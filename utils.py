import os
import openai
from dotenv import load_dotenv
import logging
import smtplib
from email.mime.text import MIMEText


class ResetPassword:
    def __init__(self):
        self.__resetRequests = {}
        self.smtp_password = os.getenv("SMTP_PASSWORD")

    def sendRequest(self, url, email_address):
        key = os.urandom(24).hex()
        self.__resetRequests[email_address] = key

        html = f"""
        <html>
            <body>
                <p>
                    You have requested to reset your Recipe Share password.
                    Assuming you requested this, click on the following link.
                    If you did not request this, ignore this email, and there
                    will be no changes.
                </p>
                <a href={url}/recover?email={email_address}&key={key}>reset password</a>
                <p> If the link does not work, copy/paste the following into your
                    browser:
                </p>
                <pre>
                    {url}/recover?email={email_address}&key={key}
                </pre>
                <p>
                    <b>Do not reply to this email</b>
            </body>
        </html>
        """

        # Create a multipart message and set headers
        sender = "karencfisher447@gmail.com"
        message = MIMEText(html, 'html')
        message["From"] = "request@recipe-share.com"
        message["To"] = email_address
        message["Subject"] = "Recipe share password reset"

        # Send the email
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
            smtp_server.login(sender, self.smtp_password)
            smtp_server.sendmail(sender, [email_address], message.as_string())       

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