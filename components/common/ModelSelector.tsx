import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ChevronRightIcon, CheckIcon, XIcon } from '../common/Icons';
import { MODELS } from '../../context/AppContext';
import { ChipIcon } from './Icons';

const ModelSelector: React.FC = () => {
  const { selectedModel, setSelectedModel } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedModelDetails = MODELS.find(m => m.id === selectedModel);

  if (!selectedModelDetails) return null;

  const handleSelectModel = (modelId: typeof selectedModel) => {
    setSelectedModel(modelId);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 text-left p-1.5 pr-3 rounded-full hover:bg-white/10 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <ChipIcon className="w-6 h-5" />
        </div>
        <div>
            <div className="font-semibold text-gray-200 leading-tight">{selectedModelDetails.name}</div>
            <div className="text-xs text-gray-500 leading-tight">Selected Model</div>
        </div>
        <ChevronRightIcon className="w-4 h-4 text-gray-500" />
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="model-selector-title"
        >
          <div
            className="bg-gray-900/70 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl w-full max-w-lg relative transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 id="model-selector-title" className="text-2xl font-bold text-gray-100">
                Choose a Model
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            
            <ul className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {MODELS.map(model => (
                <li key={model.id}>
                  <button
                    onClick={() => handleSelectModel(model.id)}
                    className={`w-full text-left flex items-center gap-4 p-4 rounded-lg transition-colors ${selectedModel === model.id ? 'bg-indigo-500/20 ring-2 ring-indigo-500' : 'hover:bg-white/5'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
                      <ChipIcon className="w-7 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-200">{model.name}</p>
                      <p className="text-sm text-gray-400">Provider: {model.provider}</p>
                    </div>
                    {model.id === selectedModel && (
                      <CheckIcon className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
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
    </>
  );
};

export default ModelSelector;