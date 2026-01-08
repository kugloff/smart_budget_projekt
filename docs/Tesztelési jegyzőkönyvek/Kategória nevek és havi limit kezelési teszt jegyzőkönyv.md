# Bejelentkezés és Regisztrációs teszt jegyzőkönyv
| Tulajdonság | Adat |
|:---|:---|
| Tesztelést végezte | Kis Gergely Sándor |
| Operációs rendszer | Windows 11 |
| Böngésző | Google Chrome |
| Dátum | 2026.08.08 |

---

## Tesztelés célja:
Annak ellenőrzése, hogy a kategória nevek kezelése és a havi költési limit beállítása és módosítása a követelményeknek megfelel-e.

### Teszt esetek lehetséges ítéletei priolitás szerint csökkenő sorrenben
| Ítélet neve | Leírás | Előforulási esetek száma |
|:---|:---|:---|
| Kritikus hiba  | Az adott funkció hibája a teljes Webszolgáltatás leállást okozza | 0 |
| Hibás működés | Az adott tesztesetben nem a várt működést tapasztaltuk | 1 |
| Esztétikai hiba | Az adott teszeset a vártaknak megfelelően lefutott funkcionálisan de a megjelenítés az nem a vártaknak megfelelően néz ki | 3 |
| Elfogadva | Az elvárt működés szerint működött a tesztelt komponens |  |

---

## Napi költési limit beállítás
| Tesztelés ID | Teszt neve | Elvárt működés | Bemeneti adat | Tapasztalt működés | Ítélet | Megjegyzés / Javaslat |
|:---|:---|:---|:---|:---|:---|:---|
| KH-01 | Költési limit beállítás 01 | A limit beállítsa gombra kattintva megjelenik egy mező ahová be lehet írni a limitet. Pozitív egész szám megadása esetén elfogadja a számot és beállítja mint limit | 1000 | A mentés után sikeresen mentésre kerül az új limit és ez alapján autómatikusa változik az oldalon lévő tartalom | Elfogadva | - |
| KH-02 | Költési limit beállítás 02 | Ezzel töröljük a havi limit megszorítást | 0 | A költési limit gombnál Nincs beállítva jelent meg, illetve a havi limit szöveg után 0 forint | Elfogadva | - |
| KH-04 | Negatív költési limit beállítás | Az oldal elutasítja a hibás adatot és megtartja a régi limitet | -100 | Az oldal elfogadta és beállította a negítív költési limitet | Hibás működés | Negatív szám elutasítása és hibaüzenet |
| KH-05 | Limit mezőbe szöveg beírás | Az oldal elutasítja | *valamilyen szöveg* | A bemeneti mező nem veszi figyelembe a szöveges adatot | Esztétikai hiba | Ha vágólapról próbálok beilleszteni szöveget akkor minden esetben *e* betű jelenik meg amire helytelen szöveg üzenet jelenik meg |

---

## Kategóriák szerkeztése
| Tesztelés ID | Teszt neve | Elvárt működés | Bemeneti adat | Tapasztalt működés | Ítélet | Megjegyzés / Javaslat |
|:---|:---|:---|:---|:---|:---|:---|
| KH-06 | Adott szín és egyedi megadott név | Az új kategória név hozzáadódik a kategória nevek listájához a kitöltött mezők szerinti adatokkal | FF0000 , Minta kategória | Az elvártnak megfelelően az új k. név rögzítésre került | Elfogadva | - |
| KH-07 | Létrehozott kategória törlése | Már létrehozott kategória (ami nincs használva) a törlés gombal törölhető | *Az előző tesztben létrehozott k. név* | A törölt kategória név törlés után eltünt a listából | Elfogadva | - |
| KH-08 | Létrehozott kategória módosítása 01 | Már létrehozott kategória szine és neve szabadon átírható és mentés gomb megnyomása után mentésre kerül | *egy már létrehozott k. név* | A mentésgomb megnyomása után a szerkeztések sikeresen mentésre kerülnek és erről üzenet is megjelenik | Elfogadva | - |
| KH-09 | Létrehozott kategória módosítása 02 | Ha olyan k. nevet módosítunk ami már használva van akkor a változtatás kihatással van rá | *Régi szín -> Új szín* | A módosítás után az oldalon a régi szín marad, visztnt az oldal újratöltésével megjelenik a helyes | Esztétikai hiba | Az oldal változtatás esetén autómatiksuan frissülnie kellene |
| KH-10 | Kategória hozzáadás már létező névvel | Minden névnek egyedinek kell lennie, vagyis az egyező nevet az oldal elutasítja | név1 , név1 | Az oldal elutasítja az egyezőséget viszont a hibaüzenet formátuma nem megfelelő *API hiba (409): { "error": true, "info": "UNIQUE constraint failed: Kategoria_nevek.nev, Kategoria_nevek.tulajdonos" }* | Esztétikai hiba | Kezelt hiba kiírás megjelenítése |
| KH-11 |  |  |  |  |  |  |
| KH-12 |  |  |  |  |  |  |
| KH-13 |  |  |  |  |  |  |