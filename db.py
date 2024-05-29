import os
from dotenv import load_dotenv
import openai
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
from PIL import Image


TEST = False

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
        self.db = client.get_database()
        self.collection = self.db.get_collection("recipes")

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
    
    def query_recipes_added(self, max_found, author):
        results = self.collection.find({"Author": {"$ne": author}}).sort("Added", -1).limit(max_found)
        return self.__extract_results(results)
    
    def query_recipes_by_user(self, author):
        results = self.collection.find({"Author": author})
        return self.__extract_results(results)

    def query_recipe_by_id(self, id):
        recipe = self.collection.find_one({"_id": ObjectId(id)})
        if recipe is None:
            return None
        recipe["Views"] += 1
        self.collection.update_one({"_id": ObjectId(id)}, 
                                   {"$set": {"Views": recipe["Views"]}})
        return recipe
    
    def writeRecipe(self, recipe):
        id = recipe.get("_id")
        if id is None or id == "":
            del recipe["_id"]
            result = self.collection.insert_one(recipe)
            recipe["_id"] = str(result.inserted_id)

        else:
            del recipe["_id"]
            self.collection.update_one({"_id": ObjectId(id)}, {"$set": recipe})
            recipe["_id"] = ObjectId(id)

    def query_user_name(self, user_name):
        user_collection = self.db.get_collection("users")
        return user_collection.find_one({"username": user_name})
    
    def query_user_id(self, user_id):
        user_collection = self.db.get_collection("users")
        return user_collection.find_one({"_id": ObjectId(user_id)})
    
    def add_user(self, username, email, hashed_password):
        new_user = {"username": username,
                    "email": email,
                    "password": hashed_password}
        user_collection = self.db.get_collection("users")
        user_collection.insert_one(new_user)

    def update_password(self, username, password):
        user_collection = self.db.get_collection("users")
        user_collection.update_one({"username": username}, 
                                   {"$set": {"password": password}})
        
    def update_mode(self, username, mode):
        user_collection = self.db.get_collection("users")
        user_collection.update_one({"username": username}, 
                                   {"$set": {"display_mode": mode}})
    

