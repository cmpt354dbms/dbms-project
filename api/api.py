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
from routes.games import games_bp
from routes.schools import schools_bp

app.register_blueprint(athletes_bp);
app.register_blueprint(coaches_bp);
app.register_blueprint(games_bp);
app.register_blueprint(schools_bp);

if __name__ == '__main__':
    app.run(debug=True)
