import enum
from datetime import datetime
from app import db, ma
from marshmallow import fields

class ContentType(enum.Enum):
    """Defines the type of course content."""
    TEXT = 'text'
    VIDEO = 'video'
    AUDIO = 'audio'
    DOCUMENT = 'document'
    IMAGE = 'image'

class CourseContent(db.Model):
    """
    CourseContent model to store structured course materials and lessons.
    """
    __tablename__ = 'course_contents'

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    content_type = db.Column(db.Enum(ContentType), nullable=False)
    content_url = db.Column(db.String(255), nullable=True) # For file-based content
    content_text = db.Column(db.Text, nullable=True)      # For text-based content
    order_index = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to Course
    course = db.relationship('Course', back_populates='contents')

    def __repr__(self):
        return f'<CourseContent {self.id}: {self.title}>'

class CourseContentSchema(ma.Schema):
    """Marshmallow schema for CourseContent serialization."""
    content_type = fields.Enum(ContentType)
    # Exclude course for brevity, as these will always be queried in the context of a course.
    
    class Meta:
        fields = (
            'id', 'course_id', 'title', 'content_type',
            'content_url', 'content_text', 'order_index',
            'created_at', 'updated_at'
        )

# Initialize schemas
course_content_schema = CourseContentSchema()
course_contents_schema = CourseContentSchema(many=True)
