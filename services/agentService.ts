import { Agent } from '../types';
import { PREMADE_AGENTS } from '../data/premadeAgents';

const CUSTOM_AGENTS_STORAGE_KEY = 'custom-agents';

export const getSiloAgents = (): Agent[] => {
  return PREMADE_AGENTS;
};

export const getCustomAgents = (): Agent[] => {
  try {
    const storedAgents = localStorage.getItem(CUSTOM_AGENTS_STORAGE_KEY);
    return storedAgents ? JSON.parse(storedAgents) : [];
  } catch (error) {
    console.error('Error parsing custom agents from localStorage:', error);
    return [];
  }
};

export const saveCustomAgents = (agents: Agent[]): void => {
  try {
    localStorage.setItem(CUSTOM_AGENTS_STORAGE_KEY, JSON.stringify(agents));
  } catch (error)
 {
    console.error('Error saving custom agents to localStorage:', error);
  }
};

export const getAllAgents = (): Agent[] => {
  return [...getSiloAgents(), ...getCustomAgents()];
};
