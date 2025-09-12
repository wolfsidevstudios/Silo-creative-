import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AppContextType {
  prompt: string;
  setPrompt: (prompt: string) => void;
  generatedCode: string;
  setGeneratedCode: (code: string) => void;
  isStudent: boolean;
  setIsStudent: (isStudent: boolean) => void;
  resetApp: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isStudent, setIsStudentState] = useState(false);

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
  };

  return (
    <AppContext.Provider value={{ prompt, setPrompt, generatedCode, setGeneratedCode, isStudent, setIsStudent, resetApp }}>
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
