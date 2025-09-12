
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import SuggestionButton from '../common/SuggestionButton';
import { LogoIcon, PaperclipIcon, BookIcon, StarIcon, CheckIcon, SendIcon, MoreVerticalIcon } from '../common/Icons';
import Sidebar from '../common/Sidebar';
import Banner from '../common/Banner';
import AgentSelector from '../agents/AgentSelector';

const MAX_CHARS = 350;

const MenuItem: React.FC<{ children: React.ReactNode, active: boolean, onClick: () => void }> = ({ children, active, onClick }) => (
    <button onClick={onClick} className="w-full text-left flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        <span>{children}</span>
        {active && <CheckIcon className="w-4 h-4 text-indigo-500" />}
    </button>
);

const HomePage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { setPrompt, appMode, setAppMode } = useAppContext();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  
  const buildSuggestions = [
      { text: "Study notes app", icon: <BookIcon className="w-4 h-4 text-gray-500" /> },
      { text: "Playful onboarding flow", icon: <StarIcon className="w-4 h-4 text-gray-500" /> },
      { text: "Shared todo app", icon: <CheckIcon className="w-4 h-4 text-gray-500" /> },
  ];
  
  const studySuggestions = [
      { text: "Cellular Biology", icon: <BookIcon className="w-4 h-4 text-gray-500" /> },
      { text: "US History Trivia", icon: <StarIcon className="w-4 h-4 text-gray-500" /> },
      { text: "JavaScript Fundamentals", icon: <CheckIcon className="w-4 h-4 text-gray-500" /> },
  ];
  
  const formSuggestions = [
      { text: "Contact form for a portfolio", icon: <BookIcon className="w-4 h-4 text-gray-500" /> },
      { text: "Event registration form", icon: <StarIcon className="w-4 h-4 text-gray-500" /> },
      { text: "Customer feedback survey", icon: <CheckIcon className="w-4 h-4 text-gray-500" /> },
  ];

  const getSuggestions = () => {
    switch(appMode) {
        case 'build': return buildSuggestions;
        case 'study': return studySuggestions;
        case 'form': return formSuggestions;
        default: return buildSuggestions;
    }
  }
  
  const getPlaceholder = () => {
    switch(appMode) {
        case 'build': return 'Ask Silo Creative...';
        case 'study': return 'What topic do you want flashcards for?';
        case 'form': return 'Describe the form you want to build...';
        default: return 'Ask Silo Creative...';
    }
  }

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
                <AgentSelector />
                <textarea
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={getPlaceholder()}
                  className="w-full h-28 bg-transparent focus:outline-none resize-none placeholder-gray-400 text-lg pt-4"
                />
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button type="button" className="p-2 rounded-full hover:bg-gray-200 text-gray-500">
                      <PaperclipIcon className="w-5 h-5" />
                    </button>
                    <div className="relative" ref={menuRef}>
                      <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-gray-200 text-gray-500">
                        <MoreVerticalIcon className="w-5 h-5" />
                      </button>
                      {isMenuOpen && (
                        <div className="absolute bottom-full mb-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200/80 py-2 z-10">
                          <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Mode</div>
                          <MenuItem active={appMode === 'build'} onClick={() => { setAppMode('build'); setIsMenuOpen(false); }}>App Builder</MenuItem>
                          <MenuItem active={appMode === 'form'} onClick={() => { setAppMode('form'); setIsMenuOpen(false); }}>AI Form Generator</MenuItem>
                          <MenuItem active={appMode === 'study'} onClick={() => { setAppMode('study'); setIsMenuOpen(false); }}>Study Mode</MenuItem>
                        </div>
                      )}
                    </div>
                  </div>
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

              <p className="text-xs text-gray-500 mt-4 text-center max-w-md">
                  By creating an app, you agree to our{' '}
                  <Link to="/terms" className="underline hover:text-indigo-600 transition-colors">
                      Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="underline hover:text-indigo-600 transition-colors">
                      Privacy Policy
                  </Link>.
              </p>

              <div className="flex items-center gap-4 mt-6">
                  {getSuggestions().map((suggestion, index) => (
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
