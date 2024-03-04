import os
import openai
from dotenv import load_dotenv
import logging

class ErrorLog:
    def __init__(self):
        logging.basicConfig(level=logging.INFO, 
                            format='%(asctime)s %(message)s')
        self.logger = logging.getLogger('error_log')

    def log_error(self, error):
        self.logger.exception(error)


load_dotenv()
api_key = os.getenv("OPENAI_KEY")
openai.api_key = api_key

prompt_template = """
From the below recipe, please write a brief (one paragraph) description of it. Make it appetizing.  

```
Title:
{title}

Ingredients:
{ingredients}

Steps:
{steps}
```
"""

def generateDescription(recipe):
    title = recipe["Title"]
    steps = "\n".join(recipe["Instructions"])
    ingredients = "\n".join(recipe["Ingredients"])
    prompt = prompt_template.format(title=title, 
                                    ingredients=ingredients, 
                                    steps=steps)
    
    result = openai.ChatCompletion.create(model="gpt-3.5-turbo",
                                       messages=[{"role": "user", "content": prompt}],
                                       temperature=1)
    return result.choices[0].message.content