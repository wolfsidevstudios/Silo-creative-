import React, { useState, FormEvent } from 'react';
import { XIcon, KeyIcon, LinkIcon, SupabaseIcon, StripeIcon, GeminiIcon } from '../common/Icons';
import { IntegrationType } from '../../types';

interface IntegrationDetailsModalProps {
  integrationType: IntegrationType;
  onClose: () => void;
  onSubmit: (details: Record<string, string>) => void;
}

const INTEGRATION_META = {
  supabase: { name: 'Connect Supabase', icon: SupabaseIcon },
  stripe: { name: 'Add Stripe Payments', icon: StripeIcon },
  gemini: { name: 'Add Gemini API', icon: GeminiIcon },
};

export const IntegrationDetailsModal: React.FC<IntegrationDetailsModalProps> = ({ integrationType, onClose, onSubmit }) => {
  const [details, setDetails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const meta = INTEGRATION_META[integrationType];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate a small delay to show loading state
    setTimeout(() => {
        onSubmit(details);
        setLoading(false);
        onClose();
    }, 500);
  };

  const renderFormFields = () => {
    switch (integrationType) {
      case 'supabase':
        return (
          <>
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">Project URL</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LinkIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input type="url" name="url" id="url" onChange={handleInputChange} className="block w-full rounded-full border-white/20 bg-black/30 py-2.5 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white placeholder-gray-500" placeholder="https://xyz.supabase.co" required />
              </div>
            </div>
            <div>
              <label htmlFor="anonKey" className="block text-sm font-medium text-gray-300 mb-1">Anon (Public) Key</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input type="text" name="anonKey" id="anonKey" onChange={handleInputChange} className="block w-full rounded-full border-white/20 bg-black/30 py-2.5 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white placeholder-gray-500" placeholder="eyJ..." required />
              </div>
            </div>
          </>
        );
      case 'stripe':
        return (
          <div>
            <label htmlFor="publishableKey" className="block text-sm font-medium text-gray-300 mb-1">Publishable Key</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyIcon className="h-5 w-5 text-gray-500" />
              </div>
              <input type="text" name="publishableKey" id="publishableKey" onChange={handleInputChange} className="block w-full rounded-full border-white/20 bg-black/30 py-2.5 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white placeholder-gray-500" placeholder="pk_test_..." required />
            </div>
          </div>
        );
      case 'gemini':
        return (
          <div className="text-center text-gray-400">
            <p>This will add UI elements to your app, allowing your users to enter their own Gemini API key to power AI features.</p>
            <p className="mt-3 text-sm">No API key is required from you at this step.</p>
          </div>
        );
      default:
        return null;
    }
  };
  
  const isSubmitDisabled = () => {
      if (loading) return true;
      if (integrationType === 'supabase') return !details.url || !details.anonKey;
      if (integrationType === 'stripe') return !details.publishableKey;
      return false;
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900/70 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <meta.icon className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-gray-100">{meta.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {renderFormFields()}
          </div>
          <div className="px-6 py-4 bg-black/20 border-t border-white/10 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-white/20 text-sm font-medium rounded-full text-gray-300 bg-white/10 hover:bg-white/20">Cancel</button>
            <button type="submit" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500/50 disabled:cursor-not-allowed" disabled={isSubmitDisabled()}>
              {loading ? 'Adding...' : (integrationType === 'gemini' ? 'Proceed' : 'Add Integration')}
            </button>
          </div>
        </form>
      </div>
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
  );
};
