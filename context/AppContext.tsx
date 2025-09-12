
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AppMode, Flashcard } from '../types';

interface AppContextType {
  prompt: string;
  setPrompt: (prompt: string) => void;
  generatedCode: string;
  setGeneratedCode: (code: string) => void;
  generatedFlashcards: Flashcard[] | null;
  setGeneratedFlashcards: (flashcards: Flashcard[] | null) => void;
  isStudent: boolean;
  setIsStudent: (isStudent: boolean) => void;
  resetApp: () => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[] | null>(null);
  const [isStudent, setIsStudentState] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>('build');

  useEffect(() => {
    // Check for student status in localStorage on initial load
    const studentStatus = localStorage.getItem('isStudentUser') === 'true';
    if (studentStatus) {
      setIsStudentState(true);
    }
  }, []);

  const setIsStudent = (status: boolean) => {
    // Persist student status to localStorage and update state
    localStorage.setItem('isStudentUser', String(status));
    setIsStudentState(status);
  };

  const resetApp = () => {
    setPrompt('');
    setGeneratedCode('');
    setGeneratedFlashcards(null);
  };

  return (
    <AppContext.Provider value={{ prompt, setPrompt, generatedCode, setGeneratedCode, generatedFlashcards, setGeneratedFlashcards, isStudent, setIsStudent, resetApp, appMode, setAppMode }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
