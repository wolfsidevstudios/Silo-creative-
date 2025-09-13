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
  setGoogleUser: (user: User) => void;
  signInAnonymously: () => Promise<void>;
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

    // On initial load, check for any persisted user profile.
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
        try {
            setUser(JSON.parse(storedProfile));
        } catch (e) {
            console.error("Could not parse stored user profile.", e);
            localStorage.removeItem('userProfile');
            localStorage.removeItem('authProvider');
        }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          // If a Supabase session exists, it's the source of truth.
          const profile: User = {
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Guest User',
            avatarUrl: session.user.user_metadata?.avatar_url || 'https://i.ibb.co/6gKCj61/avatar-1.png',
          };
          setUser(profile);
          localStorage.setItem('userProfile', JSON.stringify(profile));
          localStorage.setItem('authProvider', 'supabase');
        } else {
          // No Supabase session. Only clear the user if they were a Supabase user.
          // This prevents logging out a Google user when the app loads.
          const currentProvider = localStorage.getItem('authProvider');
          if (currentProvider === 'supabase') {
              setUser(null);
              localStorage.removeItem('userProfile');
              localStorage.removeItem('authProvider');
          }
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };

  }, []);
  
  const setGoogleUser = (profile: User) => {
    setUser(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('authProvider', 'google');
    setSession(null); // Clear any potential Supabase session from state
  };


  const signOut = async () => {
    // Universal sign out
    await supabase.auth.signOut(); // Triggers listener for Supabase cleanup
    
    // Manual cleanup for Google and local state
    if (window.google) {
        window.google.accounts.id.disableAutoSelect();
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem('userProfile');
    localStorage.removeItem('authProvider');
  };

  const signInAnonymously = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
        console.error("Anonymous sign-in error:", error);
        setLoading(false); // Make sure to stop loading on error
    }
    // onAuthStateChange will handle success and set loading to false.
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
        user, session, loading, signOut, setGoogleUser,
        signInAnonymously
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