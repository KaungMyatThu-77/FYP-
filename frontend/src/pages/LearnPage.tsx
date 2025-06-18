import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMyEnrollments } from '../hooks/useCourses';
import Loading from '../components/common/Loading';
import { Enrollment } from '../types/course.types';
import { BookOpen, Search } from 'lucide-react';

const EnrolledCourseCard: React.FC<{ enrollment: Enrollment }> = ({ enrollment }) => {
    return (
        <div className="card card-compact w-full bg-base-100 shadow-md border border-base-300 hover:shadow-lg transition-shadow duration-300">
            <div className="card-body">
                <h2 className="card-title text-lg">
                    <Link to={`/courses/${enrollment.course.id}`} className="link link-hover">{enrollment.course.title}</Link>
                </h2>
                <p className="text-sm text-base-content/70 h-12 overflow-hidden text-ellipsis">{enrollment.course.description}</p>
                <div className="card-actions justify-end mt-2">
                     <Link to={`/courses/${enrollment.course.id}/exercises`} state={{ courseTitle: enrollment.course.title }} className="btn btn-outline btn-sm">
                        Practice
                    </Link>
                    <Link to={`/courses/${enrollment.course.id}`} className="btn btn-primary btn-sm">
                        Go to Course
                    </Link>
                </div>
            </div>
        </div>
    );
};


const LearnPage: React.FC = () => {
    const { user } = useAuth();
    const { data: enrollments, isLoading, error } = useMyEnrollments();

    return (
        <div className="container mx-auto p-4 md:p-6">
            <header className="mb-8 p-6 bg-base-200 rounded-lg">
                <h1 className="text-3xl font-bold text-base-content">
                    Welcome back, {user?.first_name || 'learner'}!
                </h1>
                <p className="text-base-content/70 mt-2">
                    Continue your learning journey or discover something new.
                </p>
            </header>

            <section>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen /> My Courses
                    </h2>
                    <Link to="/courses" className="btn btn-primary">
                        <Search size={18} className="mr-2" />
                        Explore More Courses
                    </Link>
                </div>

                {isLoading && <div className="flex justify-center p-10"><Loading /></div>}
                {error && <div className="text-center text-error p-10">Error loading your courses: {(error as Error).message}</div>}
                
                {!isLoading && !error && (
                    enrollments && enrollments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrollments.map(enrollment => (
                                <EnrolledCourseCard key={enrollment.enrollment_id} enrollment={enrollment} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-base-100 rounded-lg border border-dashed border-base-300">
                            <h3 className="text-xl font-semibold">You are not enrolled in any courses yet.</h3>
                            <p className="mt-2 text-base-content/70">Start your learning adventure by exploring our course catalog.</p>
                            <Link to="/courses" className="btn btn-primary mt-4">
                                Browse Courses
                            </Link>
                        </div>
                    )
                )}
            </section>
        </div>
    );
};

export default LearnPage;
