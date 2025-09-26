import React, { useRef, useState, useEffect } from 'react';
import ChatPanel, { ChatPanelRef } from '../builder/ChatPanel';
import PreviewPanel from '../builder/PreviewPanel';
import { useAppContext } from '../../context/AppContext';
import { GenerationStatus, Message, AppMode } from '../../types';

export interface Version {
  files: { [path: string]: string };
  summary: string;
  timestamp: number;
}

export interface AgentTestAction {
  selector: string;
  action: string;
  justification: string;
}

const AppBuilderPage: React.FC = () => {
  const chatPanelRef = useRef<ChatPanelRef>(null);
  const previewPanelRef = useRef<{ takeScreenshot: () => Promise<string> }>(null);
  
  const { prompt, appMode, setFiles: setContextFiles, files: contextFiles } = useAppContext();

  const [files, setFiles] = useState<{ [path: string]: string } | null>(contextFiles);
  const [history, setHistory] = useState<Version[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [isAgentTesting, setIsAgentTesting] = useState(false);
  const [agentTestAction, setAgentTestAction] = useState<AgentTestAction | null>(null);
  const [activePreviewMode, setActivePreviewMode] = useState<'viewer' | 'editor' | 'history' | 'console'>('viewer');
  const [vercelProject, setVercelProject] = useState<{ id: string; name: string; url: string; } | null>(null);
  const [githubRepoUrl, setGithubRepoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>('idle');

  const handleSetFiles = (newFiles: { [path: string]: string }, summary?: string) => {
      if(summary && files) {
          // Add previous state to history
          setHistory(prev => [...prev, { files: files, summary: "Previous version", timestamp: Date.now() - 1 }]);
      }
      setFiles(newFiles);
      setContextFiles(newFiles); // also update context for persistence across navigation
  };

  const handleFileContentChange = (path: string, newContent: string) => {
    const newFiles = { ...(files || {}), [path]: newContent };
    // We don't want to create a history entry for every keystroke, so pass undefined for summary
    handleSetFiles(newFiles);
  };

  const handleRevertToVersion = (version: Version) => {
    setFiles(version.files);
    setContextFiles(version.files);
    // Optionally, you could add a message indicating a revert happened
    setMessages(prev => [...prev, { role: 'assistant', content: `Reverted to a previous version.`, isAgentActivity: true }]);
    setActivePreviewMode('viewer');
  };

  const handleVisualEditSubmit = (prompt: string) => {
    chatPanelRef.current?.submitRefinement(prompt);
  };

  const handleScreenshotTaken = (dataUrl: string) => {
    chatPanelRef.current?.reviewScreenshot(dataUrl);
  };

  const handleAnalyzeRequest = async () => {
    if (previewPanelRef.current) {
        try {
            const dataUrl = await previewPanelRef.current.takeScreenshot();
            chatPanelRef.current?.runUiUxAnalysis(dataUrl);
        } catch (error) {
            console.error("Failed to take screenshot for analysis:", error);
        }
    }
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
  
  const handleVercelDeploySuccess = (projectInfo: { id: string; name: string; url: string; }) => {
    setVercelProject(projectInfo);
  };

  const handleGitHubPushSuccess = (url: string) => {
    setGithubRepoUrl(url);
  };


  return (
    <div className="w-full h-full p-4 futuristic-background">
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg flex flex-col overflow-hidden">
          <ChatPanel 
            ref={chatPanelRef}
            onStartAgentTest={handleStartAgentTest}
            onToggleCodeView={() => setActivePreviewMode(prev => prev === 'editor' ? 'viewer' : 'editor')}
            status={status}
            setStatus={setStatus}
            files={files}
            setFiles={handleSetFiles}
            messages={messages}
            setMessages={setMessages}
          />
        </div>
        <div className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg flex flex-col overflow-hidden">
          <PreviewPanel 
            ref={previewPanelRef}
            files={files}
            onFileContentChange={handleFileContentChange}
            onVisualEditSubmit={handleVisualEditSubmit}
            onScreenshotTaken={handleScreenshotTaken}
            isAgentTesting={isAgentTesting}
            agentTestAction={agentTestAction}
            onTestComplete={handleTestComplete}
            activePreviewMode={activePreviewMode}
            setActivePreviewMode={setActivePreviewMode}
            onAnalyzeRequest={handleAnalyzeRequest}
            vercelProject={vercelProject}
            onVercelDeploySuccess={handleVercelDeploySuccess}
            githubRepoUrl={githubRepoUrl}
            onGitHubPushSuccess={handleGitHubPushSuccess}
            status={status}
            history={history}
            onRevertToVersion={handleRevertToVersion}
          />
        </div>
      </div>
       <style>{`
        .futuristic-background {
            background-color: #000000;
            background-image: 
                radial-gradient(circle at 15% 85%, rgba(138, 43, 226, 0.2) 0%, rgba(138, 43, 226, 0) 40%),
                radial-gradient(circle at 85% 15%, rgba(0, 255, 255, 0.2) 0%, rgba(0, 255, 255, 0) 40%),
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
        }
      `}</style>
    </div>
  );
};

export default AppBuilderPage;