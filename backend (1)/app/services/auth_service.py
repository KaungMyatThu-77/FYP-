from app import db
from app.models.user import User, UserRole, ProficiencyLevel # Import ProficiencyLevel
from app.models.authentication import Authentication
from app.utils.exceptions import InvalidCredentials, AccountLocked, UserNotFound, AuthError
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, get_jwt, get_jti
from flask import current_app
from datetime import datetime, timedelta

class AuthService:
    """
    Service layer for handling user authentication operations.
    """

    @staticmethod
    def register_user(email, password, first_name, last_name, role=UserRole.STUDENT):
        """
        Registers a new user in the system.
        """
        if User.query.filter_by(email=email).first():
            raise AuthError("User with this email already exists.", status_code=409)

        new_user = User(email=email, first_name=first_name, last_name=last_name, role=role)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.flush() # Flush to get user_id for Authentication entry

        # Create an associated Authentication entry
        auth_entry = Authentication(user_id=new_user.user_id)
        db.session.add(auth_entry)

        db.session.commit()
        return new_user

    @staticmethod
    def login_user(email, password):
        """
        Authenticates a user and generates JWT tokens.
        Handles account locking for too many failed attempts.
        """
        user = User.query.filter_by(email=email).first()
        if not user:
            current_app.logger.warning(f"Login attempt for non-existent user: {email}")
            raise InvalidCredentials()

        auth_entry = Authentication.query.filter_by(user_id=user.user_id).first()
        if not auth_entry:
            # This should ideally not happen if Authentication entry is created with User
            current_app.logger.warning(f"Authentication entry missing for user_id {user.user_id}. Creating new one.")
            auth_entry = Authentication(user_id=user.user_id)
            db.session.add(auth_entry)
            db.session.commit()

        if auth_entry.account_locked:
            current_app.logger.warning(f"Login attempt for locked account: {email}")
            raise AccountLocked()

        if not user.check_password(password):
            auth_entry.login_attempts += 1
            if auth_entry.login_attempts >= 5: # Example: Lock after 5 failed attempts
                auth_entry.account_locked = True
                current_app.logger.warning(f"Account for {email} has been locked due to too many failed login attempts.")
            db.session.commit()
            current_app.logger.warning(f"Invalid password for user: {email}")
            raise InvalidCredentials()

        # Successful login
        auth_entry.login_attempts = 0
        auth_entry.last_login = datetime.utcnow()
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.user_id), expires_delta=timedelta(hours=1))
        refresh_token = create_refresh_token(identity=str(user.user_id), expires_delta=timedelta(days=30))
        
        # Store the JTI (JWT ID) of the access token. This is used by the blocklist loader
        # to ensure that only the most recently issued access token for a user is valid.
        access_jti = get_jti(encoded_token=access_token)
        auth_entry.session_token = access_jti 
        
        db.session.commit()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role.value
        }

    @staticmethod
    def refresh_access_token(user_id):
        """
        Generates a new access token for a user and updates the session.
        This invalidates the previous access token due to the blocklist check.
        """
        auth_entry = Authentication.query.filter_by(user_id=user_id).first()
        if not auth_entry:
            # This case is unlikely if the refresh token is valid but good practice to check
            raise UserNotFound("Authentication entry not found for user.")

        new_access_token = create_access_token(identity=str(user_id), expires_delta=timedelta(hours=1))
        
        # Update the session_token with the JTI of the new access token.
        # This effectively adds the old access token to the blocklist.
        new_access_jti = get_jti(encoded_token=new_access_token)
        auth_entry.session_token = new_access_jti
        db.session.commit()

        return {"access_token": new_access_token}

    @staticmethod
    def logout_user(user_id):
        """
        Logs out a user by invalidating their session token.
        """
        auth_entry = Authentication.query.filter_by(user_id=user_id).first()
        if auth_entry:
            # By clearing the session_token, we effectively add all tokens for this
            # session to the blocklist, as their JTI will no longer match.
            auth_entry.session_token = None
            db.session.commit()
            return True
        return False

    @staticmethod
    def get_user_by_id(user_id):
        """
        Retrieves a user by their ID.
        """
        return User.query.get(user_id)

    @staticmethod
    def get_user_profile(user_id):
        """
        Retrieves a user's profile information.
        """
        user = User.query.get(user_id)
        if not user:
            raise UserNotFound("User profile not found.")
        return {
            "user_id": user.user_id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role.value,
            "proficiency_level": user.proficiency_level.value,
            "learning_goals": user.learning_goals,
            "profile_picture": user.profile_picture,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat(),
            "updated_at": user.updated_at.isoformat()
        }

    @staticmethod
    def update_user_profile(user_id, data):
        """
        Updates a user's profile information.
        """
        user = User.query.get(user_id)
        if not user:
            raise UserNotFound("User profile not found.")

        # Update fields if provided in data
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'proficiency_level' in data:
            try:
                user.proficiency_level = ProficiencyLevel[data['proficiency_level'].upper()]
            except KeyError:
                raise AuthError("Invalid proficiency level provided.", status_code=400)
        if 'learning_goals' in data:
            user.learning_goals = data['learning_goals']
        if 'profile_picture' in data:
            user.profile_picture = data['profile_picture']
        # Note: Email and role changes might require separate, more secure endpoints
        # For now, disallow direct update of email/role via this endpoint

        db.session.commit()
        return {
            "message": "Profile updated successfully",
            "user_id": user.user_id,
            "email": user.email
        }
