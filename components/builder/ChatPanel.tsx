
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
import { HtmlIcon, CssIcon, TsIcon, FileTextIcon, ReactIcon, BotIcon, CheckIcon, PlusIcon, StarIcon } from '../common/Icons';

// --- Sub-components for new UI ---

const Step: React.FC<{ icon: React.ReactNode; title: string; children?: React.ReactNode; isComplete?: boolean }> = ({ icon, title, children, isComplete }) => (
    <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
            {isComplete ? <CheckIcon className="w-5 h-5" /> : icon}
        </div>
        <div className="flex-1 pt-1">
            <h3 className={`font-semibold ${isComplete ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{title}</h3>
            {children && <div className="mt-2">{children}</div>}
        </div>
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
    onToggleCodeView: () => void;
}

const ChatPanel = forwardRef<ChatPanelRef, ChatPanelProps>(({ onStartAgentTest, onToggleCodeView }, ref) => {
  const { 
    prompt, generatedCode, setGeneratedCode, 
    appMode, setGeneratedFlashcards, agents, selectedAgentId 
  } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<AppPlan | FormPlan | null>(null);
  const [changeSummary, setChangeSummary] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'planning' | 'generating' | 'reviewing' | 'testing' | 'finished'>('idle');

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  useEffect(() => {
    if (prompt) {
      setGeneratedCode('');
      setGeneratedFlashcards(null);
      setIsCodeGenerated(false);
      setCurrentPlan(null);
      setChangeSummary(null);
      setStatus('planning');
      setIsLoading(true);

      const agentInstruction = selectedAgent?.systemInstruction;

      const handleErrors = (error: any, type: string) => {
        console.error(`Error generating ${type}:`, error);
        setChangeSummary(`Error generating ${type}. Please try again.`);
        setStatus('finished');
        setIsLoading(false);
      };
      
      const planGenerators = {
          build: generateAppPlan,
          native: generateAppPlan,
          form: generateFormPlan,
      };

      if (appMode === 'study') {
          generateFlashcards(prompt, agentInstruction)
            .then(flashcards => {
                setGeneratedFlashcards(flashcards);
                setStatus('finished');
            })
            .catch(error => handleErrors(error, 'flashcards'))
            .finally(() => setIsLoading(false));

      } else if (appMode in planGenerators) {
        planGenerators[appMode as 'build' | 'native' | 'form'](prompt, agentInstruction)
          .then((plan: any) => {
              setCurrentPlan(plan);
              setStatus('generating');
              return generateCode(plan);
          })
          .catch(error => handleErrors(error, 'app plan'));
      }
    }
  }, [prompt, appMode]);
  
  const generateCode = async (plan: AppPlan | FormPlan) => {
      const agentInstruction = selectedAgent?.systemInstruction;
      
      try {
          // FIX: Use if/else blocks to handle different app modes and ensure correct plan types are passed.
          // TypeScript cannot infer the correlation between `appMode` and the type of `plan` automatically.
          let code: string;
          if (appMode === 'build') {
              code = await generateAppCode(plan as AppPlan, agentInstruction);
          } else if (appMode === 'native') {
              code = await generateNativeAppCode(plan as AppPlan, agentInstruction);
          } else if (appMode === 'form') {
              code = await generateFormCode(plan as FormPlan, agentInstruction);
          } else {
              // This case should ideally not be reached due to logic in useEffect
              console.error(`Invalid appMode for code generation: ${appMode}`);
              setChangeSummary(`An internal error occurred: Invalid app mode.`);
              setStatus('finished');
              setIsLoading(false);
              return;
          }
          
          setGeneratedCode(code); // This triggers PreviewPanel screenshot
          saveApp(plan.title, code, appMode as 'build' | 'form' | 'native');
          setIsCodeGenerated(true);
      } catch (error) {
          console.error("Error generating code:", error);
          setChangeSummary("Sorry, there was an error generating the code.");
          setStatus('finished');
          setIsLoading(false);
      }
  };

  const reviewScreenshot = async (dataUrl: string) => {
    setStatus('reviewing');
    try {
        const result = await selfCorrectCode(prompt, generatedCode, dataUrl.split(',')[1], selectedAgent?.systemInstruction);
        if (result.summary === 'NO_CHANGES_NEEDED') {
            startAgentTestingPhase();
        } else {
            setGeneratedCode(result.code);
            setChangeSummary(`I found a small issue and fixed it: ${result.summary}`);
            // Let new code trigger a new screenshot and review. To prevent loops, we'll proceed after one correction.
            startAgentTestingPhase();
        }
    } catch (error) {
        console.error("Error during self-correction:", error);
        setStatus('finished');
        setIsLoading(false);
    }
  };

  const startAgentTestingPhase = async () => {
      setStatus('testing');
      try {
          const action = await getPrimaryAction(generatedCode, selectedAgent?.systemInstruction);
          onStartAgentTest(action);
      } catch(error) {
          console.error("Could not get primary action:", error);
          setStatus('finished');
          setIsLoading(false);
      }
  };

  useImperativeHandle(ref, () => ({
    submitRefinement,
    reviewScreenshot,
    finalizeTest: () => {
        setStatus('finished');
        setIsLoading(false);
    }
  }));

  const submitRefinement = async (refinementPrompt: string) => {
    if (!generatedCode) return;
    setStatus('generating');
    setIsLoading(true);
    setInput('');
    try {
      const agentInstruction = selectedAgent?.systemInstruction;
      const result = await refineAppCode(generatedCode, refinementPrompt, agentInstruction);
      setGeneratedCode(result.code);
      saveApp(currentPlan?.title || "Updated App", result.code, appMode as 'build' | 'form');
      setChangeSummary(result.summary);
      // Let screenshot trigger next phase
    } catch (error) {
        console.error("Error refining code:", error);
        setChangeSummary("Sorry, I couldn't apply those changes.");
        setStatus('finished');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    submitRefinement(input);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800">{currentPlan?.title || "Building your app..."}</h2>
        <p className="text-gray-500 mt-1">From prompt: "{prompt}"</p>
        
        <div className="mt-8 space-y-6">
            <Step icon={<StarIcon className="w-5 h-5"/>} title="1. Review the generated plan" isComplete={status !== 'planning' && status !== 'idle'}>
                {currentPlan && (
                    <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p className="font-medium text-gray-800">{currentPlan.description}</p>
                    </div>
                )}
            </Step>
            
            <Step icon={<BotIcon className="w-5 h-5"/>} title="2. Generate the application" isComplete={isCodeGenerated}>
                {changeSummary && <p className="text-sm text-gray-600 italic">"{changeSummary}"</p>}
                 {isCodeGenerated && !isLoading && status !== 'finished' && (
                    <div className="text-sm text-gray-600 italic flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                        <span>AI is working...</span>
                    </div>
                )}
            </Step>
            
            <Step icon={<BotIcon className="w-5 h-5"/>} title="3. Self-correct and test" isComplete={status === 'finished'}>
                {status === 'reviewing' && <p className="text-sm text-gray-600 italic">Reviewing the generated UI...</p>}
                {status === 'testing' && <p className="text-sm text-gray-600 italic">Testing primary functionality...</p>}
            </Step>
        </div>
        
        {isCodeGenerated && (
             <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Version 1</span>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Live</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{status === 'finished' ? "Landing page created." : "Creating landing page..."}</p>
            </div>
        )}

        {status === 'finished' && (
            <div className="mt-10">
                <h3 className="text-lg font-semibold text-gray-800">Everything's finished!</h3>
                <div className="mt-4 space-y-3">
                    <button onClick={onToggleCodeView} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700">View/edit codes or download</button>
                </div>
            </div>
        )}

      </div>
      <div className="p-4 bg-white border-t border-gray-200">
        <p className="text-sm font-medium text-gray-600 mb-2">How's it going? Ask the team to...</p>
        <form onSubmit={handleSendMessage} className="relative">
            <button type="button" className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-200 rounded-full hover:bg-gray-300">
                <PlusIcon className="w-4 h-4 text-gray-600" />
            </button>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isCodeGenerated ? "Make changes to the app..." : "Waiting for app to be generated..."}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                disabled={!isCodeGenerated || isLoading}
            />
        </form>
      </div>
    </div>
  );
});

export default ChatPanel;
