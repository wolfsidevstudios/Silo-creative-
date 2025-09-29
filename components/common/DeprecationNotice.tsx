import React from 'react';
import { ExternalLinkIcon } from './Icons';

interface DeprecationNoticeProps {
  onAcknowledge: () => void;
}

const DeprecationNotice: React.FC<DeprecationNoticeProps> = ({ onAcknowledge }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-gray-900/70 border border-yellow-400/50 rounded-2xl shadow-xl w-full max-w-lg p-8 text-center relative animate-scale-in">
        <img src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Silo Labs Logo" className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-white/20" />
        <h2 className="text-3xl font-bold text-yellow-300">Important Announcement</h2>
        <p className="text-lg text-gray-300 mt-4">
          Silo Labs Build will stop working on <strong>December 21st</strong>.
        </p>
        <p className="text-lg text-gray-300 mt-4">
          We've moved to a new, more powerful version: <strong>Silo Build</strong>.
        </p>
        
        <div className="my-8">
            <a 
                href="https://silobuild.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-xl font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
                <span>https://silobuild.vercel.app/</span>
                <ExternalLinkIcon className="w-5 h-5" />
            </a>
        </div>
        
        <button
          onClick={onAcknowledge}
          className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-lg text-lg"
        >
          Go to the New Silo Build
        </button>

        <p className="text-xs text-gray-500 mt-6">You will be redirected to the new site.</p>
      </div>
      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DeprecationNotice;