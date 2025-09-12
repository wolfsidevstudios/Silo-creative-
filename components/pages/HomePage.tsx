import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import SuggestionButton from '../common/SuggestionButton';
import { LogoIcon, PaperclipIcon, BookIcon, StarIcon, CheckIcon, SendIcon } from '../common/Icons';
import Sidebar from '../common/Sidebar';
import Banner from '../common/Banner';

const MAX_CHARS = 350;

const HomePage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const { setPrompt } = useAppContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setInputValue(text);
    }
  };

  const startBuilding = (promptText: string) => {
    if (!promptText.trim()) return;
    setPrompt(promptText);
    navigate('/build');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startBuilding(inputValue);
  };
  
  const suggestions = [
      { text: "Study notes app", icon: <BookIcon className="w-4 h-4 text-gray-500" /> },
      { text: "Playful onboarding flow", icon: <StarIcon className="w-4 h-4 text-gray-500" /> },
      { text: "Shared todo app", icon: <CheckIcon className="w-4 h-4 text-gray-500" /> },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50">
      <Banner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center text-gray-800 p-4">
          <div className="w-full max-w-2xl flex flex-col items-center">
              <LogoIcon />
              <h1 className="text-5xl font-bold mb-2">Good afternoon</h1>
              <h2 className="text-3xl text-gray-400 font-medium mb-12">What do you want to create?</h2>

              <form onSubmit={handleSubmit} className="w-full bg-white/50 border border-gray-200/80 rounded-2xl p-4 shadow-sm relative">
                <textarea
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Ask Silo Creative..."
                  className="w-full h-28 bg-transparent focus:outline-none resize-none placeholder-gray-400 text-lg pb-10"
                />
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center">
                  <button type="button" className="p-2 rounded-full hover:bg-gray-200 text-gray-500">
                    <PaperclipIcon className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-4">
                      <div className="text-sm font-mono text-gray-500">
                          <span className={inputValue.length > 0 ? "text-gray-900" : ""}>{MAX_CHARS - inputValue.length}</span>/{MAX_CHARS}
                      </div>
                      <button
                          type="submit"
                          disabled={!inputValue.trim()}
                          className="bg-indigo-500 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-600 transition-all shadow-sm"
                          aria-label="Send prompt"
                      >
                          <SendIcon className="w-5 h-5" />
                      </button>
                  </div>
                </div>
              </form>

              <div className="flex items-center gap-4 mt-8">
                  {suggestions.map((suggestion, index) => (
                      <SuggestionButton 
                          key={index}
                          icon={suggestion.icon} 
                          text={suggestion.text} 
                          onClick={() => startBuilding(suggestion.text)}
                      />
                  ))}
              </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
