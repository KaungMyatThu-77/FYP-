import enum
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from app import db, ma

class UserRole(enum.Enum):
    STUDENT = 'student'
    EDUCATOR = 'educator'
    ADMIN = 'admin'

class ProficiencyLevel(enum.Enum):
    BEGINNER = 'beginner'
    INTERMEDIATE = 'intermediate'
    ADVANCED = 'advanced'

class User(db.Model):
    """
    User model to store user accounts for students, educators, and administrators.
    """
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    role = db.Column(db.Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    proficiency_level = db.Column(db.Enum(ProficiencyLevel), default=ProficiencyLevel.BEGINNER, nullable=False)
    learning_goals = db.Column(db.Text, nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    authentication = db.relationship('Authentication', back_populates='user', uselist=False, cascade="all, delete-orphan")

    # A user can create many courses
    created_courses = db.relationship('Course', back_populates='creator', lazy='dynamic')
    # Relationship to ProgressTracking
    progress_records = db.relationship('ProgressTracking', backref='user', lazy='dynamic', cascade="all, delete-orphan")
    # Relationship to Enrollments
    enrollments = db.relationship('Enrollment', back_populates='user', lazy='dynamic', cascade="all, delete-orphan")
    # Relationship to ExerciseAttempt
    attempts = db.relationship('ExerciseAttempt', back_populates='user', lazy='dynamic', cascade="all, delete-orphan")

    def set_password(self, password):
        """Hashes and sets the user's password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Checks if the provided password matches the stored hash."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        """Provides a developer-friendly representation of the User object."""
        return f'<User {self.user_id}: {self.email} ({self.role.value})>'

# Marshmallow Schema for User Serialization
class UserSchema(ma.Schema):
    class Meta:
        # Fields to expose
        fields = ('user_id', 'email', 'first_name', 'last_name', 'role', 'proficiency_level', 'created_at')

    role = ma.Enum(UserRole)
    proficiency_level = ma.Enum(ProficiencyLevel)

user_schema = UserSchema()
users_schema = UserSchema(many=True)
