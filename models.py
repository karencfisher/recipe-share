from flask_login import UserMixin
from flask_login import LoginManager

from db import DB

login_manager = LoginManager()
db = DB()

@login_manager.user_loader
def load_user(user_id):
    user = db.query_user_id(user_id)
    if user:
        return User(user)
    return None

class User(UserMixin):
    def __init__(self, user):
        self.id = str(user['_id'])
        self.username = user['username']
        self.email = user['email']
        self.password = user['password']

    def get_id(self):
        return self.id
