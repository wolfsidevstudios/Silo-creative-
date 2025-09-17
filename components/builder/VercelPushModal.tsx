import React, { useState, FormEvent, useEffect } from 'react';
import { XIcon, KeyIcon, CheckIcon, ExternalLinkIcon, VercelIcon } from '../common/Icons';
import { deployToVercel } from '../../services/vercelService';

interface VercelPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileContent: string;
  filePath: string;
}

export const VercelPushModal: React.FC<VercelPushModalProps> = ({ isOpen, onClose, fileContent, filePath }) => {
  const [projectName, setProjectName] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [successUrl, setSuccessUrl] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
        setSuccessUrl('');
        setProjectName(''); // Also reset project name
      }, 300); // Wait for closing animation
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    setSuccessUrl('');
    
    // Sanitize project name for Vercel
    const sanitizedProjectName = projectName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!sanitizedProjectName) {
        setStatus('error');
        setMessage('Please enter a valid project name.');
        return;
    }

    try {
      const deploymentUrl = await deployToVercel(token, sanitizedProjectName, fileContent, filePath);
      setStatus('success');
      setMessage('Successfully deployed to Vercel!');
      setSuccessUrl(deploymentUrl);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An unknown error occurred.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vercel-modal-title"
    >
      <div
        className="bg-gray-900/70 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl w-full max-w-lg relative transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <VercelIcon className="w-6 h-6 text-gray-200" />
            <h2 id="vercel-modal-title" className="text-xl font-bold text-gray-100">
              Deploy to Vercel
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        {status === 'success' ? (
          <div className="p-8 text-center">
            <CheckIcon className="w-12 h-12 mx-auto text-green-400 bg-green-500/20 rounded-full p-2" />
            <h3 className="mt-4 text-xl font-semibold text-gray-100">Deployment Successful!</h3>
            <p className="mt-2 text-gray-400">{message}</p>
            <a href={successUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 py-2 px-4 bg-white/10 text-gray-200 text-sm font-semibold rounded-full hover:bg-white/20 transition-colors">
              Visit Deployment <ExternalLinkIcon className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">
              <div>
                <label htmlFor="project-name" className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
                <div className="relative">
                   <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <VercelIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="block w-full rounded-full border-white/20 bg-black/30 py-2.5 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white placeholder-gray-500"
                    placeholder="my-awesome-app"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="vercel-token" className="block text-sm font-medium text-gray-300 mb-1">Vercel Access Token</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    id="vercel-token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="block w-full rounded-full border-white/20 bg-black/30 py-2.5 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white placeholder-gray-500"
                    placeholder="Your Vercel access token"
                    required
                  />
                </div>
                 <p className="mt-2 text-xs text-gray-500">
                  You can create a new token from your Vercel account settings. {' '}
                  <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                    Create one here.
                  </a> Your token is not stored.
                </p>
              </div>
              {status === 'error' && <p className="text-sm text-red-400 text-center">{message}</p>}
            </div>

            <div className="px-6 py-4 bg-black/20 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-white/20 text-sm font-medium rounded-full shadow-sm text-gray-300 bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-500/50 disabled:cursor-not-allowed"
                disabled={status === 'loading' || !projectName.trim() || !token.trim()}
              >
                {status === 'loading' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deploying...
                  </>
                ) : 'Deploy'}
              </button>
            </div>
          </form>
        )}
        <style>{`
          @keyframes scale-in {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};
