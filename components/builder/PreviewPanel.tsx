
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FlashcardDisplay } from '../builder/FlashcardDisplay';
import { ClipboardIcon, CheckIcon, MousePointerClickIcon, ExternalLinkIcon, PhoneIcon, DesktopIcon, RefreshCwIcon, CodeBracketIcon, TerminalIcon, FileTextIcon, ChevronDownIcon, CodeIcon } from '../common/Icons';
import VisualEditBar from './VisualEditBar';
import { AgentTestAction } from '../pages/AppBuilderPage';

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

interface PreviewPanelProps {
  onVisualEditSubmit: (prompt: string) => void;
  onScreenshotTaken: (dataUrl: string) => void;
  isAgentTesting: boolean;
  agentTestAction: AgentTestAction | null;
  onTestComplete: () => void;
  activePreviewMode: 'viewer' | 'editor' | 'console';
  setActivePreviewMode: (mode: 'viewer' | 'editor' | 'console') => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
    onVisualEditSubmit, onScreenshotTaken, isAgentTesting, agentTestAction, onTestComplete,
    activePreviewMode, setActivePreviewMode
}) => {
    const { generatedCode, appMode } = useAppContext();
    const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isVisualEditMode, setIsVisualEditMode] = useState(false);
    const [visualEditBarState, setVisualEditBarState] = useState<{ isVisible: boolean; top: number; left: number; width: number; } | null>(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;

        const doc = iframe.contentDocument;

        const handleIframeClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const target = e.target as HTMLElement;
            const rect = target.getBoundingClientRect();
            
            setVisualEditBarState({
                isVisible: true,
                top: rect.bottom + iframe.offsetTop,
                left: rect.left + iframe.offsetLeft,
                width: rect.width,
            });
        };
        
        const closeVisualEdit = () => {
            setIsVisualEditMode(false);
            setVisualEditBarState(null);
        };

        if (isVisualEditMode && activePreviewMode === 'viewer') {
            doc.body.addEventListener('click', handleIframeClick);
            doc.body.style.cursor = 'crosshair';
            // Close visual edit mode if user switches preview mode
            if (activePreviewMode !== 'viewer') closeVisualEdit();
        }

        return () => {
            if (doc && doc.body) {
                doc.body.removeEventListener('click', handleIframeClick);
                doc.body.style.cursor = 'default';
            }
        };
    }, [isVisualEditMode, activePreviewMode]);
    

    const getSrcDoc = () => {
        if (!generatedCode) return '';
        return generatedCode;
    };

    const handleIframeLoad = () => {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow || !iframe.contentDocument?.body.innerHTML.trim()) return;
        
        setTimeout(() => {
            if (window.html2canvas) {
                window.html2canvas(iframe.contentDocument.body, { useCORS: true, allowTaint: true })
                    .then((canvas: any) => onScreenshotTaken(canvas.toDataURL('image/jpeg')))
                    .catch((err: Error) => console.error("Screenshot failed:", err));
            }
        }, 500);
    };

    const handleOpenInNewTab = () => {
        if (!generatedCode) return;
        const blob = new Blob([generatedCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    const renderContent = () => {
        if (!generatedCode) {
            return <div className="flex items-center justify-center h-full text-gray-500">Preview will appear here...</div>;
        }

        switch (activePreviewMode) {
            case 'editor':
                return <CodeViewer code={generatedCode} />;
            case 'console':
                return <ConsoleViewer />;
            case 'viewer':
            default:
                const FrameComponent = deviceMode === 'desktop' ? DesktopFrame : MobileFrame;
                return (
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <FrameComponent>
                             <iframe
                                ref={iframeRef}
                                srcDoc={getSrcDoc()}
                                onLoad={handleIframeLoad}
                                title="App Preview"
                                className="w-full h-full border-0"
                                sandbox="allow-scripts allow-forms allow-same-origin"
                            />
                        </FrameComponent>
                    </div>
                );
        }
    };
    
    return (
        <div className="relative flex flex-col h-full w-full text-white">
            <div className="flex-1 overflow-hidden">
                {renderContent()}
            </div>
            
            {generatedCode && (
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-lg rounded-full shadow-2xl border border-white/10 p-1.5 text-gray-200">
                        
                        {activePreviewMode === 'viewer' && (
                            <>
                                <button 
                                    onClick={() => setIsVisualEditMode(prev => !prev)}
                                    className={`p-2.5 rounded-full transition-colors ${isVisualEditMode ? 'bg-indigo-500 text-white' : 'hover:bg-white/10'}`}
                                    aria-label="Toggle visual edit mode"
                                >
                                    <MousePointerClickIcon className="w-5 h-5" />
                                </button>
                                <div className="w-px h-6 bg-white/10 mx-1"></div>

                                {/* Device Toggle */}
                                <div className="flex items-center bg-black/20 rounded-full p-0.5">
                                    <button
                                        onClick={() => setDeviceMode('desktop')}
                                        className={`p-2.5 rounded-full transition-colors ${deviceMode === 'desktop' ? 'bg-white/10 shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                        aria-label="Desktop view"
                                    >
                                        <DesktopIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setDeviceMode('mobile')}
                                        className={`p-2.5 rounded-full transition-colors ${deviceMode === 'mobile' ? 'bg-white/10 shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                        aria-label="Mobile view"
                                    >
                                        <PhoneIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="w-px h-6 bg-white/10 mx-1"></div>
                            </>
                        )}

                        {/* App Viewer Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-white/10 text-sm font-medium transition-colors">
                                <FileTextIcon className="w-5 h-5" />
                                <span>Viewer</span>
                                <ChevronDownIcon className="w-4 h-4 opacity-50"/>
                            </button>
                             <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-gray-900/80 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg hidden group-hover:block z-10 text-sm p-2">
                                <button onClick={() => setActivePreviewMode('editor')} className={`w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md ${activePreviewMode === 'editor' ? 'font-semibold text-gray-100' : 'text-gray-300'}`}>
                                    <CodeBracketIcon className="w-5 h-5 text-gray-400"/>Editor
                                </button>
                                <button onClick={() => setActivePreviewMode('viewer')} className={`w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md ${activePreviewMode === 'viewer' ? 'font-semibold text-gray-100' : 'text-gray-300'}`}>
                                    <ExternalLinkIcon className="w-5 h-5 text-gray-400"/>App Viewer
                                </button>
                                <button onClick={() => setActivePreviewMode('console')} className={`w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md ${activePreviewMode === 'console' ? 'font-semibold text-gray-100' : 'text-gray-300'}`}>
                                    <TerminalIcon className="w-5 h-5 text-gray-400"/>Console
                                </button>
                            </div>
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-1"></div>

                        {/* Right Side */}
                        <button
                            onClick={handleOpenInNewTab}
                            className="p-2.5 rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Open in new tab"
                        >
                            <ExternalLinkIcon className="w-5 h-5" />
                        </button>

                        {activePreviewMode === 'viewer' && (
                            <button
                                onClick={() => iframeRef.current?.contentWindow?.location.reload()}
                                className="p-2.5 rounded-full hover:bg-white/10 transition-colors"
                                aria-label="Refresh preview"
                            >
                                <RefreshCwIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            )}
             {visualEditBarState?.isVisible && (
                <VisualEditBar
                    position={visualEditBarState}
                    onSubmit={(prompt) => {
                        onVisualEditSubmit(prompt);
                        setVisualEditBarState(null);
                        setIsVisualEditMode(false);
                    }}
                    onClose={() => {
                        setVisualEditBarState(null);
                        setIsVisualEditMode(false);
                    }}
                />
            )}
        </div>
    );
};

export default PreviewPanel;
