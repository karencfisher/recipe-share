from flask import Flask, jsonify, request, render_template, redirect
from flask_login import login_user, current_user, logout_user, login_required
from flask_login import UserMixin, LoginManager
from flask_bcrypt import Bcrypt
from urllib.parse import unquote, urlparse
from io import BytesIO
from dotenv import load_dotenv
import os

from recipe import RecipeCollection
from db import DB
from utils import generateDescription, ErrorLog, Validations


load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
db = DB()
recipes = RecipeCollection()
validations = Validations()
error_log = ErrorLog()
bcrypt = Bcrypt()
registration_cache = {}

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'start'  # Define the view for login page

@login_manager.user_loader
def load_user(user_id):
    user = db.query_user_id(user_id)
    if user:
        return User(user)
    return None

class User(UserMixin):
    def __init__(self, user):
        self.id = str(user['_id'])
        self.username = user['username']
        self.email = user['email']
        self.password = user['password']

    def get_id(self):
        return self.id


@app.route('/')
def start():
    if current_user.is_authenticated:
        return redirect("/home")
    return render_template("login.html", reset=False)


####### registration/login routes
@app.route('/register', methods=["POST"])
def register():
    if current_user.is_authenticated:
        return redirect("/home")
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    user = user = db.query_user_name(username)
    if user is not None:
        return jsonify({"error": "username already exists"}), 400
    
    registration_cache[email] = {
        "username": username,
        "password": password
    }
    try:
        url_obj = urlparse(request.base_url)
        url = f'{url_obj.scheme}://{url_obj.netloc}'
        validations.validateEmail(url, username, email)
    except Exception as error:
        error_log.log_error(error)
        return jsonify({"error": "Unable to service request"}), 500
    return jsonify({"success": "Request sent"}), 200
    
@app.route('/validate', methods=['GET'])
def validate():
    email = request.args.get('email')
    key = request.args.get('key')
    if (not validations.verifyRequest(email, key)):
        return jsonify({"error": "Invalid request"}), 403
    
    try:
        cache = registration_cache[email]
        username = cache['username']
        password = cache['password']
        registration_cache.pop(email)
    except KeyError:
        return jsonify('error', 'Internal server error'), 500
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    db.add_user(username, email, hashed_password)
    return render_template('login.html', reset=False)

@app.route('/login', methods=['POST'])
def login():
    if current_user.is_authenticated:
        return redirect("/home")
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = db.query_user_name(username)
    if user and bcrypt.check_password_hash(user['password'], password):
        login_user(User(user))
        return redirect('/home')
    else:
        return jsonify({"error": "Incorrect user name or password"}), 401

@app.route('/logout')
def logout():
    recipes.deleteRecipe(current_user.get_id())
    logout_user()
    return redirect('/')


####### Password reset routes
@app.route('/request', methods=["POST"])
def request_password():
    data = request.get_json()
    username = data.get('username')
    email = db.query_user_name(username)["email"]
    try:
        url_obj = urlparse(request.base_url)
        url = f'{url_obj.scheme}://{url_obj.netloc}'
        validations.resetPassword(url, username, email)
    except Exception as error:
        error_log.log_error(error)
        return jsonify({"error": "Unable to service request"}), 500
    return jsonify({"success": "Request sent"}), 200

@app.route('/recover', methods=["GET"])
def recover_password():
    email = request.args.get('email')
    key = request.args.get('key')
    if (validations.verifyRequest(email, key)):
        return render_template("login.html", reset=True)
    else:
        return jsonify({"error": "Invalid request"}), 403
    
@app.route('/reset', methods=['POST'])
def reset_password():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    try:
        db.update_password(username, hashed_password)
        email = db.query_user_name(username)['email']
        validations.deleteRequest(email)
    except Exception as error:
        error_log.log_error(error)
        return jsonify({"error": "Error in servicing request"}), 500
    return jsonify({"success": "Password updated"}), 200
    

####### protected recipe routes
@app.route('/home')
@login_required
def home():
    try:
        recent = db.query_recipes_added(int(10), current_user.username)
        contribs = db.query_recipes_by_user(current_user.username)
        user = db.query_user_name(current_user.username)
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": "Internal server error"}), 500
    return render_template("home.html", recent=recent, contributions=contribs, 
                           username=user['username'], mode=user['display_mode'])

@app.route('/update_state', methods=['GET'])
@login_required
def update_state():
    mode = request.args.get("mode")
    db.update_mode(current_user.username, mode)
    return jsonify({"success": "updated state"}), 200

@app.route('/search')
@login_required
def queryDb():   
    method = request.args.get("method")
    try:
        if method == "semantic":
            query = unquote(request.args.get("query"))
            max_found = request.args.get("max_found")
            results = db.semantic_query(query, int(max_found))
        elif method == "contribs":
            results = db.query_recipes_by_user(current_user.username);
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
        recipes.addRecipe(current_user.get_id(), results)
        return render_template("recipe-page.html", recipe=results, mode=mode)
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": "Internal server error"}), 500
    
@app.route('/edit')
@login_required
def edit_recipe():
    update = request.args.get("update")
    id = request.args.get("id")
    mode = request.args.get("mode")
    if update == "true":
        try:
            recipe = db.query_recipe_by_id(id)
            if recipe is None:
                recipe = recipes.getRecipe(current_user.get_id()).get_recipe()
            else:
                if recipe["Author"] != current_user.username:
                    return jsonify({"error": "Recipe not by current user!"}), 403
                recipes.addRecipe(current_user.get_id(), recipe)
        except Exception as ex:
            error_log.log_error(ex)
            return jsonify({"error": "Internal server error"}), 500
    else:
        recipes.addRecipe(current_user.get_id())
        recipe = recipes.getRecipe(current_user.get_id()).get_recipe()
    return render_template("recipe-editor.html", recipe=recipe, mode=mode)

@app.route('/update', methods=['POST'])
@login_required
def insert_db():
    if not request.is_json:
        return jsonify({"response": 403}), 403
    try:
        recipe = recipes.getRecipe(current_user.get_id())
        recipe.update_recipe(request.json, current_user.username)
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": "Internal server error"}), 500
    return jsonify({"response": 200}), 200
    
@app.route('/preview')
@login_required
def preview_recipe():
    mode = request.args.get("mode")
    recipe = recipes.getRecipe(current_user.get_id()).get_recipe()
    return render_template("recipe-page.html", recipe=recipe, mode=mode, preview=True)
 
@app.route('/publish')
@login_required
def publish_recipe():
    try:
        recipe = recipes.getRecipe(current_user.get_id()).get_recipe()
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
        recipe = recipes.getRecipe(current_user.get_id()).get_recipe()
        return render_template("recipe-card.html", recipe=recipe)
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": "Internal server error"}), 500
    

if __name__ == "__main__":
    app.run(debug=True)
