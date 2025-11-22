from __future__ import annotations
import sqlite3
from enum import Enum

class TipusConst(Enum):
    INTEGER = "INTEGER"
    VARCHAR = "VARCHAR(?)"
    DATE = "DATE"

class MegkotesConst(Enum):
    URES = ""
    PK = "PRIMARY KEY"
    NN = "NOT NULL"
    NN_UK = "NOT NULL UNIQUE"

class JoinTypes(Enum):
    INNER = "INNER JOIN"
    LEFT = "LEFT JOIN"
    CROSS = "CROSS JOIN" # Descartes-szorzat
    NATURAL = "NATURAL JOIN" # automatikus oszlopnévegyezés

class LogikaiOperatorok(Enum):
    AND = "AND"
    OR = "OR"


def init_tables() -> dict:
    Tables = {}

    # mező sorrenden tilos módosítani, illetve a tábla dict kulcsain is. új mezőt a végére kell tenni.
    Felhasznalok = TableBluePrint("felhasznalok")
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
    kategoria_nevek.Add_mezo("nev", TipusConst.VARCHAR, adat_hossz=45, megkotes=MegkotesConst.NN)
    kategoria_nevek.Add_mezo("szin_kod", TipusConst.VARCHAR, adat_hossz=6, megkotes=MegkotesConst.NN)
    kategoria_nevek.Add_mezo("tulajdonos", TipusConst.VARCHAR, adat_hossz=70, megkotes=MegkotesConst.NN)
    kategoria_nevek.Table_megkotes(f"UNIQUE({kategoria_nevek.mezonevek[1]}, {kategoria_nevek.mezonevek[3]})")
    Tables["kategoria_nevek"] = kategoria_nevek

    koltesi_kategoriak = TableBluePrint("koltesi_kategoriak")
    koltesi_kategoriak.Add_mezo("kategoria_csoport_id", TipusConst.INTEGER, megkotes=MegkotesConst.NN)
    koltesi_kategoriak.Add_mezo("koltes_id", TipusConst.INTEGER, megkotes=MegkotesConst.PK)
    koltesi_kategoriak.Add_mezo("kategoria_nev_id", TipusConst.INTEGER, megkotes=MegkotesConst.NN)
    koltesi_kategoriak.Add_Table_FK(0, napi_koltesek, 1, True)
    koltesi_kategoriak.Add_Table_FK(2, kategoria_nevek, 0)
    koltesi_kategoriak.Table_megkotes(f"UNIQUE({koltesi_kategoriak.mezonevek[0]}, {koltesi_kategoriak.mezonevek[2]})")
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
        self.PK = None
        self.FK = {}
        self.create_sorok = []

    @property
    def TN(self) -> str:
        return self.table_name[0:2]

    def generate_where(self, where_mezo:tuple[int, ...], operator:LogikaiOperatorok=LogikaiOperatorok.AND, alias:str="") -> str:
        return f' {operator.value} '.join([f"{alias}" + self.mezonevek[i] + '=?' for i in where_mezo])

    def J_generate_where(self, mezonevek:dict[int, tuple[str, str]],  where_mezo:tuple[int, ...], operator:LogikaiOperatorok=LogikaiOperatorok.AND) -> str:
        darabok = []
        for i in where_mezo:
            mezo,alias = mezonevek[i]
            darabok.append(f"{alias}.{mezo}=?")
        return f' {operator.value} '.join(darabok)

    def Add_mezo(self, mezo_nev:str, tipus:TipusConst, adat_hossz:int=0, megkotes:MegkotesConst=MegkotesConst.URES):
        self.mezonevek.append(mezo_nev)
        if megkotes == MegkotesConst.PK:
            self.PK = mezo_nev
        self.create_sorok.append({"sql":f"\t{mezo_nev} {tipus.value.replace('?', str(adat_hossz))}{f' {megkotes.value}' if megkotes.value != '' else ''}", "hossz":adat_hossz})

    #def Add_Table_PK(self, *indexek:int):
    #    self.Table_megkotes(f"PRIMARY KEY({', '.join([self.mezonevek[i] for i in indexek])})")

    def Add_Table_FK(self, kapcsolomezo_sajat:int, referencia_table:TableBluePrint, referencia_kapcsolomezo:int, onDelete:bool=False):
        self.FK[referencia_table.table_name] = self.mezonevek[kapcsolomezo_sajat]
        self.Table_megkotes(f"FOREIGN KEY ({self.mezonevek[kapcsolomezo_sajat]}) REFERENCES {referencia_table.table_name} ({referencia_table.mezonevek[referencia_kapcsolomezo]}){' ON DELETE CASCADE' if onDelete else ''}")

    def Table_megkotes(self, megkotes:str):
        self.create_sorok.append({"sql":"\t"+megkotes, "hossz":0})

    def ToSQL(self) -> str:
        return f"CREATE TABLE IF NOT EXISTS {self.table_name} (\n" + ",\n".join([i['sql'] for i in self.create_sorok]) + "\n)"

    def ToDROP_TABLE(self) -> str:
        return f"DROP TABLE IF EXISTS {self.table_name}"

    def ToINSERT_INTO(self, values_db:int) -> str:
        return f"INSERT INTO {self.table_name} ({','.join(self.mezonevek)}) VALUES ({', '.join(['?']*values_db)})"

    def ToUPDATE_TABLE(self, edit_mezo:tuple[int, ...], where_mezo:tuple[int, ...]) -> str:
        return f"UPDATE {self.table_name} SET {self.generate_where(edit_mezo)} WHERE {self.generate_where(where_mezo)}"

    def ToDELETE_FROM(self, where_mezo:tuple[int, ...]) -> str:
        return f"DELETE FROM {self.table_name} WHERE {self.generate_where(where_mezo)}"

    def ToSimpleSELECT(self, where_mezo:tuple[int, ...], operator:LogikaiOperatorok, return_count:bool) -> str:
        return f"SELECT {"count(*)" if return_count else "*"} FROM {self.table_name} WHERE {self.generate_where(where_mezo, operator)}"


    def To_Join(self, kapcsolt_tabla:TableBluePrint, join_type:JoinTypes, where_mezo:tuple[int, ...]|int, operator:LogikaiOperatorok=LogikaiOperatorok.AND, return_count:bool=False) -> str:
        # módosítani kell mert nem lehet Pk hoz PK-t kötni, annak nincs értelme. kezelni kell hogy egy adott táblánkak mik az idegen kulcsai, és class szinten kezelni ezt
        # vagyis ha azt mondom hogy felhasználók class hoz kötöm a napi költések class-t akkor az utóbbi tudja melyik FK-t kell adnia ami illik az első táblához.
        mezok_dict = {}
        i = 0
        for key, values in zip([self.TN, kapcsolt_tabla.TN], [self.mezonevek, kapcsolt_tabla.mezonevek]):
            for v in values:
                mezok_dict[i] = (v, key)
                i += 1
        return f"SELECT {"count(*)" if return_count else "*"} FROM {self.table_name} {self.TN} {join_type.value} {kapcsolt_tabla.table_name} {kapcsolt_tabla.TN} ON {self.TN}.{self.PK} = {kapcsolt_tabla.TN}.{kapcsolt_tabla.FK[self.table_name]} WHERE {self.J_generate_where(mezok_dict, where_mezo, operator)}"

