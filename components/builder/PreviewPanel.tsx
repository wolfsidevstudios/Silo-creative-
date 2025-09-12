
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FlashcardDisplay } from '../common/FlashcardDisplay';

// Dedicated Ad component to manage its own lifecycle
const AdUnit: React.FC = () => {
    useEffect(() => {
        try {
            // This is the command to signal to AdSense to render an ad in this slot.
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []); // Empty dependency array ensures this runs only once when the component mounts

    return (
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-7029279570287128"
             data-ad-slot="9123765567"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
    );
};

const PreviewPanel: React.FC = () => {
    const { generatedCode, appMode, generatedFlashcards, prompt } = useAppContext();
    const [viewMode, setViewMode] = useState<'app' | 'code'>('app');

    const renderBuildMode = () => {
        if (!generatedCode) {
            return (
                 <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <div className="text-center text-gray-500 mb-4">
                         <h3 className="text-lg font-medium text-gray-900">Your app is being planned...</h3>
                         <p className="mt-1 text-sm text-gray-500">
                            The preview will appear here. In the meantime, here's a word from our sponsors.
                         </p>
                    </div>
                    <div className="w-full max-w-lg h-auto min-h-[250px] bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center p-2">
                        <AdUnit />
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
