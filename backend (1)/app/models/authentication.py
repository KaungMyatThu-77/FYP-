from app import db
from datetime import datetime

class Authentication(db.Model):
    """
    Authentication model to manage user authentication sessions and security.
    """
    __tablename__ = 'authentication'

    auth_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), unique=True, nullable=False)
    last_login = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    login_attempts = db.Column(db.Integer, default=0, nullable=False)
    account_locked = db.Column(db.Boolean, default=False, nullable=False)
    two_factor_enabled = db.Column(db.Boolean, default=False, nullable=False)
    password_reset_token = db.Column(db.String(128), nullable=True)
    token_expiry = db.Column(db.DateTime, nullable=True)
    session_token = db.Column(db.String(256), nullable=True) # For JWT refresh tokens or session management

    # Relationship to User model
    user = db.relationship('User', back_populates='authentication')

    def __repr__(self):
        return f"<Authentication for User {self.user_id}>"
