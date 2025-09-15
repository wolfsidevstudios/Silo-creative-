
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
  // FIX: Explicitly type the state to ensure type safety for the preview mode.
  const [activePreviewMode, setActivePreviewMode] = useState<'viewer' | 'editor' | 'console'>('viewer'); // viewer, editor, console

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
    <div className="flex flex-col h-screen w-screen bg-gray-100">
      <Banner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
          <div className="bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
            <ChatPanel 
              ref={chatPanelRef}
              onStartAgentTest={handleStartAgentTest}
              onToggleCodeView={() => setActivePreviewMode(prev => prev === 'editor' ? 'viewer' : 'editor')}
            />
          </div>
          <div className="bg-[#0D1117] rounded-2xl shadow-lg flex flex-col overflow-hidden">
            <PreviewPanel 
              onVisualEditSubmit={handleVisualEditSubmit}
              onScreenshotTaken={handleScreenshotTaken}
              isAgentTesting={isAgentTesting}
              agentTestAction={agentTestAction}
              onTestComplete={handleTestComplete}
              activePreviewMode={activePreviewMode}
              setActivePreviewMode={setActivePreviewMode}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppBuilderPage;