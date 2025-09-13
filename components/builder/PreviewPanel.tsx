import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FlashcardDisplay } from '../common/FlashcardDisplay';
import { ClipboardIcon, CheckIcon } from '../common/Icons';

// Add QRCode to window interface to avoid TypeScript errors
declare global {
    interface Window {
        QRCode: any;
    }
}

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

const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[630px] w-[315px] shadow-xl">
        <div className="w-[12px] h-[12px] bg-gray-800 top-[148px] -left-[17px] absolute rounded-l-lg"></div>
        <div className="w-[12px] h-[12px] bg-gray-800 top-[198px] -left-[17px] absolute rounded-l-lg"></div>
        <div className="w-[12px] h-[12px] bg-gray-800 top-[248px] -left-[17px] absolute rounded-l-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[100px] rounded-l-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white">
            {children}
        </div>
    </div>
);

const PreviewPanel: React.FC = () => {
    const { generatedCode, appMode, generatedFlashcards, prompt } = useAppContext();
    const [viewMode, setViewMode] = useState<'app' | 'code'>('app');
    const [isCopied, setIsCopied] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [qrError, setQrError] = useState<string | null>(null);

    useEffect(() => {
        // Reset view mode when app mode changes to ensure a consistent start
        setViewMode('app');
    }, [appMode]);

    useEffect(() => {
        if (appMode === 'native' && generatedCode) {
            const snackUrl = `https://snack.expo.dev/?code=${encodeURIComponent(generatedCode)}`;
            if (window.QRCode) {
                window.QRCode.toDataURL(snackUrl, { width: 256, margin: 1 })
                    .then((url: string) => {
                        setQrCodeUrl(url);
                        setQrError(null);
                    })
                    .catch((err: Error) => {
                        console.error('Failed to generate QR code:', err);
                        // This error often happens if the code is too long for a QR code.
                        setQrError('The generated code is too long to be encoded into a QR code. Please try opening the Snack URL directly.');
                        setQrCodeUrl('');
                    });
            } else {
                console.warn('QRCode library not loaded.');
                setQrError('QR Code library failed to load.');
            }
        } else {
            setQrCodeUrl('');
            setQrError(null);
        }
    }, [generatedCode, appMode]);


    const handleCopy = () => {
        if (!generatedCode) return;
        navigator.clipboard.writeText(generatedCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

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
                <div className="relative w-full h-full bg-gray-900 text-white font-mono text-sm overflow-auto">
                    <button 
                        onClick={handleCopy}
                        className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md text-xs transition-colors"
                    >
                        {isCopied ? (
                            <>
                                <CheckIcon className="w-4 h-4 text-green-400" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <ClipboardIcon className="w-4 h-4" />
                                <span>Copy Code</span>
                            </>
                        )}
                    </button>
                    <pre className="p-4 pt-12"><code>{generatedCode}</code></pre>
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
                           Your generated native app will appear here.
                        </p>
                    </div>
                </div>
            );
        }

        if (viewMode === 'app') {
            const snackUrl = `https://snack.expo.dev/embedded?platform=web&preview=true&theme=light&waitForData=true&code=${encodeURIComponent(generatedCode)}`;
            const snackDirectUrl = `https://snack.expo.dev/?code=${encodeURIComponent(generatedCode)}`;
            
            return (
                <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center p-4 bg-gray-100 gap-8 overflow-y-auto">
                    {/* Left side: Phone simulator */}
                    <div className="flex-shrink-0">
                        <PhoneFrame>
                            <iframe
                                src={snackUrl}
                                title="Native App Preview"
                                className="w-full h-full border-0"
                                sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
                            />
                        </PhoneFrame>
                    </div>
                    
                    {/* Right side: QR and instructions */}
                    <div className="flex-grow max-w-md w-full space-y-6">
                        {/* QR Code Section */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">Test on Your Device</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Use the <a href="https://expo.dev/go" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium underline">Expo Go</a> app to get a true native preview.
                            </p>
                            <div className="bg-white p-2 rounded-lg border border-gray-200 inline-block">
                                {qrCodeUrl ? (
                                    <img src={qrCodeUrl} alt="Expo Snack QR Code" width="160" height="160" />
                                ) : (
                                    <div className="w-40 h-40 bg-gray-100 flex items-center justify-center text-center text-xs text-gray-500 p-2 rounded-md">
                                        {qrError ? <span className="text-red-600">{qrError}</span> : 'Generating QR Code...'}
                                    </div>
                                )}
                            </div>
                            <a href={snackDirectUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                Open in Expo Snack
                            </a>
                        </div>
                        
                        {/* Local Run Section */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                             <h4 className="font-bold text-lg text-gray-800">Run Locally</h4>
                            <p className="text-sm text-gray-600 mt-1 mb-4">
                                Follow these steps in your terminal to run the app on your own machine.
                            </p>
                            <div className="text-left bg-gray-100 p-4 rounded-lg text-xs text-gray-800 space-y-2 font-mono">
                                <p><span className="select-none text-green-600 mr-2">$</span>npx create-expo-app my-app</p>
                                <p><span className="select-none text-green-600 mr-2">$</span>cd my-app</p>
                                <p className="text-gray-500 italic pl-5">// Copy code into App.js</p>
                                <p><span className="select-none text-green-600 mr-2">$</span>npm run expo</p>
                            </div>
                        </div>
                    </div>
                </div>
            );

        } else { // 'code' view
            return (
                <div className="relative w-full h-full bg-gray-900 text-white font-mono text-sm overflow-auto">
                    <button 
                        onClick={handleCopy}
                        className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md text-xs transition-colors"
                    >
                        {isCopied ? (
                            <>
                                <CheckIcon className="w-4 h-4 text-green-400" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <ClipboardIcon className="w-4 h-4" />
                                <span>Copy Code</span>
                            </>
                        )}
                    </button>
                    <pre className="p-4 pt-12"><code>{generatedCode}</code></pre>
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