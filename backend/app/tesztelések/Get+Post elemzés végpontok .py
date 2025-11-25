from app.database import Database, JoinTypes
import os
import pprint

pp = pprint.PrettyPrinter(width=80, compact=True, sort_dicts=False)

db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database.db")
db:Database = Database(db_path)
db.build_database()
USER = "VVZDMQ"

'''
>> {} // nincs egyetlen napi költés sem.

>> {'2025-11-10': {}, '2025-11-9': {}} // van két napi költés de ahoz nem tartozik semmi

>> {'2025-11-10': {'Utazás': {'szin_kod': 'FFAA33',     // van 2 napi költés, amihez tartozik 2-2 költési kategória. a kötlési kategóriákhoz még nincs költés rendelve
                           'koltesek': []},
                'AI propaganda': {'szin_kod': 'BABAFF',
                                  'koltesek': []}},
    '2025-11-9': {'Tisza adó': {'szin_kod': 'AAFF11',
                             'koltesek': []},
               'Fidesz adó': {'szin_kod': '5467FF',
                              'koltesek': []}}}
                              
>> {'2025-11-10': { 
                    'Utazás': {
                           'szin_kod': 'FFAA33',
                           'koltes_id': 1,
                           'koltesek': [
                                    {'leiras': 'Családi adókedvezmény','osszeg': 99000},
                                    {'leiras': 'Babaváróhitel törlesztés', 'osszeg': 10000}
                                    ]
                                },
                    'AI propaganda': {
                                'szin_kod': 'BABAFF',
                                'koltes_id': 2,
                                'koltesek': [
                                        {'leiras': 'Családi adókedvezmény', 'osszeg': 99000},
                                               {'leiras': 'Babaváróhitel törlesztés', 'osszeg': 10000}
                                            ]
                                        }
                    },
 '2025-11-9': {
                'Tisza adó': {
                        'szin_kod': 'AAFF11',
                        'koltes_id': 3,
                        'koltesek': [
                                {'leiras': 'Kitalált Tisza adó','osszeg': 3500},
                                {'leiras': 'Kitalált Tisza adó2','osszeg': 33000}
                                ]
                          },
                'Fidesz adó': {
                        'szin_kod': '5467FF',
                        'koltes_id': 4,
                        'koltesek': [
                                {'leiras': 'Kitalált Tisza adó', 'osszeg': 3500},
                                {'leiras': 'Kitalált Tisza adó2','osszeg': 33000}
                                ]
                            }
                }
}

'''


def get_kategoria_koltesek(kategoria_id: int) -> list:
    koltesek = db.select_koltesek(1, kategoria_id)
    return [{"leiras": z[2], "osszeg": z[3]} for z in koltesek]

def get_nap_kategoriak(nap_id: int) -> dict:
    end = {}
    for y in db.select_koltesi_kategoriak(0, nap_id):
        kategoria_nevek = db.select_kategoria_nevek(0, y[2])[0]
        end[kategoria_nevek[1]] = {"szin_kod": kategoria_nevek[2], "koltes_id":y[1], "koltesek": get_kategoria_koltesek(y[0])}
    return end

def get_napi_koltesek():
    eredmeny = {}
    napok = db.select_napi_koltesek(0, USER)
    for i in napok:
        datum = i[2]
        eredmeny[datum] = get_nap_kategoriak(i[1])
    return eredmeny

print(get_napi_koltesek())

#print("Napi költések tábla: ", db.select_napi_koltesek(0, USER))
#print("koltesi kategóriák tábla: ", db.fetch_all("select * from koltesi_kategoriak"))
#print("Kategória nevek tábla: ", db.select_kategoria_nevek(3, USER))


'''
db.execute("DELETE FROM koltesek")
db.execute("DELETE FROM koltesi_kategoriak")
db.execute("DELETE FROM napi_koltesek")

db.add_napi_koltes(USER, "2025-11-9")
db.add_napi_koltes(USER, "2025-11-22")

db.add_koltesi_kategoria(1, 1)
db.add_koltesi_kategoria(1, 4)
db.add_koltesi_kategoria(2, 2)
db.add_koltesi_kategoria(2, 3)

db.add_koltesek(1, "Kitalált Tisza adó", 3500)
db.add_koltesek(1, "Kitalált Tisza adó2", 33_000)

db.add_koltesek(2, "Családi adókedvezmény", 99_000)
db.add_koltesek(2, "Babaváróhitel törlesztés", 10_000)

db.add_koltesek(3, "Kínai út", 50_000)
db.add_koltesek(3, "Kocsmai látogatás", 900)

db.add_koltesek(4, "Csak egy zápor", 1_000_000)
db.add_koltesek(4, "33%-os tortaelvétel", 50_000_000)
db.add_koltesek(4, "Láda gyémánt 33% ", 50_000_000)
'''




print("-"*50)
#a = get_napi_koltesek1()
#b = get_napi_koltesek2()
#print(b == a)

#er = db.egyszeru_select("felhasznalok", (0, 1, 2), (22, 33, 55), "AND")
#er2 = db.univerzalis_join("felhasznalok", "napi_koltesek", JoinTypes.LEFT, (0, 4, 6), ("VVZDMQ", "IDK ki", "2025"), return_count=True)
#er2 = db.univerzalis_join("napi_koltesek", "koltesi_kategoriak", JoinTypes.INNER, (2,5), ("2025-11-9", 4))
#er2 = db.select_napi_koltesek((0, 2), (USER, "2025-11-9"))
#er2 = db.add_koltesi_kategoria(1, 2)
er2 = db.select_kategoria_nevek(3, USER)


print(er2)
