
/**
 * Defines the expected string literals for course difficulty levels.
 * Based on: Course.difficulty enum
 */
export type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

/**
 * Represents the nested creator object within a Course, providing basic user info.
 */
export interface CourseCreator {
  user_id: number;
  first_name: string;
  last_name: string;
}

/**
 * Represents a Course object as returned by the API.
 * Based on: app/models/course.py -> CourseSchema
 */
export interface Course {
  id: number;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  category: string | null;
  estimated_duration: number | null;
  course_image_url: string | null;
  is_published: boolean;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  enrollment_count: number;
  creator: CourseCreator;
}

/**
 * Represents the data returned for a user's enrollment in a course.
 * Based on: Enrollment Schema
 */
export interface Enrollment {
    enrollment_id: number;
    user_id: number;
    course_id: number;
    enrollment_date: string; // ISO 8601 date string
    status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
    course: {
        id: number;
        title: string;
        description: string;
    };
}

/**
 * Defines the expected string literals for course content types.
 * Based on: CourseContent.content_type
 */
export type ContentType = 'text' | 'video' | 'audio' | 'document' | 'image';

/**
 * Represents a single piece of content within a course.
 * Based on: CourseContent Schema
 */
export interface CourseContent {
  id: number;
  course_id: number;
  title: string;
  content_type: ContentType;
  content_url: string | null;
  content_text: string | null;
  order_index: number;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

/**
 * Represents the metadata for course filtering options.
 * Based on: GET /api/courses/meta-info
 */
export interface CourseMetaInfo {
  categories: string[];
  difficulties: DifficultyLevel[];
}

/**
 * Data shape for creating a new course.
 * Based on: POST /api/courses/
 */
export interface CreateCourseData {
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  category: string;
  is_published?: boolean;
}

/**
 * Data shape for updating an existing course (all fields are optional).
 * Based on: PUT /api/courses/<course_id>
 */
export type UpdateCourseData = Partial<CreateCourseData>;

/**
 * Data shape for adding a new content item to a course.
 * For file uploads, include 'file'. For text, include 'content_text'.
 * Based on: POST /api/courses/<course_id>/content
 */
export interface AddCourseContentData {
  title: string;
  content_type: ContentType;
  order_index?: number;
  content_text?: string;
  file?: File;
}

/**
 * Data shape for filtering the course list.
 * Based on: GET /api/courses/
 */
export interface CourseFilters {
  search?: string;
  difficulty?: DifficultyLevel | '';
  category?: string | '';
}
