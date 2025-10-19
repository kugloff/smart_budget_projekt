from __future__ import annotations
import sqlite3
from enum import Enum
import os

class TipusConst(Enum):
    INTEGER = "INTEGER"
    VARCHAR = "VARCHAR(?)"
    DATE = "DATE"

class MegkotesConst(Enum):
    URES = ""
    PK = "PRIMARY KEY"
    NN = "NOT NULL"
    NN_UK = "NOT NULL UNIQUE"

def init_tables() -> dict:
    Tables = {}

    # mező sorrenden tilos módosítani, illetve a tábla dict kulcsain is. új mezőt a végére kell tenni.
    Felhasznalok = TableBluePrint("Felhasznalok", ":felhasznalok")
    Felhasznalok.Add_mezo("user_id", TipusConst.VARCHAR, adat_hossz=70, megkotes=MegkotesConst.PK)
    Felhasznalok.Add_mezo("email", TipusConst.VARCHAR, adat_hossz=100, megkotes=MegkotesConst.NN_UK)
    Felhasznalok.Add_mezo("jelszo", TipusConst.VARCHAR, adat_hossz=400, megkotes=MegkotesConst.NN)
    Felhasznalok.Add_mezo("koltesi_limit", TipusConst.INTEGER)
    Tables["felhasznalok"] = Felhasznalok

    napi_koltesek = TableBluePrint("napi_koltesek", ":napi_koltesek")
    napi_koltesek.Add_mezo("user_id", TipusConst.VARCHAR, adat_hossz=70)
    napi_koltesek.Add_mezo("kategoria_csoport_id", TipusConst.INTEGER, megkotes=MegkotesConst.NN)
    napi_koltesek.Add_mezo("datum", TipusConst.DATE, megkotes=MegkotesConst.NN)
    napi_koltesek.Add_Table_PK(0, 1)
    napi_koltesek.Add_Table_FK(0, Felhasznalok, 0, True)
    Tables["napi_koltesek"] = napi_koltesek

    kategoria_nevek = TableBluePrint("Kategoria_nevek", ":kategoria_nevek")
    kategoria_nevek.Add_mezo("id", TipusConst.INTEGER, megkotes=MegkotesConst.PK)
    kategoria_nevek.Add_mezo("nev", TipusConst.VARCHAR, adat_hossz=45)
    kategoria_nevek.Add_mezo("szin_kod", TipusConst.VARCHAR, adat_hossz=6)
    Tables["kategoria_nevek"] = kategoria_nevek

    koltesi_kategoriak = TableBluePrint("koltesi_kategoriak", ":koltesi_kategoriak")
    koltesi_kategoriak.Add_mezo("kategoria_csoport_id", TipusConst.INTEGER)
    koltesi_kategoriak.Add_mezo("koltes_id", TipusConst.INTEGER)
    koltesi_kategoriak.Add_mezo("kategoria_nev_id", TipusConst.INTEGER, megkotes=MegkotesConst.NN)
    koltesi_kategoriak.Add_Table_PK(0, 1)
    koltesi_kategoriak.Add_Table_FK(0, napi_koltesek, 1, True)
    koltesi_kategoriak.Add_Table_FK(2, kategoria_nevek, 0)
    Tables["koltesi_kategoriak"] = koltesi_kategoriak

    koltesek = TableBluePrint("koltesek", ":koltesek")
    koltesek.Add_mezo("id", TipusConst.INTEGER)
    koltesek.Add_mezo("koltes_id", TipusConst.INTEGER)
    koltesek.Add_mezo("leiras", TipusConst.VARCHAR, adat_hossz=100)
    koltesek.Add_mezo("osszeg", TipusConst.INTEGER, megkotes=MegkotesConst.NN)
    koltesek.Add_Table_PK(0, 1)
    koltesek.Add_Table_FK(1, koltesi_kategoriak, 1, True)
    Tables["koltesek"] = koltesek

    return Tables

