import enum
from datetime import datetime
from app import db, ma
from app.models.user import UserSchema

class DifficultyLevel(enum.Enum):
    BEGINNER = 'beginner'
    INTERMEDIATE = 'intermediate'
    ADVANCED = 'advanced'

class Course(db.Model):
    """
    Course model to store course information and content structure.
    """
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    difficulty = db.Column(db.Enum(DifficultyLevel), default=DifficultyLevel.BEGINNER, nullable=False)
    category = db.Column(db.String(80), nullable=True)
    estimated_duration = db.Column(db.Integer, nullable=True)  # In hours
    course_image_url = db.Column(db.String(255), nullable=True)
    is_published = db.Column(db.Boolean, default=False, nullable=False)
    enrollment_count = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = db.relationship('User', back_populates='created_courses', lazy='joined')
    exercises = db.relationship('Exercise', back_populates='course', lazy='dynamic', cascade="all, delete-orphan")
    # Relationship to CourseContent
    contents = db.relationship('CourseContent', back_populates='course', lazy='dynamic', cascade="all, delete-orphan")
    # Relationship to Enrollments
    enrollments = db.relationship('Enrollment', back_populates='course', lazy='dynamic', cascade="all, delete-orphan")
    # Relationship to ProgressTracking
    progress_records = db.relationship('ProgressTracking', backref='course', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Course {self.id}: {self.title}>'

# Marshmallow Schema for Course Serialization
class CourseSchema(ma.Schema):
    creator = ma.Nested(UserSchema, only=("user_id", "first_name", "last_name"))

    class Meta:
        fields = (
            'id', 'title', 'description', 'difficulty',
            'category', 'estimated_duration', 'course_image_url', 'enrollment_count',
            'is_published', 'created_at', 'updated_at', 'creator',
        )
    
    # Handle Enum serialization
    difficulty = ma.Enum(DifficultyLevel)

# Initialize schemas
course_schema = CourseSchema()
courses_schema = CourseSchema(many=True)
