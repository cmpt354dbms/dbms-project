import os
import sqlite3 as sql
from flask import Blueprint, jsonify

athletes_bp = Blueprint('athletes', __name__, url_prefix='/api')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "..", "database.db")


def get_db_conn():
    conn = sql.connect(DB_PATH)
    conn.row_factory = sql.Row
    return conn

# GET all athletes (with their high school (FOR NOW) ) - JOIN query
# executes SQL JOIN on athlete using relevant athlete info
# returns json response containing all athletes from table 
@athletes_bp.route('/athletes', methods=['GET'])
def get_athletes():
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute("""
        SELECT a.id, a.name, a.email, a.highSchool, h.division
        FROM Athlete a
        LEFT JOIN HighSchool h ON a.highSchool = h.name
        """)
        rows = cur.fetchall()
        return jsonify([dict(row) for row in rows])
    finally:
        db.close()

# DELETE athlete - triggers CASCADE
# executes SQL DELETE on athlete using athlete_id
# returns json response 
@athletes_bp.route('/athletes/<int:athlete_id>', methods=['DELETE'])
def delete_athlete(athlete_id):
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute("DELETE FROM Athlete WHERE id = ?", (athlete_id,))
        db.commit()
        return jsonify({ 'message': f'Athlete {athlete_id} deleted' })
    finally:
        db.close()