import os
import sqlite3 as sql
from flask import Blueprint, jsonify, request

games_bp = Blueprint('games', __name__, url_prefix='/api')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "..", "database.db")

STAT_FIELDS = [
    'points',
    'shotsMade',
    'shotsAttempted',
    'threePointersMade',
    'freeThrowsMade',
    'freeThrowsAttempted',
    'fouls',
    'blocks',
    'rebounds',
    'assists',
    'steals',
]


def get_db_conn():
    conn = sql.connect(DB_PATH)
    conn.row_factory = sql.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def to_int(value):
    if value in (None, ''):
        return 0
    return int(value)


def normalize_stat(row):
    return {
        'athleteID': int(row['athleteID']),
        'points': to_int(row.get('points')),
        'shotsMade': to_int(row.get('shotsMade')),
        'shotsAttempted': to_int(row.get('shotsAttempted')),
        'threePointersMade': to_int(row.get('threePointersMade')),
        'freeThrowsMade': to_int(row.get('freeThrowsMade')),
        'freeThrowsAttempted': to_int(row.get('freeThrowsAttempted')),
        'fouls': to_int(row.get('fouls')),
        'blocks': to_int(row.get('blocks')),
        'rebounds': to_int(row.get('rebounds')),
        'assists': to_int(row.get('assists')),
        'steals': to_int(row.get('steals')),
    }


