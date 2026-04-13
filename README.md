# CMPT354 DBMS PROJECT

A basketball recruiting management system built with React (TypeScript) + Flask + SQLite.

## YOUTUBE LINKS (FOR GRADING)
- implementation demo: https://www.youtube.com/watch?v=vKmmI4Z9uKQ
- application demo: https://www.youtube.com/watch?v=KH9YJLP8nOs

## Prerequisites
- Python 3.12+
- Node.js 22+

## Database Setup
The database file `database.db` is included in the root directory with all tables and sample data already loaded.

If you need to recreate it, run:
```
cd api
python init_db.py
```

## Backend Setup (Flask)

1. Open a terminal and navigate to the `api` folder:
```
cd api
```

2. Activate the virtual environment:

Windows:
```
venv\Scripts\activate
```
Mac/Linux:
```
source venv/bin/activate
```

3. Install dependencies:
```
pip install -r requirements.txt
```

4. Start the Flask server:
```
flask run
```
Flask will run on `http://localhost:5000`

## Frontend Setup (React)

1. Open a second terminal in the project root:
```
cd dbms-project
```

2. Install dependencies:
```
npm install
```

3. Start the React dev server:
```
npm run dev
```
React will run on `http://localhost:5173`

## Running Both Together
You need two terminals running at the same time — one for Flask, one for React.

## Pages
| URL | Description |
|---|---|
| `/athletes` | View, filter, add, edit, delete athletes |
| `/athletes/new` | Add a new athlete |
| `/athletes/:id/edit` | Edit an existing athlete |

## Project Structure
```
dbms-project/
├── api/                  # Flask backend
│   ├── routes/           # API route blueprints
│   ├── api.py            # Flask entry point
│   └── venv/             # Python virtual environment
├── src/                  # React frontend
│   ├── api/              # Fetch calls to Flask
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components
│   └── types/            # TypeScript interfaces
├── database/
│   └── setup.sql         # SQL script to recreate tables and data
├── database.db           # SQLite database file
└── README.md
```

## Database Normalization Analysis

### 1. Functional Dependencies

#### Coach(<u>id</u>, name, email, phoneNo)
| FD | Meaning |
|----|---------|
| id → name, email, phoneNo | A coach's ID uniquely determines their name, email, and phone number |
| email → id, name, phoneNo | Each coach has a unique email, so it determines all other attributes |
| phoneNo → id, name, email | Each coach has a unique phone number, so it determines all other attributes |

#### HighSchool(<u>name</u>, location, division)
| FD | Meaning |
|----|---------|
| name → location, division | A high school's name uniquely determines its location and division |

#### Athlete(<u>id</u>, name, email, highSchool)
| FD | Meaning |
|----|---------|
| id → name, email, highSchool | An athlete's ID uniquely determines their name, email, and high school |
| email → id, name, highSchool | Each athlete has a unique email, so it determines all other attributes |

#### UniversityTeam(<u>name</u>, location, division, coachID)
| FD | Meaning |
|----|---------|
| name → location, division, coachID | A team's name uniquely determines its location, division, and coach |
| coachID → name, location, division | Each coach coaches at most one team, so coachID determines all other attributes |

#### Game(<u>gameID</u>, gameDate)
| FD | Meaning |
|----|---------|
| gameID → gameDate | A game's ID uniquely determines the date it was played |

#### GameStats(<u>athleteID, gameID</u>, points, shotsMade, shotsAttempted, threePointersMade, freeThrowsMade, freeThrowsAttempted, fouls, blocks, rebounds, assists, steals)
| FD | Meaning |
|----|---------|
| {athleteID, gameID} → points, shotsMade, shotsAttempted, threePointersMade, freeThrowsMade, freeThrowsAttempted, fouls, blocks, rebounds, assists, steals | An athlete's performance stats are uniquely determined by which athlete played in which game |

#### GameFilm(<u>gameID, athleteID, filmURL</u>)
| FD | Meaning |
|----|---------|
| {gameID, athleteID, filmURL} → ∅ | The entire tuple is the key (an athlete can have multiple film URLs per game); no non-trivial FDs exist beyond the full key |

#### Interested(<u>athleteID, coachID</u>, offerType, scholarshipAmount)
| FD | Meaning |
|----|---------|
| {athleteID, coachID} → offerType, scholarshipAmount | The interest relationship between a specific athlete and coach uniquely determines the offer type and scholarship amount |

#### Guard(<u>athleteID</u>), Forward(<u>athleteID</u>), Centre(<u>athleteID</u>)
| FD | Meaning |
|----|---------|
| athleteID → ∅ | Single-attribute tables with only the primary key; no non-trivial FDs |

---

### 2. Normalized Schema (BCNF)

The schema is in **BCNF**. In every table, every non-trivial functional dependency has a superkey as its determinant (i.e., every determinant is a candidate key). No decomposition is needed.

| Table | Primary Key | Foreign Keys |
|-------|------------|-------------|
| **Coach** | id | — |
| **HighSchool** | name | — |
| **Athlete** | id | highSchool → HighSchool(name) |
| **UniversityTeam** | name | coachID → Coach(id) |
| **Game** | gameID | — |
| **GameStats** | (athleteID, gameID) | athleteID → Athlete(id), gameID → Game(gameID) |
| **GameFilm** | (gameID, athleteID, filmURL) | gameID → Game(gameID), athleteID → Athlete(id) |
| **Interested** | (athleteID, coachID) | athleteID → Athlete(id), coachID → Coach(id) |
| **Guard** | athleteID | athleteID → Athlete(id) |
| **Forward** | athleteID | athleteID → Athlete(id) |
| **Centre** | athleteID | athleteID → Athlete(id) |

For every non-trivial FD X → Y in each table, X is a superkey. The candidate keys (id, email, phoneNo in Coach; id, email in Athlete; name, coachID in UniversityTeam; composite keys in GameStats/GameFilm/Interested) cover all determinants, so no violations exist.
