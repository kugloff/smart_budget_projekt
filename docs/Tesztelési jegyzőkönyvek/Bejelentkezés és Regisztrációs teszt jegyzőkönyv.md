# Bejelentkezés és Regisztrációs teszt jegyzőkönyv
| Tesztelést végezte | Kis Gergely Sándor |
| Operációs rendszer | Windows 11 |
| Böngésző | Google Chrome |
| Dátum | 2026.08.08 |
| Talált hibák száma | - |

---

## Testelés célja:
Annak ellenőzése, hogy a webalkalmazás megfelelően elérhető-e a megadott ip címről, és ezután az oldalra való bejelentkezés és regisztráció a követelményeknek megfelel-e.

---

## A szerver elindítása és az oldal elérhetősége és betöltése
| Tesztelés ID | Teszt neve | Elvárt működés | Bemeneti adat | Tapasztalt működés | Ítélet | Megjegyzés / Javaslat |
|:---|:---|:---|:---|:---|:---|:---|
| T-01 | Frontend build | A projekt mappában lévő run.bat megnyitása majd a frontend build | - | npm bild a várt módon lefutott | Elfogadva | - |
| T-02 | Requirement install | A requirements.txt-ben lévő modulok szükségesség alapján letöltés és telepítés | - | A parancssorban megjelent *Requirement already satisfied* szöveg minden külső modul melett | Elfogadva | - |
| T-03 | Flask szerver elindítása | Autómatikusan a szükéses modul telepítése után elindul a szever | - | Parancssorban megjelenet a szerver elindítását jelző szövegeket töbek között a *Running on http://127.0.0.1:5000* ip címen való elérhatőség | Elfogadva | - |
| T-04 | Böngészőből való elérhetőség | A böngészőben a szerver ip címét beírva megjelenik az oldal bejelentkezést és regisztrációt intéző oldala | http://127.0.0.1:5000/ | A szervernek küldött kérés megérkezett és visszakülte az elvárt oldalt | Elfogadva | - |

---

