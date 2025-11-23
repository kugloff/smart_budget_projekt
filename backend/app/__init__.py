from flask import Flask, send_from_directory, request, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash # 150-200 karakteres mezőt igényel legalább
from flask_cors import CORS
from app.database import Database, JoinTypes
from datetime import timedelta
import os

db_path = os.path.join(os.path.dirname(__file__), "database.db")
db:Database = Database(db_path)
db.build_database()

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

    def get_error_json(text:str):
        return jsonify({"error": True, "info": text})

    def is_logged():
        if 'user_id' not in session:
            return redirect(url_for('login', msg='Nincs bejelentkezve!'))
        return True
    def get_kategoria_koltesek(kategoria_id:int) -> list:
        koltesek = db.select_koltesek(1, kategoria_id)
        return [{"leiras": z[2], "osszeg": z[3]} for z in koltesek]

    def get_nap_kategoriak(nap_id: int) -> dict:
        end = {}
        for y in db.select_koltesi_kategoriak(0, nap_id):
            kategoria_nevek = db.select_kategoria_nevek(0, y[2])[0]
            end[kategoria_nevek[1]] = {"szin_kod": kategoria_nevek[2], "koltes_id":y[1], "koltesek": get_kategoria_koltesek(y[0])}
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
                    felhasznalo = db.select_felhasznalo(0, email) # ha a beírt adat nem egy email akkor rápróbálunk hátha nevet adatott meg.

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
        return jsonify({"success":False, "message": "Invalid method!"})

    @app.route('/register', methods=["POST"])
    def register():
        if request.method == "POST":
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

                db.add_felhasznalo(name, email, generate_password_hash(jelszo))
                # --- Sikeres bejelentkezés ---
                session.clear()
                session['user_id'] = name
                session['user_email'] = email

                return jsonify({"success": True, "message": "Sikeres regisztráció!"}), 200

            except Exception:
                app.logger.exception("Login hiba")
                return jsonify({"success": False, "message": "Váratlan hiba történt, próbálja újra."}), 500
        return jsonify({"success": False, "message": "Invalid method!"})

    @app.route('/expenses', methods=["GET"])
    def expenses():
        if (x := is_logged()) != True: return x # login ellenőrzés
        if request.method == "GET": return serve_react_page('expenses')
        return get_error_json("Invalid method!")

    # GET - lekéri az összeset, a POST-al pedig csak egy adott napot, ekkor igényel egy datum paramétert.
    @app.route("/api/get_napi_koltesek", methods=["GET", "POST"])
    def get_napi_koltesek():
        if (x := is_logged()) != True: return x # login ellenőrzés
        eredmeny = {}
        if request.method == "GET":
            napok = db.select_napi_koltesek(0, session['user_id'])
            for i in napok:
                datum = i[2]
                eredmeny[datum] = get_nap_kategoriak(i[1])
            return jsonify(eredmeny)
        if request.method == "POST":
            data = request.get_json(silent=True)
            if not data:
                return get_error_json("Hiányzó JSON!")
            if "datum" not in data:
                return get_error_json("A 'datum' mező nem létezik!")

            napok = db.select_napi_koltesek((0, 2), (session['user_id'], data["datum"]))
            for i in napok:
                datum = i[2]
                eredmeny[datum] = get_nap_kategoriak(i[1])
            return jsonify(eredmeny)
        return get_error_json("Invalid method!")

    # visszaadja azt az egy költési kategóriához tartozó költéseket melyet a paraméterek pontosan meghatároznak. kötelező paraméterek: datum, kategoria_nev
    # visszaad: {"koltesek": [...]} formában (ugyan úgy mint az összes nap lekérésénél)
    @app.route("/api/get_koltes_kategoria", methods=["POST"])
    def get_koltes_kategoria():
        if (x := is_logged()) != True: return x  # login ellenőrzés
        if request.method == "POST":
            data = request.get_json(silent=True)
            if not data:
                return get_error_json("Hiányzó JSON!")

            datum = data.get("datum")
            kategoria_nev = data.get("kategoria_nev")

            if not datum or not kategoria_nev:
                return get_error_json("Hiányzó mezők!")

            adat = db.select_kategoria_nevek((1, 3), (kategoria_nev, session['user_id']))
            if len(adat) == 1:
                kategoria_nev_id = adat[0][0] # [(1, 'Utazás', 'FFAA33', 'VVZDMQ')] <- ebből kinyerük az id-t
            else: return get_error_json("A megadott kategória név nem létezik.")
            koltesi_kategoria = db.univerzalis_join("napi_koltesek", "koltesi_kategoriak", JoinTypes.INNER, (2,5), (datum, kategoria_nev_id))
            if len(koltesi_kategoria) != 1: return get_error_json("A kért költési kategória nem létezik!")
            # a költési koltesi_kategoria adat minta: [('VVZDMQ', 1, '2025-11-9', 1, 2, 4)]
            kategoia_koltesek = get_kategoria_koltesek(koltesi_kategoria[0][4])
            return jsonify({"koltesek": kategoia_koltesek})
        return get_error_json("Invalid method!")


    # hozzáad egy új "üres" napot, igényel egy datum json mezőt.
    @app.route("/api/add_napi_koltes", methods=["POST"])
    def add_napi_koltes():
        if (x := is_logged()) != True: return x # login ellenőrzés
        if request.method == "POST":
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
            return jsonify({"error": False,"info": "Sikeres hozzáadás!"})
        return get_error_json("Invalid method!")

    # hozzáad egy új "üres" kölotési kategóriát egy adott naphoz, paraméterek: datum, kategoria_nev_id
    @app.route("/api/add_koltesi_kategoria", methods=["POST"])
    def add_koltesi_kategoria():
        if request.method == "POST":
            data = request.get_json(silent=True)
            if not data:
                return get_error_json("Hiányzó JSON!")
            if "datum" not in data or "kategoria_id" not in data:
                return get_error_json("Hiányzó mezők!")
            datum = data["datum"]
            kategoria_nev_id = data["kategoria_nev_id"]

            er = db.select_napi_koltesek((0, 2), (session['user_id'], datum))
            if len(er) != 1:
                return get_error_json("A megadott napi költés nem létezik!")
            er2 = db.add_koltesi_kategoria(er[1], kategoria_nev_id)
            if not er2:
                return get_error_json("A kért költési kategória nem hozzáadható!")
            elif er2.startswith("UNIQUE"):
                return get_error_json("Minden naphoz csak egyszer szerepelhet ugyanaz a kategória!")
            return jsonify({"error": False, "info": "Sikeres hozzáadás!"})
        return get_error_json("Invalid method!")

    # hozzáad egy új költést egy kölotési kategóriához, paraméterek: koltes_id, osszeg, leiras=None
    @app.route("/api/add_koltes", methods=["POST"])
    def add_koltes():
        if request.method == "POST":
            data = request.get_json(silent=True)
            if not data:
                return get_error_json("Hiányzó JSON!")
            if "koltes_id" not in data or "osszeg" not in data:
                return get_error_json("Hiányzó mezők!, (koltes_id, osszeg)")
            koltes_id = data["koltes_id"]
            osszeg = data["osszeg"]
            if "leiras" not in data: leiras = None
            else: leiras = data["leiras"]

            er = db.add_koltesek(koltes_id, leiras, osszeg)
            if er == True: return jsonify({"error": False, "info": "Sikeres hozzáadás!"})
            else: return get_error_json("A kért költés nem hozzáadható!")
        return get_error_json("Invalid method!")

    @app.route('/analysis')
    def analysis():
        if (x := is_logged()) != True: return x # login ellenőrzés
        if request.method == "GET": return serve_react_page('analysis')
        return get_error_json("Invalid method!")

    @app.route('/ai')
    def ai():
        if (x := is_logged()) != True: return x # login ellenőrzés
        if request.method == "GET": return serve_react_page('ai')
        return get_error_json("Invalid method!")

    # statikus fájlok (JS, CSS)
    @app.route('/static/<path:filename>')
    def static_files(filename):
        return send_from_directory(app.static_folder, filename)

    return app
