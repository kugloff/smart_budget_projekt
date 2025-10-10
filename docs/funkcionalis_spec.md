# 2. Rendszerjavaslat kidolgozása

## 2.1. Funkcionális specifikáció

### Hivatkozások
A funkcionális specifikáció alapja a **1. Követelményspecifikáció**, amely tartalmazza:
- a jelenlegi helyzet leírását,
- a vágyálomrendszert,
- jogi és szabványi előírásokat,
- üzleti folyamatok modelljét,
- funkcionális és nemfunkcionális követelménylistát.

A következő részben a felhasználó szemszögéből írjuk le a rendszert, a használati esetekre és képernyőtervekre fókuszálva.

---

## 1. Jelenlegi helyzet
A felhasználók jelenleg manuálisan vezetik költségeiket Excelben vagy jegyzetfüzetben, az adatok nem kerülnek elemzésre, nincs automatikus pénzügyi tanácsadás. A pénzügyi döntések nem adatvezéreltek. (Hivatkozás: 1.1 Jelenlegi helyzet leírása)

---

## 2. Vágyálomrendszer
A felhasználó számára egy **webes felület** biztosítja:
- költségek bevitelét (összeg, kategória, dátum, megjegyzés),
- valós idejű grafikonos megjelenítést,
- AI alapú elemzést és személyre szabott tanácsokat.

(Hivatkozás: 1.2 Vágyálomrendszer)

---

## 3. Rendszerre vonatkozó előírások
- GDPR megfelelés, ha felhasználói adatok kerülnek tárolásra
- ISO/IEC 9126 minőségi irányelvek
- WCAG 2.1 reszponzív webes hozzáférhetőség
- OpenAI API használati feltételek
- Flask és React nyílt forráskódú licenszek

(Hivatkozás: 1.3 Rendszerre vonatkozó előírások)

---

## 4. Jelenlegi és igényelt üzleti folyamatok
- **Jelenlegi folyamatok:** manuális kiadásvezetés, nincs elemzés
- **Igényelt folyamatok:** webes adatbevitel, kategorizálás, grafikonos összegzés, AI alapú pénzügyi tanácsadás  

(Hivatkozás: 1.4 Jelenlegi- és 1.5 Igényelt üzleti folyamatok)

---

## 5. Funkciók és használati esetek

### 5.1 Fő funkciók (menük, gombok, listák)
| Funkció | Leírás | UI elem |
|---------|--------|---------|
| Kiadás rögzítése | Új költség bevitele (összeg, kategória, dátum, megjegyzés) | Űrlap (Form), "Mentés" gomb |
| Kiadások listázása | A korábbi kiadások megtekintése | Táblázat, szűrés dátum szerint |
| Kategóriánkénti statisztika | Összesítés és grafikon készítése | Pie chart, bar chart |
| AI elemzés | Költségek AI által történő elemzése és tanácsadás | "Elemzés" gomb, szöveges kártya |
| Bejegyzés szerkesztés/törlés | Meglévő kiadás módosítása vagy törlése | "Szerkesztés" és "Törlés" gomb |

---

### 5.2 Használati eset diagram
**Használati esetek (Use Case)**

[@TODO]

---

### 5.3 Forgatókönyv példa

**Forgatókönyv neve:** Havi költség elemzése  

1. A felhasználó bejelentkezik.  
2. A felhasználó rögzíti az összes havi költést az űrlapon.  
3. A rendszer elmenti az adatokat a backend SQLite adatbázisába.  
4. A felhasználó megtekinti a kiadások grafikonos összegzését.  
5. A felhasználó az "Elemzés" gombra kattint.  
6. Az AI elemzés visszaadja a szöveges pénzügyi tanácsokat.  
7. Az eredmény megjelenik a felhasználó felületén.

---

### 5.4 Funkció – követelmény megfeleltetés (traceability)

| Funkcionális követelmény (1.6.1) | Funkció a rendszerben |
|------------------------------------|---------------------|
| F1 – Kiadások bevitele | Kiadás rögzítése űrlap és "Mentés" gomb |
| F2 – Adatok mentése backendbe | SQLite adatbázis + Flask REST API |
| F3 – Kiadások listázása | Táblázat nézet, szűrés |
| F4 – Grafikon készítése | Pie/bar chart komponens |
| F5 – AI elemzés | "Elemzés" gomb + AI kártya |
| F9 – Bejegyzés szerkesztés/törlés | "Szerkesztés" és "Törlés" gombok |
| F10 – Reszponzív felület | CSS + React reszponzív komponensek |

---

## 6. Képernyőtervek

[@TODO]
- Főoldal: bevitel űrlap + kiadások táblázat + grafikon  
- Elemzés oldal: AI tanács kártya, grafikonos összegzés  
- Mobil nézet: reszponzív layout, collapsible menük

---

## 7. Fogalomszótár
(Ugyanaz, mint a követelményspecifikációban, hivatkozva: 1.8 Fogalomszótár)
