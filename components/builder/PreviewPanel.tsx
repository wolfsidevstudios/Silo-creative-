import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FlashcardDisplay } from '../builder/FlashcardDisplay';
import { ClipboardIcon, CheckIcon, MousePointerClickIcon, ExternalLinkIcon, BotIcon } from '../common/Icons';
import VisualEditBar from './VisualEditBar';
import { AgentTestAction } from '../pages/AppBuilderPage';

declare global {
    interface Window {
        QRCode: any;
        html2canvas: any;
    }
}

const getQRCodeLibrary = (): Promise<any> => new Promise((resolve, reject) => {
    if (window.QRCode) return resolve(window.QRCode);
    let attempts = 0;
    const intervalId = setInterval(() => {
        if (window.QRCode) { clearInterval(intervalId); resolve(window.QRCode); }
        else if (attempts++ > 20) { clearInterval(intervalId); reject(new Error('QR Code library failed to load.')); }
    }, 250);
});

const AdUnit: React.FC = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            try { // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) { console.error("AdSense error:", e); }
        }, 50);
        return () => clearTimeout(timer);
    }, []);
    return <ins className="adsbygoogle"
     style={{display:'inline-block',width:'300px',height:'300px'}}
     data-ad-client="ca-pub-7029279570287128"
     data-ad-slot="4642676642"></ins>;
};

const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[630px] w-[315px] shadow-xl">
        <div className="w-[12px] h-[12px] bg-gray-800 top-[148px] -left-[17px] absolute rounded-l-lg"></div><div className="w-[12px] h-[12px] bg-gray-800 top-[198px] -left-[17px] absolute rounded-l-lg"></div><div className="w-[12px] h-[12px] bg-gray-800 top-[248px] -left-[17px] absolute rounded-l-lg"></div><div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[100px] rounded-l-lg"></div><div className="h-[46px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white">{children}</div>
    </div>
);

const AgentCursor: React.FC<{ position: { x: number; y: number } }> = ({ position }) => (
    <div className="absolute top-0 left-0 transition-transform duration-300 ease-in-out" style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
        <MousePointerClickIcon className="w-6 h-6 text-indigo-500 drop-shadow-lg" style={{ transform: 'rotate(-15deg)' }}/>
    </div>
);

