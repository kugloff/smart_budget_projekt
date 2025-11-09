from flask import Flask, send_from_directory, request, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash # 150-200 karakteres mezőt igényel legalább
from flask_cors import CORS
from app.database import Database
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

    def is_logged():
        if 'user_id' not in session:
            return redirect(url_for('login', msg='Nincs bejelentkezve!'))
        return True

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
                    return jsonify({"success": False, "message": "Hibás email cím vagy jelszó!"}), 401

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
                foglalt_nev = db.select_felhasznalo(0, name, van_adat=True)
                foglalt_email = db.select_felhasznalo(1, email, van_adat=True)
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

    @app.route('/expenses')
    def expenses():
        if (x := is_logged()) != True: return x # login ellenőrzés
        return serve_react_page('expenses')

    @app.route("/api/get_napi_koltesek")
    def get_napi_koltesek():
        if (x := is_logged()) != True: return x # login ellenőrzés
        eredmeny = {}
        napok = db.select_napi_koltesek(0, session['user_id'])
        for i in napok:
            datum = i[2]
            eredmeny[datum] = {}
            koltesi_kategoriak = db.select_koltesi_kategoriak(1, i[1])

            for y in koltesi_kategoriak:
                kategoria_nevek = db.select_kategoria_nevek(0, y[2])[0]
                k_nev = kategoria_nevek[1]
                k_szin = kategoria_nevek[2]
                koltesek_lista = []
                eredmeny[datum][k_nev] = {"szin_kod":k_szin, "koltesek": koltesek_lista}
                koltesek = db.select_koltesek(1, y[0])

                for z in koltesek:
                    koltesek_lista.append({"leiras": z[2], "osszeg": z[3]})
        return jsonify(eredmeny)

    @app.route("/api/add_napi_koltes")
    def add_napi_koltes():
        if (x := is_logged()) != True: return x # login ellenőrzés
        data = request.get_json()
        uj_datum = data.get("datum")
        if uj_datum is None: jsonify({"error": True, "info": "A dátum mező nem létezik!"})

        if not db.add_napi_koltes(session['user_id'], uj_datum):
            jsonify({"error": True, "info": "A kért nap nem hozzáadható!"})

        return jsonify({"error": False,"info": "Sikeres hozzáadás"})


    @app.route('/analysis')
    def analysis():
        if (x := is_logged()) != True: return x # login ellenőrzés
        return serve_react_page('analysis')

    @app.route('/ai')
    def ai():
        if (x := is_logged()) != True: return x # login ellenőrzés
        return serve_react_page('ai')

    # statikus fájlok (JS, CSS)
    @app.route('/static/<path:filename>')
    def static_files(filename):
        return send_from_directory(app.static_folder, filename)

    return app
