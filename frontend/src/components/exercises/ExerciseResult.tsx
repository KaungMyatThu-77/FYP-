import React from 'react';
import { ExerciseAttempt } from '../../types/exercise.types';
import { CheckCircle, XCircle } from 'lucide-react';

interface ExerciseResultProps {
  result: ExerciseAttempt;
  onNext: () => void;
}

const ExerciseResult: React.FC<ExerciseResultProps> = ({ result, onNext }) => {
  const isCorrect = result.is_correct;
  const bgColor = isCorrect ? 'bg-green-100' : 'bg-red-100';
  const textColor = isCorrect ? 'text-green-700' : 'text-red-700';
  const Icon = isCorrect ? CheckCircle : XCircle;

  return (
    <div className={`p-4 rounded-lg ${bgColor} ${textColor}`}>
      <div className="flex items-center gap-3">
        <Icon size={32} />
        <div>
          <h4 className="font-bold text-lg">{result.feedback_given || (isCorrect ? 'Correct!' : 'Incorrect')}</h4>
          {isCorrect && <p>You earned {result.score_earned} points.</p>}
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button className="btn btn-primary" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default ExerciseResult;
