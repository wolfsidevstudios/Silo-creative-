
export type AppMode = 'build' | 'study' | 'form' | 'native' | 'document' | 'component';
export type ModelID = 'gemini-2.5-flash' | 'qwen/qwen3-coder:free';
export type IntegrationType = 'supabase' | 'stripe' | 'gemini';
export type GenerationStatus = 'idle' | 'planning' | 'generating' | 'reviewing' | 'testing' | 'finished';

export interface Message {
  role: 'user' | 'model' | 'assistant';
  content: string;
  isPlan?: boolean;
  planType?: 'app' | 'form' | 'document' | 'component';
  isChangeSummary?: boolean;
  imageUrl?: string; // For screenshots
  isAgentActivity?: boolean; // For status messages
  analysis?: UiUxAnalysis;
}

export interface AppPlan {
    title: string;
    description: string;
    features: string[];
}

export interface ComponentPlan {
    name: string;
    description: string;
    properties: { name: string; type: string; defaultValue: string }[];
}

export interface FormPlan {
    title:string;
    description: string;
    fields: { name: string; type: string; required: boolean }[];
}

export interface DocumentPlan {
    title: string;
    documentType: 'PDF' | 'Presentation';
    outline: string[];
}

export interface RefinementResult {
  code: string;
  summary: string;
  files_edited: string[];
}

export interface UiUxAnalysis {
    headline: string;
    suggestions: {
        area: string;
        suggestion: string;
    }[];
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