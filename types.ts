// Basic types
export type AppMode = 'build' | 'component' | 'project' | 'multifile' | 'fullstack' | 'native' | 'form' | 'document' | 'study';
export type ModelID = 'gemini-2.5-flash' | 'qwen/qwen3-coder:free';
export type GenerationStatus = 'idle' | 'planning' | 'generating' | 'reviewing' | 'testing' | 'finished';
export type IntegrationType = 'supabase' | 'stripe' | 'gemini';
export type ConsoleMessageType = 'log' | 'error' | 'warn';


// Data structures
export interface User {
  email: string;
  name: string;
  avatarUrl: string;
}

export interface Agent {
  id: string;
  name:string;
  systemInstruction: string;
  imageUrl: string;
  isCustom?: boolean;
}

export interface Flashcard {
  question: string;
  answer: string;
}

// Plan types for generation
export interface AppPlan {
    title: string;
    description: string;
    features: string[];
}

export interface ProjectPlan {
    title: string;
    description: string;
    techStack: string[];
    fileStructure: { [key: string]: any };
}

export interface ComponentPlan {
    name: string;
    description: string;
    properties: {
        name: string;
        type: string;
        defaultValue: string;
    }[];
}

export interface FormPlan {
    title: string;
    description: string;
    fields: {
        name: string;
        type: string;
        required: boolean;
    }[];
}

export interface DocumentPlan {
    title: string;
    documentType: 'PDF' | 'Presentation';
    outline: string[];
}

// UI/UX analysis result
export interface UiUxAnalysis {
    headline: string;
    suggestions: {
        area: string;
        suggestion: string;
    }[];
}

// Chat and messaging
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  plan?: any;
  isPlan?: boolean;
  isChangeSummary?: boolean;
  isAgentActivity?: boolean;
  analysis?: UiUxAnalysis;
}

export interface ConsoleMessage {
    type: ConsoleMessageType;
    content: any[];
}


// API and function results
export interface RefinementResult {
    files: { [path: string]: string };
    code?: string; // For single file refinements from older implementation
    summary: string;
    files_edited: string[];
}

// Local storage types
export interface StoredApp {
    id: string;
    title: string;
    content: { [path: string]: string };
    appMode: AppMode;
    timestamp: number;
}
  
export interface StoredFlashcards {
    id: string;
    topic: string;
    cards: Flashcard[];
    timestamp: number;
}