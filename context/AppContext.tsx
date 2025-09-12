import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AppMode, Flashcard, Agent } from '../types';
import { getAllAgents, saveCustomAgents, getCustomAgents } from '../services/agentService';
import { PREMADE_AGENTS } from '../data/premadeAgents';

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
  agents: Agent[];
  addAgent: (agent: Agent) => void;
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[] | null>(null);
  const [isStudent, setIsStudentState] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>('build');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(PREMADE_AGENTS[0].id);


  useEffect(() => {
    // Load agents and student status on initial load
    setAgents(getAllAgents());
    const studentStatus = localStorage.getItem('isStudentUser') === 'true';
    if (studentStatus) {
      setIsStudentState(true);
    }
    const savedAgentId = localStorage.getItem('selectedAgentId');
    if (savedAgentId) {
        setSelectedAgentId(savedAgentId);
    }

  }, []);

  const setIsStudent = (status: boolean) => {
    localStorage.setItem('isStudentUser', String(status));
    setIsStudentState(status);
  };
  
  const handleSetSelectedAgentId = (id: string) => {
    localStorage.setItem('selectedAgentId', id);
    setSelectedAgentId(id);
  };

  const addAgent = (agent: Agent) => {
    const customAgents = getCustomAgents();
    const newCustomAgents = [...customAgents, agent];
    saveCustomAgents(newCustomAgents);
    setAgents(getAllAgents());
  };

  const resetApp = () => {
    setPrompt('');
    setGeneratedCode('');
    setGeneratedFlashcards(null);
  };

  return (
    <AppContext.Provider value={{ 
        prompt, setPrompt, 
        generatedCode, setGeneratedCode, 
        generatedFlashcards, setGeneratedFlashcards, 
        isStudent, setIsStudent, 
        resetApp, 
        appMode, setAppMode,
        agents, addAgent,
        selectedAgentId, setSelectedAgentId: handleSetSelectedAgentId
    }}>
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