import sqlite3 as sql
import os
from flask import Flask
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, "..", "database.db")

load_dotenv()
app = Flask(__name__)

# register blueprints
from routes.athletes import athletes_bp
from routes.coaches import coaches_bp

app.register_blueprint(athletes_bp);
app.register_blueprint(coaches_bp);


# def get_db_conn():
#     conn = sql.connect(db_path)
#     conn.row_factory = sql.Row
#     return conn

if __name__ == '__main__':
    app.run(debug=True)