const AgentTestingOverlay: React.FC<{ agentJustification: string, cursorPosition: { x: number, y: number } }> = ({ agentJustification, cursorPosition }) => (
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-20 flex flex-col items-center justify-between p-4">
        <AgentCursor position={cursorPosition} />
        <div className="mt-auto bg-gray-900/80 text-white p-3 rounded-lg text-center shadow-lg animate-fade-in-up">
            <div className="flex items-center gap-2">
                <BotIcon className="w-5 h-5 text-indigo-400" />
                <p className="font-medium">Agent is testing...</p>
            </div>
            <p className="text-sm text-gray-300 mt-1 italic">"{agentJustification}"</p>
        </div>
        <style>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
        `}</style>
    </div>
);


interface PreviewPanelProps {
  onVisualEditSubmit: (prompt: string) => void;
  onScreenshotTaken: (dataUrl: string) => void;
  isAgentTesting: boolean;
  agentTestAction: AgentTestAction | null;
  onTestComplete: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ onVisualEditSubmit, onScreenshotTaken, isAgentTesting, agentTestAction, onTestComplete }) => {
    const { generatedCode, appMode, generatedFlashcards, prompt } = useAppContext();
    const [viewMode, setViewMode] = useState<'app' | 'code'>('app');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [qrError, setQrError] = useState<string | null>(null);
    const [isQrLoading, setIsQrLoading] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isVisualEditMode, setIsVisualEditMode] = useState(false);
    const [selectedElementData, setSelectedElementData] = useState<{ selector: string; rect: DOMRect; } | null>(null);
    const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 });

    const visualEditScript = `
    <script>
        let visualEditEnabled = false;
        let currentOverlay = document.createElement('div');
        currentOverlay.style.position = 'absolute';
        currentOverlay.style.border = '2px solid #4f46e5';
        currentOverlay.style.backgroundColor = 'rgba(79, 70, 229, 0.2)';
        currentOverlay.style.borderRadius = '3px';
        currentOverlay.style.pointerEvents = 'none';
        currentOverlay.style.zIndex = '9999';
        currentOverlay.style.display = 'none';
        document.body.appendChild(currentOverlay);

        function getCssSelector(el) { /* ... same as before ... */ return 'body'; }
        const handleMouseOver = e => { if (visualEditEnabled) { /* ... */ } };
        const handleMouseOut = e => { if (visualEditEnabled) { /* ... */ } };
        const handleClick = e => { /* ... same as before ... */ };

        window.addEventListener('message', (event) => {
            if (event.data.type === 'VISUAL_EDIT_MODE_STATUS') {
                visualEditEnabled = event.data.enabled;
                if (!visualEditEnabled) currentOverlay.style.display = 'none';
            }
            if (event.data.type === 'EXECUTE_ACTION') {
                const el = document.querySelector(event.data.selector);
                if (el) {
                   if (event.data.action === 'click') el.click();
                }
            }
        });
        
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
        document.addEventListener('click', handleClick, true);
    </script>
    `;

    const getSrcDoc = () => {
        if (!generatedCode) return '';
        if (generatedCode.includes('</body>')) return generatedCode.replace('</body>', `${visualEditScript}</body>`);
        return generatedCode + visualEditScript;
    };

    useEffect(() => { setViewMode('app'); }, [appMode]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.source === iframeRef.current?.contentWindow && event.data.type === 'ELEMENT_SELECTED') {
                setSelectedElementData({ selector: event.data.selector, rect: event.data.rect });
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        iframeRef.current?.contentWindow?.postMessage({ type: 'VISUAL_EDIT_MODE_STATUS', enabled: isVisualEditMode }, '*');
        if (!isVisualEditMode) setSelectedElementData(null);
    }, [isVisualEditMode, generatedCode]);

    useEffect(() => {
        if (appMode === 'native' && generatedCode) {
            setIsQrLoading(true); setQrCodeUrl(''); setQrError(null);
            const snackUrl = `https://snack.expo.dev/?code=${encodeURIComponent(generatedCode)}`;
            getQRCodeLibrary().then(QRCode => QRCode.toDataURL(snackUrl, { width: 256, margin: 1 }))
                .then((url: string) => { setQrCodeUrl(url); setQrError(null); })
                .catch((err: Error) => { setQrError(err.message || 'QR Code library failed to load.'); setQrCodeUrl(''); })
                .finally(() => setIsQrLoading(false));
        } else {
            setQrCodeUrl(''); setQrError(null); setIsQrLoading(false);
        }
    }, [generatedCode, appMode]);
    
    useEffect(() => {
        if (isAgentTesting && agentTestAction && iframeRef.current) {
            const iframe = iframeRef.current;
            const targetEl = iframe.contentDocument?.querySelector(agentTestAction.selector);
            if (targetEl) {
                const rect = targetEl.getBoundingClientRect();
                const targetX = rect.left + rect.width / 2;
                const targetY = rect.top + rect.height / 2;
                
                // Animate cursor to target
                setTimeout(() => setCursorPosition({ x: targetX, y: targetY }), 500);

                // Execute action after cursor arrives
                setTimeout(() => {
                    iframe.contentWindow?.postMessage({ type: 'EXECUTE_ACTION', ...agentTestAction }, '*');
                    // End test after action
                    setTimeout(() => onTestComplete(), 1000);
                }, 1000);
            } else {
                console.warn("Agent couldn't find element:", agentTestAction.selector);
                onTestComplete(); // End test if element not found
            }
        }
    }, [isAgentTesting, agentTestAction, onTestComplete]);

    const handleVisualEditSubmit = (prompt: string) => {
        if (!selectedElementData) return;
        const finalPrompt = `Using the existing code, make the following change to the element identified by the selector "${selectedElementData.selector}": ${prompt}`;
        onVisualEditSubmit(finalPrompt);
        setSelectedElementData(null);
    };
    
    const handleOpenInNewTab = () => {
        if (generatedCode) {
            const blob = new Blob([generatedCode], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }
    };

    const handleIframeLoad = () => {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow || !iframe.contentDocument?.body.innerHTML.trim()) return;
        
        // Use a small timeout to ensure styles are applied
        setTimeout(() => {
            if (window.html2canvas) {
                window.html2canvas(iframe.contentDocument.body, { useCORS: true, allowTaint: true })
                    .then((canvas: any) => onScreenshotTaken(canvas.toDataURL('image/jpeg')))
                    .catch((err: Error) => console.error("Screenshot failed:", err));
            }
        }, 500);
    };

    const renderBuildMode = () => {
        if (!generatedCode) return <AdPlaceholder title="Your app is being planned..." />;
        if (viewMode === 'app') {
            return (
                <div className="w-full h-full relative" onClick={() => selectedElementData && setSelectedElementData(null)}>
                    {isAgentTesting && agentTestAction && <AgentTestingOverlay agentJustification={agentTestAction.justification} cursorPosition={cursorPosition} />}
                    <iframe
                        ref={iframeRef}
                        srcDoc={getSrcDoc()}
                        onLoad={handleIframeLoad}
                        title="App Preview"
                        className={`w-full h-full border-0 ${isVisualEditMode ? 'pointer-events-auto' : ''} ${isAgentTesting ? 'pointer-events-none' : ''}`}
                        sandbox="allow-scripts allow-forms allow-same-origin"
                    />
                     {isVisualEditMode && selectedElementData && (
                        <VisualEditBar
                            position={{...selectedElementData.rect, top: selectedElementData.rect.top + selectedElementData.rect.height}}
                            onSubmit={handleVisualEditSubmit}
                            onClose={() => setSelectedElementData(null)}
                        />
                    )}
                </div>
            );
        }
        return <CodeWorkspace code={generatedCode} />;
    };
    
    const renderNativeMode = () => {
        if (!generatedCode) return <NativePlaceholder />;
        if (viewMode === 'app') return <NativePreview generatedCode={generatedCode} qrCodeUrl={qrCodeUrl} qrError={qrError} isQrLoading={isQrLoading} />;
        return <CodeViewer code={generatedCode} />;
    };

    const renderStudyMode = () => {
        if (!generatedFlashcards) return <FlashcardPlaceholder />;
        return <div className="p-6 overflow-y-auto h-full"><FlashcardDisplay cards={generatedFlashcards} topic={prompt} /></div>;
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
            case 'build': case 'form': return renderBuildMode();
            case 'native': return renderNativeMode();
            case 'study': return renderStudyMode();
            default: return <div className="p-6">Select a mode to get started.</div>;
        }
    };
    
    const showViewModeToggle = (appMode === 'build' || appMode === 'form' || appMode === 'native') && generatedCode;
    const showVisualEditToggle = (appMode === 'build' || appMode === 'form') && generatedCode && viewMode === 'app';
    const showOpenInNewTabButton = (appMode === 'build' || appMode === 'form') && generatedCode && viewMode === 'app';

    return (
        <div className="w-1/2 flex flex-col h-full bg-white">
            <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                     <h2 className="text-xl font-semibold">{getHeaderText()}</h2>
                     {showViewModeToggle && (
                        <div className="bg-gray-200/80 rounded-full p-1 flex items-center text-sm font-medium">
                            <button onClick={() => setViewMode('app')} className={`px-4 py-1.5 rounded-full transition-all duration-200 ${viewMode === 'app' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Preview</button>
                            <button onClick={() => setViewMode('code')} className={`px-4 py-1.5 rounded-full transition-all duration-200 ${viewMode === 'code' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Code</button>
                        </div>
                     )}
                     {showVisualEditToggle && (
                        <button onClick={() => setIsVisualEditMode(!isVisualEditMode)} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${isVisualEditMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                            <MousePointerClickIcon className="w-4 h-4" /><span>Visual Edit</span>
                        </button>
                     )}
                </div>
                <div className="flex items-center space-x-2">
                    {showOpenInNewTabButton && <button onClick={handleOpenInNewTab} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors" title="Open in new tab"><ExternalLinkIcon className="w-5 h-5" /></button>}
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div><div className="w-3 h-3 bg-yellow-500 rounded-full"></div><div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
            </header>
            <div className="flex-1 bg-gray-100 overflow-hidden relative">{renderContent()}</div>
        </div>
    );
};

// --- Sub-components ---

const CodeViewer: React.FC<{ code: string }> = ({ code }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => { navigator.clipboard.writeText(code); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };
    return (
        <div className="relative w-full h-full bg-gray-900 text-white font-mono text-sm overflow-auto">
            <button onClick={handleCopy} className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md text-xs transition-colors">
                {isCopied ? <><CheckIcon className="w-4 h-4 text-green-400" /><span>Copied!</span></> : <><ClipboardIcon className="w-4 h-4" /><span>Copy Code</span></>}
            </button>
            <pre className="p-4 pt-12"><code>{code}</code></pre>
        </div>
    );
};

const CodeWorkspace: React.FC<{ code: string }> = ({ code }) => {
    const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
    const [html, setHtml] = useState(''); const [css, setCss] = useState(''); const [js, setJs] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!code) return;
        const jsMatch = code.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i); setJs(jsMatch && jsMatch[1] ? jsMatch[1].trim() : '// No script found.');
        const cssMatch = code.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i); setCss(cssMatch && cssMatch[1] ? cssMatch[1].trim() : '/* Styles are in HTML via Tailwind CSS */');
        setHtml(code.replace(/<script\b[^>]*>[\s\S]*?<\/script>/i, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/i, '').trim());
        setActiveTab('html');
    }, [code]);

    const handleCopy = () => { let contentToCopy = activeTab === 'html' ? html : activeTab === 'css' ? css : js; navigator.clipboard.writeText(contentToCopy); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };
    const TabButton: React.FC<{ tab: 'html' | 'css' | 'js'; label: string }> = ({ tab, label }) => <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'text-white border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}>{label}</button>;
    
    return (
        <div className="w-full h-full bg-gray-900 text-white font-mono text-sm flex flex-col">
            <header className="flex-shrink-0 bg-gray-800 flex justify-between items-center border-b border-gray-700">
                <div className="flex"><TabButton tab="html" label="HTML" /><TabButton tab="css" label="CSS" /><TabButton tab="js" label="JavaScript" /></div>
                <button onClick={handleCopy} className="mr-3 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md text-xs transition-colors">{isCopied ? <><CheckIcon className="w-4 h-4 text-green-400" /><span>Copied!</span></> : <><ClipboardIcon className="w-4 h-4" /><span>Copy</span></>}</button>
            </header>
            <div className="flex-1 relative overflow-hidden">
                <div className="h-full overflow-auto"><pre className="p-4 h-full"><code className={`language-${activeTab}`}>{activeTab === 'html' ? html : activeTab === 'css' ? css : js}</code></pre></div>
            </div>
        </div>
    );
};

const AdPlaceholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="text-center text-gray-500 mb-4"><h3 className="text-lg font-medium text-gray-900">{title}</h3><p className="mt-1 text-sm text-gray-500">The preview will appear here. In the meantime, here's a word from our sponsors.</p></div>
        <div className="w-[300px] h-[300px] bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center"><AdUnit /></div>
    </div>
);

const NativePlaceholder: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center p-4"><div className="text-center text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-gray-400"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg><h3 className="mt-2 text-lg font-medium text-gray-900">Native App Preview</h3><p className="mt-1 text-sm text-gray-500">Your generated native app will appear here.</p></div></div>
);

const NativePreview: React.FC<{ generatedCode: string; qrCodeUrl: string; qrError: string | null; isQrLoading: boolean; }> = ({ generatedCode, qrCodeUrl, qrError, isQrLoading }) => {
    const snackUrl = `https://snack.expo.dev/embedded?platform=web&preview=true&theme=light&waitForData=true&code=${encodeURIComponent(generatedCode)}`;
    const snackDirectUrl = `https://snack.expo.dev/?code=${encodeURIComponent(generatedCode)}`;
    return (
        <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center p-4 bg-gray-100 gap-8 overflow-y-auto">
            <div className="flex-shrink-0"><PhoneFrame><iframe src={snackUrl} title="Native App Preview" className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation" /></PhoneFrame></div>
            <div className="flex-grow max-w-md w-full space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Test on Your Device</h3><p className="text-sm text-gray-600 mb-4">Use the <a href="https://expo.dev/go" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium underline">Expo Go</a> app to get a true native preview.</p>
                    <div className="bg-white p-2 rounded-lg border border-gray-200 inline-block"><div className="w-40 h-40 flex items-center justify-center">{isQrLoading ? <span className="text-sm text-gray-500">Generating...</span> : qrCodeUrl ? <img src={qrCodeUrl} alt="Expo Snack QR Code" width="160" height="160" /> : <div className="text-center text-xs text-red-600 p-2">{qrError}</div>}</div></div>
                    <a href={snackDirectUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>Open in Expo Snack</a>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="font-bold text-lg text-gray-800">Run Locally</h4><p className="text-sm text-gray-600 mt-1 mb-4">Follow these steps in your terminal to run the app on your own machine.</p>
                    <div className="text-left bg-gray-100 p-4 rounded-lg text-xs text-gray-800 space-y-2 font-mono"><p><span className="select-none text-green-600 mr-2">$</span>npx create-expo-app my-app</p><p><span className="select-none text-green-600 mr-2">$</span>cd my-app</p><p className="text-gray-500 italic pl-5">// Copy code into App.js</p><p><span className="select-none text-green-600 mr-2">$</span>npm run expo</p></div>
                </div>
            </div>
        </div>
    );
};

const FlashcardPlaceholder: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center p-4"><div className="text-center text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-gray-400"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h4M7 11h7"/></svg><h3 className="mt-2 text-lg font-medium text-gray-900">Flashcards</h3><p className="mt-1 text-sm text-gray-500">Your generated flashcards will appear here.</p></div></div>
);

export default PreviewPanel;