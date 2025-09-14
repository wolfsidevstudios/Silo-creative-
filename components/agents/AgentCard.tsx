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
      className={`bg-white border rounded-lg p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-1 ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200'}`}
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
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1.5 border-2 border-white">
            <CheckIcon className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      <h3 className="font-semibold text-gray-800">{agent.name}</h3>
      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
        {agent.systemInstruction}
      </p>
       {!agent.isCustom && (
        <div className="mt-3 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <StarIcon className="w-3 h-3" /> Silo Create Agent
        </div>
      )}
    </div>
  );
};