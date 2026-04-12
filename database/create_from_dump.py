from pathlib import Path
import sqlite3 as sql


BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = BASE_DIR.parent
SQL_DUMP_PATH = BASE_DIR / "CMPT354SQLdump.sql"
DB_PATH = REPO_ROOT / "database.db"


def main():
    sql_script = SQL_DUMP_PATH.read_text(encoding="utf-8")

    if DB_PATH.exists():
        DB_PATH.unlink()

    con = sql.connect(DB_PATH)
    try:
        cur = con.cursor()
        cur.execute("PRAGMA foreign_keys = ON")
        cur.executescript(sql_script)
        con.commit()
        print(f"Success! Database has been created at {DB_PATH}.")
    except sql.Error:
        con.rollback()
        raise
    finally:
        con.close()


if __name__ == "__main__":
    main()
