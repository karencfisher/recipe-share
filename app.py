from flask import Flask, jsonify, request, render_template
from urllib.parse import unquote
from io import BytesIO
import json
import os


from db import DB
from description_generator import generateDescription
from errorlog import ErrorLog


app = Flask(__name__)
db = None


@app.route('/')
def landing():
    return render_template("index.html")


@app.route('/search')
def queryDb():
    global db
    try:
        if db is None:
            db = DB()
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
            id = request.args.get("id")
            results = db.query_recipe_by_id(id)
            mode = request.args.get("mode")
            if results is None:
                return jsonify({"error": "no data"}), 404
            return render_template("recipe-page.html", recipe=results, mode=mode)
        return jsonify(results), 200
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": "Internal server error"}), 500
    

@app.route('/edit')
def edit_recipe():
    global db
    id = request.args.get("id")
    mode = request.args.get("mode")
    if id is not None:
        try:
            if db is None:
                db = DB()
            recipe = db.query_recipe_by_id(id)
        except Exception as ex:
            error_log.log_error(ex)
            return jsonify({"error": "Internal server error"}), 500
    else:
        recipe = {"title": "", "description": ""}
    return render_template("recipe-editor.html", recipe=recipe, mode=mode)


@app.route('/insert', methods=['POST'])
def insert_db():
    if not request.is_json:
        return jsonify({"response": 403}), 403
    global db
    try:
        if db is None:
            db = DB()
        db.addRecipe(request.json)
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
    id = request.args.get("id")
    global db
    try:
        if db is None:
            db = DB()
        recipe = db.query_recipe_by_id(id)
        return render_template("recipe-card.html", recipe=recipe)
    except Exception as ex:
        error_log.log_error(ex)
        return jsonify({"error": "Internal server error"}), 500
    

if __name__ == "__main__":
    error_log = ErrorLog()
    app.run(debug=True)
