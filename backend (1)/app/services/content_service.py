import os
from app import db
from app.models.course import Course
from app.models.course_content import CourseContent, course_content_schema, course_contents_schema
from app.utils.helpers import save_file
from flask import current_app

class ContentService:
    @staticmethod
    def get_content_for_course(course_id):
        """Get all content for a specific course, ordered by index."""
        course = Course.query.get_or_404(course_id)
        contents = course.contents.order_by(CourseContent.order_index).all()
        return course_contents_schema.dump(contents)

    @staticmethod
    def add_content_to_course(course_id, data, file=None):
        """Add a new content item (text or file) to a course."""
        Course.query.get_or_404(course_id) # Ensure course exists

        # Deserialize metadata
        try:
            content_data = course_content_schema.load(data)
        except Exception as e:
             raise ValueError(f"Invalid data provided: {e}")

        content_data['course_id'] = course_id
        
        # Handle file upload if present
        if file:
            file_url = save_file(file)
            content_data['content_url'] = file_url
        
        new_content = CourseContent(**content_data)
        db.session.add(new_content)
        db.session.commit()
        
        return course_content_schema.dump(new_content)

    @staticmethod
    def get_content_by_id(content_id):
        """Get a single course content item by its ID."""
        content = CourseContent.query.get_or_404(content_id)
        return course_content_schema.dump(content)

    @staticmethod
    def delete_content(content_id):
        """Deletes a content item and its associated file if it exists."""
        content = CourseContent.query.get_or_404(content_id)
        
        if content.content_url:
            try:
                # Construct path relative to the app's root
                file_path = os.path.join(current_app.root_path, 'static', 'uploads', os.path.basename(content.content_url))
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                # Log this error, but don't block deletion of the DB record
                print(f"Error deleting file {content.content_url}: {e}")

        db.session.delete(content)
        db.session.commit()
        return True
