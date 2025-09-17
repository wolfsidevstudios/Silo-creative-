
import React from 'react';

interface SuggestionButtonProps {
  text: string;
  onClick: () => void;
}

const SuggestionButton: React.FC<SuggestionButtonProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium py-2 px-4 rounded-full transition-colors duration-200 backdrop-blur-sm border border-white/10"
    >
      {text}
    </button>
  );
};

export default SuggestionButton;
