import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FlashcardDisplay } from '../common/FlashcardDisplay';

// Dedicated Ad component to manage its own lifecycle
const AdUnit: React.FC = () => {
    useEffect(() => {
        // A small delay ensures the container has its dimensions calculated before the ad is requested.
        const timer = setTimeout(() => {
            try {
                // This is the command to signal to AdSense to render an ad in this slot.
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error("AdSense error:", e);
            }
        }, 50);

        return () => clearTimeout(timer); // Cleanup on unmount
    }, []);

    return (
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%', minHeight: '250px' }}
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
                    <div className="w-full max-w-lg h-auto min-h-[250px] bg-white border border-dashed border-gray-300 rounded-lg p-2">
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
    
    const renderNativeMode = () => {
        if (!generatedCode) {
            return (
                 <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <div className="text-center text-gray-500">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-gray-400"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Native App Preview</h3>
                        <p className="mt-1 text-sm text-gray-500">
                           Your generated native app QR code will appear here.
                        </p>
                    </div>
                </div>
            );
        }

        if (viewMode === 'app') {
            const snackUrl = `https://snack.expo.dev/?code=${encodeURIComponent(generatedCode)}`;
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(snackUrl)}`;
            
            return (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Scan to Preview</h3>
                    <p className="text-gray-600 mb-4 max-w-sm">
                        Use the <a href="https://expo.dev/go" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium underline">Expo Go</a> app on your iOS or Android device to scan the QR code.
                    </p>
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                        <img src={qrCodeUrl} alt="Expo Snack QR Code" width="256" height="256" />
                    </div>
                    <a href={snackUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        Open in Expo Snack
                    </a>
                </div>
            );
        } else { // 'code' view
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
    
    const getHeaderText = () => {
        switch(appMode) {
            case 'build': return 'Web App Preview';
            case 'form': return 'Form Preview';
            case 'native': return 'Native App Preview';
            case 'study': return 'Study Deck';
            default: return 'Preview';
        }
    }

    const renderContent = () => {
        switch(appMode) {
            case 'build':
            case 'form':
                return renderBuildMode();
            case 'native':
                return renderNativeMode();
            case 'study':
                return renderStudyMode();
            default:
                return <div className="p-6">Select a mode to get started.</div>;
        }
    };

    return (
        <div className="w-1/2 flex flex-col h-full bg-white">
            <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                     <h2 className="text-xl font-semibold">
                        {getHeaderText()}
                     </h2>
                     {(appMode === 'build' || appMode === 'form' || appMode === 'native') && generatedCode && (
                        <div className="bg-gray-200/80 rounded-full p-1 flex items-center text-sm font-medium">
                            <button
                                onClick={() => setViewMode('app')}
                                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${viewMode === 'app' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {appMode === 'native' ? 'Preview' : 'App'}
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
                {renderContent()}
            </div>
        </div>
    );
};

export default PreviewPanel;