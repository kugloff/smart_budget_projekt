# Bejelentkezés és Regisztrációs teszt jegyzőkönyv
| Tulajdonság | Adat |
|:---|:---|
| Tesztelést végezte | Kis Gergely Sándor |
| Operációs rendszer | Windows 11 |
| Böngésző | Google Chrome |
| Dátum | 2026.08.08 |

---

## Testelés célja:
Annak ellenőzése, hogy a webalkalmazás megfelelően elérhető-e a megadott ip címről, és ezután az oldalra való bejelentkezés és regisztráció a követelményeknek megfelel-e.

### Teszt esetek lehetséges ítéletei priolitás szerint csökkenő sorrenben
| Ítélet neve | Leírás | Előforulási esetek száma |
|:---|:---|:---|
| Kritikus hiba  | Az adott funkció hibája a teljes Webszolgáltatás leállást okozza | 0 |
| Hibás működés | Az adott tesztesetben nem a várt működést tapasztaltuk | 1 |
| Esztétikai hiba | Az adott teszeset a vártaknak megfelelően lefutott funkcionálisan de a megjelenítés az nem a vártaknak megfelelően néz ki | 1 |
| Elfogadva | Az elvárt működés szerint működött a tesztelt komponens | 14 |

---

## A szerver elindítása és az oldal elérhetősége és betöltése
| Tesztelés ID | Teszt neve | Elvárt működés | Bemeneti adat | Tapasztalt működés | Ítélet | Megjegyzés / Javaslat |
|:---|:---|:---|:---|:---|:---|:---|
| BR-01 | Frontend build | A projekt mappában lévő run.bat megnyitása majd a frontend build | - | npm bild a várt módon lefutott | Elfogadva | - |
| BR-02 | Requirement install | A requirements.txt-ben lévő modulok szükségesség alapján letöltés és telepítés | - | A parancssorban megjelent *Requirement already satisfied* szöveg minden külső modul melett | Elfogadva | - |
| BR-03 | Flask szerver elindítása | Autómatikusan a szükéses modul telepítése után elindul a szever | - | Parancssorban megjelent a szerver elindítását jelző szövegeket töbek között a *Running on http://127.0.0.1:5000* ip címen való elérhatőség | Elfogadva | - |
| BR-04 | Böngészőből való elérhetőség | A böngészőben a szerver ip címét beírva megjelenik az oldal bejelentkezést és regisztrációt intéző oldala | http://127.0.0.1:5000/ | A szervernek küldött kérés megérkezett és visszakülte az elvárt oldalt | Elfogadva | - |

---

## Regisztrációs felület működése
| Tesztelés ID | Teszt neve | Elvárt működés | Bemeneti adat | Tapasztalt működés | Ítélet | Megjegyzés / Javaslat |
|:---|:---|:---|:---|:---|:---|:---|
| BR-05 | Üresen hagyott mezők | Minden üresen hagyott mező esetén jelez a mezőnél miszerint kötelező annak kitöltése | - | Az üres mezőknél egy felugró szövegmező jelenik meg miszerint kötelező a mező kitöltése | Elfogadva | - |
| BR-06 | Regisztráció helyes adatokkal | Név Email és jelszó mező funkcionális követelményekben lévő helyes kitöltés után sikeres gerisztráció és beléptet autómatikusan az oldalra | Teszt név , valamilyen@gmail.com , FA2hh678 | Az adatok beírása és a regisztrációs gomb megnyomása után megjelent a sikeres regisztráció felirat és átnavigált autómatikusan a bejelentkezett oldali nézetbe | Elfogadva | - |
| BR-07 | Regisztrációs kísérlet foglalt névvel | Az oldal elutasítja a regisztrációt és valamilyen visszajelzést ad | Teszt név | Az oldalon megjelent a *A megadott név már foglalt!* üzenet | Elfogadva | - |
| BR-08 | Regisztrációs kísérlet foglalt email címmel | Az oldal elutasítja a regisztrációt és valamilyen visszajelzést ad | valamilyen@gmail.com | Az oldalon megjelent a *A megadott email már foglalt!* üzenet | Elfogadva | - |
| BR-09 | Regisztrációs kísérlet gyenge jelszóval | Az oldal elutasítja a regisztrációt és valamilyen visszajelzést ad | asd | Az oldal elfogadta az adatokat és átnívigált a főoldalra | Hibás működés | A reisztrációt túl gyenge jelszó indokkal el kell utasítani |
| BR-10 | Regisztrációs kísérlet különböző jelszavakkal | Az oldal elutasítja a regisztrációt és valamilyen visszajelzést ad | FA2hh678 , AC3fj789 | Az oldalon megjelent a * A jelszavak nem egyeznek!* szöveg | Elfogadva | - |

