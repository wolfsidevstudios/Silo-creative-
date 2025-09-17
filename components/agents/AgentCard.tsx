
import React from 'react';
import { Agent } from '../../types';
import { CheckIcon, StarIcon } from '../common/Icons';

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(agent.id)}
      className={`bg-white/5 backdrop-blur-md border rounded-lg p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-200 shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1 ${isSelected ? 'border-indigo-500/50 ring-2 ring-indigo-500/50' : 'border-white/10'}`}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
    >
      <div className="relative">
        <img
          src={agent.imageUrl}
          alt={agent.name}
          className="w-24 h-24 rounded-full mb-3 object-cover"
        />
        {isSelected && (
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1.5 border-2 border-gray-800">
            <CheckIcon className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      <h3 className="font-semibold text-gray-200">{agent.name}</h3>
      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
        {agent.systemInstruction}
      </p>
       {!agent.isCustom && (
        <div className="mt-3 bg-yellow-400/10 text-yellow-300 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <StarIcon className="w-3 h-3" /> Silo Create Agent
        </div>
      )}
    </div>
  );
};
