import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import SuggestionButton from '../common/SuggestionButton';
import { PaperclipIcon, BookIcon, StarIcon, CheckIcon, SendIcon, MoreVerticalIcon, PhoneIcon, FilesIcon, FileTextIcon, CodeBracketIcon, XIcon } from '../common/Icons';
import AgentSelector from '../agents/AgentSelector';
import { Link } from 'react-router-dom';
import ModelSelector from '../common/ModelSelector';

const MAX_CHARS = 10000; // Increased for code translation

const HomePage: React.FC = () => {
  const [inputValue, setInputValue] = React.useState('');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { 
      setPrompt, appMode, setAppMode, 
      isTranslation, setIsTranslation
  } = useAppContext();

  React.useEffect(() => {
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
  
  const suggestions = {
      build: ["A kanban board", "Playful onboarding flow", "A markdown editor"],
      study: ["Cellular Biology", "US History Trivia", "JavaScript Fundamentals"],
      form: ["Contact form for a portfolio", "Event registration form", "Customer feedback survey"],
      native: ["Simple weather app", "Quote of the day", "Tap counter"],
      document: ["A presentation on climate change", "A report on Q2 earnings", "A proposal for a new project"],
      component: ["A responsive navbar", "A pricing table component", "A testimonial card"],
  };

  const getPlaceholder = () => {
    if (isTranslation) return 'Paste your code here (e.g., Python, Java)...';
    switch(appMode) {
        case 'build': return 'Describe the web app you want to build...';
        case 'study': return 'What topic do you want flashcards for?';
        case 'form': return 'Describe the form you want to build...';
        case 'native': return 'Describe the native mobile app you want...';
        case 'document': return 'Describe the document or presentation you want...';
        case 'component': return 'Describe the UI component you want to build...';
        default: return 'Describe something to create...';
    }
  };

  const MenuItem: React.FC<{ children: React.ReactNode, active: boolean, onClick: () => void }> = ({ children, active, onClick }) => (
    <button onClick={onClick} className="w-full text-left flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-md">
        <span>{children}</span>
        {active && <CheckIcon className="w-4 h-4 text-indigo-400" />}
    </button>
  );

  return (
    <div className="relative flex flex-col h-screen w-screen bg-black overflow-hidden futuristic-background">
      <main className="flex-1 flex flex-col items-center justify-center text-gray-200 p-4 z-10">
        <div className="text-center">
            <div className="relative w-40 h-40 mx-auto mb-8">
                <div className="absolute inset-0 bg-indigo-500/50 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute inset-2 bg-black rounded-full"></div>
                <div className="absolute inset-4 border-2 border-dashed border-white/10 rounded-full animate-spin-slow"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <img src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Silo AI Core" className="w-24 h-24 rounded-full" />
                </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tighter">Start a new project</h1>
            <h2 className="text-xl text-gray-400 font-light mb-12">Let's create something amazing together.</h2>
            
             <div className="flex items-center justify-center gap-3">
                {suggestions[appMode].map((text, index) => (
                    <SuggestionButton 
                        key={index}
                        text={text} 
                        onClick={() => startBuilding(text)}
                    />
                ))}
            </div>
        </div>
      </main>
      
      <form onSubmit={handleSubmit} className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-2xl z-20">
        <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-4">
                <AgentSelector />
                <ModelSelector />
            </div>
             <div className="flex items-center bg-black/20 rounded-full p-1 text-sm font-medium">
                <button type="button" onClick={() => setIsTranslation(false)} className={`px-3 py-1 rounded-full ${!isTranslation ? 'bg-white/10' : 'text-gray-400'}`}>Describe</button>
                <button type="button" onClick={() => setIsTranslation(true)} className={`px-3 py-1 rounded-full ${isTranslation ? 'bg-white/10' : 'text-gray-400'}`}>Translate</button>
            </div>
        </div>
        <div className="relative">
            <textarea
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
                placeholder={getPlaceholder()}
                className="w-full h-12 bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-gray-500 text-base text-gray-200 transition-colors"
                rows={isTranslation ? 5 : 1}
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-2">
                <div className="text-sm font-mono text-gray-500">
                    <span className={inputValue.length > 0 ? "text-gray-200" : ""}>{MAX_CHARS - inputValue.length}</span>
                </div>
                <div className="relative" ref={menuRef}>
                    <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                        <MoreVerticalIcon className="w-5 h-5" />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute bottom-full mb-2 right-0 w-56 bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-xl border border-white/10 p-2 z-10">
                            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Mode</div>
                            <MenuItem active={appMode === 'build'} onClick={() => { setAppMode('build'); setIsMenuOpen(false); }}>Web App</MenuItem>
                            <MenuItem active={appMode === 'component'} onClick={() => { setAppMode('component'); setIsMenuOpen(false); }}>Component</MenuItem>
                            <MenuItem active={appMode === 'native'} onClick={() => { setAppMode('native'); setIsMenuOpen(false); }}>Native App</MenuItem>
                            <MenuItem active={appMode === 'form'} onClick={() => { setAppMode('form'); setIsMenuOpen(false); }}>Web Form</MenuItem>
                            <MenuItem active={appMode === 'document'} onClick={() => { setAppMode('document'); setIsMenuOpen(false); }}>Document</MenuItem>
                            <MenuItem active={appMode === 'study'} onClick={() => { setAppMode('study'); setIsMenuOpen(false); }}>Flashcards</MenuItem>
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="bg-indigo-500 text-white rounded-full w-9 h-9 flex items-center justify-center disabled:bg-gray-600/50 disabled:cursor-not-allowed hover:bg-indigo-600 transition-all shadow-lg"
                    aria-label="Send prompt"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </form>

       <div className="fixed top-4 left-4 z-20">
            <Link to="/onedrive" className="py-2 px-4 bg-white/5 text-gray-300 text-sm font-medium rounded-full transition-colors duration-200 backdrop-blur-sm border border-white/10 hover:bg-white/10">
                My Creations
            </Link>
        </div>

      <style>{`
        .futuristic-background {
            background-color: #000000;
            background-image: 
                radial-gradient(circle at 25% 25%, rgba(138, 43, 226, 0.2) 0%, rgba(138, 43, 226, 0) 50%),
                radial-gradient(circle at 75% 75%, rgba(0, 255, 255, 0.2) 0%, rgba(0, 255, 255, 0) 50%),
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
            animation: move-glow 20s linear infinite;
        }

        @keyframes move-glow {
            0% { background-position: 0% 0%, 0% 0%, 0 0, 0 0; }
            50% { background-position: 100% 100%, 0% 0%, 0 0, 0 0; }
            100% { background-position: 0% 0%, 0% 0%, 0 0, 0 0; }
        }
        
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;