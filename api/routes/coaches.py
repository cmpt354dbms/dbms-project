import os
import sqlite3 as sql
from flask import Blueprint, jsonify

coaches_bp = Blueprint('coaches', __name__, url_prefix='/api')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "..", "database.db")

def get_db_conn():
    conn = sql.connect(DB_PATH)
    conn.row_factory = sql.Row
    return conn

# GET all coaches with their university team
@coaches_bp.route('/coaches', methods=['GET'])
def get_coaches():
    db = get_db_conn()
    try: 
        cur = db.cursor()
        cur.execute("""
            SELECT c.id, c.name, c.email, c.phoneNo, ut.name AS university
            FROM Coach c
            LEFT JOIN UniversityTeam ut ON c.id = ut.coachID
        """)
        rows = cur.fetchall()
        return jsonify([dict(row) for row in rows])
    finally:
        db.close()