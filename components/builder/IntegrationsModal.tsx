import React from 'react';
import { XIcon, SupabaseIcon, StripeIcon, GeminiIcon } from '../common/Icons';

type IntegrationType = 'supabase' | 'stripe' | 'gemini';

interface Integration {
  id: IntegrationType;
  name: string;
  description: string;
  icon: React.FC<{className?: string}>;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'supabase',
    name: 'Connect Supabase',
    description: 'Add Supabase client boilerplate to your app for database and auth.',
    icon: SupabaseIcon,
  },
  {
    id: 'stripe',
    name: 'Add Stripe Payments',
    description: 'Integrate Stripe.js and a sample checkout button for payments.',
    icon: StripeIcon,
  },
  {
    id: 'gemini',
    name: 'Add Gemini API',
    description: 'Add UI and a fetch call to use Gemini API within your app.',
    icon: GeminiIcon,
  },
];


interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIntegration: (integration: IntegrationType) => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ isOpen, onClose, onSelectIntegration }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="integrations-modal-title"
    >
      <div
        className="bg-gray-900/70 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl w-full max-w-2xl relative transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 id="integrations-modal-title" className="text-xl font-bold text-gray-100">
            Add Integrations
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
          {INTEGRATIONS.map((integration) => (
            <button
              key={integration.id}
              onClick={() => {
                onSelectIntegration(integration.id);
                onClose();
              }}
              className="group text-left p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-200"
            >
              <integration.icon className="w-8 h-8 text-indigo-400 mb-3" />
              <h3 className="font-semibold text-gray-200">{integration.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{integration.description}</p>
            </button>
          ))}
        </div>

        <div className="px-6 py-4 bg-black/20 border-t border-white/10 text-right">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/20 text-sm font-medium rounded-full shadow-sm text-gray-300 bg-white/10 hover:bg-white/20 focus:outline-none"
            >
              Close
            </button>
        </div>
        
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