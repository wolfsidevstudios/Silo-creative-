import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ChevronRightIcon, XIcon } from '../common/Icons';
import { AgentCard } from './AgentCard';

const AgentSelector: React.FC = () => {
  const { agents, selectedAgentId, setSelectedAgentId } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  if (!selectedAgent) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-left p-1.5 pr-3 rounded-full hover:bg-white/10 transition-colors"
      >
        <img src={selectedAgent.imageUrl} alt={selectedAgent.name} className="w-8 h-8 rounded-full" />
        <div>
            <div className="font-semibold text-gray-200 leading-tight">{selectedAgent.name}</div>
            <div className="text-xs text-gray-500 leading-tight">Selected Agent</div>
        </div>
        <ChevronRightIcon className={`w-4 h-4 text-gray-500`} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col p-4 sm:p-8 animate-fade-in" onClick={() => setIsOpen(false)} role="dialog" aria-modal="true">
            <div className="w-full max-w-5xl mx-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Select an Agent</h2>
                    <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8 overflow-y-auto" style={{maxHeight: '80vh'}}>
                    {agents.map(agent => (
                        <AgentCard 
                            key={agent.id} 
                            agent={agent} 
                            isSelected={agent.id === selectedAgentId}
                            onSelect={(id) => {
                                setSelectedAgentId(id);
                                setIsOpen(false);
                            }}
                        />
                    ))}
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
      )}
    </div>
  );
};

export default AgentSelector;