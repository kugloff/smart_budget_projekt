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
    Felhasznalok = TableBluePrint("Felhasznalok")
    Felhasznalok.Add_mezo("user_id", TipusConst.VARCHAR, adat_hossz=70, megkotes=MegkotesConst.PK)
    Felhasznalok.Add_mezo("email", TipusConst.VARCHAR, adat_hossz=100, megkotes=MegkotesConst.NN_UK)
    Felhasznalok.Add_mezo("jelszo", TipusConst.VARCHAR, adat_hossz=400, megkotes=MegkotesConst.NN)
    Felhasznalok.Add_mezo("koltesi_limit", TipusConst.INTEGER)
    Tables["felhasznalok"] = Felhasznalok

    napi_koltesek = TableBluePrint("napi_koltesek")
    napi_koltesek.Add_mezo("user_id", TipusConst.VARCHAR, adat_hossz=70, megkotes=MegkotesConst.NN)
    napi_koltesek.Add_mezo("kategoria_csoport_id", TipusConst.INTEGER, megkotes=MegkotesConst.PK)
    napi_koltesek.Add_mezo("datum", TipusConst.DATE, megkotes=MegkotesConst.NN)
    napi_koltesek.Add_Table_FK(0, Felhasznalok, 0, True)
    napi_koltesek.Table_megkotes(f"UNIQUE({napi_koltesek.mezonevek[0]}, {napi_koltesek.mezonevek[2]})")
    Tables["napi_koltesek"] = napi_koltesek

    kategoria_nevek = TableBluePrint("Kategoria_nevek")
    kategoria_nevek.Add_mezo("id", TipusConst.INTEGER, megkotes=MegkotesConst.PK)
    kategoria_nevek.Add_mezo("nev", TipusConst.VARCHAR, adat_hossz=45)
    kategoria_nevek.Add_mezo("szin_kod", TipusConst.VARCHAR, adat_hossz=6)
    Tables["kategoria_nevek"] = kategoria_nevek

    koltesi_kategoriak = TableBluePrint("koltesi_kategoriak")
    koltesi_kategoriak.Add_mezo("kategoria_csoport_id", TipusConst.INTEGER, megkotes=MegkotesConst.NN)
    koltesi_kategoriak.Add_mezo("koltes_id", TipusConst.INTEGER, megkotes=MegkotesConst.PK)
    koltesi_kategoriak.Add_mezo("kategoria_nev_id", TipusConst.INTEGER, megkotes=MegkotesConst.NN)
    koltesi_kategoriak.Add_Table_FK(0, napi_koltesek, 1, True)
    koltesi_kategoriak.Add_Table_FK(2, kategoria_nevek, 0)
    Tables["koltesi_kategoriak"] = koltesi_kategoriak

    koltesek = TableBluePrint("koltesek")
    koltesek.Add_mezo("id", TipusConst.INTEGER, megkotes=MegkotesConst.PK)
    koltesek.Add_mezo("koltes_id", TipusConst.INTEGER, megkotes=MegkotesConst.NN)
    koltesek.Add_mezo("leiras", TipusConst.VARCHAR, adat_hossz=100)
    koltesek.Add_mezo("osszeg", TipusConst.INTEGER, megkotes=MegkotesConst.NN)
    koltesek.Add_Table_FK(1, koltesi_kategoriak, 1, True)
    Tables["koltesek"] = koltesek

    return Tables

class TableBluePrint:
    def __init__(self, table_name:str):
        self.table_name = table_name
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

    def ToDROP_TABLE(self) -> str:
        return f"DROP TABLE IF EXISTS {self.table_name}"

    def ToINSERT_INTO(self, values_db:int) -> str:
        return f"INSERT INTO {self.table_name} ({','.join(self.mezonevek)}) VALUES ({', '.join(['?']*values_db)})"

    def ToUPDATE_TABLE(self, edit_mezo:int, where_mezo:int) -> str:
        return f"UPDATE {self.table_name} SET {self.mezonevek[edit_mezo]} = ? WHERE {self.mezonevek[where_mezo]} = ?"

    def ToDELETE_FROM(self, where_mezo:int) -> str:
        return f"DELETE FROM {self.table_name} WHERE {self.mezonevek[where_mezo]} = ?"

