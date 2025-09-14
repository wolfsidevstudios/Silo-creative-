import React, { useState, useEffect, useRef, FormEvent, forwardRef, useImperativeHandle } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
    generateAppPlan, generateAppCode, generateFlashcards, 
    generateFormPlan, generateFormCode, refineAppCode, 
    generateNativeAppCode, refineNativeAppCode, chatAboutCode,
    selfCorrectCode, getPrimaryAction
} from '../../services/geminiService';
import { saveApp } from '../../services/storageService';
import type { Message, AppPlan, FormPlan, RefinementResult } from '../../types';
import { AgentTestAction } from '../pages/AppBuilderPage';
import { HtmlIcon, CssIcon, TsIcon, FileTextIcon, ReactIcon, BotIcon } from '../common/Icons';

// --- Sub-components for message types ---

const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'html': return <HtmlIcon className="w-5 h-5 text-orange-500" />;
        case 'css': return <CssIcon className="w-5 h-5 text-blue-500" />;
        case 'js':
            if (filename.toLowerCase() === 'app.js') return <ReactIcon className="w-5 h-5 text-blue-400" />;
            return <TsIcon className="w-5 h-5 text-yellow-500" />;
        default: return <FileTextIcon className="w-5 h-5 text-gray-500" />;
    }
};

