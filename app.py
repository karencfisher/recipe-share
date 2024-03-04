from flask import Flask, jsonify, request, render_template
from urllib.parse import unquote
from io import BytesIO
import json
import os

from recipe import Recipe
from db import DB
from utils import generateDescription, ErrorLog


app = Flask(__name__)
db = None
recipe_object = None
error_log = None


@app.route('/')
def landing():
    return render_template("index.html")


@app.route('/search')
def queryDb():
    global db
    global recipe_object
    global error_log

    try:
        if error_log is None:
            error_log = ErrorLog()
        if db is None:
            db = DB()
        if recipe_object is None:
            recipe_object = Recipe()
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": f"database unavailable: {ex}"}), 500
    
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
def preview_recipe():
    mode = request.args.get("mode")
    recipe = recipe_object.get_recipe()
    return render_template("recipe-page.html", recipe=recipe, mode=mode, preview=True)

    
@app.route('/publish')
def publish_recipe():
    try:
        recipe = recipe_object.get_recipe()
        db.writeRecipe(recipe)
        return jsonify({"response": 200}), 200
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": "Internal server error"}), 500


@app.route('/generate', methods=['POST'])
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
def printable_card():
    try:
        recipe = recipe_object.get_recipe()
        return render_template("recipe-card.html", recipe=recipe)
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": "Internal server error"}), 500
    

if __name__ == "__main__":
    app.run(debug=True)
