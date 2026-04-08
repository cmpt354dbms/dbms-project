import sqlite3 as sql
import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, "..", "database.db")

load_dotenv()
app = Flask(__name__)
CORS(app)

# register blueprints
from routes.athletes import athletes_bp
from routes.coaches import coaches_bp

app.register_blueprint(athletes_bp);
app.register_blueprint(coaches_bp);

if __name__ == '__main__':
    app.run(debug=True)