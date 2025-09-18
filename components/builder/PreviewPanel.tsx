



import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { generateDocumentation } from '../../services/geminiService';
import { ClipboardIcon, CheckIcon, MousePointerClickIcon, ExternalLinkIcon, PhoneIcon, DesktopIcon, RefreshCwIcon, CodeBracketIcon, TerminalIcon, FileTextIcon, ChevronDownIcon, GitHubIcon, SearchIcon, XIcon, VercelIcon, PuzzleIcon } from '../common/Icons';
import VisualEditBar from './VisualEditBar';
import { AgentTestAction } from '../pages/AppBuilderPage';
import { GitHubPushModal } from './GitHubPushModal';
import { VercelPushModal } from './VercelPushModal';
import { IntegrationsModal } from './IntegrationsModal';
import { IntegrationDetailsModal } from './IntegrationDetailsModal';
import { IntegrationType, GenerationStatus } from '../../types';
import GenerationLoader from './GenerationLoader';

declare global {
    interface Window {
        QRCode: any;
        html2canvas: any;
    }
}

const CodeViewer: React.FC<{ code: string }> = ({ code }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => { navigator.clipboard.writeText(code); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };
    return (
        <div className="relative w-full h-full bg-[#161B22] text-white font-mono text-sm overflow-auto rounded-lg">
            <button onClick={handleCopy} className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md text-xs transition-colors">
                {isCopied ? <><CheckIcon className="w-4 h-4 text-green-400" /><span>Copied!</span></> : <><ClipboardIcon className="w-4 h-4" /><span>Copy Code</span></>}
            </button>
            <pre className="p-4 pt-12"><code>{code}</code></pre>
        </div>
    );
};

const ConsoleViewer: React.FC = () => (
    <div className="w-full h-full bg-[#161B22] text-white font-mono text-sm p-4 rounded-lg flex flex-col">
        <div className="flex-shrink-0 flex gap-4 border-b border-gray-700 mb-4">
            <button className="py-2 border-b-2 border-white text-white">Console</button>
            <button className="py-2 border-b-2 border-transparent text-gray-400">0 Errors</button>
            <button className="py-2 border-b-2 border-transparent text-gray-400">1 Info</button>
        </div>
        <div className="flex-1 text-gray-500 flex items-center justify-center">
            <p>No logs at the moment.</p>
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
  onVisualEditSubmit: (prompt: string) => void;
  onScreenshotTaken: (dataUrl: string) => void;
  isAgentTesting: boolean;
  agentTestAction: AgentTestAction | null;
  onTestComplete: () => void;
  activePreviewMode: 'viewer' | 'editor' | 'console';
  setActivePreviewMode: (mode: 'viewer' | 'editor' | 'console') => void;
  onAnalyzeRequest: () => void;
  vercelProject: { id: string; name: string; url: string; } | null;
  onVercelDeploySuccess: (projectInfo: { id: string; name: string; url: string; }) => void;
  githubRepoUrl: string | null;
  onGitHubPushSuccess: (url: string) => void;
  status: GenerationStatus;
}

