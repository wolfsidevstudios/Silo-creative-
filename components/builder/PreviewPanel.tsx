
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FlashcardDisplay } from '../common/FlashcardDisplay';

const PreviewPanel: React.FC = () => {
    const { generatedCode, appMode, generatedFlashcards, prompt } = useAppContext();
    const [viewMode, setViewMode] = useState<'app' | 'code'>('app');
    
    const renderBuildMode = () => {
        if (!generatedCode) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <div className="text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">App Preview</h3>
                        <p className="mt-1 text-sm text-gray-500">
                           Your generated app will appear here after the plan is approved.
                        </p>
                    </div>
                </div>
            );
        }

        if (viewMode === 'app') {
            return (
                <iframe
                    srcDoc={generatedCode}
                    title="App Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-forms"
                />
            );
        } else {
             return (
                <div className="w-full h-full bg-gray-900 text-white font-mono text-sm overflow-auto">
                    <pre className="p-4"><code>{generatedCode}</code></pre>
                </div>
            );
        }
    };

    const renderStudyMode = () => {
        if (!generatedFlashcards) {
            return (
                 <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <div className="text-center text-gray-500">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-gray-400"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h4M7 11h7"/></svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Flashcards</h3>
                        <p className="mt-1 text-sm text-gray-500">
                           Your generated flashcards will appear here.
                        </p>
                    </div>
                </div>
            )
        }
        return (
            <div className="p-6 overflow-y-auto h-full">
                <FlashcardDisplay cards={generatedFlashcards} topic={prompt} />
            </div>
        )
    };

    return (
        <div className="w-1/2 flex flex-col h-full bg-white">
            <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                     <h2 className="text-xl font-semibold">
                        {appMode === 'build' ? 'Preview' : 'Study Deck'}
                     </h2>
                     {appMode === 'build' && generatedCode && (
                        <div className="bg-gray-200/80 rounded-full p-1 flex items-center text-sm font-medium">
                            <button
                                onClick={() => setViewMode('app')}
                                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${viewMode === 'app' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                App
                            </button>
                            <button
                                onClick={() => setViewMode('code')}
                                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${viewMode === 'code' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Code
                            </button>
                        </div>
                     )}
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
            </header>
            <div className="flex-1 bg-gray-100">
                {appMode === 'build' ? renderBuildMode() : renderStudyMode()}
            </div>
        </div>
    );
};

export default PreviewPanel;
