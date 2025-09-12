import React from 'react';
import ChatPanel from '../builder/ChatPanel';
import PreviewPanel from '../builder/PreviewPanel';
import Sidebar from '../common/Sidebar';
import Banner from '../common/Banner';

const AppBuilderPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      <Banner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 overflow-hidden">
          <ChatPanel />
          <div className="w-px bg-gray-200 h-full" />
          <PreviewPanel />
        </main>
      </div>
    </div>
  );
};

export default AppBuilderPage;
