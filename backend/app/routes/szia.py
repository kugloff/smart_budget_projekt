from flask import Blueprint, jsonify

szia = Blueprint('api', __name__, url_prefix='/')

@szia.route('/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello from Flask!"})
