
export type ExerciseType =
  | 'multiple_choice'
  | 'fill_in_the_blanks'
  | 'speaking'
  | 'listening'
  | 'matching'
  | 'vocabulary_game'
  | 'grammar_drill';

export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';

// Data structure for an exercise returned by the API
export interface Exercise {
  exercise_id: number;
  course_id: number;
  title: string;
  exercise_type: ExerciseType;
  question_text: string; // Assuming this will always be present for the types we're implementing
  audio_url?: string | null;
  // `options` for multiple_choice: { "A": "run", "B": "ran", "C": "runned" }
  options: Record<string, string> | null;
  difficulty_level: ExerciseDifficulty;
  points: number;
  time_limit?: number | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

// Data structure for the result of a submission
export interface ExerciseAttempt {
  attempt_id: number;
  user_id: number;
  exercise_id: number;
  user_answer: string;
  is_correct: boolean;
  score_earned: number;
  time_taken: number | null;
  attempted_at: string;
  feedback_given: string | null;
  user: {
    user_id: number;
    first_name: string;
    last_name: string;
  };
}

// Payload for creating a new exercise
export interface CreateExercisePayload {
    courseId: number;
    payload: {
        title: string;
        exercise_type: string;
        question_text?: string;
        correct_answer?: string;
        options?: Record<string, any>;
        difficulty_level: string;
        points?: number;
        order_index?: number;
    }
}

// Payload for submitting an answer
export interface SubmitAttemptPayload {
    exerciseId: number;
    payload: {
        answer: string;
        time_taken?: number;
    }
}