const ChangeSummaryDisplay: React.FC<{ data: { summary: string; files: string[] } }> = ({ data }) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">Changes Applied</h3>
            <p className="text-sm text-gray-600">Here's a summary of the updates made to your app.</p>
        </div>
        <div className="p-4 space-y-4">
            <p className="text-gray-700 whitespace-pre-wrap">{data.summary}</p>
            <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-2">Files Edited</h4>
                <ul className="space-y-2">
                    {data.files.map((file, index) => (
                        <li key={index} className="flex items-center gap-3 bg-gray-100 p-2 rounded-md">
                            {getFileIcon(file)}
                            <span className="font-mono text-sm text-gray-800">{file}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

const PlanDisplay: React.FC<{ plan: AppPlan; onGenerate: () => void; isGenerated: boolean; }> = ({ plan, onGenerate, isGenerated }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-800">{plan.title}</h3>
        <p className="text-gray-600 mb-4">{plan.description}</p>
        <ul className="space-y-2 mb-6">
            {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    <span className="text-gray-700">{feature}</span>
                </li>
            ))}
        </ul>
        <button onClick={onGenerate} disabled={isGenerated} className="w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isGenerated ? 'App Generated' : 'Looks good, create the app!'}
        </button>
    </div>
);

const FormPlanDisplay: React.FC<{ plan: FormPlan, onGenerate: () => void, isGenerated: boolean }> = ({ plan, onGenerate, isGenerated }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-800">{plan.title}</h3>
        <p className="text-gray-600 mb-4">{plan.description}</p>
        <ul className="space-y-2 mb-6">
            {plan.fields.map((field, index) => (
                <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    <span className="text-gray-700 font-medium">{field.name}</span>
                    <span className="text-gray-500 ml-2 text-sm">({field.type}{field.required ? ', required' : ''})</span>
                </li>
            ))}
        </ul>
        <button onClick={onGenerate} disabled={isGenerated} className="w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isGenerated ? 'Form Generated' : 'Looks good, create the form!'}
        </button>
    </div>
);

const AgentActivityMessage: React.FC<{ content: string }> = ({ content }) => (
    <div className="flex items-start gap-3 text-gray-700">
        <div className="w-8 h-8 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
            <BotIcon className="w-5 h-5 text-indigo-600" />
        </div>
        <p className="pt-1.5 italic">{content}</p>
    </div>
);

const ScreenshotMessage: React.FC<{ imageUrl: string }> = ({ imageUrl }) => (
    <div className="border bg-white p-2 rounded-lg">
        <img src={imageUrl} alt="App screenshot" className="rounded-md w-full" />
    </div>
);

// --- Main ChatPanel Component ---

export interface ChatPanelRef {
  submitRefinement: (prompt: string) => void;
  reviewScreenshot: (dataUrl: string) => void;
  finalizeTest: () => void;
}

interface ChatPanelProps {
    onStartAgentTest: (action: AgentTestAction) => void;
}

const ChatPanel = forwardRef<ChatPanelRef, ChatPanelProps>(({ onStartAgentTest }, ref) => {
  const { 
    prompt, generatedCode, setGeneratedCode, 
    appMode, setGeneratedFlashcards, agents, selectedAgentId 
  } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<AppPlan | FormPlan | null>(null);
  const [chatMode, setChatMode] = useState<'refine' | 'ask'>('refine');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (prompt) {
      const userMessage: Message = { role: 'user', content: prompt };
      setMessages([userMessage]);
      setIsLoading(true);
      setGeneratedCode('');
      setGeneratedFlashcards(null);
      setIsCodeGenerated(false);
      setCurrentPlan(null);

      const agentInstruction = selectedAgent?.systemInstruction;

      const handleErrors = (error: any, type: string) => {
        console.error(`Error generating ${type}:`, error);
        const errorMessage: Message = { role: 'model', content: `Sorry, I couldn't generate the ${type} right now. Please try again.` };
        setMessages(prev => [...prev, errorMessage]);
      };

      if (appMode === 'study') {
          generateFlashcards(prompt, agentInstruction)
            .then(flashcards => {
                setGeneratedFlashcards(flashcards);
                const modelMessage: Message = { role: 'model', content: "I've generated your flashcards! You can see them in the preview panel." };
                setMessages(prev => [...prev, modelMessage]);
            })
            .catch(error => handleErrors(error, 'flashcards'))
            .finally(() => setIsLoading(false));

      } else if (appMode === 'build' || appMode === 'native') {
        generateAppPlan(prompt, agentInstruction)
          .then(plan => {
              setCurrentPlan(plan);
              const modelMessage: Message = { role: 'model', content: JSON.stringify(plan), isPlan: true, planType: 'app' };
              setMessages(prev => [...prev, modelMessage]);
          })
          .catch(error => handleErrors(error, 'app plan'))
          .finally(() => setIsLoading(false));

      } else if (appMode === 'form') {
        generateFormPlan(prompt, agentInstruction)
          .then(plan => {
              setCurrentPlan(plan);
              const modelMessage: Message = { role: 'model', content: JSON.stringify(plan), isPlan: true, planType: 'form' };
              setMessages(prev => [...prev, modelMessage]);
          })
          .catch(error => handleErrors(error, 'form plan'))
          .finally(() => setIsLoading(false));
      }
    }
  }, [prompt, appMode]);

  useEffect(scrollToBottom, [messages]);
  
  const generateCode = async (plan: AppPlan | FormPlan, generationFn: (p: any, i?: string) => Promise<string>) => {
      if (isCodeGenerated) return;
      setIsLoading(true);
      const agentInstruction = selectedAgent?.systemInstruction;
      
      try {
          const code = await generationFn(plan, agentInstruction);
          setGeneratedCode(code); // This triggers PreviewPanel to render and take a screenshot
          saveApp(plan.title, code, appMode as 'build' | 'form' | 'native');
          setIsCodeGenerated(true);
      } catch (error) {
          console.error("Error generating code:", error);
          const errorMessage: Message = { role: 'model', content: "Sorry, there was an error generating the code. Please try again." };
          setMessages(prev => [...prev, errorMessage]);
          setIsLoading(false);
      }
  };

  const reviewScreenshot = async (dataUrl: string) => {
    setMessages(prev => [...prev, { role: 'model', content: '', imageUrl: dataUrl }]);
    setMessages(prev => [...prev, { role: 'model', content: 'Let me double-check my work...', isAgentActivity: true }]);
    
    try {
        const result = await selfCorrectCode(prompt, generatedCode, dataUrl.split(',')[1], selectedAgent?.systemInstruction);
        if (result.summary === 'NO_CHANGES_NEEDED') {
            setMessages(prev => [...prev, { role: 'model', content: 'Looks good to me!', isAgentActivity: true }]);
            startAgentTestingPhase();
        } else {
            setGeneratedCode(result.code);
            const summaryMessage: Message = { 
                role: 'model', 
                content: JSON.stringify({ summary: `I found a small issue and fixed it: ${result.summary}`, files: result.files_edited }),
                isChangeSummary: true,
            };
            setMessages(prev => [...prev, summaryMessage]);
            // The new code will trigger a new screenshot and review. To prevent loops, we'll proceed after one correction.
            startAgentTestingPhase();
        }
    } catch (error) {
        console.error("Error during self-correction:", error);
        setMessages(prev => [...prev, { role: 'model', content: "I had trouble reviewing my work, but you can check it out.", isAgentActivity: true }]);
        setIsLoading(false);
    }
  };

  const startAgentTestingPhase = async () => {
      setMessages(prev => [...prev, { role: 'model', content: 'Now, I\'ll quickly test the main functionality.', isAgentActivity: true }]);
      try {
          const action = await getPrimaryAction(generatedCode, selectedAgent?.systemInstruction);
          onStartAgentTest(action);
      } catch(error) {
          console.error("Could not get primary action:", error);
          setMessages(prev => [...prev, { role: 'model', content: "I couldn't figure out how to test this app automatically, but it's ready for you.", isAgentActivity: true }]);
          setIsLoading(false);
      }
  };

  useImperativeHandle(ref, () => ({
    submitRefinement,
    reviewScreenshot,
    finalizeTest: () => {
        setMessages(prev => [...prev, { role: 'model', content: 'Everything seems to be working! The app is now ready for you to use.' }]);
        setIsLoading(false);
    }
  }));

  const submitRefinement = async (refinementPrompt: string) => {
    if (!generatedCode) return;
    setMessages(prev => [...prev, { role: 'user', content: refinementPrompt }]);
    setIsLoading(true);
    try {
      const agentInstruction = selectedAgent?.systemInstruction;
      const result = await refineAppCode(generatedCode, refinementPrompt, agentInstruction);
      setGeneratedCode(result.code);
      saveApp(currentPlan?.title || "Updated App", result.code, appMode as 'build' | 'form');
      setMessages(prev => [...prev, { 
          role: 'model', 
          content: JSON.stringify({ summary: result.summary, files: result.files_edited }),
          isChangeSummary: true,
      }]);
    } catch (error) {
        console.error("Error refining code:", error);
        setMessages(prev => [...prev, { role: 'model', content: "Sorry, I couldn't apply those changes." }]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput('');
    
    if (isCodeGenerated && generatedCode) {
        if (chatMode === 'refine') {
            await submitRefinement(currentInput);
        } else {
            setMessages(prev => [...prev, { role: 'user', content: currentInput }]);
            setIsLoading(true);
            try {
                const responseText = await chatAboutCode(generatedCode, currentInput, selectedAgent?.systemInstruction);
                setMessages(prev => [...prev, { role: 'model', content: responseText }]);
            } catch (error) {
                setMessages(prev => [...prev, { role: 'model', content: "Sorry, I couldn't answer that right now." }]);
            } finally {
                setIsLoading(false);
            }
        }
    }
  };

  return (
    <div className="w-1/2 flex flex-col h-full bg-gray-50">
      <header className="p-4 border-b border-gray-200 flex items-center">
        <div className="flex items-center gap-3">
          {selectedAgent && <img src={selectedAgent.imageUrl} alt={selectedAgent.name} className="w-10 h-10 rounded-full" />}
          <h2 className="text-xl font-semibold">{selectedAgent ? selectedAgent.name : "Conversation"}</h2>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className="w-full max-w-lg">
                {msg.isPlan ? (
                    msg.planType === 'app' ? (
                        <PlanDisplay plan={JSON.parse(msg.content)} onGenerate={() => generateCode(JSON.parse(msg.content), appMode === 'native' ? generateNativeAppCode : generateAppCode)} isGenerated={isCodeGenerated} />
                    ) : (
                        <FormPlanDisplay plan={JSON.parse(msg.content)} onGenerate={() => generateCode(JSON.parse(msg.content), generateFormCode)} isGenerated={isCodeGenerated} />
                    )
                ) : msg.isChangeSummary ? (
                    <ChangeSummaryDisplay data={JSON.parse(msg.content)} />
                ) : msg.imageUrl ? (
                    <ScreenshotMessage imageUrl={msg.imageUrl} />
                ) : msg.isAgentActivity ? (
                    <AgentActivityMessage content={msg.content} />
                ) : (
                  <div className={`inline-block max-w-lg p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )}
              </div>
          </div>
        ))}
        {isLoading && !messages.some(m => m.isAgentActivity) && (
           <div className="flex justify-start">
             <div className="max-w-lg p-4 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.1s]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <span className="ml-2 text-sm text-gray-600">Silo Create is thinking...</span>
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200">
        {isCodeGenerated && (
            <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setChatMode('refine')} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${chatMode === 'refine' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Refine App</button>
                <button onClick={() => setChatMode('ask')} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${chatMode === 'ask' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Ask About Code</button>
            </div>
        )}
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isCodeGenerated ? (chatMode === 'refine' ? "Ask for modifications..." : "Ask a question about your code...") : "Describe your app to start..."}
            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
            disabled={isLoading || (!isCodeGenerated && appMode !== 'study')}
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 disabled:bg-gray-300 transition-colors" disabled={isLoading || !input.trim()}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
});

export default ChatPanel;