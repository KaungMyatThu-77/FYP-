from flask import Blueprint, request, jsonify, current_app
from app.services.auth_service import AuthService
from app.utils.exceptions import AuthError, InvalidCredentials, AccountLocked, UserNotFound
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models.user import UserRole

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    # Role is no longer taken from self-registration data directly for non-students.
    # All self-registrations default to STUDENT.
    # Admin/Educator creation would be via admin-only endpoints.

    if not all([email, password, first_name, last_name]):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        # AuthService.register_user defaults role to UserRole.STUDENT
        # If you want to allow admins to specify roles during registration via a different endpoint,
        # that endpoint would call AuthService.register_user with a specific role.
        user = AuthService.register_user(email, password, first_name, last_name) # Role defaults to STUDENT
        return jsonify({
            "message": "User registered successfully",
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role.value # Return the role that was set
        }), 201
    except AuthError as e:
        current_app.logger.warning(f"Registration failed for email {email}: {e.message}")
        return jsonify({"message": e.message}), e.status_code
    except Exception as e:
        current_app.logger.error(f"Registration error for {email}: {e}", exc_info=True)
        return jsonify({"message": "An internal error occurred during registration."}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"message": "Missing email or password"}), 400

    try:
        tokens = AuthService.login_user(email, password)
        current_app.logger.info(f"User '{email}' logged in successfully.")
        return jsonify(tokens), 200
    except (InvalidCredentials, AccountLocked) as e:
        current_app.logger.warning(f"Failed login attempt for email '{email}': {e.message}")
        return jsonify({"message": e.message}), e.status_code
    except Exception as e:
        current_app.logger.error(f"An error occurred during login for email '{email}': {e}", exc_info=True)
        return jsonify({"message": "An internal error occurred during login."}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Provides a new access token from a valid refresh token.
    """
    current_user_id = get_jwt_identity()
    try:
        new_token = AuthService.refresh_access_token(current_user_id)
        return jsonify(new_token), 200
    except UserNotFound as e:
        current_app.logger.warning(f"Token refresh failed for user_id {current_user_id}: {e.message}")
        return jsonify({"message": e.message}), e.status_code
    except Exception as e:
        current_app.logger.error(f"An error occurred during token refresh for user_id {current_user_id}: {e}", exc_info=True)
        return jsonify({"message": "An error occurred while refreshing the token."}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    user_id = get_jwt_identity()
    try:
        if AuthService.logout_user(user_id):
            current_app.logger.info(f"User {user_id} logged out successfully.")
            return jsonify({"message": "Successfully logged out"}), 200
        current_app.logger.warning(f"Logout failed for user {user_id}, user not found in auth table.")
        return jsonify({"message": "Logout failed or user not found"}), 400
    except Exception as e:
        current_app.logger.error(f"An error occurred during logout for user {user_id}: {e}", exc_info=True)
        return jsonify({"message": "An error occurred during logout."}), 500

# Example protected route to test JWT
@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    return jsonify(logged_in_as=current_user_id), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    try:
        profile_data = AuthService.get_user_profile(user_id)
        return jsonify(profile_data), 200
    except UserNotFound as e:
        current_app.logger.warning(f"Profile fetch for user {user_id} failed: {e.message}")
        return jsonify({"message": e.message}), e.status_code
    except Exception as e:
        current_app.logger.error(f"Error fetching profile for user {user_id}: {e}", exc_info=True)
        return jsonify({"message": "An error occurred while fetching profile."}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"message": "No data provided for update"}), 400

    try:
        result = AuthService.update_user_profile(user_id, data)
        return jsonify(result), 200
    except (UserNotFound, AuthError) as e:
        current_app.logger.warning(f"Profile update for user {user_id} failed: {e.message}")
        return jsonify({"message": e.message}), e.status_code
    except Exception as e:
        current_app.logger.error(f"Error updating profile for user {user_id}: {e}", exc_info=True)
        return jsonify({"message": "An error occurred while updating profile."}), 500
