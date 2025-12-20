from flask import Flask, send_from_directory, request, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash  # 150-200 karakteres mezőt igényel legalább
from flask_cors import CORS
from app.database import Database, JoinTypes
from datetime import timedelta
import os
import json
from google import genai
from dotenv import load_dotenv

db_path = os.path.join(os.path.dirname(__file__), "database.db")
db: Database = Database(db_path)
db.build_database()

load_dotenv()
API_KEY = os.getenv('API_KEY')
if API_KEY:
    client = genai.Client(api_key=API_KEY)

def create_app():
    def serve_react_page(page_name):
        index_path = os.path.join(FRONTEND_DIST, 'index.html')
        with open(index_path, 'r', encoding='utf-8') as f:
            html = f.read()

        # Scriptet a JS fájlok elé illesztjük
        injected_html = html.replace(
            '<script type="module"',
            f'<script>window.REACT_PAGE="{page_name}";</script>\n<script type="module"', 1
        )
        return injected_html

    def get_error_json(text: str):
        return jsonify({"error": True, "info": text})

    def is_logged():
        if 'user_id' not in session:
            return redirect(url_for('login', msg='Nincs bejelentkezve!'))
        return True

    def get_kategoria_koltesek(kategoria_id: int) -> list:
        koltesek = db.select_koltesek(1, kategoria_id)
        return [{"leiras": z[2], "osszeg": z[3]} for z in koltesek]

    def get_nap_kategoriak(nap_id: int) -> dict:
        end = {}
        for y in db.select_koltesi_kategoriak(0, nap_id):
            kategoria_nevek = db.select_kategoria_nevek(0, y[2])[0]
            end[kategoria_nevek[1]] = {"szin_kod": kategoria_nevek[2], "koltes_id": y[1],
                                       "koltesek": get_kategoria_koltesek(y[0])}
        return end

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # backend mappa
    FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, '../../frontend/dist'))

    app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')
    app.secret_key = '1o47YUJB98EaaVUis7zMyvyZAvxk2CGd7pJ3HVM4XUxGGtMMtei9oawyJ4YBBxTCwfzskZTwPBX5h8DTjG8PAV9J2BJVGFXFiX8Y'
    app.config.update({
        'PERMANENT_SESSION_LIFETIME': timedelta(days=7),
        'SESSION_COOKIE_SECURE': True,  # csak HTTPS-en működik
        'SESSION_COOKIE_HTTPONLY': True,  # JS nem olvashatja meg a sütit
        'SESSION_COOKIE_SAMESITE': 'Lax',  # CSRF védelem segítése
    })
    CORS(app)

    @app.route('/', methods=["GET", "POST"])
    def index():
        session.clear()
        return serve_react_page('login')

    @app.route('/login', methods=["POST", "GET"])
    def login():
        if request.method == "GET": return serve_react_page('login')
        if request.method == "POST":
            try:
                # --- JSON vagy form POST kezelése ---
                if request.is_json:
                    data = request.get_json()
                    email = data.get('email', '').strip().lower()
                    jelszo = data.get('password', '')
                else:
                    email = request.form.get('email', '').strip().lower()
                    jelszo = request.form.get('jelszo', '')

                # --- Validáció ---
                if not email or not jelszo:
                    return jsonify({"success": False, "message": "Email és jelszó megadása kötelező!"}), 400

                # --- Felhasználó keresése ---
                felhasznalo = db.select_felhasznalo(1, email)
                if not felhasznalo:
                    email = email.upper()
                    felhasznalo = db.select_felhasznalo(0,
                                                        email)  # ha a beírt adat nem egy email akkor rápróbálunk hátha nevet adatott meg.

                if not felhasznalo:
                    return jsonify({"success": False, "message": "Hibás email cím vagy jelszó!"}), 401

                felhasznalo = felhasznalo[0]

                # --- Jelszó ellenőrzése ---
                if not check_password_hash(felhasznalo[2], jelszo):
                    return jsonify({"success": False, "message": "Hibás email cím vagy jelszó!"}), 401

                # --- Sikeres bejelentkezés ---
                session.clear()
                session['user_id'] = felhasznalo[0]
                session['user_email'] = felhasznalo[1]

                return jsonify({"success": True, "message": "Sikeres bejelentkezés!"}), 200

            except Exception:
                app.logger.exception("Login hiba")
                return jsonify({"success": False, "message": "Váratlan hiba történt, próbálja újra."}), 500
        return jsonify({"success": False, "message": "Invalid method!"})

    @app.route('/register', methods=["POST"])
    def register():
        try:
            # --- JSON vagy form POST kezelése ---
            if request.is_json:
                data = request.get_json()
                name = data.get('name', '')
                email = data.get('email', '').strip().lower()
                jelszo = data.get('password', '')
            else:
                name = request.form.get('name', '')
                email = request.form.get('email', '').strip().lower()
                jelszo = request.form.get('jelszo', '')

            # --- Validáció ---
            if not email or not jelszo or not name:
                return jsonify({"success": False, "message": "Név, Email és jelszó megadása kötelező!"}), 400

            # --- Felhasználó keresése ---
            foglalt_nev = db.select_felhasznalo(0, name, return_count=True) != 0
            foglalt_email = db.select_felhasznalo(1, email, return_count=True) != 0
            if foglalt_nev:
                return jsonify({"success": False, "message": "A megadott név már foglalt!"}), 401
            if foglalt_email:
                return jsonify({"success": False, "message": "A megadott email már foglalt!"}), 401

           # Felhasználó hozzáadása után le kell kérnünk az új ID-t
            uj_felhasznalo_id = db.add_felhasznalo(name, email, generate_password_hash(jelszo))
            session.clear()
            # Itt ne a 'name'-et, hanem az ID-t mentsük el!
            session['user_id'] = uj_felhasznalo_id 
            session['user_email'] = email
            return jsonify({"success": True, "message": "Sikeres regisztráció!"}), 200

        except Exception:
            app.logger.exception("Login hiba")
            return jsonify({"success": False, "message": "Váratlan hiba történt, próbálja újra."}), 500

    @app.route('/expenses', methods=["GET"])
    def expenses():
        if (x := is_logged()) != True: return x  # login ellenőrzés
        if request.method == "GET": return serve_react_page('expenses')
        return get_error_json("Invalid method!")

    # GET - lekéri az összeset, ha kap egy paramétert akkor csak azt az egy napot kéri le. PL: GET /api/napi_koltesek?datum=2025-01-01
    @app.route("/api/get_napi_koltesek", methods=["GET"])
    def get_napi_koltesek():
        if (x := is_logged()) != True: return x  # login ellenőrzés
        datum = request.args.get("datum")
        eredmeny = {}

        if datum is None:
            napok = db.select_napi_koltesek(0, session['user_id'])
        else:
            napok = db.select_napi_koltesek((0, 2), (session['user_id'], datum))
            if not napok: # != []
                return get_error_json("A kért nap nem található")

        for i in napok:
            datum = i[2]
            eredmeny[datum] = get_nap_kategoriak(i[1])

        return jsonify(eredmeny)


    # visszaadja azt az egy költési kategóriához tartozó költéseket melyet a paraméterek pontosan meghatároznak. kötelező paraméterek: datum, kategoria_nev
    # visszaad: {"koltesek": [...]} formában (ugyan úgy mint az összes nap lekérésénél)
    @app.route("/api/get_koltes_kategoria", methods=["POST"])
    def get_koltes_kategoria():
        if (x := is_logged()) != True: return x  # login ellenőrzés
        data = request.get_json(silent=True)
        if not data:
            return get_error_json("Hiányzó JSON!")

        datum = data.get("datum")
        kategoria_nev = data.get("kategoria_nev")

        if not datum or not kategoria_nev:
            return get_error_json("Hiányzó mezők!")

        adat = db.select_kategoria_nevek((1, 3), (kategoria_nev, session['user_id']))
        if len(adat) == 1:
            kategoria_nev_id = adat[0][0]  # [(1, 'Utazás', 'FFAA33', 'VVZDMQ')] <- ebből kinyerük az id-t
        else:
            return get_error_json("A megadott kategória név nem létezik.")
        koltesi_kategoria = db.univerzalis_join("napi_koltesek", "koltesi_kategoriak", JoinTypes.INNER, (2, 5),
                                                (datum, kategoria_nev_id))
        if len(koltesi_kategoria) != 1: return get_error_json("A kért költési kategória nem létezik!")
        # a költési koltesi_kategoria adat minta: [('VVZDMQ', 1, '2025-11-9', 1, 2, 4)]
        kategoia_koltesek = get_kategoria_koltesek(koltesi_kategoria[0][4])
        return jsonify({"koltesek": kategoia_koltesek})

    # hozzáad egy új "üres" napot, igényel egy datum json mezőt.
    @app.route("/api/add_napi_koltes", methods=["POST"])
    def add_napi_koltes():
        if (x := is_logged()) != True: return x  # login ellenőrzés
        data = request.get_json(silent=True)
        if not data:
            return get_error_json("Hiányzó JSON!")
        if "datum" not in data:
            return get_error_json("A 'datum' mező nem létezik!")

        ad = db.add_napi_koltes(session['user_id'], data["datum"])
        if not ad:
            return get_error_json("A kért nap nem hozzáadható!")
        elif ad.startswith("UNIQUE"):
            return get_error_json("Minden dátum csak egyszer szerepelhet!")
        return jsonify({"error": False, "info": "Sikeres hozzáadás!"})

    # hozzáad egy új "üres" kölotési kategóriát egy adott naphoz, paraméterek: datum, kategoria_nev_id
    @app.route("/api/add_koltesi_kategoria", methods=["POST"])
    def add_koltesi_kategoria():
        if (x := is_logged()) != True: return x
    
        data = request.get_json(silent=True)
        if not data or "datum" not in data or "kategoria_id" not in data:
            return get_error_json("Hiányzó mezők!")

        datum = data["datum"]
        kategoria_id = data["kategoria_id"] 

        napok = db.select_napi_koltesek((0, 2), (session['user_id'], datum))
        
        if not napok:
            return get_error_json("A megadott napi költés nem létezik!")

        napi_id = napok[0][1] 
        
        er2 = db.add_koltesi_kategoria(napi_id, kategoria_id)
        
        if er2 == True:
            return jsonify({"error": False, "info": "Sikeres hozzáadás!"})
        elif isinstance(er2, str) and er2.startswith("UNIQUE"):
            return get_error_json("Ez a kategória már hozzá van adva ehhez a naphoz!")
        
        return get_error_json("Váratlan hiba történt a mentéskor.")

    # hozzáad egy új költést egy kölotési kategóriához, paraméterek: koltes_id, osszeg, leiras=None
    @app.route("/api/add_koltes", methods=["POST"])
    def add_koltes():
        if (x := is_logged()) != True: return x  # login ellenőrzés
        data = request.get_json(silent=True)
        if not data:
            return get_error_json("Hiányzó JSON!")
        if "koltes_id" not in data or "osszeg" not in data:
            return get_error_json("Hiányzó mezők!, (koltes_id, osszeg)")
        koltes_id = data["koltes_id"]
        osszeg = data["osszeg"]
        if "leiras" not in data:
            leiras = None
        else:
            leiras = data["leiras"]

        er = db.add_koltesek(koltes_id, leiras, osszeg)
        if er == True:
            return jsonify({"error": False, "info": "Sikeres hozzáadás!"})
        else:
            return get_error_json("A kért költés nem hozzáadható!")

    # visszaadja az összes a felhasználóhoz tartozó költési kategória nevet, minden adattal együtt.PL: [(1, 'Utazás', 'FFAA33', 'VVZDMQ'), ...]
    @app.route("/api/get_kategoria_nevek", methods=["GET"])
    def get_kategoria_nevek():
        # Ez a GET hívás megmarad az eredeti neven.
        if not (x := is_logged()): return x
        return jsonify(db.select_kategoria_nevek(3, session['user_id']))

    @app.route("/api/add_kategoria_nev", methods=["POST"])
    def add_kategoria_nev():
        if not (x := is_logged()): return x
        data = request.get_json(silent=True)
        if not data:
            return get_error_json("Hiányzó JSON!")
        
    # Új kategória hozzáadásához csak a 'nev' és 'szin_kod' mezők kellenek.
        if "nev" not in data or "szin_kod" not in data:
            # Pontosabb hibaüzenet, ha a 'nev' vagy a 'szin_kod' hiányzik
            return get_error_json("Hiányzó mezők: nev és szin_kod szükséges!")

        nev = data["nev"]
        szin_kod = data["szin_kod"]
        try:
            # db.add_category(nev, szin_kod, user_id)
            return jsonify({"success": True}), 200
        except Exception as e:
            # Adatbázis/egyéb hiba esetén
            print(f"Hiba kategória hozzáadásakor: {e}")
            return get_error_json("Szerveroldali hiba a kategória mentésekor.")
        
    @app.route("/api/edit_kategoria_nev", methods=["PUT"])
    def edit_kategoria_nev(): # A nevet 'edit_kategoria_nev'-re cseréltük
        if not (x := is_logged()): return x

    @app.route("/api/delete_kategoria_nev", methods=["DELETE"])
    def delete_kategoria_nev(): # A nevet 'delete_kategoria_nev'-re cseréltük
        if not (x := is_logged()): return x
    # analysis
    @app.route('/analysis')
    def analysis():
        if (x := is_logged()) != True: return x
        if request.method == "GET": return serve_react_page('analysis')
        return get_error_json("Invalid method!")

    @app.route("/api/analysis/monthly/<int:year>", methods=["GET"])
    def analysis_monthly(year):
        if (x := is_logged()) != True: return x

        return jsonify([{"honap": r[0], "osszeg": r[1]} for r in db.SELECT_ai_havi_lebontas(session['user_id'], str(year))])

    @app.route("/api/analysis/category/<int:year>", methods=["GET"])
    def analysis_category(year):
        if (x := is_logged()) != True: return x

        return jsonify([{"category": r[0], "value": r[1]} for r in db.SELECT_ai_kategoria_lebontas(session['user_id'], str(year))])

    @app.route('/ai')
    def ai():
        if (x := is_logged()) != True: return x
        if request.method == "GET": return serve_react_page('ai')
        return get_error_json("Invalid method!")

    @app.route("/api/ai-analysis", methods=["POST"])
    def ai_analysis():
        if (x := is_logged()) != True:
            return x

        data = request.get_json(silent=True)
        if not data or "mode" not in data or "userData" not in data:
            return jsonify({"error": True, "info": "Hiányzó adatok!"})

        mode = data["mode"]  # "all" vagy "year"
        user_data = data["userData"]

        prompt = f"""
            Te egy pénzügyi asszisztens vagy, aki a felhasználót tájékoztatja a pénzügyi helyzetéről.
            Kérlek elemezd a felhasználó pénzügyi adatait a következő módban: {mode}.
            Az adatok: {user_data}

            Szabályok:
            1. Fogadd el a felhasználó adatait tényként, ne kérdőjelezz meg semmit.
            2. Adj részletes, könnyen érthető pénzügyi elemzést és tanácsot.
            3. Minden összeget forintban (Ft) jeleníts meg.
            4. Használj Markdown-t, hogy a szöveg olvasható legyen.
            5. Táblázatokat ne használj; a bontás legyen felsorolás vagy egyszerű lista formátumban.
            6. Írd a választ úgy, mintha a felhasználóval beszélgetnél, barátságosan és közérthetően.
            7. A felhasználó nem tud válaszolni a válaszodra, ezért ne kezdeményezz további beszélgetést.

            Az elemzés tartalmazza:
            - Összegzést és kategóriánkénti bontást
            - Napi és összesített kiadásokat
            - Legnagyobb egyedi kiadásokat
            - Pénzügyi tanácsokat a költségvetés, megtakarítás és optimalizálás szempontjából

            A stílus legyen közvetlen, beszélgető, és segítsen a felhasználónak megérteni a pénzügyi helyzetét.
        """

        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[prompt]
            )

            result_text = "".join([part.text for part in response.candidates[0].content.parts])

            return jsonify({"result": result_text})

        except Exception as e:
            return jsonify({"error": True, "info": f"AI hívás sikertelen: {str(e)}"})

    # statikus fájlok (JS, CSS)
    @app.route('/static/<path:filename>')
    def static_files(filename):
        return send_from_directory(app.static_folder, filename)

    return app
