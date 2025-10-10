# 3. Ütemterv

## Projekt: SmartBudget – AI alapú személyes pénzügyi tanácsadó
**Időtartam:** 3 hónap (12 hét)  
**Cél:** Az első verzió elkészítése, ami a felhasználó számára lehetővé teszi a költségek bevitelét, listázását, grafikonos megjelenítését és AI alapú elemzést.

---

## 1. Fejlesztési fázisok és időbeosztás

| Hét | Feladat | Funkciók / Modulok | Megjegyzés |
|-----|---------|------------------|------------|
| 1-2 | Projekt előkészítés | Repo létrehozása, mappastruktúra, README.md, követelményspecifikáció és funkcionális specifikáció véglegesítése | Dokumentációval együtt, alap repo feltöltés GitHub-ra |
| 3-4 | Frontend alapok | React projekt létrehozása, alap layout, menü, navigáció, űrlapok | Felhasználói beviteli felület kialakítása |
| 5-6 | Backend alapok | Flask REST API létrehozása, SQLite adatbázis, CRUD műveletek kiadásokra | POST / GET / PUT / DELETE végpontok |
| 7 | Frontend-backend integráció | Adatok lekérése és küldése az API-n keresztül, listanézetek frissítése | JSON alapú kommunikáció |
| 8 | Grafikonok és statisztikák | Kategória szerinti grafikonok (Pie/Bar chart), összesítések | Recharts vagy Chart.js használata |
| 9 | AI elemzés integráció | OpenAI API hívás, promptok előkészítése, AI válasz megjelenítése | Gombok, chat-felület Frontendre |
| 10 | Felhasználói interakciók | Bejegyzés szerkesztés, törlés, hibakezelés, adatvalidálás | UI, hibajelzés |
| 11 | Tesztelés és hibajavítás | Egységtesztek, integrációs tesztek, UI tesztelés | Frontend és backend funkciók ellenőrzése |
| 12 | Dokumentáció és leadás | Projekt dokumentáció, képernyőtervek, use case diagramok, végső README.md | RFT leadásra kész verzió |

---

## 2. Verziók és funkciók ütemezése

| Verzió | Funkciók | Megvalósítási státusz |
|--------|----------|----------------------|
| V1.0 (3 hónap) | Kiadások bevitele, listázás, grafikonok, AI elemzés | Kötelező funkciók |
| V1.1 (később) | Havi célok, további AI elemzések | Későbbi verzióba halasztva |
| V1.2 | Felhasználói fiókok, felhő alapú szinkronizáció, bővített riportok | Későbbi verzióba halasztva |

---

## Megjegyzés
- Az ütemterv rugalmas, a csúszások és a visszajelzések figyelembevételével módosítható.  
- Az első verzió célja, hogy a **lényegi funkciók** működjenek, a bővítmények későbbi verzióban kerülnek bevezetésre.  
- Az ütemterv alapja a **2. Funkcionális specifikáció** és a **3. Követelményspecifikáció**-ban felsorolt prioritások.
