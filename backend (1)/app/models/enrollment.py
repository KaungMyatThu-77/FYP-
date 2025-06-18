import enum
from datetime import datetime
from app import db, ma
from marshmallow import fields

# These imports are for nested schema serialization and are safe from circular dependencies
# as the related models (User, Course) do not import the Enrollment model or schema.
from app.models.user import UserSchema
from app.models.course import CourseSchema

class EnrollmentStatus(enum.Enum):
    """Defines the status of a user's enrollment in a course."""
    ENROLLED = 'enrolled'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    DROPPED = 'dropped'

class Enrollment(db.Model):
    """
    Enrollment model to track user enrollment in courses.
    This acts as a many-to-many association table between Users and Courses.
    """
    __tablename__ = 'enrollments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    
    enrollment_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.Enum(EnrollmentStatus), default=EnrollmentStatus.ENROLLED, nullable=False)
    completion_percentage = db.Column(db.Numeric(5, 2), default=0.0, nullable=False)
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='enrollments')
    course = db.relationship('Course', back_populates='enrollments')

    # Ensure a user can only enroll in a course once
    __table_args__ = (db.UniqueConstraint('user_id', 'course_id', name='_user_course_uc'),)
    
    def __repr__(self):
        return f'<Enrollment user_id={self.user_id} course_id={self.course_id}>'

class EnrollmentSchema(ma.Schema):
    """Marshmallow schema for serializing Enrollment data."""
    # Nest related data to provide more context in API responses
    user = fields.Nested(UserSchema, only=('user_id', 'first_name', 'email'))
    course = fields.Nested(CourseSchema, only=('id', 'title', 'difficulty', 'creator'))
    status = fields.Enum(EnrollmentStatus)
    
    class Meta:
        fields = (
            'id', 'user_id', 'course_id', 'enrollment_date',
            'status', 'completion_percentage', 'last_accessed', 'user', 'course'
        )

# Initialize schemas
enrollment_schema = EnrollmentSchema()
enrollments_schema = EnrollmentSchema(many=True)
