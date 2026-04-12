import os
import sqlite3 as sql
from flask import Blueprint, jsonify, request

schools_bp = Blueprint('schools', __name__, url_prefix='/api')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "..", "database.db")


def get_db_conn():
    conn = sql.connect(DB_PATH)
    conn.row_factory = sql.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def nullable_int(value):
    if value in (None, ''):
        return None
    return int(value)


@schools_bp.route('/high-schools', methods=['GET'])
def get_high_schools():
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute("""
            SELECT
                h.name,
                h.location,
                h.division,
                COUNT(DISTINCT a.id) AS athleteCount,
                COUNT(DISTINCT gs.gameID) AS gameCount
            FROM HighSchool h
            LEFT JOIN Athlete a ON a.highSchool = h.name
            LEFT JOIN GameStats gs ON gs.athleteID = a.id
            GROUP BY h.name, h.location, h.division
            ORDER BY h.name
        """)
        return jsonify([dict(row) for row in cur.fetchall()])
    finally:
        db.close()


@schools_bp.route('/high-schools/<path:school_name>', methods=['GET'])
def get_high_school(school_name):
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute("""
            SELECT
                h.name,
                h.location,
                h.division,
                COUNT(DISTINCT a.id) AS athleteCount,
                COUNT(DISTINCT gs.gameID) AS gameCount
            FROM HighSchool h
            LEFT JOIN Athlete a ON a.highSchool = h.name
            LEFT JOIN GameStats gs ON gs.athleteID = a.id
            WHERE h.name = ?
            GROUP BY h.name, h.location, h.division
        """, (school_name,))
        row = cur.fetchone()
        if not row:
            return jsonify({'error': 'High school not found'}), 404
        return jsonify(dict(row))
    finally:
        db.close()


@schools_bp.route('/high-schools', methods=['POST'])
def add_high_school():
    db = get_db_conn()
    try:
        data = request.get_json()
        cur = db.cursor()
        cur.execute("""
            INSERT INTO HighSchool (name, location, division)
            VALUES (?, ?, ?)
        """, (
            data['name'].strip(),
            data['location'].strip(),
            data['division'].strip(),
        ))

        db.commit()
        return jsonify({'message': 'High school added successfully'}), 201
    except (sql.Error, KeyError) as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()


@schools_bp.route('/high-schools/<path:school_name>', methods=['PUT'])
def edit_high_school(school_name):
    db = get_db_conn()
    try:
        data = request.get_json()
        new_name = data['name'].strip()
        location = data['location'].strip()
        division = data['division'].strip()
        cur = db.cursor()

        cur.execute("SELECT name FROM HighSchool WHERE name = ?", (school_name,))
        if not cur.fetchone():
            return jsonify({'error': 'High school not found'}), 404

        if new_name != school_name:
            cur.execute(
                "INSERT INTO HighSchool (name, location, division) VALUES (?, ?, ?)",
                (new_name, location, division),
            )
            cur.execute(
                "UPDATE Athlete SET highSchool = ? WHERE highSchool = ?",
                (new_name, school_name),
            )
            cur.execute("DELETE FROM HighSchool WHERE name = ?", (school_name,))
        else:
            cur.execute("""
                UPDATE HighSchool
                SET location = ?, division = ?
                WHERE name = ?
            """, (location, division, school_name))

        db.commit()
        return jsonify({'message': 'High school updated successfully'})
    except (sql.Error, KeyError, ValueError) as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()


@schools_bp.route('/high-schools/<path:school_name>', methods=['DELETE'])
def delete_high_school(school_name):
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute("DELETE FROM HighSchool WHERE name = ?", (school_name,))
        if cur.rowcount == 0:
            return jsonify({'error': 'High school not found'}), 404
        db.commit()
        return jsonify({'message': 'High school deleted successfully'})
    except sql.Error as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()


