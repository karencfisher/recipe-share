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
                "id": result["_id"],
                "title": result["Title"],
                "image": result.get("Image_Name"),
                "imageData": result.get("imageData"),
                "description": result["Description"],
                "views": result["Views"] + 1,
                "ingredients": result["Ingredients"],
                "instructions": result["Instructions"],
                "tags": result["Tags"],
                "added": result['Added'].strftime('%a %d %b %Y, %I:%M%p'),
                "published": result.get("Published", False)
            }
        
        self.collection.update_one({"_id": ObjectId(id)}, 
                                   {"$set": {"Views": recipe["views"]}})
        return recipe
    
    def addRecipe(self, recipe):
        # process image if change
        if recipe["imageFile"] is not None and recipe["imageData"] is not None:
            # unpack imageData
            _, data = recipe["imageData"].split(",")

            # open image and resize
            image = Image.open(io.BytesIO(base64.b64decode(data)))
            image = image.resize((274, 170))

            # re-encode image as jpeg
            header = "data:image/jpeg;base64"
            buffer = io.BytesIO()
            image.save(buffer, format="JPEG")
            image_str = base64.b64encode(buffer.getvalue()).decode('ascii')
            recipe["imageData"] = ",".join([header, image_str.strip()])

            # file name
            base_file_name, _ = os.path.splitext(recipe['imageFile'])
            recipe["Image_Name"] = base_file_name
        else:
            # no image change, so don't update field
            del recipe["imageData"]

        recipe["Added"] = datetime.utcnow()
        del recipe["imageFile"]
        id = recipe["tempId"]
        del recipe["tempId"]

        if id == "":
            result = self.collection.insert_one(recipe)
            id = str(result.inserted_id)
        else:
            self.collection.update_one({"_id": ObjectId(id)}, {"$set": recipe})
        return id
        
    def publishRecipe(self, id):
        self.collection.update_one({"_id": ObjectId(id)}, {"$set": {"Published": True}})

