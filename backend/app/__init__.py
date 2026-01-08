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

    def get_error_json(text: str, code: int=400):
        return jsonify({"error": True, "info": text}), code

    def get_helyes_json(text:str="OK", code: int=200):
        return jsonify({"error": False, "info": text}), code

    def is_logged():
        if 'user_id' not in session:
            return redirect(url_for('login', msg='Nincs bejelentkezve!')), 401
        return True

    def get_kategoria_koltesek(kategoria_id: int) -> list:
        koltesek = db.select_koltesek(1, kategoria_id)
        return [{"leiras": z[2], "osszeg": z[3]} for z in koltesek]

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
                    felhasznalo = db.select_felhasznalo(0, email)  # ha a beírt adat nem egy email akkor rápróbálunk hátha nevet adatott meg.
                print(felhasznalo)
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
                name = data.get('name', '').upper()
                email = data.get('email', '').strip().lower()
                jelszo = data.get('password', '')
            else:
                name = request.form.get('name', '').upper()
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
            session.clear()

            session['user_id'] = name
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

    # GET - lekéri az összeset, ha kap egy datum paramétert akkor csak azt az egy dátumot adja vissza.
    @app.route("/api/get_napi_koltesek", methods=["GET"])
    def get_napi_koltesek():
        if (x := is_logged()) != True: return x
        
        user_id = session['user_id']
        rows = db.SELECT_teljes_napi_nezet(user_id)
        try:
            limit_rows = db.fetch_all("SELECT koltesi_limit FROM felhasznalok WHERE user_id = ?", (user_id,))
            havi_limit = limit_rows[0][0] if limit_rows and limit_rows[0][0] else 0
        except:
            havi_limit = 0

        napok = {}

        for row in rows:
            datum = row[0]
            kat_nev = row[2]
            szin = row[3]
            kat_koltes_id = row[4]
            
            entry_id = row[5]
            leiras = row[6]
            osszeg = row[7]

            if datum not in napok:
                napok[datum] = {}

            if kat_nev is not None:
                if kat_nev not in napok[datum]:
                    napok[datum][kat_nev] = {
                        "szin_kod": szin,
                        "koltes_id": kat_koltes_id,
                        "koltesek": []
                    }

                if entry_id is not None:
                    napok[datum][kat_nev]["koltesek"].append({
                        "id": entry_id,
                        "leiras": leiras,
                        "osszeg": osszeg
                    })

        return jsonify({
            "havi_limit": havi_limit,
            "napok": napok
        }), 200

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
            return get_error_json("A megadott kategória név nem létezik.", 409)
        koltesi_kategoria = db.univerzalis_join("napi_koltesek", "koltesi_kategoriak", JoinTypes.INNER, (2, 5),(datum, kategoria_nev_id))
        if len(koltesi_kategoria) != 1: return get_error_json("A kért költési kategória nem létezik!", 409)
        # a költési koltesi_kategoria adat minta: [('VVZDMQ', 1, '2025-11-9', 1, 2, 4)]
        kategoia_koltesek = get_kategoria_koltesek(koltesi_kategoria[0][4])
        return jsonify({"koltesek": kategoia_koltesek}), 200

    # hozzáad egy új "üres" napot, igényel egy datum json mezőt.
    @app.route("/api/add_napi_koltes", methods=["POST"])
    def add_napi_koltes():
        if (x := is_logged()) != True: return x
        
        data = request.get_json(silent=True)
        if not data:
            return get_error_json("Hiányzó JSON!")
        if "datum" not in data:
            return get_error_json("A 'datum' mező hiányzik!")

        print(data["datum"])
        eredmeny = db.add_napi_koltes(session['user_id'], data["datum"])
        print(eredmeny)

        if eredmeny is True:
            return get_helyes_json("Nap sikeresen hozzáadva!")
        
        if "UNIQUE" in eredmeny:
            return get_error_json("Ez a nap már szerepel a listában!", 409)
            
        return get_error_json(f"Hiba a mentés során: {eredmeny}", 500)

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
            return get_error_json("A megadott napi költés nem létezik!", 409)

        napi_id = napok[0][1] 
        
        er2 = db.add_koltesi_kategoria(napi_id, kategoria_id)
        
        if er2 == True:
            return get_helyes_json("Sikeres hozzáadás!")
        elif isinstance(er2, str) and er2.startswith("UNIQUE"):
            return get_error_json("Ez a kategória már hozzá van adva ehhez a naphoz!", 409)
        
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
            return get_helyes_json("Sikeres hozzáadás!")
        else:
            return get_error_json("A kért költés nem hozzáadható!", 409)

    @app.route("/api/delete_napi_koltes", methods=["DELETE"])
    def delete_napi_koltes_api():
        if (x := is_logged()) != True: return x
        data = request.get_json(silent=True)

        if not data or "id" not in data: 
            return get_error_json("Hiányzó dátum!")
        
        er = db.delete_napi_koltes((0, 2), (session['user_id'], data["id"]))
        
        if er == True: 
            return get_helyes_json("Nap törölve!")
        return get_error_json(f"Hiba a nap törlésénél! {er}")

    @app.route("/api/delete_koltesi_kategoria", methods=["DELETE"])
    def delete_koltesi_kategoria_api():
        if (x := is_logged()) != True: return x
        data = request.get_json(silent=True)
        if not data or "id" not in data: 
            return get_error_json("Hiányzó ID!")
        
        er = db.delete_koltesi_kategoria((1,), (data["id"],)) 
        
        if er == True: 
            return get_helyes_json("Kategória törölve!")
        return get_error_json(f"Hiba a kategória törlésénél!  {er}")

    @app.route("/api/delete_koltes", methods=["DELETE"])
    def delete_koltes_api():
        if (x := is_logged()) != True: return x
        data = request.get_json(silent=True)
        if not data or "id" not in data: 
            return get_error_json("Hiányzó ID!")
        
        er = db.delete_koltesek((0,), (data["id"],))
        
        if er == True: 
            return get_helyes_json("Tétel törölve!")
        return get_error_json(f"Hiba a tétel törlésénél! {er}")

    @app.route("/api/edit_koltes", methods=["PUT"])
    def edit_koltes():
        if (x := is_logged()) != True: return x
        data = request.get_json(silent=True)
        if not data or "id" not in data: 
            return get_error_json("Hiányzó adatok!")
        
        entry_id = data["id"]
        leiras = data.get("leiras", "")
        osszeg = data.get("osszeg", 0)

        er = db.edit_koltesek((2, 3), (leiras, osszeg), entry_id)
        
        if er == True: 
            return get_helyes_json("OK")
        return get_error_json(str(er), 409)

    # visszaadja az összes a felhasználóhoz tartozó költési kategória nevet, minden adattal együtt.PL: [(1, 'Utazás', 'FFAA33', 'VVZDMQ'), ...]
    @app.route("/api/get_kategoria_nevek", methods=["GET"])
    def get_kategoria_nevek():
        # Ez a GET hívás megmarad az eredeti neven.
        if not (x := is_logged()): return x
        return jsonify(db.select_kategoria_nevek(3, session['user_id'])), 200


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

        if (x := db.add_kategoria_nev(nev, szin_kod, session['user_id'])) == True:
            return get_helyes_json()
        else:
            return get_error_json(str(x),409)
        
    @app.route("/api/edit_kategoria_nev", methods=["PUT"])
    def edit_kategoria_nev(): # A nevet 'edit_kategoria_nev'-re cseréltük
        if not (x := is_logged()): return x
        data = request.get_json(silent=True)
        if not data:
            return get_error_json("Hiányzó JSON!")

        if "id" not in data:
            return get_error_json("Hiányzó mező: szükséges az id mező!")
        elif "nev" in data:
            modositando_mezo = [1, data['nev']]
        elif "szin_kod" in data:
            modositando_mezo = [2, data['szin_kod']]
        else: return get_error_json("Hiányzó mező: nev vagy szin_kod kötül valamelyik.")


        if (x := db.edit_kategoria_nev((modositando_mezo[0], ), (modositando_mezo[1], ), (0, 3), (data["id"], session['user_id']))) == True:
            return get_helyes_json()
        else:
            return get_error_json(str(x), 409)


    @app.route("/api/delete_kategoria_nev", methods=["DELETE"])
    def delete_kategoria_nev(): # A nevet 'delete_kategoria_nev'-re cseréltük
        if not (x := is_logged()): return x

        data = request.get_json(silent=True)
        if not data:
            return get_error_json("Hiányzó JSON!")

        if "id" not in data:
            return get_error_json("Hiányzó mező: szükséges az id mező!")
        if (x:= db.delete_kategoria_nev((0, 3), (data['id'], session['user_id']))) == True:
            return get_helyes_json()
        else:
            return get_error_json(str(x), 409)

    # analysis
    @app.route('/analysis')
    def analysis():
        if (x := is_logged()) != True: return x
        if request.method == "GET": return serve_react_page('analysis')
        return get_error_json("Invalid method!")

    @app.route("/api/analysis/monthly/<int:year>", methods=["GET"])
    def analysis_monthly(year):
        if (x := is_logged()) != True: return x
        adatok = db.SELECT_elemzes_havi_lebontas(session['user_id'], str(year))
        print(f"{year} DEBUG ADATOK: {adatok}")
        return jsonify([{"honap": r[0], "osszeg": r[1]} for r in db.SELECT_elemzes_havi_lebontas(session['user_id'], str(year))])

    @app.route("/api/analysis/category/<int:year>", methods=["GET"])
    def analysis_category(year):
        if (x := is_logged()) != True: return x

        eredmeny = db.SELECT_elemzes_kategoria_lebontas(session['user_id'], str(year))
        
        visszaadott_adat = []
        for r in eredmeny:
            visszaadott_adat.append({
                "category": r[0],
                "value": r[1],
                "szin_kod": f"#{r[2]}" if r[2] and not str(r[2]).startswith('#') else r[2]
            })

        return jsonify(visszaadott_adat)
    @app.route('/ai')
    def ai():
        if (x := is_logged()) != True: return x
        if request.method == "GET": return serve_react_page('ai')
        return get_error_json("Invalid method!")

    @app.route("/api/ai-analysis", methods=["POST"])
    def ai_analysis():
        # teszt, ha nem érhető el a modell
        #for m in client.models.list():
        #    print(f"Elérhető modell: {m.name}")

        if (x := is_logged()) != True:
            return x

        data = request.get_json(silent=True)
        if not data or "mode" not in data or "userData" not in data:
            return jsonify({"error": True, "info": "Hiányzó adatok!"})

        mode = data["mode"]
        user_data = data["userData"]

        prompt = f"""
            Szerep: Barátságos pénzügyi tanácsadó.
            Feladat: Elemezd a felhasználó adatait ({mode} mód): {user_data}
            
            Szabályok:
            - Használj magyar nyelvet és közvetlen stílust.
            - Pénznem: Ft.
            - Formátum: Markdown (felsorolás igen, táblázat NEM).
            - Tartalom: Összegzés, kategória bontás, legnagyobb kiadások és 3 konkrét megtakarítási tipp.
            - Ne kérdezz vissza a végén.
        """

        try:
            response = client.models.generate_content(
                model="models/gemini-2.5-flash",
                contents=prompt
            )

            if not response.text:
                return jsonify({"error": True, "info": "Az AI válasza üres volt."})

            return jsonify({"result": response.text})

        except Exception as e:
            error_msg = str(e)
            # Specifikus hibakezelés a kvótára
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                return jsonify({
                    "error": True, 
                    "info": "Az ingyenes AI keret pillanatnyilag betelt. Kérlek, próbáld újra 1 perc múlva!"
                }), 429
            
            # 404 esetén jelezzük a modellhibát
            if "404" in error_msg:
                return jsonify({"error": True, "info": "A kiválasztott AI modell nem elérhető. Próbáld később!"}), 404

            return jsonify({"error": True, "info": f"AI hívás sikertelen: {error_msg}"})
        

    @app.route("/api/set_user_limit", methods=["POST"])
    def set_user_limit():
        auth_check = is_logged()
        if auth_check != True:
            return auth_check  

        data = request.get_json(silent=True)
        if not data or "limit" not in data:
            return jsonify({"error": True, "info": "Hiányzó limit adat!"})

        uj_limit = data["limit"]
        user_id = session.get('user_id')

        try:
            db.execute("UPDATE felhasznalok SET koltesi_limit = ? WHERE user_id = ?", (uj_limit, user_id))
            
            return jsonify({"error": False, "info": "Sikeres mentés!"})
            
        except Exception as e:
            print(f"ADATBÁZIS HIBA: {e}")
            return jsonify({"error": True, "info": "Adatbázis hiba történt!"}), 500

    @app.route("/api/get_user_limit", methods=["GET"])
    def get_user_limit():
        if (x := is_logged()) != True: return x
    
        user_id = session.get('user_id')
    
        try:
            user_data = db.select_felhasznalo(0, user_id) 
            
            havi_limit = user_data[0][3] if user_data and len(user_data[0]) > 3 else 0
            
            if havi_limit is None:
                havi_limit = 0
                
            return jsonify({"limit": havi_limit})
        except Exception as e:
            print(f"HIBA A LIMIT LEKÉRÉSNÉL: {e}")
            return jsonify({"limit": 0, "error": str(e)})

    # statikus fájlok (JS, CSS)
    @app.route('/static/<path:filename>')
    def static_files(filename):
        return send_from_directory(app.static_folder, filename)

    return app
