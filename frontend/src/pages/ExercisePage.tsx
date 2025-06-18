import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import ExerciseViewer from '../components/exercises/ExerciseViewer';
import Loading from '../components/common/Loading';

const ExercisePage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const location = useLocation();
    // Get course title passed via state from the Link component
    const courseTitle = location.state?.courseTitle || 'Course Exercises';

    const numericCourseId = Number(courseId);

    if (isNaN(numericCourseId)) {
        return <div className="text-center p-10">Invalid Course ID. <Link to="/courses" className="link link-primary">Go back</Link></div>;
    }

    return (
        <div className="bg-base-200 min-h-screen py-8">
            <ExerciseViewer courseId={numericCourseId} courseTitle={courseTitle} />
        </div>
    );
};

export default ExercisePage;
