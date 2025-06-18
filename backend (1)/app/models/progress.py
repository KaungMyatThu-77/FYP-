from datetime import datetime
from app import db, ma
from .user import UserSchema
from .course import CourseSchema

class ProgressTracking(db.Model):
    """
    ProgressTracking model to track detailed learning progress and analytics.
    """
    __tablename__ = 'progress_tracking'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False) 
    
    lessons_completed = db.Column(db.Integer, default=0)
    exercises_completed = db.Column(db.Integer, default=0)
    total_score = db.Column(db.Integer, default=0)
    average_accuracy = db.Column(db.Numeric(5, 2), default=0.0)
    time_spent = db.Column(db.Integer, default=0) # in minutes
    streak_days = db.Column(db.Integer, default=0)
    skill_scores = db.Column(db.JSON, nullable=True) # e.g., {"reading": 85, "writing": 70}
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('user_id', 'course_id', name='_user_course_uc'),)

    def __repr__(self):
        return f'<ProgressTracking User {self.user_id} in Course {self.course_id}>'

class ProgressTrackingSchema(ma.Schema):
    user = ma.Nested(UserSchema, only=("user_id", "first_name", "last_name", "email"))
    course = ma.Nested(CourseSchema, only=("id", "title"))

    class Meta:
        model = ProgressTracking
        fields = (
            "id", "user_id", "course_id", "lessons_completed", 
            "exercises_completed", "total_score", "average_accuracy",
            "time_spent", "streak_days", "skill_scores", "last_activity",
            "updated_at", "user", "course"
        )
        dump_only = ("id", "updated_at")

progress_tracking_schema = ProgressTrackingSchema()
progress_trackings_schema = ProgressTrackingSchema(many=True)
