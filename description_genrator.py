import os
import openai
from dotenv import load_dotenv


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
                                    teps=steps)
    
    result = openai.ChatCompletion.create(model="gpt-3.5-turbo",
                                       messages=[{"role": "user", "content": prompt}],
                                       temperature=1)
    return result.choices[0].message.content
