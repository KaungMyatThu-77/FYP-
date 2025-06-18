import enum
from datetime import datetime
from app import db, ma
from marshmallow import fields
from app.models.user import UserSchema # Import UserSchema for nesting

class ExerciseType(enum.Enum):
    MULTIPLE_CHOICE = 'multiple_choice'
    FILL_IN_THE_BLANKS = 'fill_in_the_blanks'
    SPEAKING = 'speaking'
    LISTENING = 'listening'
    MATCHING = 'matching'
    VOCABULARY_GAME = 'vocabulary_game'
    GRAMMAR_DRILL = 'grammar_drill'

class ExerciseDifficultyLevel(enum.Enum):
    EASY = 'easy'
    MEDIUM = 'medium'
    HARD = 'hard'

class Exercise(db.Model):
    """
    Exercise model to store interactive exercises and assessments.
    """
    __tablename__ = 'exercise' # Changed to singular as per plan

    exercise_id = db.Column(db.Integer, primary_key=True) # Changed from id to exercise_id
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    exercise_type = db.Column(db.Enum(ExerciseType), nullable=False)
    question_text = db.Column(db.Text, nullable=True)
    audio_url = db.Column(db.String(255), nullable=True)
    correct_answer = db.Column(db.Text, nullable=True)
    options = db.Column(db.JSON, nullable=True)  # For multiple choice, matching, etc.
    difficulty_level = db.Column(db.Enum(ExerciseDifficultyLevel), default=ExerciseDifficultyLevel.MEDIUM)
    points = db.Column(db.Integer, default=10)
    time_limit = db.Column(db.Integer, nullable=True)  # in seconds
    order_index = db.Column(db.Integer)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # removed updated_at as it's not in the model plan for this table

    # Relationship to Course.
    course = db.relationship('Course', back_populates='exercises')
    # Relationship to ExerciseAttempt
    attempts = db.relationship('ExerciseAttempt', back_populates='exercise', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Exercise {self.title}>'


class ExerciseSchema(ma.Schema):
    exercise_type = fields.String(attribute="exercise_type.value")
    difficulty_level = fields.String(attribute="difficulty_level.value")
    
    class Meta:
        model = Exercise
        fields = (
            "exercise_id", "course_id", "title", "exercise_type", "question_text",
            "audio_url", "options", "difficulty_level", "points",
            "time_limit", "order_index", "is_active", "created_at"
        )
        # `correct_answer` is intentionally excluded from student-facing serialization.
        include_fk = True

exercise_schema = ExerciseSchema()
exercises_schema = ExerciseSchema(many=True)

# New Model for Exercise Attempts
class ExerciseAttempt(db.Model):
    """
    ExerciseAttempt model to record individual exercise attempts and results.
    """
    __tablename__ = 'exercise_attempt'
    attempt_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercise.exercise_id'), nullable=False)
    user_answer = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean)
    score_earned = db.Column(db.Integer)
    time_taken = db.Column(db.Integer) # in seconds
    attempt_number = db.Column(db.Integer, default=1)
    feedback_given = db.Column(db.Text, nullable=True)
    attempted_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='attempts')
    exercise = db.relationship('Exercise', back_populates='attempts')

    def __repr__(self):
        return f"<ExerciseAttempt {self.attempt_id} by User {self.user_id} for Exercise {self.exercise_id}>"

class ExerciseAttemptSchema(ma.Schema):
    user = ma.Nested(UserSchema, only=("user_id", "first_name", "last_name"))
    
    class Meta:
        model = ExerciseAttempt
        fields = (
            "attempt_id", "user_id", "exercise_id", "user_answer", "is_correct",
            "score_earned", "time_taken", "attempted_at", "feedback_given", "user"
        )
        include_fk = True

exercise_attempt_schema = ExerciseAttemptSchema()
exercise_attempts_schema = ExerciseAttemptSchema(many=True)
