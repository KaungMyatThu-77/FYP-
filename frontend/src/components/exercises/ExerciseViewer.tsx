import React, { useState, useEffect } from 'react';
import { useExercisesForCourse, useSubmitAttempt } from '../../hooks/useExercises';
import Loading from '../common/Loading';
import MultipleChoice from './MultipleChoice';
import FillInTheBlanks from './FillInTheBlanks';
import ExerciseResult from './ExerciseResult';
import { ExerciseAttempt } from '../../types/exercise.types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ExerciseViewerProps {
  courseId: number;
  courseTitle: string;
}

const ExerciseViewer: React.FC<ExerciseViewerProps> = ({ courseId, courseTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [attemptResults, setAttemptResults] = useState<Record<number, ExerciseAttempt>>({});

  const { data: exercises, isLoading, error } = useExercisesForCourse(courseId);
  const submitMutation = useSubmitAttempt();

  const currentExercise = exercises?.[currentIndex];
  const hasAttempted = currentExercise && attemptResults[currentExercise.exercise_id];

  const handleNext = () => {
    if (exercises && currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setUserAnswer('');
    }
  };

  const handleSubmit = () => {
    if (!currentExercise || !userAnswer) return;
    submitMutation.mutate({
      exerciseId: currentExercise.exercise_id,
      payload: { answer: userAnswer },
    }, {
      onSuccess: (data) => {
        setAttemptResults(prev => ({ ...prev, [currentExercise.exercise_id]: data }));
      }
    });
  };
  
  if (isLoading) return <Loading fullScreen />;
  if (error) return <div className="text-center text-error">Failed to load exercises: {error.message}</div>;
  if (!exercises || exercises.length === 0) return <div className="text-center p-10">No exercises found for this course.</div>;

  const progress = ((currentIndex + 1) / exercises.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold">{courseTitle}</h1>
      <p className="text-base-content/70 mb-4">Exercise {currentIndex + 1} of {exercises.length}</p>
      
      <progress className="progress progress-primary w-full mb-8" value={progress} max="100"></progress>
      
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body min-h-[300px]">
          {currentExercise.exercise_type === 'multiple_choice' && (
            <MultipleChoice 
              exercise={currentExercise}
              onSelectAnswer={setUserAnswer}
              selectedAnswer={userAnswer}
              isSubmitted={!!hasAttempted}
            />
          )}
          {currentExercise.exercise_type === 'fill_in_the_blanks' && (
             <FillInTheBlanks
                exercise={currentExercise}
                onAnswerChange={setUserAnswer}
                userAnswer={userAnswer}
                isSubmitted={!!hasAttempted}
              />
          )}
          {/* Add other exercise types here */}
        </div>
      </div>

      <div className="mt-6">
        {hasAttempted ? (
          <ExerciseResult result={hasAttempted} onNext={handleNext} />
        ) : (
          <div className="flex justify-between items-center">
            <button className="btn btn-ghost" onClick={handlePrev} disabled={currentIndex === 0}>
              <ArrowLeft /> Previous
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={!userAnswer || submitMutation.isLoading}>
              {submitMutation.isLoading ? <span className="loading loading-spinner"></span> : "Check Answer"}
            </button>
            <button className="btn btn-ghost" onClick={handleNext} disabled={currentIndex === exercises.length - 1}>
              Next <ArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseViewer;
