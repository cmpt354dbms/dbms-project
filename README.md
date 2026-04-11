# CMPT354 DBMS PROJECT

A basketball recruiting management system built with React (TypeScript) + Flask + SQLite.

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
```
