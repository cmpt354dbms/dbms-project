import os
import sqlite3 as sql
from flask import Blueprint, jsonify, request

athletes_bp = Blueprint('athletes', __name__, url_prefix='/api')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "..", "database.db")


def get_db_conn():
    conn = sql.connect(DB_PATH)
    conn.row_factory = sql.Row
    conn.execute("PRAGMA foreign_keys = ON")
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

# EDIT athlete 
# executes SQL UPDATE on athlete using athlete_id
# executes SQL trigger for data validation 
# returns json response

@athletes_bp.route('/athletes/<int:athlete_id>', methods=['PUT'])
def edit_athlete(athlete_id):
    db = get_db_conn()
    try:
        data = request.get_json()
        cur = db.cursor()

        # update Athlete table
        cur.execute("""
            UPDATE Athlete
            SET name = ?, email = ?, highSchool = ?
            WHERE id = ?
        """, (data['name'], data['email'], data['highSchool'], athlete_id))

        # update position - remove old, insert new
        if 'position' in data:
            cur.execute("DELETE FROM Guard WHERE athleteID = ?", (athlete_id,))
            cur.execute("DELETE FROM Forward WHERE athleteID = ?", (athlete_id,))
            cur.execute("DELETE FROM Centre WHERE athleteID = ?", (athlete_id,))

            if data['position'] == 'Guard':
                cur.execute("INSERT INTO Guard (athleteID) VALUES (?)", (athlete_id,))
            elif data['position'] == 'Forward':
                cur.execute("INSERT INTO Forward (athleteID) VALUES (?)", (athlete_id,))
            elif data['position'] == 'Centre':
                cur.execute("INSERT INTO Centre (athleteID) VALUES (?)", (athlete_id,))

        db.commit()
        return jsonify({ 'message': 'Athlete updated successfully' })

    except sql.Error as e:
        return jsonify({ 'error': str(e) }), 400
    finally:
        db.close()

# INSERT ATHLETE
# executes SQL trigger 
# returns json response
@athletes_bp.route('/athletes', methods=['POST'])
def add_athlete():
    db = get_db_conn()
    try:
        data = request.get_json()
        print("Received data:", data)  # add this
        cur = db.cursor()

        # insert into Athlete table
        cur.execute("""
            INSERT INTO Athlete (id, name, email, highSchool)
            VALUES (?, ?, ?, ?)
        """, (data['id'], data['name'], data['email'], data['highSchool']))

        # insert into position table
        position = data.get('position')
        if position == 'Guard':
            cur.execute("INSERT INTO Guard (athleteID) VALUES (?)", (data['id'],))
        elif position == 'Forward':
            cur.execute("INSERT INTO Forward (athleteID) VALUES (?)", (data['id'],))
        elif position == 'Centre':
            cur.execute("INSERT INTO Centre (athleteID) VALUES (?)", (data['id'],))

        db.commit()
        return jsonify({ 'message': 'Athlete added successfully' }), 201

    except sql.Error as e:
        db.rollback()
        print("SQL ERROR:", e)
        return jsonify({ 'error': str(e) }), 400
    except Exception as e:
        print("GENERAL ERROR:", e)        # add this
        return jsonify({ 'error': str(e) }), 400
    finally:
        db.close()

# get Athlete Schools
@athletes_bp.route('/schools', methods=['GET'])
def get_schools():
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute("SELECT name FROM HighSchool")
        rows = cur.fetchall()
        return jsonify([dict(row) for row in rows])
    finally:
        db.close()

# get Athlete average
# executes SQL DIVISION on athlete using athlete_id
# returns json response

# @athletes_bp.route('/athletes', methods=['GET'])
# def get_athlete_average_stats():
