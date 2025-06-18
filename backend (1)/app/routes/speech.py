from flask import Blueprint, request, jsonify

speech_bp = Blueprint('speech_bp', __name__)

# Example route (will be replaced with actual speech logic later)
@speech_bp.route('/test', methods=['GET'])
def test_speech_route():
    return jsonify(message="Speech blueprint is working!"), 200
