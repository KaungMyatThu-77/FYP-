import React, { useState } from 'react';
import CourseList from '../components/courses/CourseList';
import { useCourses, useCourseMeta } from '../hooks/useCourses';
import useDebounce from '../hooks/useDebounce';
import { DifficultyLevel } from '../types/course.types';

const CoursesPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [difficulty, setDifficulty] = useState<DifficultyLevel | ''>('');
    const [category, setCategory] = useState('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const filters = {
        search: debouncedSearchTerm,
        difficulty: difficulty,
        category: category,
    };

    const { data: courses, isLoading, error } = useCourses(filters);
    const { data: meta } = useCourseMeta();

    return (
        <div className="container mx-auto p-4 md:p-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-base-content mb-2">Explore Courses</h1>
                <p className="text-base-content/70">Find your next learning adventure.</p>
            </header>

            <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-base-200 rounded-lg">
                <div className="flex-grow">
                    <input
                        type="text"
                        placeholder="Search for courses..."
                        className="input input-bordered w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        className="select select-bordered w-full md:w-auto capitalize"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as DifficultyLevel | '')}
                    >
                        <option value="">All Difficulties</option>
                        {meta?.difficulties.map(d => <option key={d} value={d} className="capitalize">{d.toLowerCase()}</option>)}
                    </select>
                    <select
                        className="select select-bordered w-full md:w-auto"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {meta?.categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <CourseList courses={courses} isLoading={isLoading} error={error as Error | null} />
        </div>
    );
};

export default CoursesPage;