@schools_bp.route('/university-teams', methods=['GET'])
def get_university_teams():
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute("""
            SELECT
                ut.name,
                ut.location,
                ut.division,
                ut.coachID,
                c.name AS coachName,
                COUNT(i.athleteID) AS recruitCount
            FROM UniversityTeam ut
            LEFT JOIN Coach c ON c.id = ut.coachID
            LEFT JOIN Interested i ON i.coachID = ut.coachID
            GROUP BY ut.name, ut.location, ut.division, ut.coachID, c.name
            ORDER BY ut.name
        """)
        return jsonify([dict(row) for row in cur.fetchall()])
    finally:
        db.close()


@schools_bp.route('/university-teams', methods=['POST'])
def add_university_team():
    db = get_db_conn()
    try:
        data = request.get_json()
        cur = db.cursor()
        cur.execute("""
            INSERT INTO UniversityTeam (name, location, division, coachID)
            VALUES (?, ?, ?, ?)
        """, (
            data['name'].strip(),
            data['location'].strip(),
            data['division'].strip(),
            nullable_int(data.get('coachID')),
        ))

        db.commit()
        return jsonify({'message': 'University team added successfully'}), 201
    except (sql.Error, KeyError, ValueError) as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()


@schools_bp.route('/university-teams/<path:team_name>', methods=['GET'])
def get_university_team(team_name):
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute("""
            SELECT
                ut.name,
                ut.location,
                ut.division,
                ut.coachID,
                c.name AS coachName,
                COUNT(i.athleteID) AS recruitCount
            FROM UniversityTeam ut
            LEFT JOIN Coach c ON c.id = ut.coachID
            LEFT JOIN Interested i ON i.coachID = ut.coachID
            WHERE ut.name = ?
            GROUP BY ut.name, ut.location, ut.division, ut.coachID, c.name
        """, (team_name,))
        row = cur.fetchone()
        if not row:
            return jsonify({'error': 'University team not found'}), 404
        return jsonify(dict(row))
    finally:
        db.close()


@schools_bp.route('/university-teams/<path:team_name>', methods=['PUT'])
def edit_university_team(team_name):
    db = get_db_conn()
    try:
        data = request.get_json()
        new_coach_id = nullable_int(data.get('coachID'))
        cur = db.cursor()

        cur.execute("SELECT coachID FROM UniversityTeam WHERE name = ?", (team_name,))
        existing_team = cur.fetchone()
        if not existing_team:
            return jsonify({'error': 'University team not found'}), 404

        old_coach_id = existing_team['coachID']
        if old_coach_id is not None and old_coach_id != new_coach_id:
            if new_coach_id is None:
                cur.execute("DELETE FROM Interested WHERE coachID = ?", (old_coach_id,))
            else:
                cur.execute("""
                    DELETE FROM Interested
                    WHERE coachID = ?
                      AND athleteID IN (
                        SELECT athleteID
                        FROM Interested
                        WHERE coachID = ?
                      )
                """, (old_coach_id, new_coach_id))
                cur.execute(
                    "UPDATE Interested SET coachID = ? WHERE coachID = ?",
                    (new_coach_id, old_coach_id),
                )

        cur.execute("""
            UPDATE UniversityTeam
            SET name = ?, location = ?, division = ?, coachID = ?
            WHERE name = ?
        """, (
            data['name'].strip(),
            data['location'].strip(),
            data['division'].strip(),
            new_coach_id,
            team_name,
        ))

        db.commit()
        return jsonify({'message': 'University team updated successfully'})
    except (sql.Error, KeyError, ValueError) as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()


@schools_bp.route('/university-teams/<path:team_name>', methods=['DELETE'])
def delete_university_team(team_name):
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute("SELECT coachID FROM UniversityTeam WHERE name = ?", (team_name,))
        existing_team = cur.fetchone()
        if not existing_team:
            return jsonify({'error': 'University team not found'}), 404

        old_coach_id = existing_team['coachID']
        if old_coach_id is not None:
            cur.execute("DELETE FROM Interested WHERE coachID = ?", (old_coach_id,))

        cur.execute("DELETE FROM UniversityTeam WHERE name = ?", (team_name,))
        db.commit()
        return jsonify({'message': 'University team deleted successfully'})
    except sql.Error as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()