class Database:
    def __init__(self, db_path):
        self.db_path = db_path
        self.tables = init_tables()

    @staticmethod
    def generate_where(table_blueprint, where_mezo:tuple[int, ...], operator:LogikaiOperatorok=LogikaiOperatorok.AND) -> str:
        return f' {operator} '.join([table_blueprint.mezonevek[i] + '=?' for i in where_mezo])

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
            if error_print and not return_integritas_error: print(f"A beszúranó adat megsérti a UNIQUE megkötés a táblában: {e}, query: {query} params: {params}")
            return str(e) if return_integritas_error else False
        except sqlite3.Error as e:
            if error_print and not return_integritas_error: print(f"Hiba az adatbázis művelet során: {e}, query: {query} params: {params}")
            return str(e)

    def fetch_all(self, query:str, params:tuple=(), error_print=True) -> list: # minta kimenet [(adat1, adat2, ...), (adat1, adat2, ...), (...), ...]
        try:
          with self.connect() as conn:
              cursor = conn.cursor()
              cursor.execute(query, params)
              return cursor.fetchall()
        except sqlite3.Error as e:
            if error_print: print(f"Hiba a lekérdezés során: {e}, query: {query} params: {params}")
            return []

    def fetch_one(self, query:str, params:tuple=(), error_print=True) -> tuple|None: # minta kienet: (adat1, adat2, adat3, ...)
        try:
          with self.connect() as conn:
              cursor = conn.cursor()
              cursor.execute(query, params)
              return cursor.fetchone()
        except sqlite3.Error as e:
            if error_print: print(f"Hiba a lekérdezés során: {e}, query: {query} params: {params}")
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
        return self.execute(table_blueprint.ToUPDATE_TABLE((3, ), (0, )), (koltesi_limit, user_id), error_print=False)

    # napi költések kezelése
    def add_napi_koltes(self, user_id:str, datum:str) -> bool|str:
        table_blueprint: TableBluePrint = self.tables["napi_koltesek"]
        # ha sikeresen a hozzáadás True, ha UNIQUE(user_id, datum) sért akkor "IntegrityError" ha egyéb hiba akkor False
        return self.execute(table_blueprint.ToINSERT_INTO(3), (user_id, None, datum), return_integritas_error=True)
    def delete_napi_koltes(self, where_mezo:tuple[int, ...], where_adat) -> bool:
        table_blueprint: TableBluePrint = self.tables["napi_koltesek"]
        return self.execute(table_blueprint.ToDELETE_FROM(where_mezo), where_adat, error_print=False)

    # költési kategóriák kezelése
    def add_koltesi_kategoria(self, kategoria_csoport_id:int, kategoria_nev_id:int) -> bool|str|None:
        table_blueprint: TableBluePrint = self.tables["koltesi_kategoriak"]
        return self.execute(table_blueprint.ToINSERT_INTO(3), (kategoria_csoport_id, None, kategoria_nev_id), return_integritas_error=True)
    def edit_koltesi_kategoria(self, koltes_id:int, kategoria_nev_id:int) -> bool|str|None:
        table_blueprint: TableBluePrint = self.tables["koltesi_kategoriak"]
        return self.execute(table_blueprint.ToUPDATE_TABLE((2, ), (0, )), (kategoria_nev_id, koltes_id), return_integritas_error=True)
    def delete_koltesi_kategoria(self, where_mezo:tuple[int, ...], where_adat:tuple):
        table_blueprint: TableBluePrint = self.tables["koltesi_kategoriak"]
        return self.execute(table_blueprint.ToDELETE_FROM(where_mezo), where_adat, error_print=False)

    # költések kezelése
    def add_koltesek(self, koltes_id:int, leiras:str|None, osszeg:int) -> bool|str|None:
        table_blueprint: TableBluePrint = self.tables["koltesek"]
        leiras = None if leiras == "" or leiras is None else leiras.strip()
        return self.execute(table_blueprint.ToINSERT_INTO(4), (None, koltes_id, leiras, osszeg), return_integritas_error=True)
    def edit_koltesek(self, edit_mezo:tuple[int, ...], edit_vaule:int, where_vaule:int) -> bool|None:
        table_blueprint: TableBluePrint = self.tables["koltesek"]
        return self.execute(table_blueprint.ToUPDATE_TABLE(edit_mezo, (0, )), (edit_vaule, where_vaule), error_print=False)
    def delete_koltesek(self, where_mezo:tuple[int, ...], where_adat:tuple):
        table_blueprint: TableBluePrint = self.tables["koltesek"]
        return self.execute(table_blueprint.ToDELETE_FROM(where_mezo), where_adat, error_print=False)

    # kategoria nevek kezelése
    def add_kategoria_nev(self, nev:str, szinkod:str, tulajdonos:str) -> bool:
        table_blueprint: TableBluePrint = self.tables["kategoria_nevek"]
        return self.execute(table_blueprint.ToINSERT_INTO(4), (None, nev, szinkod, tulajdonos), error_print=False)
    def edit_kategoria_nev(self, edit_mezo:tuple[int, ...], edit_value:tuple, where_mezo:tuple[int, ...], where_vaule:tuple) -> bool:
        table_blueprint: TableBluePrint = self.tables["kategoria_nevek"]
        return self.execute(table_blueprint.ToUPDATE_TABLE(edit_mezo, where_mezo), (edit_value+where_vaule), error_print=False)
    def delete_kategoria_nev(self, where_mezo:tuple[int, ...], where_adat:tuple):
        table_blueprint: TableBluePrint = self.tables["kategoria_nevek"]
        return self.execute(table_blueprint.ToDELETE_FROM(where_mezo), where_adat, error_print=False)

    # különböző lekérések
    # list<tuple> -> van adat és azt kapjuk vissza
    # bool -> kizárólag van_adat=True esetében van bool más esetben list<tuple> || True ha legalább egy rekordot ad a lekérdezés (minimum 1) || False ha a lekérdezés nem ad vissza semmit
    # [] -> ha a lekérdezés nem adott vissza egyetlen rekordot sem.
    def egyszeru_select(self, tabla_id:str, where_mezo:tuple[int, ...], where_adat:tuple, operator:LogikaiOperatorok, return_count:bool=False) -> list|int: # list<tuple>
        table_blueprint: TableBluePrint = self.tables[tabla_id]
        if return_count: return self.fetch_one(table_blueprint.ToSimpleSELECT(where_mezo, operator, return_count), where_adat)[0]
        else: return self.fetch_all(table_blueprint.ToSimpleSELECT(where_mezo, operator, return_count), where_adat)


    def select_felhasznalo(self, where_mezo:tuple[int, ...]|int, where_adat:tuple|object, operator:LogikaiOperatorok=LogikaiOperatorok.AND, return_count:bool=False) -> list|int:
        if isinstance(where_mezo, int): where_mezo, where_adat = (where_mezo,), (where_adat,)
        return self.egyszeru_select("felhasznalok",where_mezo, where_adat, operator, return_count)
    def select_napi_koltesek(self, where_mezo:tuple[int, ...]|int, where_adat:tuple|object, operator:LogikaiOperatorok=LogikaiOperatorok.AND, return_count:bool=False) -> list|int:
        if isinstance(where_mezo, int): where_mezo, where_adat = (where_mezo,), (where_adat,)
        return self.egyszeru_select("napi_koltesek",where_mezo, where_adat, operator, return_count)
    def select_koltesi_kategoriak(self, where_mezo:tuple[int, ...]|int, where_adat:tuple|object, operator:LogikaiOperatorok=LogikaiOperatorok.AND, return_count:bool=False) -> list|int:
        if isinstance(where_mezo, int): where_mezo, where_adat = (where_mezo,), (where_adat,)
        return self.egyszeru_select("koltesi_kategoriak",where_mezo, where_adat, operator, return_count)
    def select_koltesek(self, where_mezo:tuple[int, ...]|int, where_adat:tuple|object, operator:LogikaiOperatorok=LogikaiOperatorok.AND, return_count:bool=False) -> list|int:
        if isinstance(where_mezo, int): where_mezo, where_adat = (where_mezo,), (where_adat,)
        return self.egyszeru_select("koltesek",where_mezo, where_adat, operator, return_count)
    def select_kategoria_nevek(self, where_mezo:tuple[int, ...]|int, where_adat:tuple|object, operator:LogikaiOperatorok=LogikaiOperatorok.AND, return_count:bool=False) -> list|int:
        if isinstance(where_mezo, int): where_mezo, where_adat = (where_mezo,), (where_adat,)
        return self.egyszeru_select("kategoria_nevek",where_mezo, where_adat, operator, return_count)

    def univerzalis_join(self, tabla_index:str, kapcsolt_tabla_index:str, join_type:JoinTypes, where_mezo:tuple[int, ...]|int, where_adat:tuple|object, operator:LogikaiOperatorok=LogikaiOperatorok.AND, return_count:bool=False) -> list|int:
        if isinstance(where_mezo, int): where_mezo, where_adat = (where_mezo,), (where_adat,)
        table_blueprint: TableBluePrint = self.tables[tabla_index]
        print("univerzalis_join sql: "+table_blueprint.To_Join(self.tables[kapcsolt_tabla_index], join_type, where_mezo, operator))
        if return_count: return self.fetch_one(table_blueprint.To_Join(self.tables[kapcsolt_tabla_index], join_type, where_mezo, operator, return_count), where_adat)[0]
        else: return self.fetch_all(table_blueprint.To_Join(self.tables[kapcsolt_tabla_index], join_type, where_mezo, operator, return_count), where_adat)