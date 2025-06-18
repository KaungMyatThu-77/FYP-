import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as exerciseService from '../services/exerciseService';
import { CreateExercisePayload, SubmitAttemptPayload } from '../types/exercise.types';

// Query key factory for consistency and to avoid typos
const exerciseKeys = {
  all: ['exercises'] as const,
  lists: () => [...exerciseKeys.all, 'list'] as const,
  list: (courseId: number) => [...exerciseKeys.lists(), { courseId }] as const,
  details: () => [...exerciseKeys.all, 'detail'] as const,
  detail: (exerciseId: number) => [...exerciseKeys.details(), exerciseId] as const,
};

/**
 * Hook to fetch all exercises for a specific course.
 * @param courseId The ID of the course.
 */
export const useExercisesForCourse = (courseId: number) => {
  return useQuery({
    queryKey: exerciseKeys.list(courseId),
    queryFn: () => exerciseService.getExercisesForCourse(courseId),
    enabled: !!courseId, // The query will not run until a valid courseId is provided
  });
};

/**
 * Hook to fetch a single exercise by its ID.
 * @param exerciseId The ID of the exercise.
 */
export const useExerciseById = (exerciseId: number) => {
  return useQuery({
    queryKey: exerciseKeys.detail(exerciseId),
    queryFn: () => exerciseService.getExerciseById(exerciseId),
    enabled: !!exerciseId, // The query will not run until a valid exerciseId is provided
  });
};

/**
 * Hook for creating a new exercise.
 * Automatically invalidates the course's exercise list to trigger a refetch.
 */
export const useCreateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExercisePayload) => exerciseService.createExercise(data),
    onSuccess: (data) => {
      // When a new exercise is created, invalidate the query for that course's exercise list.
      // This will cause the list to be refetched with the new data automatically.
      queryClient.invalidateQueries({ queryKey: exerciseKeys.list(data.course_id) });
    },
  });
};

/**
 * Hook for submitting an exercise attempt.
 */
export const useSubmitAttempt = () => {
  // We don't need to invalidate queries here as the attempt state is local to the session
  return useMutation({
    mutationFn: (data: SubmitAttemptPayload) => exerciseService.submitExerciseAttempt(data),
    onSuccess: (data) => {
      console.log('Submission successful:', data);
    },
  });
};