def insert_stats(cur, game_id, teams):
    seen_athletes = set()
    for team in teams:
        for raw_row in team.get('stats', []):
            if raw_row.get('athleteID') in (None, ''):
                continue

            stat = normalize_stat(raw_row)
            athlete_id = stat['athleteID']
            if athlete_id in seen_athletes:
                raise ValueError('An athlete can only be entered once per game.')
            seen_athletes.add(athlete_id)

            cur.execute(
                """
                INSERT INTO GameStats (
                    athleteID, gameID, points, shotsMade, shotsAttempted,
                    threePointersMade, freeThrowsMade, freeThrowsAttempted,
                    fouls, blocks, rebounds, assists, steals
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    athlete_id,
                    game_id,
                    stat['points'],
                    stat['shotsMade'],
                    stat['shotsAttempted'],
                    stat['threePointersMade'],
                    stat['freeThrowsMade'],
                    stat['freeThrowsAttempted'],
                    stat['fouls'],
                    stat['blocks'],
                    stat['rebounds'],
                    stat['assists'],
                    stat['steals'],
                ),
            )
    return seen_athletes


def replace_game_film(cur, game_id, athlete_ids, film_url):
    # The UI treats film as one full-game URL. The schema stores film by
    # athlete, so attach the same URL to each athlete recorded in the game.
    cur.execute("DELETE FROM GameFilm WHERE gameID = ?", (game_id,))
    if not film_url:
        return

    for athlete_id in athlete_ids:
        cur.execute(
            "INSERT INTO GameFilm (gameID, athleteID, filmURL) VALUES (?, ?, ?)",
            (game_id, athlete_id, film_url),
        )


@games_bp.route('/teams', methods=['GET'])
def get_teams():
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute("""
            SELECT name, location, division
            FROM HighSchool
            ORDER BY name
        """)
        return jsonify([dict(row) for row in cur.fetchall()])
    finally:
        db.close()


@games_bp.route('/games', methods=['GET'])
def get_games():
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute("""
            SELECT
                g.gameID,
                g.gameDate,
                a.highSchool AS teamName,
                COALESCE(SUM(gs.points), 0) AS totalScore,
                COUNT(gs.athleteID) AS playerCount
            FROM Game g
            LEFT JOIN GameStats gs ON g.gameID = gs.gameID
            LEFT JOIN Athlete a ON gs.athleteID = a.id
            GROUP BY g.gameID, g.gameDate, a.highSchool
            ORDER BY g.gameDate DESC, g.gameID DESC, a.highSchool
        """)

        games = {}
        for row in cur.fetchall():
            game_id = row['gameID']
            if game_id not in games:
                games[game_id] = {
                    'gameID': game_id,
                    'gameDate': row['gameDate'],
                    'teams': [],
                    'totalScore': 0,
                }

            if row['teamName']:
                team_score = row['totalScore'] or 0
                games[game_id]['teams'].append({
                    'teamName': row['teamName'],
                    'totalScore': team_score,
                    'playerCount': row['playerCount'],
                })
                games[game_id]['totalScore'] += team_score

        cur.execute("""
            SELECT gameID, MIN(filmURL) AS filmURL
            FROM GameFilm
            GROUP BY gameID
        """)
        for row in cur.fetchall():
            game_id = row['gameID']
            if game_id in games:
                games[game_id]['filmURL'] = row['filmURL']

        return jsonify(list(games.values()))
    finally:
        db.close()


@games_bp.route('/games/<int:game_id>', methods=['GET'])
def get_game(game_id):
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute("SELECT gameID, gameDate FROM Game WHERE gameID = ?", (game_id,))
        game = cur.fetchone()
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        cur.execute("""
            SELECT
                gs.athleteID,
                a.name AS athleteName,
                a.highSchool AS teamName,
                gs.points,
                gs.shotsMade,
                gs.shotsAttempted,
                gs.threePointersMade,
                gs.freeThrowsMade,
                gs.freeThrowsAttempted,
                gs.fouls,
                gs.blocks,
                gs.rebounds,
                gs.assists,
                gs.steals
            FROM GameStats gs
            JOIN Athlete a ON gs.athleteID = a.id
            WHERE gs.gameID = ?
            ORDER BY a.highSchool, a.name
        """, (game_id,))

        teams = {}
        for row in cur.fetchall():
            team_name = row['teamName'] or ''
            if team_name not in teams:
                teams[team_name] = {
                    'teamName': team_name,
                    'stats': [],
                }

            teams[team_name]['stats'].append({
                'athleteID': row['athleteID'],
                'athleteName': row['athleteName'],
                'points': row['points'],
                'shotsMade': row['shotsMade'],
                'shotsAttempted': row['shotsAttempted'],
                'threePointersMade': row['threePointersMade'],
                'freeThrowsMade': row['freeThrowsMade'],
                'freeThrowsAttempted': row['freeThrowsAttempted'],
                'fouls': row['fouls'],
                'blocks': row['blocks'],
                'rebounds': row['rebounds'],
                'assists': row['assists'],
                'steals': row['steals'],
            })

        cur.execute(
            "SELECT MIN(filmURL) AS filmURL FROM GameFilm WHERE gameID = ?",
            (game_id,),
        )
        film = cur.fetchone()

        return jsonify({
            'game': dict(game),
            'teams': list(teams.values()),
            'filmURL': film['filmURL'] if film and film['filmURL'] else '',
        })
    finally:
        db.close()


@games_bp.route('/games', methods=['POST'])
def add_game():
    db = get_db_conn()
    try:
        data = request.get_json()
        cur = db.cursor()
        cur.execute(
            "INSERT INTO Game (gameID, gameDate) VALUES (?, ?)",
            (data['gameID'], data['gameDate']),
        )
        athlete_ids = insert_stats(cur, data['gameID'], data.get('teams', []))
        replace_game_film(cur, data['gameID'], athlete_ids, data.get('filmURL', '').strip())
        db.commit()
        return jsonify({'message': 'Game added successfully'}), 201
    except (sql.Error, ValueError, KeyError) as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()


@games_bp.route('/games/<int:game_id>', methods=['PUT'])
def edit_game(game_id):
    db = get_db_conn()
    try:
        data = request.get_json()
        cur = db.cursor()
    
        cur.execute("DELETE FROM GameStats WHERE gameID = ?", (game_id,))
        
        insert_stats(cur, game_id, data.get('teams', []))
        
        db.commit()
        return jsonify({'message': 'Updated successfully'})
    except sql.Error as e:
        db.rollback() 
        return jsonify({'error': str(e)}), 400

@games_bp.route('/games/<int:game_id>', methods=['DELETE'])
def delete_game(game_id):
    db = get_db_conn()
    try:
        cur = db.cursor()
        cur.execute("DELETE FROM Game WHERE gameID = ?", (game_id,))
        if cur.rowcount == 0:
            return jsonify({'error': 'Game not found'}), 404

        db.commit()
        return jsonify({'message': 'Game deleted successfully'})
    except sql.Error as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()
