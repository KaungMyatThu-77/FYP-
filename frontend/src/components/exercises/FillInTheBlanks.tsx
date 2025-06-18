import React from 'react';
import { Exercise } from '../../types/exercise.types';

interface FillInTheBlanksProps {
  exercise: Exercise;
  onAnswerChange: (answer: string) => void;
  userAnswer: string;
  isSubmitted: boolean;
}

const FillInTheBlanks: React.FC<FillInTheBlanksProps> = ({ exercise, onAnswerChange, userAnswer, isSubmitted }) => {
  const parts = exercise.question_text.split('___');
  
  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Complete the sentence:</h3>
      <div className="flex items-center text-lg flex-wrap gap-2">
        <span>{parts[0]}</span>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          disabled={isSubmitted}
          className="input input-bordered input-primary w-40 text-center"
          placeholder="your answer"
        />
        <span>{parts[1]}</span>
      </div>
    </div>
  );
};

export default FillInTheBlanks;
