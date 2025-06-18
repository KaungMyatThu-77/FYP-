import React from 'react';
import { Course } from '../../types/course.types';
import CourseCard from './CourseCard';

interface CourseListProps {
    courses: Course[] | undefined;
    isLoading: boolean;
    error: Error | null;
}

const CourseList: React.FC<CourseListProps> = ({ courses, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Skeleton loaders */}
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="skeleton h-80 w-full"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-error">Error loading courses: {error.message}</div>;
    }

    if (!courses || courses.length === 0) {
        return <div className="text-center text-base-content/70 py-10">No courses found. Try adjusting your search or filters.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map(course => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
};

export default CourseList;
