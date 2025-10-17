from flask import Flask, send_from_directory
from flask_cors import CORS
from app.database import db
from datetime import timedelta
import os



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

    db.__init__("database.db")

    @app.route('/')
    def login():
        return serve_react_page('login')

    @app.route('/login')
    def login_alias():
        return serve_react_page('login')

    @app.route('/expenses')
    def expenses():
        return serve_react_page('expenses')

    @app.route('/analysis')
    def analysis():
        return serve_react_page('analysis')

    @app.route('/ai')
    def ai():
        return serve_react_page('ai')

    # statikus fájlok (JS, CSS)
    @app.route('/static/<path:filename>')
    def static_files(filename):
        return send_from_directory(app.static_folder, filename)

    return app
