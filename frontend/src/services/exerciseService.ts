import api from './api';
import {
  Exercise,
  ExerciseAttempt,
  CreateExercisePayload,
  SubmitAttemptPayload,
} from '../types/exercise.types';

/**
 * Retrieves a list of all exercises for a specific course.
 * Corresponds to: GET /api/courses/<course_id>/exercises
 */
export const getExercisesForCourse = async (courseId: number): Promise<Exercise[]> => {
  const response = await api.get<Exercise[]>(`/courses/${courseId}/exercises`);
  return response.data;
};

/**
 * Retrieves a single exercise by its ID.
 * Corresponds to: GET /api/exercises/<exercise_id>
 */
export const getExerciseById = async (exerciseId: number): Promise<Exercise> => {
  const response = await api.get<Exercise>(`/exercises/${exerciseId}`);
  return response.data;
};

/**
 * Creates a new exercise for a specific course.
 * Requires Educator or Admin role.
 * Corresponds to: POST /api/courses/<course_id>/exercises
 */
export const createExercise = async ({
  courseId,
  payload,
}: CreateExercisePayload): Promise<Exercise> => {
  const response = await api.post<Exercise>(`/courses/${courseId}/exercises`, payload);
  return response.data;
};

/**
 * Submits an answer for an exercise.
 * Requires Student role.
 * Corresponds to: POST /api/exercises/<exercise_id>/submit
 */
export const submitExerciseAttempt = async ({
  exerciseId,
  payload,
}: SubmitAttemptPayload): Promise<ExerciseAttempt> => {
  const response = await api.post<ExerciseAttempt>(`/exercises/${exerciseId}/submit`, payload);
  return response.data;
};
