import React, { useState } from 'react';
import { Exercise } from '../../types/exercise.types';

interface MultipleChoiceProps {
  exercise: Exercise;
  onSelectAnswer: (answer: string) => void;
  selectedAnswer: string | null;
  isSubmitted: boolean;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({ exercise, onSelectAnswer, selectedAnswer, isSubmitted }) => {
  if (!exercise.options) return <div>This multiple choice question has no options.</div>;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{exercise.question_text}</h3>
      <div className="flex flex-col gap-3">
        {Object.entries(exercise.options).map(([key, value]) => (
          <button
            key={key}
            onClick={() => onSelectAnswer(value)}
            disabled={isSubmitted}
            className={`btn btn-outline justify-start w-full text-left ${selectedAnswer === value ? 'btn-active btn-primary' : ''}`}
          >
            <span className="badge badge-neutral mr-4">{key}</span>
            {value}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoice;
