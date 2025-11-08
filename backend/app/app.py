from flask import Flask, request, jsonify
from database import Database

app = Flask(__name__)
db = Database("koltesek.db")
db.build_database()

#felhasználó

@app.route("/felhasznalok", methods=["POST"])
def add_felhasznalo():
    data = request.json
    success = db.add_felhasznalo(data["user_id"], data["email"], data["jelszo"])
    return jsonify({"success": success})

@app.route("/felhasznalok/<user_id>", methods=["GET"])
def get_felhasznalo(user_id):
    result = db.select_felhasznalo(0, user_id)
    if result:
        return jsonify({
            "user_id": result[0],
            "email": result[1],
            "jelszo": result[2],
            "koltesi_limit": result[3]
        })
    return jsonify({"error": "User not found"}), 404

@app.route("/felhasznalok/<user_id>", methods=["PUT"])
def edit_felhasznalo(user_id):
    data = request.json
    success = db.edit_felhasznalo(user_id, data.get("koltesi_limit"))
    return jsonify({"success": success})

@app.route("/felhasznalok/<user_id>", methods=["DELETE"])
def delete_felhasznalo(user_id):
    success = db.delete_napi_koltes(0, user_id)
    return jsonify({"success": success})

#napi költések 

@app.route("/napi_koltesek", methods=["POST"])
def add_napi_koltes():
    data = request.json
    result = db.add_napi_koltes(data["user_id"], data["datum"])
    if result is True:
        return jsonify({"success": True})
    elif "UNIQUE" in str(result):
        return jsonify({"error": "Napi koltes already exists"}), 400
    return jsonify({"error": str(result)}), 500

@app.route("/napi_koltesek/<user_id>", methods=["GET"])
def get_napi_koltesek(user_id):
    results = db.select_napi_koltesek(0, user_id)
    return jsonify([{"user_id": r[0], "kategoria_csoport_id": r[1], "datum": r[2]} for r in results] if results else [])

@app.route("/napi_koltesek/<kategoria_csoport_id>", methods=["DELETE"])
def delete_napi_koltes(kategoria_csoport_id):
    success = db.delete_napi_koltes(1, kategoria_csoport_id)
    return jsonify({"success": success})

#költési kategóriák -napon belül

@app.route("/koltesi_kategoriak", methods=["POST"])
def add_koltesi_kategoria():
    data = request.json
    result = db.add_koltesi_kategoria(data["kategoria_csoport_id"], data["kategoria_nev_id"])
    return jsonify({"success": result is True, "error": None if result is True else str(result)})

@app.route("/koltesi_kategoriak/<koltes_id>", methods=["PUT"])
def edit_koltesi_kategoria(koltes_id):
    data = request.json
    result = db.edit_koltesi_kategoria(int(koltes_id), data["kategoria_nev_id"])
    return jsonify({"success": result is True, "error": None if result is True else str(result)})

@app.route("/koltesi_kategoriak/<koltes_id>", methods=["DELETE"])
def delete_koltesi_kategoria(koltes_id):
    success = db.delete_koltesi_kategoria(1, int(koltes_id))
    return jsonify({"success": success})

#költések -entries

@app.route("/koltesek", methods=["POST"])
def add_koltesek():
    data = request.json
    result = db.add_koltesek(data["koltes_id"], data.get("leiras"), data["osszeg"])
    return jsonify({"success": result is True, "error": None if result is True else str(result)})

@app.route("/koltesek/<koltes_id>", methods=["PUT"])
def edit_koltesek(koltes_id):
    data = request.json
    success = db.edit_koltesek(3, data["osszeg"], int(koltes_id))
    return jsonify({"success": success})

@app.route("/koltesek/<koltes_id>", methods=["DELETE"])
def delete_koltesek(koltes_id):
    success = db.delete_koltesek(0, int(koltes_id))
    return jsonify({"success": success})

#kategóriák

@app.route("/kategoria_nevek", methods=["POST"])
def add_kategoria_nev():
    data = request.json
    success = db.add_kategoria_nev(data["nev"], data["szinkod"])
    return jsonify({"success": success})

@app.route("/kategoria_nevek/<id>", methods=["PUT"])
def edit_kategoria_nev(id):
    data = request.json
    success = db.edit_kategoria_nev(1, data["nev"], int(id))
    return jsonify({"success": success})

@app.route("/kategoria_nevek/<id>", methods=["DELETE"])
def delete_kategoria_nev(id):
    success = db.delete_kategoria_nev(0, int(id))
    return jsonify({"success": success})

if __name__ == "__main__":
    app.run(debug=True)