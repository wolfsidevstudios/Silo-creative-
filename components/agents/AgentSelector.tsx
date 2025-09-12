import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ChevronRightIcon, CheckIcon } from '../common/Icons';

const AgentSelector: React.FC = () => {
  const { agents, selectedAgentId, setSelectedAgentId } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!selectedAgent) return null;

  return (
    <div className="relative mb-2" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-left p-1.5 pr-3 rounded-full hover:bg-gray-200/80 transition-colors"
      >
        <img src={selectedAgent.imageUrl} alt={selectedAgent.name} className="w-8 h-8 rounded-full" />
        <div>
            <div className="font-semibold text-gray-700 leading-tight">{selectedAgent.name}</div>
            <div className="text-xs text-gray-500 leading-tight">Selected Agent</div>
        </div>
        <ChevronRightIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200/80 z-20 overflow-hidden">
          <div className="p-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
            Choose an Agent
          </div>
          <ul className="py-1 max-h-64 overflow-y-auto">
            {agents.map(agent => (
              <li key={agent.id}>
                <button
                  onClick={() => {
                    setSelectedAgentId(agent.id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-gray-100"
                >
                  <img src={agent.imageUrl} alt={agent.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{agent.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{agent.systemInstruction}</p>
                  </div>
                  {agent.id === selectedAgentId && (
                    <CheckIcon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AgentSelector;
