
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AppMode, Flashcard, Agent, User } from '../types';
import { getAllAgents, saveCustomAgents, getCustomAgents } from '../services/agentService';
import { PREMADE_AGENTS } from '../data/premadeAgents';
import { supabase } from '../services/supabaseClient';
import type { Session } from '@supabase/supabase-js';


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
  // Auth
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => void;
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

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load non-auth data on initial load
    setAgents(getAllAgents());
    const studentStatus = localStorage.getItem('isStudentUser') === 'true';
    if (studentStatus) {
      setIsStudentState(true);
    }
    const savedAgentId = localStorage.getItem('selectedAgentId');
    if (savedAgentId) {
        setSelectedAgentId(savedAgentId);
    }

    // --- Auth Listener ---
    // The listener is called once on initial load and then again every time the auth state changes.
    // This handles all cases: initial load, login, logout, and token refresh.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          const profile: User = {
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
            avatarUrl: session.user.user_metadata?.avatar_url || 'https://i.ibb.co/6gKCj61/avatar-1.png',
          };
          setUser(profile);
          localStorage.setItem('userProfile', JSON.stringify(profile));
        } else {
          setUser(null);
          localStorage.removeItem('userProfile');
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };

  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    localStorage.removeItem('userProfile');
    // The onAuthStateChange listener will handle the state update automatically.
  };

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
        selectedAgentId, setSelectedAgentId: handleSetSelectedAgentId,
        user, session, loading, signOut
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
