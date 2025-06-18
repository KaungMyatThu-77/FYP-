import api from './api';
import {
  Course,
  Enrollment,
  CourseContent,
  CourseMetaInfo,
  CreateCourseData,
  UpdateCourseData,
  AddCourseContentData,
  CourseFilters,
} from '../types/course.types';

/**
 * Retrieves a list of courses, with optional filtering.
 * Corresponds to: GET /api/courses/
 */
export const getCourses = async (
  params?: CourseFilters
): Promise<Course[]> => {
  const response = await api.get<Course[]>('/courses/', { params });
  return response.data;
};

/**
 * Creates a new course.
 * Requires Educator or Admin role.
 * Corresponds to: POST /api/courses/
 */
export const createCourse = async (data: CreateCourseData): Promise<Course> => {
  const response = await api.post<Course>('/courses', data);
  return response.data;
};

/**
 * Retrieves a single course by its ID.
 * Corresponds to: GET /api/courses/<course_id>
 */
export const getCourseById = async (courseId: number): Promise<Course> => {
  const response = await api.get<Course>(`/courses/${courseId}`);
  return response.data;
};

/**
 * Updates an existing course.
 * Requires Course Creator or Admin role.
 * Corresponds to: PUT /api/courses/<course_id>
 */
export const updateCourse = async (
  courseId: number,
  data: UpdateCourseData
): Promise<Course> => {
  const response = await api.put<Course>(`/courses/${courseId}`, data);
  return response.data;
};

/**
 * Deletes a course.
 * Requires Course Creator or Admin role.
 * Corresponds to: DELETE /api/courses/<course_id>
 */
export const deleteCourse = async (
  courseId: number
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/courses/${courseId}`);
  return response.data;
};

/**
 * Enrolls the current user in a specific course.
 * Corresponds to: POST /api/courses/<course_id>/enroll
 */
export const enrollInCourse = async (courseId: number): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`/courses/${courseId}/enroll`);
  return response.data;
};

/**
 * Unenrolls the current user from a specific course.
 * Corresponds to: DELETE /api/courses/<course_id>/enroll
 */
export const unenrollFromCourse = async (
  courseId: number
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/courses/${courseId}/enroll`
  );
  return response.data;
};

/**
 * Gets a list of all courses the current user is enrolled in.
 * Corresponds to: GET /api/courses/my-enrollments
 */
export const getMyEnrollments = async (): Promise<Enrollment[]> => {
  const response = await api.get<Enrollment[]>('/courses/my-enrollments');
  return response.data;
};

/**
 * Retrieves all content for a specific course.
 * Corresponds to: GET /api/courses/<course_id>/content
 */
export const getCourseContent = async (
  courseId: number
): Promise<CourseContent[]> => {
  const response = await api.get<CourseContent[]>(
    `/courses/${courseId}/content`
  );
  return response.data;
};

/**
 * Adds a new content item to a course. Handles both JSON and file uploads.
 * Requires Course Creator or Admin role.
 * Corresponds to: POST /api/courses/<course_id>/content
 */
export const addCourseContent = async (
  courseId: number,
  data: AddCourseContentData
): Promise<CourseContent> => {
  let requestBody: FormData | AddCourseContentData;
  const headers = {};

  if (data.file) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content_type', data.content_type);
    formData.append('file', data.file);
    if (data.order_index !== undefined) {
      formData.append('order_index', String(data.order_index));
    }
    requestBody = formData;
    // Axios will set the correct multipart/form-data header with boundary
  } else {
    requestBody = {
      title: data.title,
      content_type: data.content_type,
      content_text: data.content_text,
      order_index: data.order_index,
    };
    headers['Content-Type'] = 'application/json';
  }

  const response = await api.post<CourseContent>(
    `/courses/${courseId}/content`,
    requestBody,
    { headers }
  );
  return response.data;
};

/**
 * Deletes a specific content item.
 * Requires Course Creator or Admin role.
 * Corresponds to: DELETE /api/content/<content_id>
 */
export const deleteCourseContent = async (
  contentId: number
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/content/${contentId}`);
  return response.data;
};

/**
 * Retrieves metadata for UI filters (categories and difficulties).
 * Public endpoint.
 * Corresponds to: GET /api/courses/meta-info
 */
export const getCourseMetaInfo = async (): Promise<CourseMetaInfo> => {
  const response = await api.get<CourseMetaInfo>('/courses/meta-info');
  return response.data;
};
