# 1. Követelményspecifikáció

## Projekt neve
**SmartBudget – AI alapú személyes pénzügyi tanácsadó webalkalmazás**

## Készítette
Kis Gergő, Vanczák Tamás, Varga Zsófia
(React + Flask fejlesztés)  
Dátum: 2025. október

---

## 1.1 Jelenlegi helyzet leírása
A legtöbb felhasználó napjainkban nehezen követi nyomon a személyes pénzügyeit.  
Bár számos költségkövető alkalmazás létezik, a legtöbb csak rögzíti az adatokat, de **nem nyújt valós elemzést vagy személyre szabott tanácsot**.  
A felhasználók gyakran táblázatokat vezetnek, de ezek elemzése időigényes és nehezen átlátható.  

Hiányzik egy **felhasználóbarát, webalapú megoldás**, ami egyszerűen kezelhető, vizuálisan megjeleníti a kiadásokat, és **intelligens elemzéseket nyújt** a bevitt adatok alapján.

---

## 1.2 Vágyálomrendszer leírása
A cél egy olyan **webalkalmazás**, amely:
- böngészőből elérhető (asztali és mobil nézetben is),
- a felhasználó ott, helyben viheti fel a kiadásait,
- automatikusan összesíti és kategorizálja azokat,
- interaktív grafikonokon jeleníti meg az adatokat,
- és **mesterséges intelligencia segítségével értékeli a költési szokásokat**, illetve javaslatokat ad megtakarításra.  

A rendszer legyen **egyszerű, átlátható, látványos és valós időben működő**.  
A felhasználók adatbiztonságát alapvető szinten garantálni kell (pl. lokális adatbázis, jelszavas hozzáférés opcionálisan).

---

## 1.3 Rendszerre vonatkozó pályázat, törvények, rendeletek, szabványok és ajánlások
- **GDPR (EU 2016/679)** – személyes adatok kezelése, ha felhasználói adatok tárolása megvalósul.  
- **ISO/IEC 9126 szabvány** – a szoftver minőségi jellemzőinek irányelvei (helyesség, használhatóság, karbantarthatóság stb.).  
- **WCAG 2.1** – alapvető webes hozzáférhetőségi irányelvek (reszponzív megjelenés, olvashatóság).  
- **Google Generative AI Terms of Service** – a Gemini AI API használati feltételeinek betartása.  
- **Python Flask és React keretrendszer licenszei** – nyílt forráskódú komponensek megfelelő használata.

---

## 1.4 Jelenlegi üzleti folyamatok modellje
**Jelenlegi helyzet:**
- A felhasználók manuálisan vezetik költségeiket Excelben vagy jegyzetfüzetben, esetleg papíron
- Az adatok nem kerülnek elemzésre.  
- Nincs automatikus visszajelzés vagy tanácsadás. 

---

## 1.5 Igényelt üzleti folyamatok modellje
**Tervezett folyamat:**

1. A felhasználó bejelentkezik az alkalmazásba.  
2. A főoldalon megadja a napi kiadásokat (összeg, kategória, dátum, megjegyzés).  
3. Az adatok eltárolódnak a Flask backend SQLite adatbázisában.  
4. A rendszer valós időben frissíti a grafikonokat.  
5. A felhasználó az AI-tól kérhet szöveges visszajelzést.  
6. A Google Gemini AI elemzi a kiadásokat, és személyre szabott javaslatokat küld vissza.  
7. Az eredmények megjelennek a React frontendben, letisztult vizuális formában.

---

## 1.6 Követelménylista

### 1.6.1 Funkcionális követelmények
| Azonosító | Követelmény |
|------------|--------------|
| F1 | A rendszer biztosítson webes felületet a kiadások beviteléhez (összeg, kategória, dátum, megjegyzés). |
| F2 | Az adatok mentése történjen Flask backend segítségével SQLite adatbázisba. | 
| F3 | A felhasználó megtekinthesse a korábbi kiadásokat listanézetben. | 
| F4 | A rendszer generáljon kategóriánkénti statisztikát és grafikus megjelenítést. | 
| F5 | A rendszer képes legyen mesterséges intelligencia segítségével elemzést és tanácsot adni a költési adatok alapján.|
| F6 | A felhasználó bármikor új elemzést kérhessen a friss adatok alapján. |
| F7 | Az AI által generált elemzést jelenítse meg olvasható, szöveges formában a webes felületen. ||
| F8 | A rendszer kezelje az adatbázisban a havi adatokat (pl. szűrés év, hónap alapján). | 
| F9 | A felhasználó törölhessen vagy szerkeszthessen meglévő bejegyzéseket. |
| F10 | A rendszer reszponzív legyen, mobil és desktop nézetben is használható. |

---

### 1.6.2 Nemfunkcionális követelmények
| Azonosító | Követelmény
|------------|--------------|
| N1 | **Helyesség:** Az adatok feldolgozása pontosan és hibamentesen történjen. |
| N2 | **Használhatóság:** A felhasználói felület legyen áttekinthető, intuitív és gyors. |
| N3 | **Megbízhatóság:** Az alkalmazás kezelje az esetleges hálózati vagy API hibákat. |
| N4 | **Adaptálhatóság:** A rendszer működjön különböző böngészőkben és eszközökön. |
| N5 | **Karbantarthatóság:** A kód legyen moduláris, jól dokumentált, könnyen bővíthető. |
| N6 | **Hatékonyság:** Az AI elemzés és adatfeldolgozás rövid időn belül fusson le. |
| N7 | **Hibatűrés:** Hibás adatbevitel esetén a rendszer jelezzen, de ne fusson le hibára. |
| N8 | **Bővíthetőség:** Később lehessen hozzáadni bevétel-kezelést, célmeghatározást, riportokat. |
| N9 | **Kompatibilitás:** Flask REST API és React frontend közti kommunikáció JSON formátumban történjen. | 
| N10 | **Könnyű elérhetőség:** A rendszer egyszerűen telepíthető és lokálisan futtatható. |

---

## 1.7 Irányított és szabad szöveges riportok
- **Irányított riport:** havi statisztikai összefoglaló kategóriák szerint (pl. étel, rezsi, közlekedés).  
- **Szabad szöveges riport:** a Gemini AI által készített személyre szabott pénzügyi tanácsok.

> Példa: „Ebben a hónapban a legtöbbet szórakozásra költöttél.  
> Javaslom, hogy tarts heti szinten költségkorlátot.”

---

## 1.8 Fogalomszótár
| Fogalom | Jelentés |
|----------|-----------|
| **Gemini AI** | A Google mesterséges intelligencia modellje, amely elemzi a kiadási adatokat és tanácsokat generál. |
| **Flask** | Python alapú webes backend keretrendszer. |
| **React** | JavaScript alapú frontend könyvtár, amely a felhasználói felületet kezeli. |
| **SQLite** | Egyszerű, lokális relációs adatbázis, a projekt adataihoz. |
| **REST API** | Backend és frontend közti kommunikációs szabvány JSON formátumban. |
| **Frontend** | A felhasználó által látható, böngészőben futó rész (React). |
| **Backend** | Az adatok kezeléséért és az AI-kommunikációért felelős szerveroldali rész (Flask). |
| **Prompt** | Az AI-nak küldött szöveges kérés vagy utasítás. |