const PreviewPanel = forwardRef<{ takeScreenshot: () => Promise<string> }, PreviewPanelProps>(({ 
    onVisualEditSubmit, onScreenshotTaken, onTestComplete,
    activePreviewMode, setActivePreviewMode, onAnalyzeRequest,
    vercelProject, onVercelDeploySuccess, githubRepoUrl, onGitHubPushSuccess, status
}, ref) => {
    const { generatedCode, appMode, agents, selectedAgentId, selectedModel } = useAppContext();
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
                prompt = `Integrate the Supabase v2 JavaScript client into the app. Add its CDN script to the head. Then, in the main script tag, add code to initialize the client with the URL '${details.url}' and the anon key '${details.anonKey}'. Also, add a simple example function that fetches and logs data from a 'products' table to the console when the page loads to demonstrate it's working.`;
                break;
            case 'stripe':
                prompt = `Integrate Stripe Payments. Add the Stripe.js v3 script to the head. In the main script tag, initialize a Stripe object using the publishable key '${details.publishableKey}'. In the body, add a 'Checkout' button. In the script, add an event listener to this button that, when clicked, redirects to a Stripe Checkout session. Use placeholder data for the checkout session for demonstration purposes. Ensure the code is vanilla JavaScript.`;
                break;
            case 'gemini':
                prompt = `Integrate the Google Gemini API for in-app AI features. Add a new section to the UI with an input field for a user to enter their Gemini API key, a textarea for a prompt, a 'Generate' button, and a preformatted block to display the result. In the main script tag, add an event listener to the button. When clicked, it should take the key and prompt from the inputs, make a direct fetch call to the Google AI Generative Language API v1beta endpoint for 'gemini-2.5-flash:generateContent', and display the text response in the result block. Handle loading and error states.`;
                break;
        }

        if (prompt) {
            onVisualEditSubmit(prompt);
        }
        setIntegrationDetails(null); // Close the details modal
    };


    const getSrcDoc = () => !generatedCode ? '' : generatedCode;

    const handleIframeLoad = () => {
        if (!iframeRef.current?.contentDocument?.body.innerHTML.trim()) return;
        takeScreenshot().then(onScreenshotTaken).catch(err => console.error("Initial screenshot failed:", err));
    };

    const handleOpenInNewTab = () => {
        if (!generatedCode) return;
        const blob = new Blob([generatedCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };
    
    const handleGenerateDocs = async () => {
        if (!generatedCode || isGeneratingDocs) return;
        setIsGeneratingDocs(true);
        try {
            const docs = await generateDocumentation(generatedCode, selectedModel, selectedAgent?.systemInstruction);
            setDocumentation(docs);
            setIsDocsModalOpen(true);
        } catch (error) {
            console.error("Failed to generate documentation:", error);
        } finally {
            setIsGeneratingDocs(false);
        }
    };

    const canDeploy = ['build', 'form', 'document', 'component'].includes(appMode);

    const renderContent = () => {
        if (isLoading && !generatedCode) {
            return <GenerationLoader status={status} />;
        }
        if (!generatedCode) return <div className="flex items-center justify-center h-full text-gray-500">Preview will appear here...</div>;
        switch (activePreviewMode) {
            case 'editor': return <CodeViewer code={generatedCode} />;
            case 'console': return <ConsoleViewer />;
            default:
                const FrameComponent = deviceMode === 'desktop' ? DesktopFrame : MobileFrame;
                return (
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <FrameComponent>
                             <iframe ref={iframeRef} srcDoc={getSrcDoc()} onLoad={handleIframeLoad} title="App Preview" className="w-full h-full border-0" sandbox="allow-scripts allow-forms allow-same-origin" />
                        </FrameComponent>
                    </div>
                );
        }
    };
    
    return (
        <div className="relative flex flex-col h-full w-full text-white">
            {isLoading && generatedCode && (
                <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm">
                    <GenerationLoader status={status} />
                </div>
            )}
            <div className="flex-1 overflow-hidden">{renderContent()}</div>
            
            {generatedCode && (
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
                        {activePreviewMode === 'viewer' && (
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
                                <span>Viewer</span><ChevronDownIcon className="w-4 h-4 opacity-50"/>
                            </button>
                             <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-gray-900/80 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg hidden group-hover:block z-10 text-sm p-2">
                                <button onClick={() => setActivePreviewMode('editor')} className={`w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md ${activePreviewMode === 'editor' && 'text-indigo-400'}`}><CodeBracketIcon className="w-5 h-5"/>Editor</button>
                                <button onClick={() => setActivePreviewMode('viewer')} className={`w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md ${activePreviewMode === 'viewer' && 'text-indigo-400'}`}><DesktopIcon className="w-5 h-5"/>App Viewer</button>
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
             <GitHubPushModal isOpen={isGitHubModalOpen} onClose={() => setIsGitHubModalOpen(false)} fileContent={generatedCode} filePath={appMode === 'native' ? 'App.js' : 'index.html'} repoUrl={githubRepoUrl} onPushSuccess={onGitHubPushSuccess} />
             <VercelPushModal isOpen={isVercelModalOpen} onClose={() => setIsVercelModalOpen(false)} fileContent={generatedCode} filePath={appMode === 'native' ? 'App.js' : 'index.html'} project={vercelProject} onDeploySuccess={onVercelDeploySuccess} />
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