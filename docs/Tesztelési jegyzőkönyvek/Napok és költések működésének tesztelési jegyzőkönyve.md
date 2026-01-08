# Napok és Költések működésének tesztelési jegyzőkönyve
| Tulajdonság | Adat |
|:---|:---|
| Tesztelést végezte | Kis Gergely Sándor |
| Operációs rendszer | Windows 11 |
| Böngésző | Google Chrome |
| Dátum | 2026.08.08 |

---

## Tesztelés célja:


### Teszt esetek lehetséges ítéletei priolitás szerint csökkenő sorrenben
| Ítélet neve | Leírás | Előforulási esetek száma |
|:---|:---|:---|
| Kritikus hiba  | Az adott funkció hibája a teljes Webszolgáltatás leállást okozza | 0 |
| Hibás működés | Az adott tesztesetben nem a várt működést tapasztaltuk | 2 |
| Esztétikai hiba | Az adott teszeset a vártaknak megfelelően lefutott funkcionálisan de a megjelenítés az nem a vártaknak megfelelően néz ki | 1 |
| Elfogadva | Az elvárt működés szerint működött a tesztelt komponens | 10 |

---

## Új nap hozzáadás
| Tesztelés ID | Teszt neve | Elvárt működés | Bemeneti adat | Tapasztalt működés | Ítélet | Megjegyzés / Javaslat |
|:---|:---|:---|:---|:---|:---|:---|
| NK-01 | Új egyedi nap hozzáadás | A hozzáadás gombra kattintva megnyílik egy dátum választó panel. A mentés gombra kattintva mentésre kerül az új nap | 2026.01.08 | Az elvártnak megfelelően hozzáadásra került az új nap | Elfogadva | - |
| NK-02 | Új már létező nap hozzáadás | Minden nap csak egyszer szerepelhet így el kell utasítania az oldalnak a létrehozást, és erről értesítenie kell | 2026.01.08 | A mentést kérve megjelenet egy alert üzenet miszerint: *Ez a nap már szerepel a listában!* | Elfogadva | Javasolt szebben megoldani a hiba kijelzést |

---

## Adott nap kezelése
| Tesztelés ID | Teszt neve | Elvárt működés | Bemeneti adat | Tapasztalt működés | Ítélet | Megjegyzés / Javaslat |
|:---|:---|:---|:---|:---|:---|:---|
| NK-03 | Adott naphoz új kategória hozzáadás | Szerkeztés gombra nyomva belépünk a nap szerkeztésének módjába, aholúj kategória hozzáadása menüpontal lenyílnak az elérhető k. nevek melyből válaszhtunk. a választott k. azonnal hozzáadásra kerül a naphoz. mentés gombal mentjük a változtatásokat. | - | Az elvártaknak megfelelően hozzáadásra került az új kategória | Elfogadva | - |
| NK-04 | Adott naphoz már hozáadott kategória hozzáadás | Minden naphoz tartozó kategóriának egyedinek kell lennie, vagyis el kell utasítani az egyezőt és értesítést kell megjeelníteni | - | A legördülő listában benne van a már hozzáadott név, kattintás után nem adja hozzá de nem is ír ki semmit | Esztétikai hiba | Ha már hozzáadott k. akarunk hozzáadni akkor üzenetettel elutasítjuk |
| NK-05 | Kategóriához új tétel hozzáadás | Nap szerkeztő módban a naphoz tartozó kategóriáknál van egy *új tétel* gomb erre kattintva hozzáad egy új költési tételt két mezővel. ezeket helyesen kitöltjük | Valmilyen költés , 500 | A hozzáadás menete megegyezik az elvártakkal és mentés után az adott napi költés frissül az új költés összegével | Elfogadva | - |
| NK-06 | Kategóriához új tétel hozzáadás nagatív értékkel | A negatív számokat el kell az oldalnak utasítani | Valamilyen költés 2 , -555 | A hozzáadás sikeresen megtörténik és a már meglévő költésekből kivonja a negatív költést | Hibás működés | A negatív számokat el kell utasítani |
| NK-07 | Hozzáadott tétel módosítása | Már meglévő költés nevének másikra való átírása lehetséges és a mentés után végrehajtódik | *Valmilyen költés* -> *Valmilyen költés mod* | A költés a vártnak megfelelően módosult | Elfogadva | - |
| NK-08 | Tétel hozzáadás név nélkül | A név nem kötelező így ekkor a hozzáadásnak sikeresnek kell lennie | - , 800 | Mentés után a név nélküli tétel nem került hozzáadásra | Hibás működés | Az ilyen költéseket hozzá kell adni és a leírást vagy üresen hagyni vagy nincs leírás szöveget odailleszteni |
| NK-09 | Hozzáadott tétel nevének törlése | A név nem kötelező így a módosításnak sikeresnek kell lennie | - | Mentés után a törölt tétel neve helyén a *Nincs leírás* szöveg jelenik meg | Elfogadva | - |
| NK-10 | Tétel törlése | Lehetséges a tétel sora mögötti törlés gombal. ekkor a tétel eltávolításra kerül a kategóriából | - | Törlés után a tétel eltűnik és a hozzá tartozó összeg kikerül a végösszegből | Elfogadva | - |
| NK-11 | Nap törlése | Naptot lehet minden esetben törölni függetlenül attól tartozik-e hozzá költés | - | Törlés után az adott nap eltünk a listából | Elfogadva | - |
| NK-12 | Naphoz tartozó kategória törlése | Kategóriát lehet minden esetben törölni függetlenül attól tartozik-e hozzá költés | - | Törlés után a kategória eltávolításra került a hozzá tartozó naptól | Elfogadva | - |
| NK-13 | Havi költés túllépi a havi költési limitet | Az oldal minden adott hónaphoz tartozó naphoz jelzi hogy túlépés történet | - | Túlépés esetén a nap fejlécébe került a *Havi limit túllépve* szöveg | Elfogadva | - |


---
---

## Tesztelési konklúzió
A hibás működés (NK-06, NK-08) esetleges rejtett hibákhoz vezethet javítása minnél előbb ajánlott. Az esztétikai hiba javítás pedig a felhasználói élményt tudja javítani.

## Javítási jegyzék
| Tesztelés ID | Javítás állapota | Megjegyzés |
|:---|:---|:---|
| NK-06 | Nincs javítva | - |
| NK-08 | Nincs javítva | - |
| NK-04 | Nincs javítva | - |