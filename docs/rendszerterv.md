# 3. Rendszerterv

Ez a fejezet a SmartBudget alkalmazás technikai megvalósításának részleteit rögzíti, útmutatást nyújtva a fejlesztőknek az architektúra és az adatfolyamok kialakításához.

---

## 3.1 Logikai terv (Az architektúra elvei)

A rendszer ideális esetben egy teljesen eseményvezérelt alkalmazás, ahol az adatok azonnal szinkronizálódnak a felhővel, az AI pedig valós időben elemzi a felhasználó pénzügyi mozgásait.

### Rendszerarchitektúra
A szoftver egy modern **háromrétegű architektúrára** épül:
1.  **Prezentációs réteg (Frontend):** React alapú egyoldalas alkalmazás (SPA), amely komponensekre bontva kezeli a megjelenítést.
2.  **Logikai réteg (Backend):** Flask alapú REST API, amely az üzleti logikát és az AI kommunikációt (Google Gemini) vezérli.
3.  **Adatréteg (Database):** SQLite adatbázis a tranzakciók és felhasználói profilok tárolásához.

### Adatfolyam modell
1. A felhasználó interakcióba lép a React komponensekkel (pl. adatbevitel).
2. A Frontend egy **JSON** csomagot küld a Flask API végpontjának.
3. A Backend validálja az adatokat, elmenti azokat az adatbázisba, majd kérés esetén továbbítja a megfelelő adathalmazt a **Google Gemini AI** API-nak.
4. Az AI válasza a Backenden keresztül, strukturált formában jut vissza a Frontendhez, ahol a UI frissül.

---

## 3.2 Fizikai terv (A megvalósítás korlátai)

A valóságban a rendszer erőforrásait a hatékonyság és a költséghatékonyság határozza meg.

-   **Kliens oldal:** A böngésző futtatja a React alkalmazást. Figyelembe vesszük a mobilinternet sebességét, az AI elemzéseket külön oldalon kezeljük.
-   **Szerver oldal:** Python Flask környezet. Mivel az AI válaszideje változó lehet, a kéréseket válaszidőtől függően töltési/feldolgozási jelzésekkel látjuk el. 
-   **Adattárolás:** SQLite fájl alapú adatbázis, amely gyors és nem igényel külön adatbázis-szervert.
-   **API Kommunikáció:** A Google Gemini API kulcsot környezeti változóban (`.env`) tároljuk, nem a frontend kódban.

---

## 3.3 Technológiai stack

| Réteg | Technológia | Feladat |
| :--- | :--- | :--- |
| **Frontend** | React (JavaScript/JSX) | Felhasználói felület, állapotkezelés. |
| **Styling** | CSS | Reszponzív design és komponens stílusok. |
| **Backend** | Python Flask | API végpontok, adatbázis-kezelés, AI illesztés. |
| **AI** | Google Gemini API | Pénzügyi adatok elemzése és tanácsadás. |
| **Adatbázis** | SQLite | Felhasználók és kiadások tárolása. |
| **Adatátvitel** | JSON | Kommunikáció a kliens és a szerver között. |

---

## 3.4 Moduláris felépítés (React Frontend)

A frontendet moduláris szemlélettel alakítjuk ki, hogy a kód könnyen karbantartható és bővíthető legyen.

### 3.4.1 Keret komponensek (Globális)
-   **Navbar:** Navigációs sáv a Kiadások, Limit beállítása, Elemzés és AI menüpontokhoz.
-   **Footer:** Információs lábléc, verziószám és jogi nyilatkozatok.

### 3.4.2 Funkcionális modulok
-   **LoginPage:** `Login` és `Register` komponensek, validációs logikával.
-   **ExpensesPage:** A kiadások felviteléért, szerkesztéséért és törléséért felelős űrlapok.
-   **AnalysisPage:** A grafikonok (`Chart.js` vagy `Recharts`) és a havi összesítő megjelenítése.
-   **AiAssistantPage:** A Gemini AI-nak küldött lekérdezések indítása és a válaszok formázott megjelenítése.

---

## 3.5 Adatbázis séma

![image](./pics/logikai_adatbazisterv.png)

---

## 3.6 Biztonsági terv
-   **Jelszókezelés:** A backend hasheli a jelszavakat.
-   **AI Prompt Security:** Az AI-nak csak az összegeket és kategóriákat továbbítjuk elemzésre.