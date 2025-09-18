import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardIcon, CheckIcon, KeyIcon } from '../common/Icons';

const ApiKeyDisplay: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const generateKey = () => {
        setApiKey(`silo_sk_${[...Array(32)].map(() => Math.random().toString(36)[2]).join('')}`);
        setIsCopied(false);
    };

    const handleCopy = () => {
        if (!apiKey) return;
        navigator.clipboard.writeText(apiKey);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-200">Your API Key</h3>
            <p className="text-sm text-gray-400 mt-1">This key is used to authenticate your requests to the Silo Labs API.</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <KeyIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        readOnly
                        value={apiKey || 'Click "Generate Key" to get started'}
                        className="w-full bg-black/30 border border-white/20 rounded-full py-2 pl-10 pr-4 text-gray-300 font-mono text-sm"
                    />
                </div>
                {apiKey && (
                     <button onClick={handleCopy} className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-full bg-white/10 text-gray-200 hover:bg-white/20">
                        {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                        {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                )}
                <button onClick={generateKey} className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700">
                    {apiKey ? 'Regenerate Key' : 'Generate Key'}
                </button>
            </div>
            <p className="mt-3 text-xs text-yellow-400">Note: API access is not yet enabled. This is for demonstration purposes only.</p>
        </div>
    );
};

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-black/50 border border-white/10 rounded-lg p-4 mt-4 text-sm text-gray-300 overflow-x-auto">
        <code>
            {children}
        </code>
    </pre>
);

const DeveloperAPIPage: React.FC = () => {
    return (
        <div className="h-full overflow-y-auto bg-black p-6 sm:p-10">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-100">Developer API</h1>
                    <p className="text-lg text-gray-400 mt-1">Integrate Silo Labs' generation capabilities into your own applications.</p>
                </header>

                <div className="prose prose-invert max-w-none text-gray-300 space-y-12">
                    <section id="api-key">
                        <h2>API Authentication</h2>
                        <p>Authenticate your API requests by including your secret key in the header of your request. All API requests must be made over HTTPS.</p>
                        <ApiKeyDisplay />
                    </section>
                    
                    <section id="endpoints">
                        <h2>Endpoints</h2>
                        <div>
                            <h3 className="flex items-center gap-3">
                                <span className="text-sm font-bold bg-green-500/80 text-white rounded px-2 py-0.5">POST</span>
                                <span>/v1/generate</span>
                            </h3>
                            <p className="mt-2">Generates a new piece of content (web app, form, etc.) based on a prompt.</p>
                            
                            <h4 className="mt-6 font-semibold text-gray-200">Request Body (JSON)</h4>
                            <CodeBlock>
{`{
  "prompt": "A simple pomodoro timer",
  "mode": "build",
  "agentId": "silo-creative-coder"
}`}
                            </CodeBlock>
                            
                            <h4 className="mt-6 font-semibold text-gray-200">Example Request (cURL)</h4>
                             <CodeBlock>
{`curl -X POST https://api.silolabs.ai/v1/generate \\
-H "Authorization: Bearer YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
      "prompt": "A simple pomodoro timer",
      "mode": "build",
      "agentId": "silo-creative-coder"
    }'`}
                            </CodeBlock>

                             <h4 className="mt-6 font-semibold text-gray-200">Example Success Response (200 OK)</h4>
                            <CodeBlock>
{`{
  "id": "gen_123abc",
  "object": "generation",
  "created": 1677649920,
  "mode": "build",
  "status": "succeeded",
  "result": {
    "code": "<!DOCTYPE html>...",
    "format": "html"
  }
}`}
                            </CodeBlock>
                        </div>
                    </section>
                </div>
            </div>
             <style>{`
                .prose-invert h2 {
                    color: #e5e7eb;
                    margin-bottom: 1em;
                    padding-bottom: 0.5em;
                    border-bottom: 1px solid #374151;
                }
                 .prose-invert h3 {
                    color: #d1d5db;
                }
                .prose-invert a {
                    color: #818cf8;
                }
            `}</style>
        </div>
    );
};

export default DeveloperAPIPage;
