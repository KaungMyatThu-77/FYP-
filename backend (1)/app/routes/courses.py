from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.services.course_service import CourseService, enrollments_schema
from app.services.content_service import ContentService
from app.utils.decorators import educator_or_admin_required
from app.models.course import course_schema, Course
from app.models.user import User, UserRole
from app.models.course_content import CourseContent, course_content_schema

courses_bp = Blueprint('courses_bp', __name__)

@courses_bp.route('/', methods=['POST'])
@jwt_required()
@educator_or_admin_required
def create_course():
    """
    Create a new course.
    Only accessible to educators and admins.
    """
    json_data = request.get_json()
    if not json_data:
        return jsonify({'message': 'No input data provided'}), 400
    
    try:
        # Do not load creator from request, it will be set from JWT identity
        data = course_schema.load(json_data, partial=("creator",))
    except ValidationError as err:
        return jsonify(err.messages), 422

    creator_id = get_jwt_identity()

    try:
        new_course = CourseService.create_course(data, creator_id)
        return jsonify(new_course), 201
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        # It's good practice to log the actual exception `e`
        return jsonify({'message': 'An error occurred while creating the course.'}), 500

@courses_bp.route('/', methods=['GET'])
@jwt_required()
def get_courses():
    """
    Get all courses, with optional filtering by difficulty and category.
    Students see only published courses.
    Educators and Admins see all courses.
    Query params: ?difficulty=beginner&category=Grammar
    """
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)

    # Extract filter criteria from query parameters
    filters = {
        'difficulty': request.args.get('difficulty'),
        'category': request.args.get('category')
    }

    if current_user.role in [UserRole.EDUCATOR, UserRole.ADMIN]:
        courses = CourseService.get_all_courses_for_authoring(filters)
    else:
        courses = CourseService.get_all_courses(filters)
    
    return jsonify(courses), 200

