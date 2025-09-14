
import React from 'react';
import Sidebar from '../common/Sidebar';
import Banner from '../common/Banner';
import { UserIcon, AtSignIcon } from '../common/Icons';
import { useAppContext } from '../../context/AppContext';

const SettingsPanel: React.FC = () => {
    const { user } = useAppContext();

    return (
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-gray-50">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-gray-800">Settings</h1>
                <p className="text-lg text-gray-500 mt-1">Manage your account and application preferences.</p>
            </header>

            <div className="space-y-8 max-w-4xl mx-auto">
                {/* Profile Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                     <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Profile</h2>
                        <p className="text-gray-500 mt-1">This information is synced from your login provider.</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                             <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="text" id="name" value={user?.name || ''} className="block w-full rounded-lg border-gray-300 py-2.5 pl-10 pr-4 shadow-sm bg-gray-100 cursor-not-allowed" disabled />
                             </div>
                        </div>
                        <div>
                             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                             <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <AtSignIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="email" id="email" value={user?.email || ''} className="block w-full rounded-lg border-gray-300 py-2.5 pl-10 pr-4 shadow-sm bg-gray-100 cursor-not-allowed" disabled />
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