class Database:
    def __init__(self, db_path):
        self.db_path = db_path
        self.tables = init_tables()

    def connect(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA foreign_keys = ON;") # szükséges a cascade törléshez
        return conn

    def execute(self, query:str, params:tuple=(), error_print:bool=True, return_integritas_error:bool=False) -> bool|str:
        try:
          with self.connect() as conn:
              cursor = conn.cursor()
              cursor.execute(query, params)
              conn.commit()
              return True
        except sqlite3.IntegrityError as e:
            if error_print and not return_integritas_error: print(f"A beszúranó adat megsérti a UNIQUE megkötés a táblában: {e}, query: {query}, params: {params}")
            return str(e) if return_integritas_error else False
        except sqlite3.Error as e:
            if error_print and not return_integritas_error: print(f"Hiba az adatbázis művelet során: {e}, query: {query}, params: {params}")
            return str(e)

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
        with self.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("PRAGMA foreign_keys = OFF;")
            for tabla_blueprint in self.tables.values():
                cursor.execute(f"DROP TABLE IF EXISTS {tabla_blueprint.table_name}")
            cursor.execute("PRAGMA foreign_keys = ON;")
            conn.commit()
        for tabla_blueprint in self.tables.values():
            self.execute(tabla_blueprint.ToSQL())

    def print_database_shema(self):
        print('\n'.join([i.ToSQL() for i in self.tables.values()]))

    # felhasználók kezelése
    def add_felhasznalo(self, user_id:str, email:str, jelszo_hash:str) -> bool:
        table_blueprint: TableBluePrint = self.tables["felhasznalok"]
        return self.execute(table_blueprint.ToINSERT_INTO(4), (user_id, email, jelszo_hash, None), error_print=False)
    def edit_felhasznalo(self, user_id:str, koltesi_limit:int|None) -> bool:
        table_blueprint: TableBluePrint = self.tables["felhasznalok"]
        return self.execute(table_blueprint.ToUPDATE_TABLE(3, 0), (koltesi_limit, user_id), error_print=False)

    # napi költések kezelése
    def add_napi_koltes(self, user_id:str, datum:str) -> bool|str:
        table_blueprint: TableBluePrint = self.tables["napi_koltesek"]
        # ha sikeresen a hozzáadás True, ha UNIQUE(user_id, datum) sért akkor "IntegrityError" ha egyéb hiba akkor False
        return self.execute(table_blueprint.ToINSERT_INTO(3), (user_id, None, datum), return_integritas_error=True)
    def delete_napi_koltes(self, where_mezo:int, where_vaule) -> bool:
        table_blueprint: TableBluePrint = self.tables["napi_koltesek"]
        return self.execute(table_blueprint.ToDELETE_FROM(where_mezo), (where_vaule, ), error_print=False)

    # költési kategóriák kezelése
    def add_koltesi_kategoria(self, kategoria_csoport_id:int, kategoria_nev_id:int) -> bool|str|None:
        table_blueprint: TableBluePrint = self.tables["koltesi_kategoriak"]
        return self.execute(table_blueprint.ToINSERT_INTO(3), (kategoria_csoport_id, None, kategoria_nev_id), return_integritas_error=True)
    def edit_koltesi_kategoria(self, koltes_id:int, kategoria_nev_id:int) -> bool|str|None:
        table_blueprint: TableBluePrint = self.tables["koltesi_kategoriak"]
        return self.execute(table_blueprint.ToUPDATE_TABLE(2, 0), (kategoria_nev_id, koltes_id), return_integritas_error=True)
    def delete_koltesi_kategoria(self, where_mezo:int, where_vaule):
        table_blueprint: TableBluePrint = self.tables["koltesi_kategoriak"]
        return self.execute(table_blueprint.ToDELETE_FROM(where_mezo), (where_vaule, ), error_print=False)

    # költések kezelése
    def add_koltesek(self, koltes_id:int, leiras:str|None, osszeg:int) -> bool|str|None:
        table_blueprint: TableBluePrint = self.tables["koltesek"]
        leiras = None if leiras == "" or leiras is None else leiras.strip()
        return self.execute(table_blueprint.ToINSERT_INTO(4), (None, koltes_id, leiras, osszeg), return_integritas_error=True)
    def edit_koltesek(self, edit_mezo:int, edit_vaule:int, where_vaule:int) -> bool|None:
        table_blueprint: TableBluePrint = self.tables["koltesek"]
        return self.execute(table_blueprint.ToUPDATE_TABLE(edit_mezo, 0), (edit_vaule, where_vaule), error_print=False)
    def delete_koltesek(self, where_mezo:int, where_vaule:int):
        table_blueprint: TableBluePrint = self.tables["koltesek"]
        return self.execute(table_blueprint.ToDELETE_FROM(where_mezo), (where_vaule,), error_print=False)

    # kategoria nevek kezelése
    def add_kategoria_nev(self, nev:str, szinkod:str) -> bool:
        table_blueprint: TableBluePrint = self.tables["kategoria_nevek"]
        return self.execute(table_blueprint.ToINSERT_INTO(3), (None, nev, szinkod), error_print=False)
    def edit_kategoria_nev(self, edit_mezo:int, edit_value, where_vaule:int) -> bool:
        table_blueprint: TableBluePrint = self.tables["kategoria_nevek"]
        return self.execute(table_blueprint.ToUPDATE_TABLE(edit_mezo, 0), (edit_value, where_vaule), error_print=False)
    def delete_kategoria_nev(self, where_mezo:int, where_vaule:int):
        table_blueprint: TableBluePrint = self.tables["kategoria_nevek"]
        return self.execute(table_blueprint.ToDELETE_FROM(where_mezo), (where_vaule,), error_print=False)

    # különböző lekérések
    def egyszeru_select(self, tabla_id:str, where_mezo:int, where_adat, van_adat:bool=False) -> tuple|bool|None:
        table_blueprint: TableBluePrint = self.tables[tabla_id]
        eredmeny = self.fetch_one(f"SELECT * FROM {table_blueprint.table_name} WHERE {table_blueprint.mezonevek[where_mezo]}=?",(where_adat,))
        return eredmeny is not None if van_adat else eredmeny

    def select_felhasznalo(self, where_mezo:int, where_adat, van_adat:bool=False) -> tuple|bool|None:
        return self.egyszeru_select("felhasznalok",where_mezo, where_adat, van_adat)
    def select_napi_koltesek(self, where_mezo:int, where_adat, van_adat:bool=False) -> tuple|bool|None:
        return self.egyszeru_select("napi_koltesek",where_mezo, where_adat, van_adat)

db_path = os.path.join(os.path.dirname(__file__), "database.db")
db = Database(db_path)