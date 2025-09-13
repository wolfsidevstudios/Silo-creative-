

import { StoredApp, StoredFlashcards, Flashcard, AppMode } from '../types';

const RECENT_APPS_KEY = 'silo-recent-apps';
const RECENT_FLASHCARDS_KEY = 'silo-recent-flashcards';
const MAX_HISTORY = 10;

// === App Storage ===

export const getRecentApps = (): StoredApp[] => {
  try {
    const stored = localStorage.getItem(RECENT_APPS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading recent apps from localStorage:", error);
    return [];
  }
};

export const saveApp = (title: string, content: string, appMode: AppMode): void => {
  try {
    const newApp: StoredApp = {
      id: `app-${Date.now()}`,
      title,
      content,
      appMode,
      timestamp: Date.now(),
    };
    const recentApps = getRecentApps();
    const updatedApps = [newApp, ...recentApps].slice(0, MAX_HISTORY);
    localStorage.setItem(RECENT_APPS_KEY, JSON.stringify(updatedApps));
  } catch (error) {
    console.error("Error saving app to localStorage:", error);
  }
};

// === Flashcard Storage ===

export const getRecentFlashcards = (): StoredFlashcards[] => {
  try {
    const stored = localStorage.getItem(RECENT_FLASHCARDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading recent flashcards from localStorage:", error);
    return [];
  }
};

export const saveFlashcards = (topic: string, cards: Flashcard[]): void => {
  try {
    const newDeck: StoredFlashcards = {
      id: `deck-${Date.now()}`,
      topic,
      cards,
      timestamp: Date.now(),
    };
    const recentDecks = getRecentFlashcards();
    const updatedDecks = [newDeck, ...recentDecks].slice(0, MAX_HISTORY);
    localStorage.setItem(RECENT_FLASHCARDS_KEY, JSON.stringify(updatedDecks));
  } catch (error) {
    console.error("Error saving flashcards to localStorage:", error);
  }
};