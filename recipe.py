import os
import io
import base64
from datetime import datetime
from PIL import Image

class RecipeCollection:
    def __init__(self):
        self.collection = {}

    def addRecipe(self, user_id, recipe_obj=None):
        recipe = Recipe()
        recipe.create_recipe(recipe=recipe_obj)
        self.collection[user_id] = recipe

    def getRecipe(self, user_id):
        return self.collection[user_id]
    
    def deleteRecipe(self, user_id):
        self.collection.pop(user_id, None)
    

class Recipe:
    def __init__(self):
        self.__recipe = None

    def create_recipe(self, recipe=None):
        if recipe is not None:
            self.__recipe = recipe
        else:
            self.__recipe = {
                "Title": "",
                "Ingredients": [],
                "Instructions": [],
                "Tags": [],
                "Description": "",
                "Image_Name": None,
                "imageData": None,
                "Views": 0,
                "Added": datetime.utcnow()
            }

    def get_recipe(self):
        return self.__recipe
    
    def update_recipe(self, recipe, author):
        if recipe["imageData"] is not None:
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
        else:
            # no image change, so don't update field
            del recipe["imageData"]

        if recipe["imageFile"] is not None:
            # file name
            file_name = os.path.basename(recipe['imageFile'])
            base_file_name, _ = os.path.splitext(file_name)
            recipe["Image_Name"] = base_file_name

        recipe["Added"] = datetime.utcnow()
        recipe["Author"] = author
        del recipe["imageFile"]
        self.__recipe = recipe

    def delete_recipe(self):
        pass


    
