from flask import Flask, jsonify, request, render_template, redirect
from flask_login import login_user, current_user, logout_user, login_required
from flask_bcrypt import Bcrypt
from urllib.parse import unquote
from io import BytesIO

from recipe import Recipe
from db import DB
from utils import generateDescription, ErrorLog
from models import User


app = Flask(__name__)
db = DB()
recipe_object = Recipe()
error_log = ErrorLog()
bcrypt = Bcrypt()


@app.route('/')
def start():
    return render_template("login.html", reset=False)


@app.route('/register', methods=["POST"])
def register():
    if current_user.is_authenticated:
        return redirect("/home")
    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')

    user = user = db.query_user_name(username)
    if user is not None:
        return jsonify({"error": "username already exists"}), 400
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    db.add_user(username, email, hashed_password)
    return jsonify({"success": "Your account is now created"}), 200


@app.route('/login', methods=['POST'])
def login():
    if current_user.is_authenticated:
        return redirect("/home")
    username = request.form.get('username')
    password = request.form.get('password')
    
    user = db.query_user_name(username)
    if user and bcrypt.check_password_hash(user['password'], password):
        login_user(User(user))
        return redirect('/home')
    else:
        return jsonify({"error": "Incorrect user name or password"}), 401


@app.route('/home')
@login_required
def home():
    try:
        recent = results = db.query_recipes_added(int(5))
        views = db.query_recipes_top_views(int(5))
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": "Internal server error"}), 500
    return render_template("home.html", recent=recent, views=views)


@app.route('/profile')
@login_required
def profile():
    pass


@app.route('/search')
@login_required
def queryDb():   
    method = request.args.get("method")
    try:
        if method == "semantic":
            query = unquote(request.args.get("query"))
            max_found = request.args.get("max_found")
            results = db.semantic_query(query, int(max_found))
        elif method == "tags":
            tags = unquote(request.args.get("tags")).split(",")
            max_found = request.args.get("max_found")
            results = db.query_recipes_by_tags(tags, int(max_found))
        elif method == "views":
            max_found = request.args.get("max_found")
            results = db.query_recipes_top_views(int(max_found))
        elif method == "recent":
            max_found = request.args.get("max_found")
            results = db.query_recipes_added(int(max_found))
        else:
            raise Exception("Invalid method")
        return jsonify(results), 200
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": "Internal server error"}), 500
    
    
@app.route('/display')
@login_required
def display_recipe():
    id = request.args.get("id")
    mode = request.args.get("mode")
    try:
        results = db.query_recipe_by_id(id)
        recipe_object.create_recipe(results)
        return render_template("recipe-page.html", recipe=results, mode=mode)
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": "Internal server error"}), 500
    

@app.route('/edit')
@login_required
def edit_recipe():
    update = request.args.get("update")
    mode = request.args.get("mode")
    if update == "true":
        recipe = recipe_object.get_recipe()
    else:
        recipe_object.create_recipe()
        recipe = recipe_object.get_recipe()
    return render_template("recipe-editor.html", recipe=recipe, mode=mode)


@app.route('/update', methods=['POST'])
@login_required
def insert_db():
    if not request.is_json:
        return jsonify({"response": 403}), 403
    try:
        recipe_object.update_recipe(request.json)
        return jsonify({"response": 200}), 200
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": "Internal server error"}), 500
    

@app.route('/preview')
@login_required
def preview_recipe():
    mode = request.args.get("mode")
    recipe = recipe_object.get_recipe()
    return render_template("recipe-page.html", recipe=recipe, mode=mode, preview=True)

    
@app.route('/publish')
@login_required
def publish_recipe():
    try:
        recipe = recipe_object.get_recipe()
        db.writeRecipe(recipe)
        return jsonify({"response": 200}), 200
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": "Internal server error"}), 500


@app.route('/generate', methods=['POST'])
@login_required
def generate_description():
    if not request.is_json:
        return jsonify({"response": 403}), 403
    try:
        description = generateDescription(request.json)
        return jsonify({"response": description}), 200
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": "Internal server error"}), 500


@app.route('/printable')
@login_required
def printable_card():
    try:
        recipe = recipe_object.get_recipe()
        return render_template("recipe-card.html", recipe=recipe)
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": "Internal server error"}), 500
    

if __name__ == "__main__":
    app.run(debug=True)
