import os
import io
import base64
from dotenv import load_dotenv
import openai
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
from PIL import Image


TEST = True

class DB:
    def __init__(self):
        load_dotenv()
        password = os.getenv("MONGODB_PASSWORD")
        url = os.getenv("MONGODB_URL")
        if TEST:
            CONNECTION_STRING = f"mongodb://localhost:27017/recipe-share"
        else:
            CONNECTION_STRING = f"mongodb+srv://karen:{password}@{url}/recipe-share"
        client = MongoClient(CONNECTION_STRING)
        db = client.get_database()
        self.collection = db.get_collection("recipes")

        openai.api_key = os.getenv("OPENAI_KEY")
        self.model = "text-embedding-ada-002"

    def __generate_embedding(self, query):
        return openai.Embedding.create(input = [query], model=self.model).data[0].embedding
    
    def __extract_results(self, results):
        recipes = []
        for result in results:
            recipe = {
                "id": str(result["_id"]),
                "title": result["Title"],
                "views": result["Views"],
                "added": result['Added'].strftime('%a %d %b %Y, %I:%M%p')
            }
            recipes.append(recipe)
        return recipes
    
    def semantic_query(self, query, max_found):
        results = self.collection.aggregate([
            {
                '$vectorSearch': {
                    "index": "vector_index",
                    "path": "recipe_embedding",
                    "queryVector": self.__generate_embedding(query),
                    "numCandidates": 50,
                    "limit": max_found
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "Title": 1,
                    "Views": 1,
                    "Added": 1,
                    "score": {
                        "$meta": "vectorSearchScore"
                    }
                }
            }
        ])
        return self.__extract_results(results)
    
    def query_recipes_by_tags(self, tags, max_found):
        results = self.collection.find({"Tags": tags}).sort("Views", -1).limit(max_found)
        return self.__extract_results(results)
    
    def query_recipes_top_views(self, max_found):
        results = self.collection.find().sort("Views", -1).limit(max_found)
        return self.__extract_results(results)
    
    def query_recipes_added(self, max_found):
        results = self.collection.find().sort("Added", -1).limit(max_found)
        return self.__extract_results(results)

    def query_recipe_by_id(self, id):
        result = self.collection.find_one({"_id": ObjectId(id)})
        if result is None:
            return None
        recipe = {
                "_id": result["_id"],
                "Title": result["Title"],
                "Image_Name": result.get("Image_Name"),
                "imageData": result.get("imageData"),
                "Description": result["Description"],
                "Views": result["Views"] + 1,
                "Ingredients": result["Ingredients"],
                "Instructions": result["Instructions"],
                "Tags": result["Tags"],
                "Added": result['Added']
            }
        
        self.collection.update_one({"_id": ObjectId(id)}, 
                                   {"$set": {"Views": recipe["Views"]}})
        return recipe
    
    def writeRecipe(self, recipe):
        id = recipe.get("_id")
        if id is None:
            result = self.collection.insert_one(recipe)
        else:
            del recipe["_id"]
            self.collection.update_one({"_id": ObjectId(id)}, {"$set": recipe})
            recipe["_id"] = ObjectId(id)

