from app import db
from app.models.course import Course
from app.models.exercise import (
    Exercise, ExerciseAttempt,
    exercise_schema, exercises_schema, exercise_attempt_schema,
    ExerciseType, ExerciseDifficultyLevel
)
from app.models.user import User, UserRole
from app.utils.exceptions import ForbiddenError
from sqlalchemy.exc import IntegrityError

class ExerciseService:
    @staticmethod
    def create_exercise(course_id, data, creator_id):
        """Creates a new exercise for a course."""
        course = Course.query.get_or_404(course_id)
        creator = User.query.get_or_404(creator_id)

        if course.creator_id != creator.user_id and creator.role != UserRole.ADMIN:
            raise ForbiddenError("You are not authorized to add exercises to this course.")

        try:
            new_exercise = Exercise(
                course_id=course_id,
                title=data['title'],
                exercise_type=ExerciseType[data['exercise_type'].upper()],
                question_text=data.get('question_text'),
                correct_answer=data.get('correct_answer'),
                options=data.get('options'),
                difficulty_level=ExerciseDifficultyLevel[data['difficulty_level'].upper()],
                points=data.get('points', 10),
                order_index=data.get('order_index')
            )
            db.session.add(new_exercise)
            db.session.commit()
            return exercise_schema.dump(new_exercise)
        except (KeyError, ValueError) as e:
            db.session.rollback()
            raise ValueError(f"Invalid data provided for exercise creation: {e}")
        except IntegrityError:
            db.session.rollback()
            raise ValueError("Database integrity error, possibly due to invalid foreign key or enum value.")

    @staticmethod
    def get_exercises_for_course(course_id):
        """Retrieves all exercises for a given course."""
        course = Course.query.get_or_404(course_id)
        exercises = course.exercises.order_by(Exercise.order_index).all()
        return exercises_schema.dump(exercises)

    @staticmethod
    def get_exercise_by_id(exercise_id):
        """Retrieves a single exercise by its ID."""
        exercise = Exercise.query.get_or_404(exercise_id)
        # We can return the full schema here, but let's assume students see this too
        return exercise_schema.dump(exercise)

    @staticmethod
    def submit_attempt(exercise_id, user_id, submission_data):
        """Processes a user's attempt at an exercise, scores it, and records it."""
        exercise = Exercise.query.get_or_404(exercise_id)
        user = User.query.get_or_404(user_id)
        user_answer = submission_data.get('answer')

        if user_answer is None:
            raise ValueError("Submission must include an 'answer'.")

        # Basic scoring logic
        is_correct = (str(user_answer).strip().lower() == str(exercise.correct_answer).strip().lower())
        score_earned = exercise.points if is_correct else 0
        feedback = "Correct!" if is_correct else f"Incorrect. The correct answer is: {exercise.correct_answer}"

        attempt = ExerciseAttempt(
            user_id=user.user_id,
            exercise_id=exercise.exercise_id,
            user_answer=str(user_answer),
            is_correct=is_correct,
            score_earned=score_earned,
            feedback_given=feedback,
            time_taken=submission_data.get('time_taken')
        )

        db.session.add(attempt)
        db.session.commit()
        
        return exercise_attempt_schema.dump(attempt)
