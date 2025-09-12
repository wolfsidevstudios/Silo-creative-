
import React, { useState, useEffect, FormEvent } from 'react';
import Sidebar from '../common/Sidebar';
import Banner from '../common/Banner';
import { getApiKey, setApiKey } from '../../services/apiKeyService';
import { KeyIcon, UserIcon, SaveIcon, CheckIcon, AtSignIcon } from '../common/Icons';

const SettingsPanel: React.FC = () => {
    const [apiKey, setApiKeyValue] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        // Load the stored API key on component mount
        setApiKeyValue(getApiKey());
    }, []);

    const handleSaveApiKey = (e: FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');
        setApiKey(apiKey);
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1000);
    };

    return (
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-gray-50">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-gray-800">Settings</h1>
                <p className="text-lg text-gray-500 mt-1">Manage your account and application preferences.</p>
            </header>

            <div className="space-y-8 max-w-4xl mx-auto">
                {/* API Configuration Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">API Configuration</h2>
                        <p className="text-gray-500 mt-1">Manage your Gemini API key.</p>
                    </div>
                    <form onSubmit={handleSaveApiKey}>
                        <div className="p-6 space-y-4">
                             <div>
                                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
                                    Gemini API Key
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <KeyIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        id="api-key"
                                        value={apiKey}
                                        onChange={(e) => setApiKeyValue(e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 py-2.5 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Enter your API key"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Your key is stored securely in your browser's local storage and is never sent to our servers.
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                                disabled={saveStatus !== 'idle'}
                            >
                                {saveStatus === 'idle' && <><SaveIcon className="w-4 h-4 mr-2" /><span>Save API Key</span></>}
                                {saveStatus === 'saving' && 'Saving...'}
                                {saveStatus === 'saved' && <><CheckIcon className="w-4 h-4 mr-2" /><span>Saved!</span></>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Profile Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                     <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Profile</h2>
                        <p className="text-gray-500 mt-1">This information is for display purposes only.</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                             <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="text" id="name" defaultValue="User Name" className="block w-full rounded-lg border-gray-300 py-2.5 pl-10 pr-4 shadow-sm bg-gray-100 cursor-not-allowed" disabled />
                             </div>
                        </div>
                        <div>
                             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                             <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <AtSignIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="email" id="email" defaultValue="user@example.com" className="block w-full rounded-lg border-gray-300 py-2.5 pl-10 pr-4 shadow-sm bg-gray-100 cursor-not-allowed" disabled />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const SettingsPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      <Banner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 overflow-hidden">
          <SettingsPanel />
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
