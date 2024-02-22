import os
from dotenv import load_dotenv
import openai
from pymongo import MongoClient
from bson.objectid import ObjectId


class DB:
    def __init__(self):
        load_dotenv()
        password = os.getenv("MONGODB_PASSWORD")
        url = os.getenv("MONGODB_URL")
        CONNECTION_STRING = f"mongodb+srv://karen:{password}@{url}/recipe-share"
        client = MongoClient(CONNECTION_STRING)
        db = client.get_database()
        self.collection = db.get_collection("recipes")

        openai.api_key = os.getenv("OPENAI_KEY")
        self.model = "text-embedding-ada-002"

    def __generate_embedding(self, query):
        return openai.Embedding.create(input = [query], model=self.model).data[0].embedding
    
    def semantic_query(self, query, max_found):
        results = self.collection.aggregate([
                {
                    '$vectorSearch': {
                        "index": "vector_index",
                        "path": "recipe_embedding",
                        "queryVector": self.__generate_embedding(query),
                        "numCandidates": 50,
                        "limit": max_found,
                    }
                }
            ])
        
        recipes = []
        for result in results:
            recipe = {
                "id": str(result["_id"]),
                "title": result["Title"],
                "views": result["Views"]
            }
            recipes.append(recipe)
        return recipes
    
    def query_recipes_by_tags(self, tags, max_found):
        results = self.collection.find({"Tags": tags}).sort("Views", -1).limit(max_found)
        recipes = []
        for result in results:
            recipe = {
                "id": str(result["_id"]),
                "title": result["Title"],
                "views": result["Views"]
            }
            recipes.append(recipe)
        return recipes
    
    def query_recipes_top_views(self, max_found):
        results = self.collection.find().sort("Views", -1).limit(max_found)
        recipes = []
        for result in results:
            recipe = {
                "id": str(result["_id"]),
                "title": result["Title"],
                "views": result["Views"]
            }
            recipes.append(recipe)
        return recipes

    def query_recipe_by_id(self, id):
        result = self.collection.find_one({"_id": ObjectId(id)})
        recipe = {
                "title": result["Title"],
                "image": result["Image_Name"],
                "description": result["Description"],
                "views": result["Views"],
                "ingredients": result["Ingredients"],
                "instructions": result["Instructions"],
                "tags": result["Tags"]
            }
        return recipe
    
    def addRecipe(self, recipe):
        self.collection.insert_one(recipe)
