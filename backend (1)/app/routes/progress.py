from flask import Blueprint, request, jsonify

progress_bp = Blueprint('progress_bp', __name__)

# Example route (will be replaced with actual progress logic later)
@progress_bp.route('/test', methods=['GET'])
def test_progress_route():
    return jsonify(message="Progress blueprint is working!"), 200
