import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { SendIcon } from '../common/Icons';

interface VisualEditBarProps {
  position: { top: number; left: number; width: number };
  onSubmit: (prompt: string) => void;
  onClose: () => void;
}

const VisualEditBar: React.FC<VisualEditBarProps> = ({ position, onSubmit, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit(prompt);
  };

  const barStyle: React.CSSProperties = {
    top: `${position.top}px`,
    left: `${position.left}px`,
    width: `${Math.max(position.width, 250)}px`,
    transform: 'translateY(8px)',
  };
  
  // Center the bar if it's wider than the element
  if (Math.max(position.width, 250) > position.width) {
      barStyle.left = `${position.left + (position.width / 2) - (Math.max(position.width, 250) / 2)}px`;
  }


  return (
    <div
      className="absolute z-50 p-1 bg-gray-900/80 backdrop-blur-sm rounded-full shadow-2xl animate-fade-in"
      style={barStyle}
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'change color to blue'"
          className="flex-grow bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none px-3 py-1"
        />
        <button
          type="submit"
          className="flex-shrink-0 bg-indigo-500 text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-indigo-600 transition-colors disabled:bg-gray-500"
          disabled={!prompt.trim()}
          aria-label="Submit change"
        >
          <SendIcon className="w-4 h-4" />
        </button>
      </form>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(0px); }
          to { opacity: 1; transform: translateY(8px); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default VisualEditBar;
