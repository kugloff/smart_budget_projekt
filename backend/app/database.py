import sqlite3
import os




class TableBluePrint:
    def __init__(self, table_name):
        self.table_name = table_name
        self.mezonevek = []
        self.create_sorok = []

    def Add_mezo(self, mezo_nev:str, tipus:str, adat_hossz:int=0, megkotes:str=""):
        self.mezonevek.append(mezo_nev)
        self.create_sorok.append({"sql":f"{mezo_nev} {tipus.replace('?', str(adat_hossz))} {megkotes}", "hossz":adat_hossz})

    def ToSQL(self) -> str:
        return f"""
        CREATE TABLE {self.table_name} (
        {",\n".join(self.create_sorok)})"""


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

    def rebuild_database(self):
        # Táblák sémái és mezőlistái
        tables = [
            ("kategoria_nevek",
             '''CREATE TABLE kategoria_nevek (
                id INTEGER PRIMARY KEY,
                nev VARCHAR(45) NOT NULL,
                nev VARCHAR(6) NOT NULL
            )''',
             ["SzakID", "SzakNev"]),
            ("Szokeszletek",
             '''CREATE TABLE Szokeszletek (
                SzokeszletID INTEGER PRIMARY KEY,
                Nev VARCHAR(500) NOT NULL,
                Tulajdonos VARCHAR(100)
            )''',
             ["SzokeszletID", "Nev", "Tulajdonos"]),
        ]
        # Minden tábla migrációja
        for name, create_sql, cols in tables:
            # Ha a tábla létezik, migráljuk, különben csak létrehozzuk
            with self.connect() as conn:
                cursor = conn.cursor()
                cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name=?", (name,))
                if cursor.fetchone():
                    self.migrate_table(name, create_sql, cols)
                else:
                    self.execute(create_sql)

db_path = os.path.join(os.path.dirname(__file__), "database.db")
db = Database(db_path)