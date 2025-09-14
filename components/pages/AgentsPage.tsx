import React, { useState } from 'react';
import Sidebar from '../common/Sidebar';
import Banner from '../common/Banner';
import { useAppContext } from '../../context/AppContext';
import { AgentCard } from '../agents/AgentCard';
import { CreateAgentModal } from '../agents/CreateAgentModal';
import { PlusIcon } from '../common/Icons';

const AgentsPage: React.FC = () => {
  const { agents, selectedAgentId, setSelectedAgentId } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const siloAgents = agents.filter(agent => !agent.isCustom);
  const customAgents = agents.filter(agent => agent.isCustom);

  return (
    <>
      <div className="flex flex-col h-screen w-screen bg-white">
        <Banner />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6 sm:p-10">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">Agent Library</h1>
                    <p className="text-lg text-gray-500 mt-1">Select, create, and manage your AI agents.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Create New Agent
                </button>
            </header>

            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">Silo Create Agents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {siloAgents.map(agent => (
                            <AgentCard
                                key={agent.id}
                                agent={agent}
                                isSelected={agent.id === selectedAgentId}
                                onSelect={setSelectedAgentId}
                            />
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">Your Custom Agents</h2>
                    {customAgents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {customAgents.map(agent => (
                                <AgentCard
                                    key={agent.id}
                                    agent={agent}
                                    isSelected={agent.id === selectedAgentId}
                                    onSelect={setSelectedAgentId}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No custom agents yet</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by creating a new agent.
                            </p>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <PlusIcon className="w-5 h-5 mr-2" />
                                    Create New Agent
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
          </main>
        </div>
      </div>
      <CreateAgentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default AgentsPage;