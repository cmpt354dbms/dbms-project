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

        # initial sql query 
        # cur.execute("""
        #    SELECT a.id, a.name, a.email, a.highSchool, h.division,
        #         CASE
        #             WHEN g.athleteID IS NOT NULL THEN 'Guard'
        #             WHEN f.athleteID IS NOT NULL THEN 'Forward'
        #             WHEN c.athleteID IS NOT NULL THEN 'Centre'
        #             ELSE NULL
        #         END AS position
        #     FROM Athlete a
        #     LEFT JOIN HighSchool h ON a.highSchool = h.name
        #     LEFT JOIN Guard g ON a.id = g.athleteID
        #     LEFT JOIN Forward f ON a.id = f.athleteID
        #     LEFT JOIN Centre c ON a.id = c.athleteID
        # """)
        
        # sql query with game stats as well

        cur.execute("""
            SELECT a.id, a.name, a.email, a.highSchool, h.division,
                CASE
                    WHEN g.athleteID IS NOT NULL THEN 'Guard'
                    WHEN f.athleteID IS NOT NULL THEN 'Forward'
                    WHEN c.athleteID IS NOT NULL THEN 'Centre'
                    ELSE NULL
                END AS position,
                gs.points, gs.rebounds, gs.assists, gs.steals,
                gs.blocks, gs.fouls, gs.shotsMade, gs.shotsAttempted,
                gs.threePointersMade, gs.freeThrowsMade, gs.freeThrowsAttempted,
                gs.gameID, gm.gameDate
            FROM Athlete a
            LEFT JOIN HighSchool h ON a.highSchool = h.name
            LEFT JOIN Guard g ON a.id = g.athleteID
            LEFT JOIN Forward f ON a.id = f.athleteID
            LEFT JOIN Centre c ON a.id = c.athleteID
            LEFT JOIN GameStats gs ON a.id = gs.athleteID
            LEFT JOIN Game gm ON gs.gameID = gm.gameID
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