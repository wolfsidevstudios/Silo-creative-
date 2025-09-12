import React, { useState, FormEvent, useEffect } from 'react';
import { XIcon, LinkIcon } from '../common/Icons';
import { useAppContext } from '../../context/AppContext';
import { Agent } from '../../types';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATARS = [
    'https://i.ibb.co/6gKCj61/avatar-1.png',
    'https://i.ibb.co/VMyPzZC/avatar-2.png',
    'https://i.ibb.co/Ld1sWv1/avatar-3.png',
    'https://i.ibb.co/YyS0WH3/avatar-4.png',
    'https://i.ibb.co/yQjLgP4/avatar-5.png',
    'https://i.ibb.co/R9hscjY/avatar-6.png',
];

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [imageUrl, setImageUrl] = useState(AVATARS[0]);
  const { addAgent } = useAppContext();

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setName('');
        setSystemInstruction('');
        setImageUrl(AVATARS[0]);
      }, 300);
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemInstruction.trim() || !imageUrl.trim()) return;

    const newAgent: Agent = {
      id: `custom-${Date.now()}`,
      name,
      systemInstruction,
      imageUrl,
      isCustom: true,
    };

    addAgent(newAgent);
    onClose();
  };

  if (!isOpen) return null;

  const isCustomUrl = !AVATARS.includes(imageUrl);
  const customUrlInputValue = isCustomUrl ? imageUrl : '';

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-agent-title"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 id="create-agent-title" className="text-xl font-bold text-gray-900">
            Create Custom Agent
          </h2>
          <p className="text-sm text-gray-500 mt-1">Define the personality and expertise of your new AI assistant.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="agent-name" className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
              <input
                type="text"
                id="agent-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Grumpy Pirate Coder"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Profile Image</label>
              <div className="flex flex-wrap gap-3">
                {AVATARS.map((avatarUrl) => (
                  <button
                    key={avatarUrl}
                    type="button"
                    onClick={() => setImageUrl(avatarUrl)}
                    className={`w-16 h-16 rounded-full overflow-hidden transition-all duration-200 ${imageUrl === avatarUrl ? 'ring-4 ring-offset-2 ring-indigo-500' : 'ring-2 ring-transparent hover:ring-indigo-300'}`}
                  >
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-sm text-gray-500">Or</span>
                </div>
              </div>
              <div>
                <label htmlFor="agent-image-url" className="sr-only">Image URL</label>
                 <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <LinkIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="url"
                        id="agent-image-url"
                        value={customUrlInputValue}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 py-2.5 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter image URL"
                    />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="system-instruction" className="block text-sm font-medium text-gray-700 mb-1">System Instructions</label>
              <textarea
                id="system-instruction"
                rows={6}
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="You are a grumpy pirate who reluctantly helps with coding..."
                required
              ></textarea>
              <p className="mt-2 text-xs text-gray-500">
                This defines the agent's behavior. Be specific about its role, personality, and skills.
              </p>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              disabled={!name.trim() || !systemInstruction.trim() || !imageUrl.trim()}
            >
              Create Agent
            </button>
          </div>
        </form>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <XIcon className="w-5 h-5" />
        </button>
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