---

## Bejelentkezési felület működése
| Tesztelés ID | Teszt neve | Elvárt működés | Bemeneti adat | Tapasztalt működés | Ítélet | Megjegyzés / Javaslat |
|:---|:---|:---|:---|:---|:---|:---|
| BR-11 | Bejelentkezés helyes adatokkal 01 | Email és jelszó mezők helyes kitöltése után átnavigál a bejelentkezett oldalra | valamilyen@gmail.com , FA2hh678 | Az oldal az elvárt módon sikeres bejelentkezés üzenete megjelenítése után átnavigál| Elfogadva | - |
| BR-12 | Üresen hagyott mezők | Üresen vagyott valamely mező esetén jelez ad adott mezőnél miszerint ki kell tölteni | - | Az üres mezőknél egy felugró szövegmező jelenik meg miszerint kötelező a mező kitöltése | Elfogadva | - |
| BR-13 | Bejelentezés helyes adatokkal 02 | Név és jelszó használatával is ugyanúgy el kell fogadni abban az esetben ha azok helyesek | Teszt név , FA2hh678 | Az elvárt módon sikeres bejelentkezés névvel is | Elfogadva | - |
| BR-14 | Bejelentkezési kísérlet hibás email-el | Az oldal elutasítja a bejelentkezést és valamilyen visszajelzést ad | nemlétezőgmail@gmail.com | Az oldalon megjelent a *Hibás email cím vagy jelszó!* üzenet | Elfogadva | - |
| BR-15 | Bejelentkezési kísérlet hibás jelszóval | Az oldal elutasítja a bejelentkezést és valamilyen visszajelzést ad | ez_egy_hibás_jelszó | Az oldalon megjelent a *Hibás email cím vagy jelszó!* üzenet | Elfogadva | - |
| BR-16 | Belejelntkezés nélküi oldalelérés | Beírjuk "kézzel" a bejelentkezett oldalra mutató route nevét, melyre azt várjuk, hogy visszadob a bejelentkezés oldalra azzal hogy nincs hiteles bejelentkezés | http://127.0.0.1:5000/expenses | Az entert lenyomása után a bejelentkezett oldal helyett a következő szöveg jelenik meg: *Redirecting... You should be redirected automatically to the target URL: /login?msg=Nincs+bejelentkezve!. If not, click the link.* A linkre kattintás után pedig átnavigál a bejelentkezéshez a *❌ Nincs bejelentkezve!* üzenettel | Esztétikai hiba | Javasolt rögtön a bejelentkezési oldalra navigálni a közbeeső állomás nélkül |


## Tesztelési konklúzió
A vizsgált rész szerkezetileg működik egyedül a gyenge jelszó elfogadását kell letiltani, illetve a bejelentkezés nélküli esetben jó helyre kell hogy navigáljon. Minden más az elvártak szerint működik.

## Javítási jegyzék
| Tesztelés ID | Javítás állapota | Megjegyzés |
|:---|:---|:---|
| BR-09 | Nincs javítva | - |
| BR-16 | Nincs javítva | - |