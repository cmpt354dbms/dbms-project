import os
import sqlite3 as sql
from flask import Blueprint, jsonify
from flask import Blueprint, jsonify, request

coaches_bp = Blueprint('coaches', __name__, url_prefix='/api')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "..", "database.db")

def get_db_conn():
    conn = sql.connect(DB_PATH)
    conn.row_factory = sql.Row
    conn.execute("PRAGMA foreign_keys = ON")
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
        db.close()

 
# GET one coach with all athletes they are interested in
# executes JOINs on Interested + Athlete to return recruit list
# returns coach profile + array of interested athletes for the modal view
@coaches_bp.route('/coaches/<int:coach_id>', methods=['GET'])
def get_coach(coach_id):
    db = get_db_conn()
    try:
        cur = db.cursor()
 
        # coach profile row
        cur.execute("""
            SELECT c.id, c.name, c.email, c.phoneNo, ut.name AS university
            FROM Coach c
            LEFT JOIN UniversityTeam ut ON c.id = ut.coachID
            WHERE c.id = ?
        """, (coach_id,))
        coach = cur.fetchone()
        if not coach:
            return jsonify({'error': 'Coach not found'}), 404
 
        # athletes this coach is interested in
        cur.execute("""
            SELECT a.id AS athleteID,
                   a.jerseyNumber,
                   a.name AS athleteName,
                   a.email AS athleteEmail,
                   a.highSchool,
                   h.division,
                   CASE
                       WHEN g.athleteID IS NOT NULL THEN 'Guard'
                       WHEN f.athleteID IS NOT NULL THEN 'Forward'
                       WHEN ce.athleteID IS NOT NULL THEN 'Centre'
                       ELSE NULL
                   END         AS position,
                   i.offerType,
                   i.scholarshipAmount
            FROM Interested i
            JOIN Athlete a ON i.athleteID  = a.id
            LEFT JOIN HighSchool h ON a.highSchool = h.name
            LEFT JOIN Guard g ON a.id = g.athleteID
            LEFT JOIN Forward f ON a.id = f.athleteID
            LEFT JOIN Centre ce ON a.id = ce.athleteID
            WHERE i.coachID = ?
            ORDER BY a.name ASC
        """, (coach_id,))
        recruits = cur.fetchall()
 
        result = dict(coach)
        result['recruits'] = [dict(r) for r in recruits]
        return jsonify(result)
    finally:
        db.close()
 
 
# DELETE coach — triggers CASCADE on UniversityTeam (coachID SET NULL) and Interested
# executes SQL DELETE on Coach using coach_id
# returns json response
@coaches_bp.route('/coaches/<int:coach_id>', methods=['DELETE'])
def delete_coach(coach_id):
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute("DELETE FROM Coach WHERE id = ?", (coach_id,))
        db.commit()
        return jsonify({'message': f'Coach {coach_id} deleted'})
    finally:
        db.close()
 
 
# EDIT coach
# executes SQL UPDATE on Coach using coach_id
# returns json response
@coaches_bp.route('/coaches/<int:coach_id>', methods=['PUT'])
def edit_coach(coach_id):
    db = get_db_conn()
    try:
        data = request.get_json()
        cur = db.cursor()
 
        cur.execute("""
            UPDATE Coach
            SET name = ?, email = ?, phoneNo = ?
            WHERE id = ?
        """, (data['name'], data['email'], data['phoneNo'], coach_id))
 
        db.commit()
        return jsonify({'message': 'Coach updated successfully'})
 
    except sql.Error as e:
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()
 
 
# INSERT coach
# executes SQL INSERT into Coach
# returns json response
@coaches_bp.route('/coaches', methods=['POST'])
def add_coach():
    db = get_db_conn()
    try:
        data = request.get_json()
        cur = db.cursor()

        cur.execute("SELECT COALESCE(MAX(id), 0) + 1 AS nextID FROM Coach")
        coach_id = cur.fetchone()['nextID']
 
        cur.execute("""
            INSERT INTO Coach (id, name, email, phoneNo)
            VALUES (?, ?, ?, ?)
        """, (coach_id, data['name'], data['email'], data['phoneNo']))
 
        db.commit()
        return jsonify({'message': 'Coach added successfully', 'id': coach_id}), 201
 
    except sql.Error as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()
 
 
@coaches_bp.route('/scholarships', methods=['POST'])
def add_scholarship():
    db = get_db_conn()
    try:
        data = request.get_json()
        cur = db.cursor()
        cur.execute("""
            INSERT INTO Interested (athleteID, coachID, offerType, scholarshipAmount)
            VALUES (?, ?, ?, ?)
        """, (
            int(data['athleteID']),
            int(data['coachID']),
            data['offerType'],
            float(data.get('scholarshipAmount') or 0),
        ))

        db.commit()
        return jsonify({'message': 'Scholarship added successfully'}), 201
    except (sql.Error, KeyError, ValueError) as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()


@coaches_bp.route('/scholarships/<int:coach_id>/<int:athlete_id>', methods=['DELETE'])
def delete_scholarship(coach_id, athlete_id):
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute(
            "DELETE FROM Interested WHERE coachID = ? AND athleteID = ?",
            (coach_id, athlete_id),
        )
        if cur.rowcount == 0:
            return jsonify({'error': 'Scholarship not found'}), 404

        db.commit()
        return jsonify({'message': 'Scholarship removed successfully'})
    except sql.Error as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()


# GET universities — used to populate dropdowns in the frontend
@coaches_bp.route('/universities', methods=['GET'])
def get_universities():
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute("SELECT name, division FROM UniversityTeam ORDER BY name ASC")
        rows = cur.fetchall()
        return jsonify([dict(row) for row in rows])
    finally:
        db.close()
