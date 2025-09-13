import React, { useRef } from 'react';
import ChatPanel, { ChatPanelRef } from '../builder/ChatPanel';
import PreviewPanel from '../builder/PreviewPanel';
import Sidebar from '../common/Sidebar';
import Banner from '../common/Banner';

const AppBuilderPage: React.FC = () => {
  const chatPanelRef = useRef<ChatPanelRef>(null);

  const handleVisualEditSubmit = (prompt: string) => {
    chatPanelRef.current?.submitRefinement(prompt);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      <Banner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 overflow-hidden">
          <ChatPanel ref={chatPanelRef} />
          <div className="w-px bg-gray-200 h-full" />
          <PreviewPanel onVisualEditSubmit={handleVisualEditSubmit} />
        </main>
      </div>
    </div>
  );
};

export default AppBuilderPage;