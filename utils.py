import os
import openai
from dotenv import load_dotenv
import logging
import smtplib
from email.mime.text import MIMEText


class Validations:
    def __init__(self):
        self.__resetRequests = {}
        self.smtp_server = "live.smtp.mailtrap.io"
        self.smtp_port = 587
        self.smtp_password = os.getenv("SMTP_PASSWORD")
    
    def resetPassword(self, url, email_address):
        key = self.__add_key()
        self.__sendRequest(url, email_address, key, "reset")

    def validateEmail(self, url, email_address):
        key = self.__add_key(email_address)
        self.__sendRequest(url, email_address, key, "validate")

    def __add_key(self, email_address):
        key = os.urandom(24).hex()
        self.__resetRequests[email_address] = key
        return key

    def __sendRequest(self, url, email_address, key, reason):
        # get template and generate html
        with open(os.path.join('templates', f'{reason}_template.txt'), 'r') as FILE:
            template = FILE.read()
        html = template.format(
            url=url,
            email_address=email_address,
            key=key
        )

        # Create a multipart message and set headers
        message = MIMEText(html, 'html')
        sender_email = "NOREPLY@recipe-share.app"
        message["From"] = "NOREPLY@recipe-share.app"
        message["To"] = email_address
        message["Subject"] = "Recipe share password reset"

       # Send the email
        with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
            server.starttls()
            server.login("api", self.smtp_password)
            server.sendmail(sender_email, email_address, message.as_string())   

    def verifyRequest(self, email_address, key):
        return self.__resetRequests[email_address] == key
    
    def deleteRequest(self, email_address):
        self.__resetRequests.pop(email_address)


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