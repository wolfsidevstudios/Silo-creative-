import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ChevronRightIcon, CheckIcon } from '../common/Icons';
import { MODELS } from '../../context/AppContext';
import { ChipIcon } from './Icons';

const ModelSelector: React.FC = () => {
  const { selectedModel, setSelectedModel } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedModelDetails = MODELS.find(m => m.id === selectedModel);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!selectedModelDetails) return null;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-left p-1.5 pr-3 rounded-full hover:bg-white/10 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <ChipIcon className="w-6 h-5" />
        </div>
        <div>
            <div className="font-semibold text-gray-200 leading-tight">{selectedModelDetails.name}</div>
            <div className="text-xs text-gray-500 leading-tight">Selected Model</div>
        </div>
        <ChevronRightIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-72 bg-gray-900/80 backdrop-blur-lg rounded-lg shadow-xl border border-white/10 z-20 overflow-hidden">
          <div className="p-3 text-sm font-semibold text-gray-200 border-b border-white/10">
            Choose a Model
          </div>
          <ul className="py-1 max-h-64 overflow-y-auto">
            {MODELS.map(model => (
              <li key={model.id}>
                <button
                  onClick={() => {
                    setSelectedModel(model.id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-white/5"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
                    <ChipIcon className="w-6 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-200">{model.name}</p>
                    <p className="text-xs text-gray-500">Provider: {model.provider}</p>
                  </div>
                  {model.id === selectedModel && (
                    <CheckIcon className="w-5 h-5 text-indigo-400 flex-shrink-0" />
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

export default ModelSelector;
