from flask import Flask, jsonify, request
from urllib.parse import unquote

from db import DB
from description_generator import generateDescription


app = Flask(__name__)
db = None


@app.route('/')
def landing():
    pass


@app.route('/search')
def queryDb():
    global db
    if db is None:
        db = DB()

    method = request.args.get("method")
    if method == "semantic":
        query = unquote(request.args.get("query"))
        max_found = request.args.get("max_found")
        results = db.semantic_query(query, int(max_found))
    elif method == "tags":
        tags = unquote(request.args.get("tags")).split(",")
        max_found = request.args.get(max_found)
        results = db.query_recipes_by_tags(tags, int(max_found))
    elif method == "views":
        max_found = request.args.get("max_found")
        results = db.query_recipes_top_views(int(max_found))
    else:
        id = request.args.get("id")
        results = db.query_recipe_by_id(id)
    return jsonify(results), 200


@app.route('/insert', methods=['POST'])
def insertDB():
    if not request.is_json:
        return jsonify({"response": 403}), 403
    
    global db
    if db is None:
        db = DB()

    db.addRecipe(request.json)
    return jsonify({"response": 200}), 200


@app.route('/generate', methods=['POST'])
def generate_description():
    if not request.is_json:
        return jsonify({"response": 403}), 403
    
    description = generateDescription()
    return jsonify({"response": description}), 200


if __name__ == "__main__":
    app.run(debug=True)
