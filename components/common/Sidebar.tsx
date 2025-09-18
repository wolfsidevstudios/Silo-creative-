import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { PlusIcon, ClockIcon, CreditCardIcon, ChevronLeftIcon, ChevronRightIcon, ChipIcon, SettingsIcon, UsersIcon, LogOutIcon, FolderIcon, BookIcon, FileTextIcon, CodeBracketIcon } from './Icons';
import { PREMADE_AGENTS } from '../../data/premadeAgents';

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { resetApp, isStudent, user, signOut } = useAppContext();

  const handleNewApp = () => {
    resetApp();
    navigate('/home');
  };
  
  const recentProjects = [ "Study notes app", "Playful onboarding", "Shared todo app" ];
  const credits = 1250;
  
  const NavItem: React.FC<{ to: string; icon: React.ReactNode; text: string }> = ({ to, text, icon }) => {
    const isActive = location.pathname === to;
    return (
      <button onClick={() => navigate(to)} className={`w-full flex items-center p-2 text-gray-300 hover:bg-white/10 rounded-lg group ${!isExpanded && 'justify-center'} ${isActive ? 'bg-white/10 font-bold text-white' : 'font-semibold'}`}>
          {icon}
          {isExpanded && <span className="ml-3 whitespace-nowrap">{text}</span>}
      </button>
    );
  };

  return (
    <aside className={`relative flex flex-col bg-gray-900/30 backdrop-blur-lg border-r border-white/10 rounded-r-2xl shadow-2xl transition-all duration-300 ease-in-out z-10 ${isExpanded ? 'w-64' : 'w-20'}`}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="absolute -right-3 top-8 z-20 p-1 bg-gray-800/50 backdrop-blur-md border-2 border-white/10 rounded-full hover:bg-gray-700/50 transition-colors"
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? <ChevronLeftIcon className="w-4 h-4 text-gray-300" /> : <ChevronRightIcon className="w-4 h-4 text-gray-300" />}
      </button>

      <div className={`flex items-center h-20 border-b border-white/10 transition-all duration-300 ${isExpanded ? 'justify-start px-6' : 'justify-center'}`}>
        <img src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Silo Labs Logo" className="w-10 h-10 rounded-full flex-shrink-0" />
        {isExpanded && (
            <div className="ml-3 flex items-center gap-2">
                 <span className="text-xl font-bold text-gray-200 whitespace-nowrap">Silo Labs</span>
                 <span className="px-2 py-0.5 bg-indigo-500/80 text-white text-xs font-bold rounded-full">Build</span>
            </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        <button 
            onClick={handleNewApp} 
            className={`w-full flex items-center bg-indigo-500/80 text-white rounded-lg hover:bg-indigo-500 transition-colors py-2.5 mb-4 border border-indigo-400/50 shadow-lg ${isExpanded ? 'px-4' : 'justify-center'}`}
        >
          <PlusIcon className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="ml-3 font-semibold whitespace-nowrap">New Project</span>}
        </button>
        
        <NavItem 
            to="/home"
            icon={<BookIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-200 flex-shrink-0" />}
            text="Home"
        />

        <NavItem 
            to="/onedrive"
            icon={<FolderIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-200 flex-shrink-0" />}
            text="Silo OneDrive"
        />
        
        <NavItem 
            to="/agents"
            icon={<UsersIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-200 flex-shrink-0" />}
            text="Custom Agents"
        />

        <NavItem 
            to="/docs"
            icon={<FileTextIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-200 flex-shrink-0" />}
            text="Documentation"
        />
        
        <NavItem 
            to="/developer"
            icon={<CodeBracketIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-200 flex-shrink-0" />}
            text="Developer API"
        />

      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        {isExpanded ? (
          <div className="relative p-4 bg-white/5 border border-white/10 rounded-lg text-white shadow-lg overflow-hidden font-mono">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-12 -translate-y-12"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 translate-y-12"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-xs uppercase tracking-wider text-gray-400">Silo Credits</span>
                <ChipIcon />
              </div>
              <div className={`text-center font-bold tracking-wider mb-2 ${isStudent ? 'text-2xl' : 'text-3xl'}`}>
                {isStudent ? 'Unlimited' : credits.toLocaleString()}
              </div>
              <div className="text-right text-xs uppercase opacity-70">
                {isStudent ? 'Student Plan' : 'Balance'}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-3">
              <CreditCardIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />
          </div>
        )}
      </div>
      
      {user && (
        <div className="px-3 py-3 border-t border-white/10 space-y-1">
            <button onClick={() => navigate('/settings')} className={`w-full flex items-center p-2 text-left text-gray-300 hover:bg-white/10 rounded-lg group ${!isExpanded && 'justify-center'}`}>
                <img src={user.avatarUrl} alt="User avatar" className="w-8 h-8 rounded-full flex-shrink-0" />
                {isExpanded && (
                    <div className="ml-3 flex-1 overflow-hidden">
                        <span className="font-semibold whitespace-nowrap truncate block text-gray-200">{user.name}</span>
                    </div>
                )}
            </button>
            <NavItem
                to="/settings"
                icon={<SettingsIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-200 flex-shrink-0" />}
                text="Settings"
            />
             <button onClick={signOut} className={`w-full flex items-center p-2 text-gray-300 hover:bg-white/10 rounded-lg group ${!isExpanded && 'justify-center'}`}>
                <LogOutIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-200 flex-shrink-0" />
                {isExpanded && <span className="ml-3 font-semibold whitespace-nowrap">Sign Out</span>}
            </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
