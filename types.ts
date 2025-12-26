export interface QuizOption {
  key: string; // e.g., "A", "B", "C", "D"
  text: string; // The content of the option
}

export interface Question {
  id: number;
  text: string;
  options: QuizOption[];
  correctAnswer: string; // "A", "B", "C", or "D"
  explanation?: string;
}

export interface QuizData {
  title: string;
  questions: Question[];
  timeLimit?: number; // Time limit in seconds
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  CONFIG = 'CONFIG',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS'
}

export interface UserAnswers {
  [questionId: number]: string; // questionId -> selectedKey (e.g., "A")
}