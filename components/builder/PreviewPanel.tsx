import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { generateDocumentation } from '../../services/geminiService';
import { ClipboardIcon, CheckIcon, MousePointerClickIcon, ExternalLinkIcon, PhoneIcon, DesktopIcon, RefreshCwIcon, CodeBracketIcon, TerminalIcon, FileTextIcon, ChevronDownIcon, GitHubIcon, SearchIcon, XIcon, VercelIcon, PuzzleIcon, ClockIcon, HtmlIcon, CssIcon, TsIcon, JsonIcon, ReactIcon, ViteIcon, BrainCircuitIcon } from '../common/Icons';
import VisualEditBar from './VisualEditBar';
import { AgentTestAction, Version } from '../pages/AppBuilderPage';
import { GitHubPushModal } from './GitHubPushModal';
import { VercelPushModal } from './VercelPushModal';
import { IntegrationsModal } from './IntegrationsModal';
import { IntegrationDetailsModal } from './IntegrationDetailsModal';
import { IntegrationType, GenerationStatus, ConsoleMessage } from '../../types';
import GenerationLoader from './GenerationLoader';

declare global {
    interface Window {
        QRCode: any;
        html2canvas: any;
        JSZip: any;
    }
}

const FileIcon: React.FC<{ filename: string }> = ({ filename }) => {
    const lowerFilename = filename.toLowerCase();
    if (lowerFilename.endsWith('.html')) return <HtmlIcon className="w-5 h-5 text-orange-400" />;
    if (lowerFilename.endsWith('.css')) return <CssIcon className="w-5 h-5 text-blue-400" />;
    if (lowerFilename.endsWith('.js')) return <TsIcon className="w-5 h-5 text-yellow-400" />;
    if (lowerFilename.endsWith('.jsx')) return <ReactIcon className="w-5 h-5 text-blue-300" />;
    if (lowerFilename.endsWith('.tsx')) return <ReactIcon className="w-5 h-5 text-blue-300" />;
    if (lowerFilename.endsWith('vite.config.js') || lowerFilename.endsWith('vite.config.ts')) return <ViteIcon className="w-5 h-5 text-purple-400" />;
    if (lowerFilename.endsWith('.json')) return <JsonIcon className="w-5 h-5 text-green-400" />;
    if (lowerFilename.endsWith('.md')) return <FileTextIcon className="w-5 h-5 text-gray-400" />;
    return <FileTextIcon className="w-5 h-5 text-gray-400" />;
};

