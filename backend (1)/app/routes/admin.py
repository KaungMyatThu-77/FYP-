from flask import Blueprint, request, jsonify
from app.utils.decorators import admin_required # Import the decorator

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route('/test', methods=['GET'])
@admin_required # Apply the decorator
def test_admin_route():
    # This route is now only accessible to users with the 'admin' role.
    return jsonify(message="Admin blueprint is working! You have admin access."), 200

# Example of a future admin-only endpoint:
# @admin_bp.route('/users', methods=['POST'])
# @admin_required
# def create_user_as_admin():
#     data = request.get_json()
#     # ... logic to create a user, potentially with a specified role (educator, admin)
#     # email = data.get('email')
#     # password = data.get('password')
#     # first_name = data.get('first_name')
#     # last_name = data.get('last_name')
#     # role_str = data.get('role', 'student') # Default to student if not specified
#     # try:
#     #     role_enum = UserRole(role_str.lower())
#     # except ValueError:
#     #     return jsonify({"message": "Invalid role specified"}), 400
#     #
#     # # Call AuthService.register_user(..., role=role_enum)
#     return jsonify({"message": "User creation endpoint for admin (not implemented yet)"}), 501
