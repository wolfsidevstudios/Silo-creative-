import { MousePointerClickIcon } from './components/common/Icons';
import React, { useState } from 'react';
import { AppMode } from './types';
import { XIcon, DesktopIcon, PuzzleIcon, FolderIcon, FilesIcon, CodeBracketIcon, PhoneIcon, FormIcon, FileTextIcon, GraduationCapIcon, CheckIcon } from './Icons';

interface Mode {
    id: AppMode;
    name: string;
    description: string;
    icon: React.FC<{className?: string}>;
}

export const MODES: Mode[] = [
    { id: 'build', name: 'Web App', description: 'Generate a single-file, interactive web application with HTML, CSS, and JS.', icon: DesktopIcon },
    { id: 'component', name: 'Component', description: 'Create a standalone, reusable UI component like a navbar or a card.', icon: PuzzleIcon },
    { id: 'project', name: 'Project', description: 'Scaffold a complete multi-file project with a modern stack like React + Vite.', icon: FolderIcon },
    { id: 'multifile', name: 'Multi-file App', description: 'Build a classic web app with separate HTML, CSS, and JavaScript files.', icon: FilesIcon },
    { id: 'fullstack', name: 'Full-stack App', description: 'Generate a simple frontend and a Node.js backend with an API endpoint.', icon: CodeBracketIcon },
    { id: 'native', name: 'Native App', description: 'Create a simple mobile app layout using React Native for iOS and Android.', icon: PhoneIcon },
    { id: 'form', name: 'Web Form', description: 'Design a web form with client-side validation and Netlify integration.', icon: FormIcon },
    { id: 'document', name: 'Document', description: 'Generate a professional document or slide deck from an outline.', icon: FileTextIcon },
    { id: 'study', name: 'Flashcards', description: 'Create a set of flashcards on any topic for studying and learning.', icon: GraduationCapIcon },
];

interface ModeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentMode: AppMode;
    onSelectMode: (mode: AppMode) => void;
}

export const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({ isOpen, onClose, currentMode, onSelectMode }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col p-4 sm:p-8 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
            <div className="w-full max-w-5xl mx-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Select a Creation Mode</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 overflow-y-auto" style={{maxHeight: '80vh'}}>
                    {MODES.map(mode => (
                        <button 
                            key={mode.id} 
                            onClick={() => onSelectMode(mode.id)}
                            className={`p-6 bg-white/5 border rounded-lg text-left transition-all duration-200 ${currentMode === mode.id ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-white/10 hover:border-white/20 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                                        <mode.icon className="w-7 h-7 text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-100">{mode.name}</h3>
                                </div>
                                {currentMode === mode.id && <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center"><CheckIcon className="w-5 h-5 text-white"/></div>}
                            </div>
                            <p className="mt-4 text-sm text-gray-400">{mode.description}</p>
                        </button>
                    ))}
                </div>
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
    );
};
