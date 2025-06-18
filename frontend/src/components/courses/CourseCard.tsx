import React from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../../types/course.types';
import { Users } from 'lucide-react';

const placeholderImage = 'https://placehold.co/400x225/E0E0E0/4A4A4A?text=LELMS+Course';

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
    const difficultyColors: Record<string, string> = {
        BEGINNER: 'bg-green-100 text-green-800',
        INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
        ADVANCED: 'bg-red-100 text-red-800',
    };

    return (
        <div className="card card-compact w-full bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-shadow duration-300">
            <Link to={`/courses/${course.id}`}>
                <figure>
                    <img
                        src={course.course_image_url || placeholderImage}
                        alt={course.title}
                        className="h-48 w-full object-cover rounded-t-4xl"
                    />
                </figure>
            </Link>
            <div className="card-body">
                {course.category && (
                    <div className="text-xs text-primary font-semibold uppercase">{course.category}</div>
                )}
                <h2 className="card-title text-lg h-14 leading-tight">
                    <Link to={`/courses/${course.id}`} className="link link-hover">{course.title}</Link>
                </h2>
                <div className="flex justify-between items-center mt-2 text-sm text-base-content/70">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${difficultyColors[course.difficulty]}`}>
                        {course.difficulty}
                    </span>
                    <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>{course.enrollment_count}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
