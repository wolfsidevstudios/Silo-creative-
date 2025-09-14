import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FlashcardDisplay } from '../builder/FlashcardDisplay';
import { ClipboardIcon, CheckIcon, MousePointerClickIcon, ExternalLinkIcon } from '../common/Icons';
import VisualEditBar from './VisualEditBar';

// Add QRCode to window interface to avoid TypeScript errors
declare global {
    interface Window {
        QRCode: any;
    }
}

// Helper function to wait for the QRCode library to load.
const getQRCodeLibrary = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (window.QRCode) return resolve(window.QRCode);
    let attempts = 0;
    const intervalId = setInterval(() => {
      if (window.QRCode) {
        clearInterval(intervalId);
        resolve(window.QRCode);
      } else if (attempts++ > 20) {
        clearInterval(intervalId);
        reject(new Error('QR Code library failed to load.'));
      }
    }, 250);
  });
};


const AdUnit: React.FC = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error("AdSense error:", e);
            }
        }, 50);
        return () => clearTimeout(timer);
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

interface PreviewPanelProps {
  onVisualEditSubmit: (prompt: string) => void;
}


const PreviewPanel: React.FC<PreviewPanelProps> = ({ onVisualEditSubmit }) => {
    const { generatedCode, appMode, generatedFlashcards, prompt } = useAppContext();
    const [viewMode, setViewMode] = useState<'app' | 'code'>('app');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [qrError, setQrError] = useState<string | null>(null);
    const [isQrLoading, setIsQrLoading] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isVisualEditMode, setIsVisualEditMode] = useState(false);
    const [selectedElementData, setSelectedElementData] = useState<{ selector: string; rect: DOMRect; } | null>(null);

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

        function getCssSelector(el) {
            if (!(el instanceof Element)) return 'body';
            if (el.id) return '#' + el.id;
            
            const path = [];
            while (el && el.nodeType === Node.ELEMENT_NODE) {
                let selector = el.nodeName.toLowerCase();
                if (el.id) {
                    selector = '#' + el.id;
                    path.unshift(selector);
                    break;
                } else {
                    let sib = el;
                    let nth = 1;
                    while (sib = sib.previousElementSibling) {
                        if (sib.nodeName.toLowerCase() === selector) nth++;
                    }
                    if (nth !== 1) {
                        selector += ':nth-of-type(' + nth + ')';
                    }
                }
                path.unshift(selector);
                el = el.parentNode;
                if (el === document.body) {
                    path.unshift('body');
                    break;
                }
            }
            return path.join(' > ');
        }

        const handleMouseOver = e => {
            if (!visualEditEnabled || e.target === document.body) return;
            const rect = e.target.getBoundingClientRect();
            currentOverlay.style.display = 'block';
            currentOverlay.style.width = rect.width + 'px';
            currentOverlay.style.height = rect.height + 'px';
            currentOverlay.style.top = rect.top + window.scrollY + 'px';
            currentOverlay.style.left = rect.left + window.scrollX + 'px';
        };

        const handleMouseOut = e => {
            if (!visualEditEnabled) return;
            currentOverlay.style.display = 'none';
        }

        const handleClick = e => {
            if (!visualEditEnabled) return;
            e.preventDefault();
            e.stopPropagation();
            const selector = getCssSelector(e.target);
            const rect = e.target.getBoundingClientRect();
            window.parent.postMessage({ type: 'ELEMENT_SELECTED', selector, rect: JSON.parse(JSON.stringify(rect)) }, '*');
        };

        window.addEventListener('message', (event) => {
            if (event.data.type === 'VISUAL_EDIT_MODE_STATUS') {
                visualEditEnabled = event.data.enabled;
                if (!visualEditEnabled) {
                    currentOverlay.style.display = 'none';
                }
            }
        });
        
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
        document.addEventListener('click', handleClick, true); // Use capture to prevent other clicks
    </script>
    `;

    const getSrcDoc = () => {
        if (!generatedCode) return '';
        if (generatedCode.includes('</body>')) {
            return generatedCode.replace('</body>', `${visualEditScript}</body>`);
        }
        return generatedCode + visualEditScript;
    };


    useEffect(() => {
        setViewMode('app');
    }, [appMode]);
    
     useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.source !== iframeRef.current?.contentWindow) return;
            if (event.data.type === 'ELEMENT_SELECTED') {
                setSelectedElementData({ selector: event.data.selector, rect: event.data.rect });
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        // When generatedCode updates or mode changes, inform the iframe
        iframeRef.current?.contentWindow?.postMessage({
            type: 'VISUAL_EDIT_MODE_STATUS',
            enabled: isVisualEditMode
        }, '*');
    }, [isVisualEditMode, generatedCode]);
    
    // When switching out of visual edit mode, clear selection
    useEffect(() => {
        if (!isVisualEditMode) {
            setSelectedElementData(null);
        }
    }, [isVisualEditMode]);
    
    useEffect(() => {
        if (appMode === 'native' && generatedCode) {
            setIsQrLoading(true);
            setQrCodeUrl('');
            setQrError(null);
            const snackUrl = `https://snack.expo.dev/?code=${encodeURIComponent(generatedCode)}`;
            
            getQRCodeLibrary().then(QRCode => QRCode.toDataURL(snackUrl, { width: 256, margin: 1 }))
                .then((url: string) => { setQrCodeUrl(url); setQrError(null); })
                .catch((err: Error) => {
                    console.error('QR code generation failed:', err);
                    setQrError(err.message || 'QR Code library failed to load.');
                    setQrCodeUrl('');
                }).finally(() => setIsQrLoading(false));
        } else {
            setQrCodeUrl('');
            setQrError(null);
            setIsQrLoading(false);
        }
    }, [generatedCode, appMode]);

    const handleVisualEditSubmit = (prompt: string) => {
        if (!selectedElementData) return;
        const finalPrompt = `Using the existing code, make the following change to the element identified by the selector "${selectedElementData.selector}": ${prompt}`;
        onVisualEditSubmit(finalPrompt);
        setSelectedElementData(null); // Hide bar after submission
    };
    
    const handleOpenInNewTab = () => {
        if (generatedCode) {
            const blob = new Blob([generatedCode], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }
    };

    const renderBuildMode = () => {
        if (!generatedCode) return <AdPlaceholder title="Your app is being planned..." />;
        if (viewMode === 'app') {
            return (
                <div className="w-full h-full relative" onClick={() => selectedElementData && setSelectedElementData(null)}>
                    <iframe
                        ref={iframeRef}
                        srcDoc={getSrcDoc()}
                        title="App Preview"
                        className={`w-full h-full border-0 ${isVisualEditMode ? 'pointer-events-auto' : ''}`}
                        sandbox="allow-scripts allow-forms"
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
        return (
            <div className="p-6 overflow-y-auto h-full">
                <FlashcardDisplay cards={generatedFlashcards} topic={prompt} />
            </div>
        );
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
            case 'form': return renderBuildMode();
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
                        <button
                            onClick={() => setIsVisualEditMode(!isVisualEditMode)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${isVisualEditMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            <MousePointerClickIcon className="w-4 h-4" />
                            <span>Visual Edit</span>
                        </button>
                     )}
                </div>
                <div className="flex items-center space-x-2">
                    {showOpenInNewTabButton && (
                        <button
                            onClick={handleOpenInNewTab}
                            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                            title="Open in new tab"
                            aria-label="Open in new tab"
                        >
                            <ExternalLinkIcon className="w-5 h-5" />
                        </button>
                    )}
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
            </header>
            <div className="flex-1 bg-gray-100 overflow-hidden relative">{renderContent()}</div>
        </div>
    );
};

// --- Sub-components for cleaner rendering logic ---

const CodeViewer: React.FC<{ code: string }> = ({ code }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

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
    type Tab = 'html' | 'css' | 'js';
    const [activeTab, setActiveTab] = useState<Tab>('html');
    const [html, setHtml] = useState('');
    const [css, setCss] = useState('');
    const [js, setJs] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!code) return;

        const jsRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/i;
        const jsMatch = code.match(jsRegex);
        const jsContent = jsMatch && jsMatch[1] ? jsMatch[1].trim() : '// No JavaScript found in script tag.';
        setJs(jsContent);

        const cssRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/i;
        const cssMatch = code.match(cssRegex);
        const cssContent = cssMatch && cssMatch[1] ? cssMatch[1].trim() : '/*\n This app uses Tailwind CSS for styling.\n Styles are applied directly as classes in the HTML tab.\n*/';
        setCss(cssContent);

        const htmlContent = code.replace(jsRegex, '').replace(cssRegex, '').trim();
        setHtml(htmlContent);

        setActiveTab('html');
    }, [code]);

    const handleCopy = () => {
        let contentToCopy = '';
        if (activeTab === 'html') contentToCopy = html;
        else if (activeTab === 'css') contentToCopy = css;
        else if (activeTab === 'js') contentToCopy = js;

        navigator.clipboard.writeText(contentToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const TabButton: React.FC<{ tab: Tab; label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                    ? 'text-white border-b-2 border-indigo-400'
                    : 'text-gray-400 hover:text-white'
            }`}
        >
            {label}
        </button>
    );

    const CodeBlock: React.FC<{ language: string, children: string }> = ({ language, children }) => (
        <div className="h-full overflow-auto">
             <pre className="p-4 h-full"><code className={`language-${language}`}>{children}</code></pre>
        </div>
    );
    
    return (
        <div className="w-full h-full bg-gray-900 text-white font-mono text-sm flex flex-col">
            <header className="flex-shrink-0 bg-gray-800 flex justify-between items-center border-b border-gray-700">
                <div className="flex">
                    <TabButton tab="html" label="HTML" />
                    <TabButton tab="css" label="CSS" />
                    <TabButton tab="js" label="JavaScript" />
                </div>
                <button onClick={handleCopy} className="mr-3 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md text-xs transition-colors">
                    {isCopied ? <><CheckIcon className="w-4 h-4 text-green-400" /><span>Copied!</span></> : <><ClipboardIcon className="w-4 h-4" /><span>Copy</span></>}
                </button>
            </header>
            <div className="flex-1 relative overflow-hidden">
                {activeTab === 'html' && <CodeBlock language="html">{html}</CodeBlock>}
                {activeTab === 'css' && <CodeBlock language="css">{css}</CodeBlock>}
                {activeTab === 'js' && <CodeBlock language="javascript">{js}</CodeBlock>}
            </div>
        </div>
    );
};

const AdPlaceholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="text-center text-gray-500 mb-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">The preview will appear here. In the meantime, here's a word from our sponsors.</p>
        </div>
        <div className="w-full max-w-lg h-auto min-h-[250px] bg-white border border-dashed border-gray-300 rounded-lg p-2"><AdUnit /></div>
    </div>
);

const NativePlaceholder: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-gray-400"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Native App Preview</h3>
            <p className="mt-1 text-sm text-gray-500">Your generated native app will appear here.</p>
        </div>
    </div>
);

const NativePreview: React.FC<{ generatedCode: string; qrCodeUrl: string; qrError: string | null; isQrLoading: boolean; }> = ({ generatedCode, qrCodeUrl, qrError, isQrLoading }) => {
    const snackUrl = `https://snack.expo.dev/embedded?platform=web&preview=true&theme=light&waitForData=true&code=${encodeURIComponent(generatedCode)}`;
    const snackDirectUrl = `https://snack.expo.dev/?code=${encodeURIComponent(generatedCode)}`;
    return (
        <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center p-4 bg-gray-100 gap-8 overflow-y-auto">
            <div className="flex-shrink-0"><PhoneFrame><iframe src={snackUrl} title="Native App Preview" className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation" /></PhoneFrame></div>
            <div className="flex-grow max-w-md w-full space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Test on Your Device</h3>
                    <p className="text-sm text-gray-600 mb-4">Use the <a href="https://expo.dev/go" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium underline">Expo Go</a> app to get a true native preview.</p>
                    <div className="bg-white p-2 rounded-lg border border-gray-200 inline-block">
                        <div className="w-40 h-40 flex items-center justify-center">
                            {isQrLoading ? <span className="text-sm text-gray-500">Generating...</span> : qrCodeUrl ? <img src={qrCodeUrl} alt="Expo Snack QR Code" width="160" height="160" /> : <div className="text-center text-xs text-red-600 p-2">{qrError}</div>}
                        </div>
                    </div>
                    <a href={snackDirectUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        Open in Expo Snack
                    </a>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="font-bold text-lg text-gray-800">Run Locally</h4>
                    <p className="text-sm text-gray-600 mt-1 mb-4">Follow these steps in your terminal to run the app on your own machine.</p>
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
};

const FlashcardPlaceholder: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-gray-400"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h4M7 11h7"/></svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Flashcards</h3>
            <p className="mt-1 text-sm text-gray-500">Your generated flashcards will appear here.</p>
        </div>
    </div>
);

export default PreviewPanel;