@courses_bp.route('/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course(course_id):
    """Get a single course by ID."""
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    
    course = CourseService.get_course_by_id(course_id, current_user)
    
    if not course:
        return jsonify({'message': 'Course not found'}), 404
    return jsonify(course), 200

@courses_bp.route('/<int:course_id>', methods=['PUT'])
@jwt_required()
@educator_or_admin_required
def update_course(course_id):
    """
    Update a course.
    Only accessible to the course creator or an admin.
    """
    json_data = request.get_json()
    if not json_data:
        return jsonify({'message': 'No input data provided'}), 400

    try:
        # Use partial=True to allow partial updates
        data = course_schema.load(json_data, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 422

    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    course_to_update = Course.query.get(course_id)

    if not course_to_update:
        return jsonify({'message': 'Course not found'}), 404

    # Authorization check: must be admin or the course creator
    if current_user.role != UserRole.ADMIN and course_to_update.creator_id != int(user_id):
        return jsonify({'message': 'You are not authorized to update this course'}), 403

    try:
        updated_course = CourseService.update_course(course_id, data)
        return jsonify(updated_course), 200
    except Exception as e:
        # Log exception e
        return jsonify({'message': 'An error occurred while updating the course.'}), 500

@courses_bp.route('/<int:course_id>', methods=['DELETE'])
@jwt_required()
@educator_or_admin_required
def delete_course(course_id):
    """
    Delete a course.
    Only accessible to the course creator or an admin.
    """
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    
    course_to_delete = Course.query.get(course_id)

    if not course_to_delete:
        return jsonify({'message': 'Course not found'}), 404

    # Authorization check: must be admin or the course creator
    if current_user.role != UserRole.ADMIN and course_to_delete.creator_id != int(user_id):
        return jsonify({'message': 'You are not authorized to delete this course'}), 403

    try:
        CourseService.delete_course(course_id)
        return jsonify({'message': 'Course deleted successfully'}), 200
    except Exception as e:
        # Log exception e
        return jsonify({'message': 'An error occurred while deleting the course.'}), 500

# --- Enrollment Endpoints ---

@courses_bp.route('/<int:course_id>/enroll', methods=['POST'])
@jwt_required()
def enroll_in_course(course_id):
    """Enrolls the current user in a course."""
    user_id = get_jwt_identity()
    try:
        enrollment = CourseService.enroll_user(user_id, course_id)
        return jsonify(enrollment), 201
    except ValueError as e:
        # Use 400 for client errors like "already enrolled" or "course not found"
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        # Log the exception e
        return jsonify({'message': 'An unexpected error occurred.'}), 500

@courses_bp.route('/<int:course_id>/enroll', methods=['DELETE'])
@jwt_required()
def unenroll_from_course(course_id):
    """Unenrolls the current user from a course."""
    user_id = get_jwt_identity()
    try:
        CourseService.unenroll_user(user_id, course_id)
        return jsonify({'message': 'Successfully unenrolled from the course.'}), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        # Log the exception e
        return jsonify({'message': 'An unexpected error occurred.'}), 500

@courses_bp.route('/my-enrollments', methods=['GET'])
@jwt_required()
def get_my_enrollments():
    """Gets all courses the current user is enrolled in."""
    user_id = get_jwt_identity()
    enrollments = CourseService.get_user_enrollments(user_id)
    return jsonify(enrollments), 200

@courses_bp.route('/<int:course_id>/enrollments', methods=['GET'])
@jwt_required()
@educator_or_admin_required
def get_enrollments_for_course(course_id):
    """(For Educators/Admins) Gets all user enrollments for a specific course."""
    user_id = get_jwt_identity()
    current_user = User.query.get_or_404(user_id)
    course = Course.query.get(course_id)

    if not course:
        return jsonify({'message': 'Course not found'}), 404

    # Authorization: Admins can see any course's enrollments.
    # Educators can only see enrollments for courses they created.
    if current_user.role == UserRole.EDUCATOR and course.creator_id != int(user_id):
        return jsonify({'message': 'You are not authorized to view enrollments for this course'}), 403
    
    enrollments = enrollments_schema.dump(course.enrollments.all())
    return jsonify(enrollments), 200

@courses_bp.route('/meta-info', methods=['GET'])
def get_meta_info():
    """
    Returns metadata for courses, such as available categories and difficulty levels.
    This is a public endpoint and does not require authentication.
    """
    meta_info = CourseService.get_course_meta_info()
    return jsonify(meta_info), 200

# --- Course Content Endpoints ---

@courses_bp.route('/<int:course_id>/content', methods=['POST'])
@jwt_required()
@educator_or_admin_required
def add_course_content(course_id):
    """Adds a new content item (text or file) to a course."""
    user_id = get_jwt_identity()
    course = Course.query.get_or_404(course_id)
    current_user = User.query.get_or_404(user_id)

    # Authorization: Must be course creator or admin
    if current_user.role != UserRole.ADMIN and course.creator_id != int(user_id):
        return jsonify({'message': 'Not authorized to add content to this course'}), 403
    
    # request.form contains the non-file part of the form
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400
        
        try:
            content = ContentService.add_content_to_course(course_id, request.form, file)
            return jsonify(content), 201
        except ValueError as e:
            return jsonify({'message': str(e)}), 400
    else:
        # Handle text-only content
        json_data = request.get_json()
        if not json_data:
             return jsonify({'message': 'No data provided'}), 400
        try:
            content = ContentService.add_content_to_course(course_id, json_data)
            return jsonify(content), 201
        except ValueError as e:
            return jsonify({'message': str(e)}), 400

@courses_bp.route('/<int:course_id>/content', methods=['GET'])
@jwt_required()
def get_course_content(course_id):
    """Gets all content items for a specific course."""
    # Authorization to view content is implicitly handled by ability to view the course itself.
    # For now, any logged-in user can see content of a published course.
    user_id = get_jwt_identity()
    course = Course.query.get_or_404(course_id)
    current_user = User.query.get_or_404(user_id)

    if current_user.role == UserRole.STUDENT and not course.is_published:
        return jsonify({'message': 'Course not found or not published'}), 404
        
    contents = ContentService.get_content_for_course(course_id)
    return jsonify(contents), 200

@courses_bp.route('/content/<int:content_id>', methods=['DELETE'])
@jwt_required()
@educator_or_admin_required
def delete_course_content(content_id):
    """Deletes a specific content item."""
    user_id = get_jwt_identity()
    content = CourseContent.query.get_or_404(content_id)
    current_user = User.query.get_or_404(user_id)

    # Authorization: Must be creator of the course this content belongs to, or an admin.
    if current_user.role != UserRole.ADMIN and content.course.creator_id != int(user_id):
        return jsonify({'message': 'Not authorized to delete this content'}), 403

    ContentService.delete_content(content_id)
    return jsonify({'message': 'Content deleted successfully'}), 200
