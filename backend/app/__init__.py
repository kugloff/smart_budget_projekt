from flask import Flask, send_from_directory, render_template, request, redirect, url_for, flash, session, jsonify
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

    @app.route('/login', methods=["POST"])
    def login():
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
        if 'user_id' not in session:
            return jsonify({'error': 'Nincs bejelentkezve!'}), 401
        return serve_react_page('expenses')

    @app.route('/analysis')
    def analysis():
        if 'user_id' not in session:
            return jsonify({'error': 'Nincs bejelentkezve!'}), 401
        return serve_react_page('analysis')

    @app.route('/ai')
    def ai():
        if 'user_id' not in session:
            return jsonify({'error': 'Nincs bejelentkezve!'}), 401
        return serve_react_page('ai')

    # statikus fájlok (JS, CSS)
    @app.route('/static/<path:filename>')
    def static_files(filename):
        return send_from_directory(app.static_folder, filename)

    return app