const FileExplorer: React.FC<{
    files: { [path: string]: string };
    onFileContentChange: (path: string, content: string) => void;
}> = ({ files, onFileContentChange }) => {
    const [selectedFile, setSelectedFile] = useState(Object.keys(files)[0] || null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        // If the selected file is no longer in the files list (e.g., after a revert), select the first available file.
        if (selectedFile && !files[selectedFile]) {
            setSelectedFile(Object.keys(files)[0] || null);
        }
    }, [files, selectedFile]);


    const handleCopy = () => {
        if (!selectedFile) return;
        navigator.clipboard.writeText(files[selectedFile]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (selectedFile) {
            onFileContentChange(selectedFile, e.target.value);
        }
    };

    const handleDownload = () => {
        const zip = new window.JSZip();
        Object.keys(files).forEach(filename => {
            zip.file(filename, files[filename]);
        });
        zip.generateAsync({ type: "blob" }).then(function(content: any) {
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `project.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    };

    return (
        <div className="flex w-full h-full bg-[#161B22] rounded-lg overflow-hidden">
            <div className="w-48 bg-black/30 border-r border-white/10 p-2 flex flex-col">
                <h3 className="text-xs font-bold uppercase text-gray-500 px-2 mb-2 flex-shrink-0">Files</h3>
                <div className="flex-grow overflow-y-auto">
                    {Object.keys(files).map(filename => (
                        <button 
                            key={filename} 
                            onClick={() => setSelectedFile(filename)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded ${selectedFile === filename ? 'bg-indigo-500/30 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                        >
                            <FileIcon filename={filename} />
                            <span className="truncate">{filename}</span>
                        </button>
                    ))}
                </div>
                <button onClick={handleDownload} className="w-full mt-4 flex-shrink-0 text-center px-3 py-1.5 border border-white/20 text-sm font-medium rounded-full text-gray-300 bg-white/10 hover:bg-white/20">
                    Download .zip
                </button>
            </div>
            <div className="flex-1 flex flex-col font-mono text-sm text-white overflow-hidden">
                {selectedFile ? (
                    <>
                        <div className="flex-shrink-0 bg-[#161B22]/80 backdrop-blur-sm z-10 p-3 border-b border-white/10 flex justify-between items-center">
                            <span className="text-gray-300">{selectedFile}</span>
                             <button onClick={handleCopy} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md text-xs transition-colors">
                                {isCopied ? <><CheckIcon className="w-4 h-4 text-green-400" /><span>Copied!</span></> : <><ClipboardIcon className="w-4 h-4" /><span>Copy Code</span></>}
                            </button>
                        </div>
                        <div className="flex-1 relative">
                            <textarea
                                value={files[selectedFile] || ''}
                                onChange={handleCodeChange}
                                className="absolute inset-0 w-full h-full bg-[#161B22] p-4 resize-none focus:outline-none text-white font-mono leading-relaxed"
                                spellCheck="false"
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">Select a file to view or edit</div>
                )}
            </div>
        </div>
    );
};

const HistoryViewer: React.FC<{ history: Version[], onRevert: (version: Version) => void }> = ({ history, onRevert }) => {
    if (history.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No version history yet. Refine the code to create versions.</div>;
    }

    return (
        <div className="w-full h-full p-4 overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-200 mb-4">Version History</h3>
            <ul className="space-y-3">
                {history.slice().reverse().map((version, index) => (
                    <li key={version.timestamp} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-300">{`Version ${history.length - index}`}</p>
                            <p className="text-sm text-gray-400">Refinement at {new Date(version.timestamp).toLocaleTimeString()}</p>
                        </div>
                        <button onClick={() => onRevert(version)} className="px-3 py-1.5 text-sm font-medium rounded-full bg-indigo-600 text-white hover:bg-indigo-700">
                            Revert
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const ConsoleViewer: React.FC<{ messages: ConsoleMessage[], onDebug: (error: ConsoleMessage) => void, onClear: () => void }> = ({ messages, onDebug, onClear }) => (
    <div className="w-full h-full bg-[#161B22] text-white font-mono text-sm rounded-lg flex flex-col">
        <div className="flex-shrink-0 flex justify-between items-center gap-4 border-b border-gray-700 p-2">
            <p className="px-2 text-xs font-semibold text-gray-400">Console</p>
            <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-300">Clear</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {messages.length === 0 ? (
                <p className="text-gray-600">No logs yet...</p>
            ) : (
                messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-2 p-1 rounded ${msg.type === 'error' ? 'bg-red-500/10 text-red-300' : 'text-gray-300'}`}>
                        <span className="text-gray-600 mt-0.5">&gt;</span>
                        <div className="flex-1">
                            <pre className="whitespace-pre-wrap break-words">{msg.content.map(c => typeof c === 'object' ? JSON.stringify(c, null, 2) : String(c)).join(' ')}</pre>
                             {msg.type === 'error' && (
                                <button onClick={() => onDebug(msg)} className="mt-2 flex items-center gap-2 px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-full">
                                    <BrainCircuitIcon className="w-4 h-4" />
                                    Debug with AI
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

const DesktopFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden">
        {children}
    </div>
);

const MobileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="relative mx-auto border-gray-600 bg-gray-800 border-[8px] rounded-[2rem] h-[90%] max-h-[700px] w-auto aspect-[9/19] shadow-xl">
        <div className="rounded-[1.5rem] overflow-hidden w-full h-full bg-white">{children}</div>
    </div>
);

const DocsModal: React.FC<{ isOpen: boolean, onClose: () => void, content: string }> = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900/70 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-100">Generated Documentation</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-5 h-5"/></button>
                </header>
                <div className="prose prose-invert p-6 overflow-y-auto flex-1">
                    <pre className="whitespace-pre-wrap font-sans">{content}</pre>
                </div>
            </div>
        </div>
    );
};

interface PreviewPanelProps {
  files: { [path: string]: string } | null;
  onFileContentChange: (path: string, content: string) => void;
  onVisualEditSubmit: (prompt: string) => void;
  onScreenshotTaken: (dataUrl: string) => void;
  isAgentTesting: boolean;
  agentTestAction: AgentTestAction | null;
  onTestComplete: () => void;
  activePreviewMode: 'viewer' | 'editor' | 'history' | 'console';
  setActivePreviewMode: (mode: 'viewer' | 'editor' | 'history' | 'console') => void;
  onAnalyzeRequest: () => void;
  onDebugError: (error: ConsoleMessage, files: { [path: string]: string }) => void;
  vercelProject: { id: string; name: string; url: string; } | null;
  onVercelDeploySuccess: (projectInfo: { id: string; name: string; url: string; }) => void;
  githubRepoUrl: string | null;
  onGitHubPushSuccess: (url: string) => void;
  status: GenerationStatus;
  history: Version[];
  onRevertToVersion: (version: Version) => void;
}

const PreviewPanel = forwardRef<{ takeScreenshot: () => Promise<string> }, PreviewPanelProps>(({ 
    files, onFileContentChange, onVisualEditSubmit, onScreenshotTaken, onTestComplete,
    activePreviewMode, setActivePreviewMode, onAnalyzeRequest, onDebugError,
    vercelProject, onVercelDeploySuccess, githubRepoUrl, onGitHubPushSuccess, status,
    history, onRevertToVersion
}, ref) => {
    const { appMode, agents, selectedAgentId, selectedModel } = useAppContext();
    const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isVisualEditMode, setIsVisualEditMode] = useState(false);
    const [visualEditBarState, setVisualEditBarState] = useState<{ isVisible: boolean; top: number; left: number; width: number; } | null>(null);
    const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
    const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);
    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
    const [documentation, setDocumentation] = useState('');
    const [isGeneratingDocs, setIsGeneratingDocs] = useState(false);
    const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);
    const [integrationDetails, setIntegrationDetails] = useState<IntegrationType | null>(null);
    const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
    const selectedAgent = agents.find(agent => agent.id === selectedAgentId);
    
    const isLoading = ['planning', 'generating', 'reviewing', 'testing'].includes(status);

    const takeScreenshot = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            const iframe = iframeRef.current;
            if (iframe && iframe.contentDocument?.body && window.html2canvas) {
                 setTimeout(() => { // ensure content is rendered
                    window.html2canvas(iframe.contentDocument.body, { useCORS: true, allowTaint: true })
                    .then((canvas: any) => resolve(canvas.toDataURL('image/jpeg')))
                    .catch((err: Error) => reject(err));
                 }, 500);
            } else {
                reject(new Error("Screenshot prerequisites not met."));
            }
        });
    };

    useImperativeHandle(ref, () => ({ takeScreenshot }));
    
    useEffect(() => {
        const handleConsoleMessage = (event: MessageEvent) => {
            if (event.source !== iframeRef.current?.contentWindow) return;
            const { type, content } = event.data;
            if (type === 'log' || type === 'error' || type === 'warn') {
                setConsoleMessages(prev => [...prev, { type, content }]);
                if(type === 'error' && activePreviewMode !== 'console') {
                    setActivePreviewMode('console');
                }
            }
        };
        window.addEventListener('message', handleConsoleMessage);
        return () => window.removeEventListener('message', handleConsoleMessage);
    }, [activePreviewMode, setActivePreviewMode]);

    useEffect(() => {
        if (!files) return;
        setConsoleMessages([]); // Clear console on new code
        updateIframeContent();
    }, [files]);


    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;
        const doc = iframe.contentDocument;

        const handleIframeClick = (e: MouseEvent) => {
            e.preventDefault(); e.stopPropagation();
            const target = e.target as HTMLElement;
            const rect = target.getBoundingClientRect();
            setVisualEditBarState({ isVisible: true, top: rect.bottom + iframe.offsetTop, left: rect.left + iframe.offsetLeft, width: rect.width });
        };
        
        if (isVisualEditMode && activePreviewMode === 'viewer') {
            doc.body.addEventListener('click', handleIframeClick);
            doc.body.style.cursor = 'crosshair';
        }

        return () => {
            if (doc && doc.body) {
                doc.body.removeEventListener('click', handleIframeClick);
                doc.body.style.cursor = 'default';
            }
        };
    }, [isVisualEditMode, activePreviewMode]);
    
    const handleSelectIntegration = (type: IntegrationType) => {
        setIsIntegrationsModalOpen(false);
        setIntegrationDetails(type);
    };

    const handleAddIntegrationWithDetails = (details: Record<string, string>) => {
        if (!integrationDetails) return;

        let prompt = '';
        switch (integrationDetails) {
            case 'supabase':
                prompt = `Integrate the Supabase v2 JavaScript client into the app. Add its CDN script to the head of index.html. Then, in script.js, add code to initialize the client with the URL '${details.url}' and the anon key '${details.anonKey}'. Also, add a simple example function that fetches and logs data from a 'products' table to the console when the page loads to demonstrate it's working.`;
                break;
            case 'stripe':
                prompt = `Integrate Stripe Payments. Add the Stripe.js v3 script to the head of index.html. In script.js, initialize a Stripe object using the publishable key '${details.publishableKey}'. In the body of index.html, add a 'Checkout' button. In the script, add an event listener to this button that, when clicked, redirects to a Stripe Checkout session. Use placeholder data for the checkout session for demonstration purposes. Ensure the code is vanilla JavaScript.`;
                break;
            case 'gemini':
                prompt = `Integrate the Google Gemini API for in-app AI features. Add a new section to the UI in index.html with an input field for a user to enter their Gemini API key, a textarea for a prompt, a 'Generate' button, and a preformatted block to display the result. In script.js, add an event listener to the button. When clicked, it should take the key and prompt from the inputs, make a direct fetch call to the Google AI Generative Language API v1beta endpoint for 'gemini-2.5-flash:generateContent', and display the text response in the result block. Handle loading and error states. Style it appropriately in style.css.`;
                break;
        }

        if (prompt) {
            onVisualEditSubmit(prompt);
        }
        setIntegrationDetails(null); // Close the details modal
    };

    const getIframeSrcDoc = () => {
        if (!files) return '';
        if (appMode === 'native' || appMode === 'project') return '';

        let html = files['index.html'] || '<html><head></head><body></body></html>';
        const css = files['style.css'] || '';
        const js = files['script.js'] || '';
    
        const consoleLoggerScript = `
            <script>
                const originalConsoleLog = console.log;
                const originalConsoleError = console.error;
                const originalConsoleWarn = console.warn;
                console.log = (...args) => {
                    window.parent.postMessage({ type: 'log', content: args }, '*');
                    originalConsoleLog.apply(console, args);
                };
                console.error = (...args) => {
                    window.parent.postMessage({ type: 'error', content: args }, '*');
                    originalConsoleError.apply(console, args);
                };
                console.warn = (...args) => {
                    window.parent.postMessage({ type: 'warn', content: args }, '*');
                    originalConsoleWarn.apply(console, args);
                };
                window.onerror = (message, source, lineno, colno, error) => {
                    window.parent.postMessage({ type: 'error', content: [message, 'at', source + ':' + lineno + ':' + colno] }, '*');
                };
            </script>
        `;
        
        html = html.replace('</head>', `${consoleLoggerScript}</head>`);

        if (css) {
             html = html.replace('<style></style>', `<style>${css}</style>`);
        }
    
        if(js) {
            html = html.replace('</body>', `<script type="module">${js}</script></body>`);
        }

        return html;
    };
    
    const updateIframeContent = () => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const html = getIframeSrcDoc();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        iframe.src = url;

        iframe.onload = () => {
            URL.revokeObjectURL(url); // Clean up the blob URL
            if (status === 'generating' || status === 'planning' ) {
                takeScreenshot().then(onScreenshotTaken).catch(err => console.error("Initial screenshot failed:", err));
            }
        };
    };

    const handleOpenInNewTab = () => {
        if (!files) return;
        const blob = new Blob([getIframeSrcDoc()], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        URL.revokeObjectURL(url);
    };
    
    const handleGenerateDocs = async () => {
        const code = files ? Object.values(files).join('\n\n--- FILE ---\n\n') : '';
        if (!code || isGeneratingDocs) return;
        setIsGeneratingDocs(true);
        try {
            const docs = await generateDocumentation(code, selectedModel, selectedAgent?.systemInstruction);
            setDocumentation(docs);
            setIsDocsModalOpen(true);
        } catch (error) {
            console.error("Failed to generate documentation:", error);
        } finally {
            setIsGeneratingDocs(false);
        }
    };
    
    const handleDebug = (error: ConsoleMessage) => {
        if (!files) return;
        onDebugError(error, files);
    };

    const canDeploy = ['build', 'form', 'document', 'component', 'multifile', 'fullstack'].includes(appMode);

    const renderContent = () => {
        if (isLoading && !files) {
            return <GenerationLoader status={status} />;
        }
        if (!files || Object.keys(files).length === 0) return <div className="flex items-center justify-center h-full text-gray-500">Preview will appear here...</div>;

        if (appMode === 'project') {
             return (
                <div className="p-4 h-full flex flex-col gap-4">
                    <FileExplorer files={files} onFileContentChange={onFileContentChange} />
                    <div className="p-4 bg-black/30 rounded-lg text-sm text-gray-400 border border-white/10">
                        <h4 className="font-bold text-gray-200">How to Run This Project</h4>
                        <ol className="list-decimal list-inside mt-2 space-y-1 font-mono">
                            <li>Download the project as a <code className="text-xs bg-white/10 p-1 rounded">.zip</code> file.</li>
                            <li>Unzip the file and open the folder in your terminal.</li>
                            <li>Run <code className="text-xs bg-white/10 p-1 rounded">npm install</code> to install dependencies.</li>
                            <li>Run <code className="text-xs bg-white/10 p-1 rounded">npm run dev</code> to start the local server.</li>
                        </ol>
                    </div>
                </div>
            );
        }

        switch (activePreviewMode) {
            case 'editor': return <FileExplorer files={files} onFileContentChange={onFileContentChange} />;
            case 'history': return <HistoryViewer history={history} onRevert={onRevertToVersion} />;
            case 'console': return <ConsoleViewer messages={consoleMessages} onDebug={handleDebug} onClear={() => setConsoleMessages([])}/>;
            default:
                if (appMode === 'native') {
                     return <div className="p-4 h-full"><FileExplorer files={files} onFileContentChange={onFileContentChange} /></div>;
                }
                const FrameComponent = deviceMode === 'desktop' ? DesktopFrame : MobileFrame;
                return (
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <FrameComponent>
                             <iframe ref={iframeRef} title="App Preview" className="w-full h-full border-0" sandbox="allow-scripts allow-forms allow-same-origin" />
                        </FrameComponent>
                    </div>
                );
        }
    };
    
    return (
        <div className="relative flex flex-col h-full w-full text-white">
            {isLoading && files && (
                <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm">
                    <GenerationLoader status={status} />
                </div>
            )}
            <div className="flex-1 overflow-hidden">{renderContent()}</div>
            
            {files && Object.keys(files).length > 0 && (
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="flex items-center gap-1 bg-black/30 backdrop-blur-lg rounded-full shadow-2xl border border-white/10 p-1.5 text-gray-200">
                        {/* Left Side */}
                        <button onClick={() => setIsIntegrationsModalOpen(true)} className="p-2.5 rounded-full hover:bg-white/10 transition-colors" aria-label="Add Integration"><PuzzleIcon className="w-5 h-5" /></button>
                        <button onClick={onAnalyzeRequest} className="p-2.5 rounded-full hover:bg-white/10 transition-colors" aria-label="Analyze UI/UX"><SearchIcon className="w-5 h-5" /></button>
                        <button onClick={handleGenerateDocs} disabled={isGeneratingDocs} className="p-2.5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50" aria-label="Generate Documentation"><FileTextIcon className="w-5 h-5" /></button>
                        <button onClick={() => setIsGitHubModalOpen(true)} className="p-2.5 rounded-full hover:bg-white/10 transition-colors" aria-label="Push to GitHub"><GitHubIcon className="w-5 h-5" /></button>
                        {canDeploy && (
                             <button onClick={() => setIsVercelModalOpen(true)} className="p-2.5 rounded-full hover:bg-white/10 transition-colors" aria-label="Deploy to Vercel"><VercelIcon className="w-5 h-5" /></button>
                        )}
                        
                        <div className="w-px h-6 bg-white/10 mx-1"></div>
                        
                        {/* Middle Controls */}
                        {activePreviewMode === 'viewer' && appMode !== 'native' && appMode !== 'project' && (
                            <>
                                <button onClick={() => setIsVisualEditMode(p => !p)} className={`p-2.5 rounded-full transition-colors ${isVisualEditMode ? 'bg-indigo-500 text-white' : 'hover:bg-white/10'}`} aria-label="Toggle visual edit mode"><MousePointerClickIcon className="w-5 h-5" /></button>
                                <div className="flex items-center bg-black/20 rounded-full p-0.5 ml-1">
                                    <button onClick={() => setDeviceMode('desktop')} className={`p-2 rounded-full transition-colors ${deviceMode === 'desktop' ? 'bg-white/10 shadow-sm' : 'text-gray-400 hover:text-white'}`} aria-label="Desktop view"><DesktopIcon className="w-5 h-5" /></button>
                                    <button onClick={() => setDeviceMode('mobile')} className={`p-2 rounded-full transition-colors ${deviceMode === 'mobile' ? 'bg-white/10 shadow-sm' : 'text-gray-400 hover:text-white'}`} aria-label="Mobile view"><PhoneIcon className="w-5 h-5" /></button>
                                </div>
                            </>
                        )}
                         <div className="relative group ml-1">
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-white/10 text-sm font-medium transition-colors">
                                <span>{activePreviewMode.charAt(0).toUpperCase() + activePreviewMode.slice(1)}</span><ChevronDownIcon className="w-4 h-4 opacity-50"/>
                            </button>
                             <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-gray-900/80 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg hidden group-hover:block z-10 text-sm p-2">
                                <button onClick={() => setActivePreviewMode('editor')} className={`w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md ${activePreviewMode === 'editor' && 'text-indigo-400'}`}><CodeBracketIcon className="w-5 h-5"/>Editor</button>
                                <button onClick={() => setActivePreviewMode('viewer')} className={`w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md ${activePreviewMode === 'viewer' && 'text-indigo-400'}`}><DesktopIcon className="w-5 h-5"/>App Viewer</button>
                                <button onClick={() => setActivePreviewMode('history')} className={`w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md ${activePreviewMode === 'history' && 'text-indigo-400'}`}><ClockIcon className="w-5 h-5"/>History</button>
                                <button onClick={() => setActivePreviewMode('console')} className={`w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md ${activePreviewMode === 'console' && 'text-indigo-400'}`}><TerminalIcon className="w-5 h-5"/>Console</button>
                            </div>
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-1"></div>

                        {/* Right Side */}
                        <button onClick={handleOpenInNewTab} className="p-2.5 rounded-full hover:bg-white/10 transition-colors" aria-label="Open in new tab"><ExternalLinkIcon className="w-5 h-5" /></button>
                        {activePreviewMode === 'viewer' && (
                            <button onClick={() => iframeRef.current?.contentWindow?.location.reload()} className="p-2.5 rounded-full hover:bg-white/10 transition-colors" aria-label="Refresh preview"><RefreshCwIcon className="w-5 h-5" /></button>
                        )}
                    </div>
                </div>
            )}
             {visualEditBarState?.isVisible && <VisualEditBar position={visualEditBarState} onSubmit={(prompt) => { onVisualEditSubmit(prompt); setVisualEditBarState(null); setIsVisualEditMode(false); }} onClose={() => { setVisualEditBarState(null); setIsVisualEditMode(false); }} />}
             {files && <GitHubPushModal isOpen={isGitHubModalOpen} onClose={() => setIsGitHubModalOpen(false)} files={files} repoUrl={githubRepoUrl} onPushSuccess={onGitHubPushSuccess} />}
             {files && <VercelPushModal isOpen={isVercelModalOpen} onClose={() => setIsVercelModalOpen(false)} files={files} project={vercelProject} onDeploySuccess={onVercelDeploySuccess} />}
             <DocsModal isOpen={isDocsModalOpen} onClose={() => setIsDocsModalOpen(false)} content={documentation} />
             <IntegrationsModal isOpen={isIntegrationsModalOpen} onClose={() => setIsIntegrationsModalOpen(false)} onSelectIntegration={handleSelectIntegration} />
             {integrationDetails && (
                <IntegrationDetailsModal 
                    integrationType={integrationDetails} 
                    onClose={() => setIntegrationDetails(null)} 
                    onSubmit={handleAddIntegrationWithDetails} 
                />
             )}
        </div>
    );
});

export default PreviewPanel;
