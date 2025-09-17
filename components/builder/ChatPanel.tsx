
import React, { useState, useEffect, useRef, FormEvent, forwardRef, useImperativeHandle } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
    generateAppPlan, generateAppCode, generateFlashcards, 
    generateFormPlan, generateFormCode, refineAppCode, 
    generateNativeAppCode, refineNativeAppCode, chatAboutCode,
    selfCorrectCode, getPrimaryAction, generateDocumentPlan, generateDocumentCode
} from '../../services/geminiService';
import { saveApp } from '../../services/storageService';
import type { Message, AppPlan, FormPlan, DocumentPlan, RefinementResult } from '../../types';
import { AgentTestAction } from '../pages/AppBuilderPage';
import { HtmlIcon, CssIcon, TsIcon, FileTextIcon, ReactIcon, BotIcon, CheckIcon, PlusIcon, StarIcon, SendIcon } from '../common/Icons';

// --- Sub-components for new UI ---

const Step: React.FC<{ icon: React.ReactNode; title: string; children?: React.ReactNode; isComplete?: boolean }> = ({ icon, title, children, isComplete }) => (
    <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isComplete ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400'}`}>
            {isComplete ? <CheckIcon className="w-5 h-5" /> : icon}
        </div>
        <div className="flex-1 pt-1">
            <h3 className={`font-semibold ${isComplete ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{title}</h3>
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

const MAX_CHARS_REFINEMENT = 200;

const ChatPanel = forwardRef<ChatPanelRef, ChatPanelProps>(({ onStartAgentTest, onToggleCodeView }, ref) => {
  const { 
    prompt, generatedCode, setGeneratedCode, 
    appMode, setGeneratedFlashcards, agents, selectedAgentId, selectedModel
  } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<AppPlan | FormPlan | DocumentPlan | null>(null);
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
      
      const planGenerators: { [key: string]: (prompt: string, model: any, agentInstruction?: string) => Promise<any> } = {
          build: generateAppPlan,
          native: generateAppPlan,
          form: generateFormPlan,
          document: generateDocumentPlan,
      };

      if (appMode === 'study') {
          generateFlashcards(prompt, selectedModel, agentInstruction)
            .then(flashcards => {
                setGeneratedFlashcards(flashcards);
                setStatus('finished');
            })
            .catch(error => handleErrors(error, 'flashcards'))
            .finally(() => setIsLoading(false));

      } else if (appMode in planGenerators) {
        planGenerators[appMode as 'build' | 'native' | 'form' | 'document'](prompt, selectedModel, agentInstruction)
          .then((plan: AppPlan | FormPlan | DocumentPlan) => {
              setCurrentPlan(plan);
              setStatus('generating');
              return generateCode(plan);
          })
          .catch(error => handleErrors(error, 'plan'));
      }
    }
  }, [prompt, appMode, selectedModel]);
  
  const generateCode = async (plan: AppPlan | FormPlan | DocumentPlan) => {
      const agentInstruction = selectedAgent?.systemInstruction;
      
      try {
          let code: string;
          if (appMode === 'build' && 'features' in plan) {
              code = await generateAppCode(plan as AppPlan, selectedModel, agentInstruction);
          } else if (appMode === 'native' && 'features' in plan) {
              code = await generateNativeAppCode(plan as AppPlan, selectedModel, agentInstruction);
          } else if (appMode === 'form' && 'fields' in plan) {
              code = await generateFormCode(plan as FormPlan, selectedModel, agentInstruction);
          } else if (appMode === 'document' && 'documentType' in plan) {
              code = await generateDocumentCode(plan as DocumentPlan, selectedModel, agentInstruction);
          } else {
              console.error(`Invalid appMode or plan type mismatch: ${appMode}`);
              setChangeSummary(`An internal error occurred: Invalid app mode or plan mismatch.`);
              setStatus('finished');
              setIsLoading(false);
              return;
          }
          
          setGeneratedCode(code); // This triggers PreviewPanel screenshot
          saveApp(plan.title, code, appMode as 'build' | 'form' | 'native' | 'document');
          setIsCodeGenerated(true);
      } catch (error) {
          console.error("Error generating code:", error);
          setChangeSummary("Sorry, there was an error generating the code.");
          setStatus('finished');
          setIsLoading(false);
      }
  };

  const reviewScreenshot = async (dataUrl: string) => {
    if (appMode === 'document' || appMode === 'study') {
        finalizeTest();
        return;
    }
    setStatus('reviewing');
    try {
        const result = await selfCorrectCode(prompt, generatedCode, dataUrl.split(',')[1], selectedAgent?.systemInstruction);
        if (result.summary === 'NO_CHANGES_NEEDED') {
            startAgentTestingPhase();
        } else {
            setGeneratedCode(result.code);
            setChangeSummary(`I found a small issue and fixed it: ${result.summary}`);
            startAgentTestingPhase();
        }
    } catch (error) {
        console.error("Error during self-correction:", error);
        setStatus('finished');
        setIsLoading(false);
    }
  };

  const startAgentTestingPhase = async () => {
      if (appMode === 'document' || appMode === 'study') {
          finalizeTest();
          return;
      }
      setStatus('testing');
      try {
          const action = await getPrimaryAction(generatedCode, selectedModel, selectedAgent?.systemInstruction);
          onStartAgentTest(action);
      } catch(error) {
          console.error("Could not get primary action:", error);
          setStatus('finished');
          setIsLoading(false);
      }
  };
  
  const finalizeTest = () => {
    setStatus('finished');
    setIsLoading(false);
  };

  useImperativeHandle(ref, () => ({
    submitRefinement,
    reviewScreenshot,
    finalizeTest
  }));

  const submitRefinement = async (refinementPrompt: string) => {
    if (!generatedCode) return;
    setStatus('generating');
    setIsLoading(true);
    setInput('');
    try {
      const agentInstruction = selectedAgent?.systemInstruction;
      let result: RefinementResult;
      if (appMode === 'native') {
        result = await refineNativeAppCode(generatedCode, refinementPrompt, selectedModel, agentInstruction);
      } else {
        result = await refineAppCode(generatedCode, refinementPrompt, selectedModel, agentInstruction);
      }
      setGeneratedCode(result.code);
      saveApp(currentPlan?.title || "Updated App", result.code, appMode as 'build' | 'form' | 'native');
      setChangeSummary(result.summary);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS_REFINEMENT) {
      setInput(text);
    }
  };

  const isRefinementDisabled = !isCodeGenerated || isLoading || appMode === 'document' || appMode === 'study';

  const getPlaceholderText = () => {
    if (!isCodeGenerated) return "Waiting for content to be generated...";
    if (appMode === 'document') return "Document generation complete.";
    if (appMode === 'study') return "Flashcards generated.";
    return "Describe a change...";
  };

  return (
    <div className="flex flex-col h-full text-gray-300">
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-100">{currentPlan?.title || "Building your creation..."}</h2>
        <p className="text-gray-400 mt-1">From prompt: "{prompt}"</p>
        
        <div className="mt-8 space-y-6">
            <Step icon={<StarIcon className="w-5 h-5"/>} title="1. Review the generated plan" isComplete={status !== 'planning' && status !== 'idle'}>
                {currentPlan && (
                    <div className="text-sm text-gray-300 p-3 bg-white/5 rounded-md border border-white/10">
                        <p className="font-medium text-gray-200">
                           { 'description' in currentPlan ? currentPlan.description : `Type: ${(currentPlan as DocumentPlan).documentType}` }
                        </p>
                    </div>
                )}
            </Step>
            
            <Step icon={<BotIcon className="w-5 h-5"/>} title="2. Generate the content" isComplete={isCodeGenerated}>
                {changeSummary && <p className="text-sm text-gray-400 italic">"{changeSummary}"</p>}
                 {isCodeGenerated && !isLoading && status !== 'finished' && (
                    <div className="text-sm text-gray-400 italic flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                        <span>AI is working...</span>
                    </div>
                )}
            </Step>
            
            <Step icon={<BotIcon className="w-5 h-5"/>} title="3. Self-correct and test" isComplete={status === 'finished'}>
                {status === 'reviewing' && <p className="text-sm text-gray-400 italic">Reviewing the generated UI...</p>}
                {status === 'testing' && <p className="text-sm text-gray-400 italic">Testing primary functionality...</p>}
                {(appMode === 'document' || appMode === 'study') && status !== 'generating' && status !== 'planning' && <p className="text-sm text-gray-400 italic">Self-correction is not applicable for this content type.</p>}
            </Step>
        </div>
        
        {isCodeGenerated && (
             <div className="mt-8 bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-200">Version 1</span>
                    <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full">Live</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{status === 'finished' ? "Content created." : "Creating content..."}</p>
            </div>
        )}

        {status === 'finished' && (
            <div className="mt-10">
                <h3 className="text-lg font-semibold text-gray-200">What's next?</h3>
                <div className="mt-4 space-y-3">
                    <button onClick={onToggleCodeView} className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-gray-300 transition-colors">View/edit codes or download</button>
                </div>
            </div>
        )}

      </div>
      <div className="p-4 bg-transparent mt-auto">
        <form onSubmit={handleSendMessage} className="relative">
            <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                    }
                }}
                placeholder={getPlaceholderText()}
                className="w-full bg-black/30 backdrop-blur-lg border border-white/10 rounded-full py-3 pl-5 pr-28 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-gray-500 text-gray-200"
                rows={1}
                disabled={isRefinementDisabled}
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-2">
                <div className="text-sm font-mono text-gray-500">
                    <span className={input.length > 0 ? "text-gray-200" : ""}>{MAX_CHARS_REFINEMENT - input.length}</span>
                </div>
                <button
                    type="submit"
                    disabled={isRefinementDisabled || !input.trim()}
                    className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center disabled:bg-gray-600/50 disabled:cursor-not-allowed hover:bg-indigo-600 transition-all shadow-lg"
                    aria-label="Send change request"
                >
                    <SendIcon className="w-4 h-4" />
                </button>
            </div>
        </form>
      </div>
    </div>
  );
});

export default ChatPanel;
