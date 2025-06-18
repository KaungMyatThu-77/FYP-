from app import db
from app.models.course import Course, course_schema, courses_schema, DifficultyLevel
from app.models.user import User, UserRole
from app.models.enrollment import Enrollment, enrollment_schema, enrollments_schema

class CourseService:
    @staticmethod
    def get_all_courses(filters=None):
        """
        Retrieve all published courses, with optional filtering.
        `filters` is a dict that can contain 'difficulty' and 'category'.
        """
        query = Course.query.filter_by(is_published=True)
        if filters:
            if 'difficulty' in filters and filters['difficulty']:
                try:
                    # Convert string from query param to Enum member
                    difficulty_enum = DifficultyLevel(filters['difficulty'].lower())
                    query = query.filter(Course.difficulty == difficulty_enum)
                except ValueError:
                    # Ignore invalid difficulty values
                    pass
            if 'category' in filters and filters['category']:
                query = query.filter(Course.category.ilike(f"%{filters['category']}%"))
        
        courses = query.order_by(Course.created_at.desc()).all()
        return courses_schema.dump(courses)

    @staticmethod
    def get_all_courses_for_authoring(filters=None):
        """
        Retrieve all courses (published or not), with optional filtering.
        For educators/admins.
        """
        # This method is very similar to get_all_courses, but without the is_published filter.
        # For now, we'll keep them separate for clarity, but they could be consolidated.
        query = Course.query
        # The filtering logic is identical, so we just apply it to the base query.
        if filters:
            if 'difficulty' in filters and filters['difficulty']:
                try:
                    difficulty_enum = DifficultyLevel(filters['difficulty'].lower())
                    query = query.filter(Course.difficulty == difficulty_enum)
                except ValueError:
                    pass
            if 'category' in filters and filters['category']:
                query = query.filter(Course.category.ilike(f"%{filters['category']}%"))

        courses = query.order_by(Course.created_at.desc()).all()
        return courses_schema.dump(courses)

    @staticmethod
    def get_course_by_id(course_id, user):
        """
        Retrieve a single course by its ID.
        Respects publishing status for students.
        """
        course = Course.query.get(course_id)
        if not course:
            return None
        
        # If user is a student and course is not published, treat as not found.
        if user.role == UserRole.STUDENT and not course.is_published:
            return None
            
        return course_schema.dump(course)

    @staticmethod
    def create_course(data, creator_id):
        """Create a new course from deserialized data."""
        if not User.query.get(creator_id):
            raise ValueError("Creator user not found.")

        new_course = Course(creator_id=creator_id, **data)
        
        db.session.add(new_course)
        db.session.commit()
        return course_schema.dump(new_course)

    @staticmethod
    def update_course(course_id, data):
        """Update an existing course's data."""
        course = Course.query.get_or_404(course_id)
        
        for key, value in data.items():
            setattr(course, key, value)

        db.session.commit()
        return course_schema.dump(course)

    @staticmethod
    def delete_course(course_id):
        """Delete a course from the database."""
        course = Course.query.get_or_404(course_id)
        
        db.session.delete(course)
        db.session.commit()
        return True

    @staticmethod
    def enroll_user(user_id, course_id):
        """Enroll a user in a course."""
        course = Course.query.get(course_id)
        if not course or not course.is_published:
            raise ValueError("Course not found or is not published.")
        
        existing_enrollment = Enrollment.query.filter_by(user_id=user_id, course_id=course_id).first()
        if existing_enrollment:
            raise ValueError("User is already enrolled in this course.")

        new_enrollment = Enrollment(user_id=user_id, course_id=course_id)
        course.enrollment_count = (course.enrollment_count or 0) + 1
        
        db.session.add(new_enrollment)
        db.session.commit()
        
        return enrollment_schema.dump(new_enrollment)

    @staticmethod
    def unenroll_user(user_id, course_id):
        """Unenroll a user from a course."""
        enrollment = Enrollment.query.filter_by(user_id=user_id, course_id=course_id).first()
        
        if not enrollment:
            raise ValueError("User is not enrolled in this course.")

        course = Course.query.get(course_id)
        if course and course.enrollment_count > 0:
            course.enrollment_count -= 1
        
        db.session.delete(enrollment)
        db.session.commit()
        return True

    @staticmethod
    def get_user_enrollments(user_id):
        """Get all courses a user is enrolled in."""
        enrollments = Enrollment.query.filter_by(user_id=user_id).order_by(Enrollment.enrollment_date.desc()).all()
        # We return the enrollment objects which contain nested course info
        return enrollments_schema.dump(enrollments)

    @staticmethod
    def get_course_meta_info():
        """Gets all unique categories and available difficulty levels."""
        # Using a query to get distinct, non-null, non-empty categories
        categories_query = db.session.query(Course.category).filter(Course.category.isnot(None), Course.category != '').distinct().all()
        # Extracting the string from the tuple result
        categories = [category[0] for category in categories_query]
        
        # Getting difficulty levels from the Enum
        difficulties = [level.value for level in DifficultyLevel]
        
        return {
            "categories": sorted(categories),
            "difficulties": difficulties
        }
