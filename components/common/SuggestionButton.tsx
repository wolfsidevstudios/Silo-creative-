
import React from 'react';

interface SuggestionButtonProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}

const SuggestionButton: React.FC<SuggestionButtonProps> = ({ icon, text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-gray-200/60 hover:bg-gray-300/60 text-gray-600 font-medium py-2 px-4 rounded-full transition-colors duration-200"
    >
      <div className="bg-white p-1 rounded-full shadow-sm">{icon}</div>
      <span>{text}</span>
    </button>
  );
};

export default SuggestionButton;
