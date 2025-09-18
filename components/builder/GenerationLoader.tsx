import React, { useState, useEffect } from 'react';
import { BrainCircuitIcon } from '../common/Icons';
import { GenerationStatus } from '../../types';

const STATUS_MESSAGES: Record<GenerationStatus, { title: string; steps: string[] }> = {
  idle: { title: 'Waiting for prompt...', steps: [] },
  planning: {
    title: 'Planning your creation...',
    steps: ['Analyzing user requirements', 'Identifying core features', 'Structuring the application plan', 'Finalizing architectural layout'],
  },
  generating: {
    title: 'Generating code...',
    steps: ['Building HTML structure', 'Applying Tailwind CSS classes', 'Writing JavaScript logic', 'Wiring up interactive elements', 'Polishing the UI/UX', 'Running final checks'],
  },
  reviewing: { title: 'Reviewing the generated code...', steps: ['Scanning for syntax errors', 'Checking for common bugs', 'Verifying functionality against plan'] },
  testing: { title: 'Running automated tests...', steps: ['Initiating test environment', 'Executing UI interaction tests', 'Validating component behavior', 'Finalizing test results'] },
  finished: { title: 'Generation complete!', steps: [] },
};

const GenerationLoader: React.FC<{ status: GenerationStatus }> = ({ status }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const messages = STATUS_MESSAGES[status] || STATUS_MESSAGES.idle;

  useEffect(() => {
    setCurrentStepIndex(0); // Reset on status change
    if (messages.steps.length > 0) {
      const interval = setInterval(() => {
        setCurrentStepIndex(prev => (prev + 1) % messages.steps.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [status, messages.steps.length]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-black/30 overflow-hidden relative">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-plus-lighter filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-plus-lighter filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 bg-indigo-500/30 rounded-full animate-pulse"></div>
        <div className="absolute inset-2 flex items-center justify-center bg-gray-900 rounded-full">
          <BrainCircuitIcon className="w-12 h-12 text-indigo-400" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-100 mb-2">{messages.title}</h2>
      <div className="h-6 text-gray-400 font-mono text-sm">
        {messages.steps[currentStepIndex]}
      </div>

       <style>{`
            @keyframes blob {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(20px, -30px) scale(1.1); }
                66% { transform: translate(-15px, 15px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1); }
            }
            .animate-blob {
                animation: blob 8s infinite;
            }
            .animation-delay-2000 {
                animation-delay: 2s;
            }
        `}</style>
    </div>
  );
};

export default GenerationLoader;
