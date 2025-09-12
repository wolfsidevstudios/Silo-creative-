
export type AppMode = 'build' | 'study';

export interface Message {
  role: 'user' | 'model';
  content: string;
  isPlan?: boolean;
  isFlashcards?: boolean;
}

export interface AppPlan {
    title: string;
    description: string;
    features: string[];
}

export interface Flashcard {
    question: string;
    answer: string;
}
