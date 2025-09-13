import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FlashcardDisplay } from '../builder/FlashcardDisplay';
import { ClipboardIcon, CheckIcon } from '../common/Icons';

// Add QRCode and Sucrase to window interface to avoid TypeScript errors
declare global {
    interface Window {
        QRCode: any;
        sucrase: any;
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

// Helper function to wait for the Sucrase library to load.
const getSucrase = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (window.sucrase) return resolve(window.sucrase);
    let attempts = 0;
    const intervalId = setInterval(() => {
      if (window.sucrase) {
        clearInterval(intervalId);
        resolve(window.sucrase);
      } else if (attempts++ > 40) { // Try for ~10 seconds
        clearInterval(intervalId);
        reject(new Error('Sucrase preview builder failed to load. Please check your network connection and try refreshing the page.'));
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

const PreviewPanel: React.FC = () => {
    const { generatedCode, appMode, generatedFlashcards, prompt, generatedFileTree } = useAppContext();
    const [viewMode, setViewMode] = useState<'app' | 'code'>('app');
    const [isCopied, setIsCopied] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [qrError, setQrError] = useState<string | null>(null);
    const [isQrLoading, setIsQrLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState('src/App.tsx');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewBuilding, setIsPreviewBuilding] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const blobUrlsRef = useRef<string[]>([]);

    // Cleanup blob URLs on unmount or when new ones are created
    useEffect(() => {
      return () => {
        blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
        blobUrlsRef.current = [];
      };
    }, []);

    useEffect(() => {
        setViewMode('app');
    }, [appMode]);
    
    // In-browser build process for React web apps
    useEffect(() => {
        if (appMode === 'react_web' && generatedFileTree && viewMode === 'app') {
            const buildPreview = async () => {
                setIsPreviewBuilding(true);
                setPreviewError(null);
                setPreviewUrl(null);
                
                blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
                blobUrlsRef.current = [];

                try {
                    const sucrase = await getSucrase();
                    const fileUrlMap = new Map<string, string>();
                    const newBlobUrls: string[] = [];

                    for (const path in generatedFileTree) {
                        const content = generatedFileTree[path];
                        let blob: Blob;

                        if (path.endsWith('.tsx') || path.endsWith('.ts')) {
                            const transformed = sucrase.transform(content, {
                                transforms: ['typescript', 'jsx'],
                                production: true,
                            }).code;
                            blob = new Blob([transformed], { type: 'application/javascript' });
                        } else {
                            const mimeType = path.endsWith('.css') ? 'text/css' :
                                             path.endsWith('.js') ? 'application/javascript' :
                                             'text/plain';
                            blob = new Blob([content], { type: mimeType });
                        }
                        
                        const url = URL.createObjectURL(blob);
                        fileUrlMap.set(`/${path}`, url);
                        newBlobUrls.push(url);
                    }
                    blobUrlsRef.current = newBlobUrls;

                    const importMap = { imports: {} as Record<string, string> };
                    const pkgJson = generatedFileTree['package.json'];
                    if (pkgJson) {
                        const pkg = JSON.parse(pkgJson);
                        const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
                        for (const dep in dependencies) {
                           importMap.imports[dep] = `https://esm.sh/${dep}@${dependencies[dep]}`;
                           importMap.imports[`${dep}/`] = `https://esm.sh/${dep}@${dependencies[dep]}/`;
                        }
                    }

                    let htmlContent = generatedFileTree['index.html'];
                    if (!htmlContent) throw new Error('index.html not found in the project.');

                    htmlContent = htmlContent.replace(/(src|href)="(\/[^"]+)"/g, (match, attr, path) => {
                        return fileUrlMap.has(path) ? `${attr}="${fileUrlMap.get(path)}"` : match;
                    });

                    const importMapScript = `<script type="importmap">${JSON.stringify(importMap)}</script>`;
                    htmlContent = htmlContent.replace('</head>', `${importMapScript}</head>`);
                    
                    const finalHtmlBlob = new Blob([htmlContent], { type: 'text/html' });
                    const finalUrl = URL.createObjectURL(finalHtmlBlob);
                    blobUrlsRef.current.push(finalUrl);

                    setPreviewUrl(finalUrl);

                } catch (error: any) {
                    console.error("Failed to build preview:", error);
                    setPreviewError(error.message || "An unknown error occurred while building the preview.");
                } finally {
                    setIsPreviewBuilding(false);
                }
            };

            buildPreview();
        }
    }, [generatedFileTree, viewMode, appMode]);

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

    const handleCopy = () => {
        const codeToCopy = appMode === 'react_web' ? generatedFileTree?.[selectedFile] : generatedCode;
        if (!codeToCopy) return;
        navigator.clipboard.writeText(codeToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const renderBuildMode = () => {
        if (!generatedCode) return <AdPlaceholder title="Your app is being planned..." />;
        if (viewMode === 'app') {
            return <iframe srcDoc={generatedCode} title="App Preview" className="w-full h-full border-0" sandbox="allow-scripts allow-forms" />;
        }
        return <CodeViewer code={generatedCode} onCopy={handleCopy} isCopied={isCopied} />;
    };
    
    const renderReactWebMode = () => {
        if (!generatedFileTree) return <AdPlaceholder title="Your React app is being planned..." />;
        if (viewMode === 'app') {
            if (isPreviewBuilding) {
                return <div className="flex items-center justify-center h-full text-gray-500">Building preview...</div>;
            }
            if (previewError) {
                return <div className="flex items-center justify-center h-full text-red-500 p-4 text-center">{previewError}</div>;
            }
            if (previewUrl) {
                return <iframe src={previewUrl} title="React App Preview" className="w-full h-full border-0" sandbox="allow-scripts allow-forms allow-same-origin" />;
            }
            return <div className="flex items-center justify-center h-full text-gray-500">Preparing preview environment...</div>;
        }
        return <FileExplorerViewer fileTree={generatedFileTree} selectedFile={selectedFile} setSelectedFile={setSelectedFile} onCopy={handleCopy} isCopied={isCopied} />;
    };
    
    const renderNativeMode = () => {
        if (!generatedCode) return <NativePlaceholder />;
        if (viewMode === 'app') return <NativePreview generatedCode={generatedCode} qrCodeUrl={qrCodeUrl} qrError={qrError} isQrLoading={isQrLoading} />;
        return <CodeViewer code={generatedCode} onCopy={handleCopy} isCopied={isCopied} />;
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
            case 'build': return 'Single-File Web App';
            case 'form': return 'Form Preview';
            case 'native': return 'Native App Preview';
            case 'study': return 'Study Deck';
            case 'react_web': return 'React App Preview';
            default: return 'Preview';
        }
    }

    const renderContent = () => {
        switch(appMode) {
            case 'build':
            case 'form': return renderBuildMode();
            case 'react_web': return renderReactWebMode();
            case 'native': return renderNativeMode();
            case 'study': return renderStudyMode();
            default: return <div className="p-6">Select a mode to get started.</div>;
        }
    };
    
    const showViewModeToggle = (appMode === 'build' || appMode === 'form' || appMode === 'native' || appMode === 'react_web') && (generatedCode || generatedFileTree);

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
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
            </header>
            <div className="flex-1 bg-gray-100 overflow-hidden">{renderContent()}</div>
        </div>
    );
};

// --- Sub-components for cleaner rendering logic ---

const CodeViewer: React.FC<{ code: string; onCopy: () => void; isCopied: boolean }> = ({ code, onCopy, isCopied }) => (
    <div className="relative w-full h-full bg-gray-900 text-white font-mono text-sm overflow-auto">
        <button onClick={onCopy} className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md text-xs transition-colors">
            {isCopied ? <><CheckIcon className="w-4 h-4 text-green-400" /><span>Copied!</span></> : <><ClipboardIcon className="w-4 h-4" /><span>Copy Code</span></>}
        </button>
        <pre className="p-4 pt-12"><code>{code}</code></pre>
    </div>
);

const FileExplorerViewer: React.FC<{ fileTree: { [key: string]: string }, selectedFile: string, setSelectedFile: (file: string) => void, onCopy: () => void, isCopied: boolean }> = ({ fileTree, selectedFile, setSelectedFile, onCopy, isCopied }) => (
    <div className="w-full h-full flex bg-gray-800 text-white font-mono text-sm">
        <div className="w-48 h-full bg-gray-900/50 border-r border-gray-700 overflow-y-auto p-2">
            <h4 className="text-xs text-gray-400 uppercase font-sans font-bold px-2 mb-2">Files</h4>
            <ul>
                {Object.keys(fileTree).sort().map(fileName => (
                    <li key={fileName}>
                        <button onClick={() => setSelectedFile(fileName)} className={`w-full text-left text-xs px-2 py-1 rounded ${selectedFile === fileName ? 'bg-indigo-500/30 text-white' : 'text-gray-300 hover:bg-white/10'}`}>
                            {fileName}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
        <div className="flex-1 relative h-full">
            <CodeViewer code={fileTree[selectedFile] || ''} onCopy={onCopy} isCopied={isCopied} />
        </div>
    </div>
);

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