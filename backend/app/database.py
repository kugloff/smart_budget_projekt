import sqlite3
import os

class Database:
    def __init__(self, db_path):
        self.db_path = db_path

    def connect(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def execute(self, query, params=()):
        try:
          with self.connect() as conn:
              cursor = conn.cursor()
              cursor.execute(query, params)
              conn.commit()
              return True
        except sqlite3.Error as e:
            print(f"Hiba az adatbázis művelet során: {e}, query: {query}, params: {params}")
            return False

    def fetch_all(self, query, params=()):
        try:
          with self.connect() as conn:
              cursor = conn.cursor()
              cursor.execute(query, params)
              return cursor.fetchall()
        except sqlite3.Error as e:
            print(f"Hiba a lekérdezés során: {e}")
            return []

    def fetch_one(self, query, params=()):
        try:
          with self.connect() as conn:
              cursor = conn.cursor()
              cursor.execute(query, params)
              return cursor.fetchone()
        except sqlite3.Error as e:
            print(f"Hiba a lekérdezés során: {e}")
            return None

db_path = os.path.join(os.path.dirname(__file__), "database.db")
db = Database(db_path)