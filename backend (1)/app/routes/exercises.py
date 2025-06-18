from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.exercise_service import ExerciseService
from app.utils.decorators import educator_or_admin_required, student_required
from app.utils.exceptions import ForbiddenError

exercises_bp = Blueprint('exercises_bp', __name__)

@exercises_bp.route('/courses/<int:course_id>/exercises', methods=['POST'])
@jwt_required()
@educator_or_admin_required
def create_exercise_for_course(course_id):
    """Creates a new exercise within a specific course."""
    data = request.get_json()
    creator_id = get_jwt_identity()
    try:
        exercise = ExerciseService.create_exercise(course_id, data, creator_id)
        return jsonify(exercise), 201
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except ForbiddenError as e:
        return jsonify({"message": str(e)}), 403

@exercises_bp.route('/courses/<int:course_id>/exercises', methods=['GET'])
@jwt_required()
def get_exercises_for_course(course_id):
    """Gets all exercises for a specific course."""
    exercises = ExerciseService.get_exercises_for_course(course_id)
    return jsonify(exercises), 200

@exercises_bp.route('/exercises/<int:exercise_id>', methods=['GET'])
@jwt_required()
def get_exercise(exercise_id):
    """Gets a single exercise by its ID."""
    exercise = ExerciseService.get_exercise_by_id(exercise_id)
    return jsonify(exercise), 200

@exercises_bp.route('/exercises/<int:exercise_id>/submit', methods=['POST'])
@jwt_required()
@student_required
def submit_exercise_attempt(exercise_id):
    """Submits an answer for an exercise."""
    data = request.get_json()
    user_id = get_jwt_identity()
    try:
        result = ExerciseService.submit_attempt(exercise_id, user_id, data)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
