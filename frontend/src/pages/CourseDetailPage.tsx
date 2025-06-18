import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourseById, useMyEnrollments, useEnrollInCourse, useUnenrollFromCourse } from '../hooks/useCourses';
import Loading from '../components/common/Loading';
import { Clock, BarChart, User } from 'lucide-react';

const CourseDetailPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const numericCourseId = Number(courseId);

    const { data: course, isLoading: isLoadingCourse, error: courseError } = useCourseById(numericCourseId);
    const { data: enrollments, isLoading: isLoadingEnrollments } = useMyEnrollments();
    
    const enrollMutation = useEnrollInCourse();
    const unenrollMutation = useUnenrollFromCourse();

    const isEnrolled = enrollments?.some(e => e.course_id === numericCourseId);
    
    const handleEnroll = () => {
        enrollMutation.mutate(numericCourseId);
    };

    const handleUnenroll = () => {
        unenrollMutation.mutate(numericCourseId);
    };

    if (isLoadingCourse || isLoadingEnrollments) {
        return <Loading fullScreen />;
    }

    if (courseError) {
        return <div className="text-center text-error p-10">Error loading course: {(courseError as Error).message}</div>;
    }

    if (!course) {
        return <div className="text-center p-10">Course not found. <Link to="/courses" className="link link-primary">Go back to courses</Link>.</div>;
    }

    const isEnrolling = enrollMutation.isLoading || unenrollMutation.isLoading;

    return (
        <div>
            <div className="bg-base-200">
                <div className="container mx-auto p-6 md:p-10">
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link to="/courses">Courses</Link></li>
                            <li>{course.title}</li>
                        </ul>
                    </div>
                    <h1 className="text-4xl font-bold mt-4 text-base-content">{course.title}</h1>
                    <p className="mt-2 text-lg text-base-content/80">{course.description}</p>
                    <div className="flex items-center gap-2 mt-4 text-sm text-base-content/70">
                        <User size={16} />
                        <span>Created by {course.creator.first_name} {course.creator.last_name}</span>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-6 items-center">
                        <div className="badge badge-lg badge-outline gap-2 capitalize">
                            <BarChart size={16} /> {course.difficulty.toLowerCase()}
                        </div>
                        {course.estimated_duration && <div className="badge badge-lg badge-outline gap-2">
                            <Clock size={16} /> {course.estimated_duration} hours
                        </div>}
                        {course.category && <div className="badge badge-lg badge-outline">
                            {course.category}
                        </div>}
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">About this course</h2>
                    {course.course_image_url && <img
                        src={course.course_image_url}
                        alt={course.title}
                        className="w-full rounded-lg shadow-lg mb-6 object-cover aspect-video"
                    />}
                    <div className="prose max-w-none">
                        <p>{course.description}</p>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="card bg-base-100 shadow-xl border border-base-300 sticky top-24">
                        <div className="card-body">
                            <h2 className="card-title">
                                {isEnrolled ? "You are enrolled" : "Start Learning Now"}
                            </h2>
                            
                            {enrollMutation.error && <p className="text-error text-sm">{(enrollMutation.error as any).response?.data?.message || 'Enrollment failed.'}</p>}
                            {unenrollMutation.error && <p className="text-error text-sm">{(unenrollMutation.error as any).response?.data?.message || 'Unenrollment failed.'}</p>}
                            
                            {isEnrolled ? (
                                <div className="flex flex-col gap-2 mt-4">
                                    <Link 
                                        to={`/courses/${numericCourseId}/exercises`}
                                        state={{ courseTitle: course.title }}
                                        className="btn btn-primary w-full"
                                    >
                                        Practice Exercises
                                    </Link>
                                    <button 
                                        className="btn btn-outline btn-error w-full"
                                        onClick={handleUnenroll}
                                        disabled={isEnrolling}
                                    >
                                        {isEnrolling ? <span className="loading loading-spinner"></span> : "Unenroll from Course"}
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    className="btn btn-primary w-full mt-4"
                                    onClick={handleEnroll}
                                    disabled={isEnrolling}
                                >
                                    {isEnrolling ? <span className="loading loading-spinner"></span> : "Enroll Now"}
                                </button>
                            )}
                            <p className="text-sm text-center mt-2 text-base-content/60">{course.enrollment_count} students enrolled</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
