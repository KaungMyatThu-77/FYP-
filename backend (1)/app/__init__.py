import logging
import os
from logging.handlers import RotatingFileHandler

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, get_jwt, get_jwt_identity, verify_jwt_in_request
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate # Import Migrate
from .config import Config
from .utils.exceptions import AuthError

db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()
ma = Marshmallow()
migrate = Migrate() # Initialize Migrate

# A set to store revoked token identifiers
# For a production environment, this should be a persistent store like Redis.
revoked_tokens = set()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configure Logging
    if not app.debug and not app.testing:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240, backupCount=10)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)

        app.logger.setLevel(logging.INFO)
        app.logger.info('LELMS startup')

    @app.errorhandler(Exception)
    def handle_unhandled_exception(e):
        from werkzeug.exceptions import HTTPException
        if isinstance(e, HTTPException):
            # Let Flask's default HTTPException handler take over for standard HTTP errors
            return e
        elif isinstance(e, AuthError):
            # Handle custom AuthError exceptions by returning a JSON response
            app.logger.warning(f"AuthError caught: {e.message} (Status: {e.status_code})")
            return jsonify(message=e.message), e.status_code
        
        # Log and return a generic error for all other unhandled exceptions
        app.logger.error(f'Unhandled Exception: {str(e)}', exc_info=True)
        return jsonify(message="An unexpected internal server error occurred."), 500

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}}) # Example CORS config
    ma.init_app(app)
    migrate.init_app(app, db) # Initialize Migrate with app and db

    # Import models here to ensure they are registered with SQLAlchemy
    from app.models.user import User
    from app.models.authentication import Authentication # Import Authentication model
    from app.models.course import Course # Import Course model
    from app.models.enrollment import Enrollment # Import Enrollment model
    from app.models.course_content import CourseContent # Import CourseContent model
    from app.models.exercise import Exercise, ExerciseAttempt # Import Exercise and ExerciseAttempt models
    from app.models.progress import ProgressTracking # Import ProgressTracking model

    # JWT user lookup loader
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.query.get(identity)

    # Register a callback function that checks if a JWT is in the blocklist.
    # This function is called automatically by Flask-JWT-Extended when JWT_BLACKLIST_ENABLED is True.
    @jwt.token_in_blocklist_loader
    def check_if_token_in_blocklist(jwt_header, jwt_payload):
        user_id = jwt_payload["sub"]
        jti = jwt_payload["jti"] # Get the unique identifier for the JWT
        
        auth_entry = Authentication.query.filter_by(user_id=user_id).first()

        # A token is considered in the blocklist (revoked) if:
        # 1. No authentication entry exists for the user (shouldn't happen if user_lookup_loader works).
        # 2. The stored session_token for the user does not match the current token's jti.
        #    This implies the user logged out (session_token cleared) or logged in again
        #    (session_token updated to a new jti, invalidating old tokens).
        if not auth_entry or auth_entry.session_token != jti:
            return True # Token is in blocklist (revoked)
        
        return False # Token is not in blocklist (valid)


    from app.routes.auth import auth_bp
    from app.routes.courses import courses_bp
    from app.routes.exercises import exercises_bp
    from app.routes.progress import progress_bp
    from app.routes.speech import speech_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    # Change the prefix for exercises to make nested routing cleaner
    app.register_blueprint(exercises_bp, url_prefix='/api')
    app.register_blueprint(progress_bp, url_prefix='/api/progress')
    app.register_blueprint(speech_bp, url_prefix='/api/speech')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    return app
