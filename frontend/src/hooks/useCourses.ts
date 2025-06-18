import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as courseService from '../services/courseService';
import { CourseFilters } from '../types/course.types';

// Query key factory
const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: CourseFilters) => [...courseKeys.lists(), { filters }] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (courseId: number) => [...courseKeys.details(), courseId] as const,
  enrollments: () => [...courseKeys.all, 'enrollments'] as const,
  meta: () => [...courseKeys.all, 'meta'] as const,
};

/**
 * Hook to fetch a list of courses with filters.
 */
export const useCourses = (filters: CourseFilters) => {
  return useQuery({
    queryKey: courseKeys.list(filters),
    queryFn: () => {
      // Remove empty filters before sending to API
      const activeFilters: CourseFilters = {};
      if (filters.search) activeFilters.search = filters.search;
      if (filters.difficulty) activeFilters.difficulty = filters.difficulty;
      if (filters.category) activeFilters.category = filters.category;
      return courseService.getCourses(activeFilters);
    },
    keepPreviousData: true,
  });
};

/**
 * Hook to fetch course metadata (categories, difficulties) for filters.
 */
export const useCourseMeta = () => {
    return useQuery({
        queryKey: courseKeys.meta(),
        queryFn: courseService.getCourseMetaInfo,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Hook to fetch a single course by its ID.
 */
export const useCourseById = (courseId: number) => {
  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: () => courseService.getCourseById(courseId),
    enabled: !!courseId,
  });
};

/**
 * Hook to fetch the current user's enrollments.
 */
export const useMyEnrollments = () => {
  return useQuery({
    queryKey: courseKeys.enrollments(),
    queryFn: courseService.getMyEnrollments,
  });
};

/**
 * Hook for enrolling in a course.
 */
export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: number) => courseService.enrollInCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.enrollments() });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
};

/**
 * Hook for unenrolling from a course.
 */
export const useUnenrollFromCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: number) => courseService.unenrollFromCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.enrollments() });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
};
