import React, { useRef, useState, useEffect } from 'react';
import ChatPanel, { ChatPanelRef } from '../builder/ChatPanel';
import PreviewPanel from '../builder/PreviewPanel';
import Sidebar from '../common/Sidebar';
import Banner from '../common/Banner';
import { useAppContext } from '../../context/AppContext';

export interface AgentTestAction {
  selector: string;
  action: string;
  justification: string;
}

const AppBuilderPage: React.FC = () => {
  const chatPanelRef = useRef<ChatPanelRef>(null);
  const { generatedCode, setGeneratedCode } = useAppContext();
  const [isAgentTesting, setIsAgentTesting] = useState(false);
  const [agentTestAction, setAgentTestAction] = useState<AgentTestAction | null>(null);

  const handleVisualEditSubmit = (prompt: string) => {
    chatPanelRef.current?.submitRefinement(prompt);
  };

  const handleScreenshotTaken = (dataUrl: string) => {
    chatPanelRef.current?.reviewScreenshot(dataUrl);
  };

  const handleStartAgentTest = (action: AgentTestAction) => {
    setIsAgentTesting(true);
    setAgentTestAction(action);
  };
  
  const handleTestComplete = () => {
    setIsAgentTesting(false);
    setAgentTestAction(null);
    chatPanelRef.current?.finalizeTest();
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      <Banner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 overflow-hidden">
          <ChatPanel 
            ref={chatPanelRef}
            onStartAgentTest={handleStartAgentTest}
          />
          <div className="w-px bg-gray-200 h-full" />
          <PreviewPanel 
            onVisualEditSubmit={handleVisualEditSubmit}
            onScreenshotTaken={handleScreenshotTaken}
            isAgentTesting={isAgentTesting}
            agentTestAction={agentTestAction}
            onTestComplete={handleTestComplete}
          />
        </main>
      </div>
    </div>
  );
};

export default AppBuilderPage;