class TableBluePrint:
    def __init__(self, table_name:str, osztaly_id:str):
        self.table_name = table_name
        self.osztaly_id = osztaly_id
        self.mezonevek = []
        self.create_sorok = []

    def Add_mezo(self, mezo_nev:str, tipus:TipusConst, adat_hossz:int=0, megkotes:MegkotesConst=MegkotesConst.URES):
        self.mezonevek.append(mezo_nev)
        self.create_sorok.append({"sql":f"\t{mezo_nev} {tipus.value.replace('?', str(adat_hossz))}{f' {megkotes.value}' if megkotes.value != '' else ''}", "hossz":adat_hossz})

    def Add_Table_PK(self, *indexek:int):
        self.Table_megkotes(f"PRIMARY KEY({', '.join([self.mezonevek[i] for i in indexek])})")

    def Add_Table_FK(self, kapcsolomezo_sajat:int, referencia_table:TableBluePrint, referencia_kapcsolomezo:int, onDelete:bool=False):
        self.Table_megkotes(f"FOREIGN KEY ({self.mezonevek[kapcsolomezo_sajat]}) REFERENCES {referencia_table.table_name} ({referencia_table.mezonevek[referencia_kapcsolomezo]}){' ON DELETE CASCADE' if onDelete else ''}")

    def Table_megkotes(self, megkotes:str):
        self.create_sorok.append({"sql":"\t"+megkotes, "hossz":0})

    def ToSQL(self) -> str:
        return f"CREATE TABLE IF NOT EXISTS {self.table_name} (\n{",\n".join([i['sql'] for i in self.create_sorok])}\n)"

    def ToINSERT_INTO(self, VALUES:tuple):
        return f"INSERT INTO {self.table_name} ({','.join(self.mezonevek)}) VALUES ({','.join(VALUES)})"


class Database:
    def __init__(self, db_path):
        self.db_path = db_path
        self.tables = init_tables()

    def connect(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA foreign_keys = ON;") # szükséges a cascade törléshez
        return conn

    def execute(self, query:str, params:tuple=(), error_print=True) -> bool:
        try:
          with self.connect() as conn:
              cursor = conn.cursor()
              cursor.execute(query, params)
              conn.commit()
              return True
        except sqlite3.Error as e:
            if error_print: print(f"Hiba az adatbázis művelet során: {e}, query: {query}, params: {params}")
            return False

    def fetch_all(self, query:str, params:tuple=(), error_print=True) -> list: # minta kimenet [(adat1, adat2, ...), (adat1, adat2, ...), (...), ...]
        try:
          with self.connect() as conn:
              cursor = conn.cursor()
              cursor.execute(query, params)
              return cursor.fetchall()
        except sqlite3.Error as e:
            if error_print: print(f"Hiba a lekérdezés során: {e}")
            return []

    def fetch_one(self, query:str, params:tuple=(), error_print=True) -> tuple|None: # minta kienet: (adat1, adat2, adat3, ...)
        try:
          with self.connect() as conn:
              cursor = conn.cursor()
              cursor.execute(query, params)
              return cursor.fetchone()
        except sqlite3.Error as e:
            if error_print: print(f"Hiba a lekérdezés során: {e}")
            return None

    def build_database(self):
        for tabla_blueprint in self.tables.values():
            self.execute(tabla_blueprint.ToSQL())

    def rebuild_database(self):
        for tabla_blueprint in self.tables.values():
            self.execute(f"DROP TABLE IF EXISTS {tabla_blueprint.table_name}")
            self.execute(tabla_blueprint.ToSQL())

    def print_database_shema(self):
        print('\n'.join([i.ToSQL() for i in self.tables.values()]))

    # felhasználók kezelése
    def add_felhasznalo(self, user_id, email, jelszo_hash) -> bool:
        table_blueprint: TableBluePrint = self.tables["felhasznalok"]
        return self.execute(table_blueprint.ToINSERT_INTO((user_id, email, jelszo_hash)), error_print=False)
    def edit_felhasznalo(self):
        pass

    # napi költések kezelése
    def add_napi_koltes(self):
        pass
    def edit_napi_koltes(self):
        pass
    def delete_napi_koltes(self):
        pass

    # költési kategóriák kezelése
    def add_koltesi_kategoria(self):
        pass
    def edit_koltesi_kategoria(self):
        pass
    def delete_koltesi_kategoria(self):
        pass

    # költések kezelése
    def add_koltesek(self):
        pass
    def edit_koltesek(self):
        pass
    def delete_koltesek(self):
        pass

    # kategoria nevek kezelése
    def add_kategoria_nev(self):
        pass
    def edit_kategoria_nev(self):
        pass
    def delete_kategoria_nev(self):
        pass

    # különböző lekérések
    def select_felhasznalo(self, where_mezo:int, where_adat:str|int, van_adat:bool=False) -> tuple|bool|None:
        table_blueprint: TableBluePrint = self.tables["felhasznalok"]
        eredmeny = self.fetch_one(f"SELECT * FROM {table_blueprint.table_name} WHERE {table_blueprint.mezonevek[where_mezo]}=?", where_adat)
        return eredmeny is not None if van_adat else eredmeny



db_path = os.path.join(os.path.dirname(__file__), "database.db")
db = Database(db_path)