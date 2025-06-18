from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from flask import jsonify
from app.models.user import User, UserRole # Ensure UserRole is imported
from app.utils.exceptions import ForbiddenError # Import the new exception

def role_required(required_roles):
    """
    Decorator to ensure the current user has one of the required roles.
    `required_roles` can be a single UserRole enum member or a list/tuple of them.
    """
    if not isinstance(required_roles, (list, tuple)):
        required_roles = [required_roles]

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request() # Ensure JWT is present and valid
            user_id = get_jwt_identity()
            current_user = User.query.get(user_id)

            if not current_user:
                # This case should ideally be rare if JWT identity is valid
                # and user_lookup_loader is working correctly.
                return jsonify({"message": "User not found for the provided token."}), 404
            
            # Check if the current user's role is in the list of required roles
            if current_user.role not in required_roles:
                raise ForbiddenError("You do not have the necessary permissions to access this resource.")
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def admin_required(fn):
    """Decorator for routes accessible only by admin users."""
    return role_required(UserRole.ADMIN)(fn)

def educator_required(fn):
    """Decorator for routes accessible only by educator users."""
    return role_required(UserRole.EDUCATOR)(fn)

def student_required(fn):
    """Decorator for routes accessible only by student users."""
    return role_required(UserRole.STUDENT)(fn)

def educator_or_admin_required(fn):
    """Decorator for routes accessible by educators or admin users."""
    return role_required([UserRole.EDUCATOR, UserRole.ADMIN])(fn)

# You can add more combinations as needed, e.g.:
# def student_or_educator_required(fn):
# return role_required([UserRole.STUDENT, UserRole.EDUCATOR])(fn)
