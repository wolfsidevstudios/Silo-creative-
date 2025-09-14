
export type AppMode = 'build' | 'study' | 'form' | 'native';

export interface Message {
  role: 'user' | 'model';
  content: string;
  isPlan?: boolean;
  planType?: 'app' | 'form';
  isChangeSummary?: boolean;
}

export interface AppPlan {
    title: string;
    description: string;
    features: string[];
}

export interface FormPlan {
    title: string;
    description: string;
    fields: { name: string; type: string; required: boolean }[];
}

export interface RefinementResult {
  code: string;
  summary: string;
  files_edited: string[];
}

export interface Flashcard {
    question: string;
    answer: string;
}

export interface Agent {
  id: string;
  name: string;
  systemInstruction: string;
  imageUrl: string;
  isCustom?: boolean;
}

export interface User {
  email: string;
  name: string;
  avatarUrl: string;
}

// For local storage
export interface StoredApp {
    id: string;
    title: string;
    appMode: AppMode;
    content: string;
    timestamp: number;
}

export interface StoredFlashcards {
    id:string;
    topic: string;
    cards: Flashcard[];
    timestamp: number;
}