import React, { useState, useEffect, FormEvent, forwardRef, useImperativeHandle } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
    generateAppPlan, generateAppCode, generateFlashcards, 
    generateFormPlan, generateFormCode, refineAppCode, 
    generateNativeAppCode, refineNativeAppCode, 
    selfCorrectCode, generateDocumentPlan, generateDocumentCode,
    generateComponentPlan, generateComponentCode, translateCodeToWebApp,
    analyzeUiUx, cloneWebsite
} from '../../services/geminiService';
import { saveApp } from '../../services/storageService';
import type { Message, AppPlan, FormPlan, DocumentPlan, RefinementResult, UiUxAnalysis, ComponentPlan, GenerationStatus } from '../../types';
import { AgentTestAction } from '../pages/AppBuilderPage';
import { HtmlIcon, CssIcon, TsIcon, FileTextIcon, ReactIcon, BotIcon, CheckIcon, PlusIcon, StarIcon, SendIcon, SearchIcon, CodeBracketIcon } from '../common/Icons';

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

const UiAnalysisResult: React.FC<{ analysis: UiUxAnalysis }> = ({ analysis }) => (
    <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex-shrink-0 bg-indigo-500/20 text-indigo-300 rounded-full flex items-center justify-center">
                <SearchIcon className="w-5 h-5" />
            </div>
            <div>
                <h4 className="font-semibold text-gray-200">UI/UX Analysis Complete</h4>
                <p className="text-sm text-gray-400">{analysis.headline}</p>
            </div>
        </div>
        <ul className="mt-4 space-y-3 text-sm">
            {analysis.suggestions.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                    <CheckIcon className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                        <strong className="text-gray-300">{item.area}:</strong>
                        <span className="text-gray-400 ml-1">{item.suggestion}</span>
                    </div>
                </li>
            ))}
        </ul>
    </div>
);


// --- Main ChatPanel Component ---

export interface ChatPanelRef {
  submitRefinement: (prompt: string) => void;
  reviewScreenshot: (dataUrl: string) => void;
  finalizeTest: () => void;
  runUiUxAnalysis: (dataUrl: string) => void;
}

interface ChatPanelProps {
    onStartAgentTest: (action: AgentTestAction) => void;
    onToggleCodeView: () => void;
    status: GenerationStatus;
    setStatus: (status: GenerationStatus) => void;
}

const MAX_CHARS_REFINEMENT = 200;

const ChatPanel = forwardRef<ChatPanelRef, ChatPanelProps>(({ onStartAgentTest, onToggleCodeView, status, setStatus }, ref) => {
  const { 
    prompt, isTranslation, isCloning, generatedCode, setGeneratedCode, 
    appMode, setGeneratedFlashcards, agents, selectedAgentId, selectedModel
  } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<AppPlan | FormPlan | DocumentPlan | ComponentPlan | null>(null);

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  useEffect(() => {
    if (prompt) {
      setGeneratedCode('');
      setGeneratedFlashcards(null);
      setIsCodeGenerated(false);
      setCurrentPlan(null);
      setMessages([]);
      setStatus('planning');
      setIsLoading(true);

      const agentInstruction = selectedAgent?.systemInstruction;

      const handleErrors = (error: any, type: string) => {
        console.error(`Error generating ${type}:`, error);
        setMessages(prev => [...prev, { role: 'assistant', content: `Error generating ${type}. Please try again.` }]);
        setStatus('finished');
        setIsLoading(false);
      };
      
      if(isTranslation) {
        translateCodeToWebApp(prompt, selectedModel, agentInstruction)
            .then(code => handleCodeGeneration(code, "Translated App"))
            .catch(error => handleErrors(error, 'code translation'))
            .finally(() => setIsLoading(false));
        return;
      }

      if(isCloning) {
        cloneWebsite(prompt, selectedModel, agentInstruction)
            .then(code => handleCodeGeneration(code, `Clone of ${prompt}`))
            .catch(error => handleErrors(error, 'website clone'))
            .finally(() => setIsLoading(false));
        return;
      }

      const planGenerators: { [key: string]: (prompt: string, model: any, agentInstruction?: string) => Promise<any> } = {
          build: generateAppPlan,
          native: generateAppPlan,
          form: generateFormPlan,
          document: generateDocumentPlan,
          component: generateComponentPlan,
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
        planGenerators[appMode](prompt, selectedModel, agentInstruction)
          .then((plan: AppPlan | FormPlan | DocumentPlan | ComponentPlan) => {
              setCurrentPlan(plan);
              setStatus('generating');
              return generateCode(plan);
          })
          .catch(error => handleErrors(error, 'plan'));
      }
    }
  }, [prompt, appMode, selectedModel, isTranslation, isCloning]);
  
  const generateCode = async (plan: AppPlan | FormPlan | DocumentPlan | ComponentPlan) => {
      const agentInstruction = selectedAgent?.systemInstruction;
      
      try {
          let code: string;
          let title = "Generated Content";
          if (appMode === 'build' && 'features' in plan) {
              code = await generateAppCode(plan as AppPlan, selectedModel, agentInstruction);
              title = plan.title;
          } else if (appMode === 'native' && 'features' in plan) {
              code = await generateNativeAppCode(plan as AppPlan, selectedModel, agentInstruction);
              title = plan.title;
          } else if (appMode === 'form' && 'fields' in plan) {
              code = await generateFormCode(plan as FormPlan, selectedModel, agentInstruction);
              title = plan.title;
          } else if (appMode === 'document' && 'documentType' in plan) {
              code = await generateDocumentCode(plan as DocumentPlan, selectedModel, agentInstruction);
              title = plan.title;
          } else if (appMode === 'component' && 'properties' in plan) {
              code = await generateComponentCode(plan as ComponentPlan, selectedModel, agentInstruction);
              title = (plan as ComponentPlan).name;
          } else {
              throw new Error(`Invalid appMode or plan type mismatch: ${appMode}`);
          }
          
          handleCodeGeneration(code, title);

      } catch (error) {
          console.error("Error generating code:", error);
          setMessages(prev => [...prev, {role: 'assistant', content: "Sorry, there was an error generating the code."}]);
          setStatus('finished');
          setIsLoading(false);
      }
  };

  const handleCodeGeneration = (code: string, title: string) => {
      setGeneratedCode(code); // This triggers PreviewPanel screenshot
      saveApp(title, code, appMode);
      setIsCodeGenerated(true);
  }

  const reviewScreenshot = async (dataUrl: string) => {
    // Self-correction and testing step has been removed by user request.
    // This function is still wired up and is called after code generation.
    // We just call finalizeTest() to move the status to 'finished'.
    finalizeTest();
  };
  
  const finalizeTest = () => {
    setStatus('finished');
    setIsLoading(false);
  };

  const runUiUxAnalysis = async (dataUrl: string) => {
      if (!generatedCode) return;
      setMessages(prev => [...prev, {role: 'assistant', content: 'Analyzing UI/UX...', isAgentActivity: true}]);
      setIsLoading(true);
      try {
          const agentInstruction = selectedAgent?.systemInstruction;
          const analysis = await analyzeUiUx(generatedCode, dataUrl, agentInstruction);
          setMessages(prev => prev.filter(m => m.content !== 'Analyzing UI/UX...'));
          setMessages(prev => [...prev, {role: 'assistant', content: '', analysis}]);
      } catch (error) {
          console.error("Error running analysis:", error);
          setMessages(prev => prev.filter(m => m.content !== 'Analyzing UI/UX...'));
          setMessages(prev => [...prev, {role: 'assistant', content: "Sorry, I couldn't run the UI/UX analysis."}]);
      } finally {
          setIsLoading(false);
      }
  };

  useImperativeHandle(ref, () => ({
    submitRefinement,
    reviewScreenshot,
    finalizeTest,
    runUiUxAnalysis,
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
      // FIX: Safely access title or name from the union type for the currentPlan.
      saveApp((currentPlan as any)?.title || (currentPlan as any)?.name || "Updated App", result.code, appMode);
      setMessages(prev => [...prev, {role: 'assistant', content: result.summary, isChangeSummary: true}]);
    } catch (error) {
        console.error("Error refining code:", error);
        setMessages(prev => [...prev, {role: 'assistant', content: "Sorry, I couldn't apply those changes."}]);
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

  const isRefinementDisabled = !isCodeGenerated || isLoading || appMode === 'document' || appMode === 'study';

  const getPlaceholderText = () => {
    if (!isCodeGenerated) return "Waiting for content to be generated...";
    if (appMode === 'document' || appMode === 'study') return "Generation complete.";
    return "Describe a change...";
  };

  return (
    <div className="flex flex-col h-full text-gray-300">
      <div className="flex-1 p-6 overflow-y-auto">
        {/* FIX: Safely access title or name from the union type of currentPlan. */}
        <h2 className="text-2xl font-bold text-gray-100">{(currentPlan as any)?.title || (currentPlan as any)?.name || "Building your creation..."}</h2>
        <p className="text-gray-400 mt-1 line-clamp-1">From prompt: "{prompt}"</p>
        
        <div className="mt-8 space-y-6">
            <Step icon={<StarIcon className="w-5 h-5"/>} title="1. Review the generated plan" isComplete={status !== 'planning' && status !== 'idle'}>
                {currentPlan && (
                    <div className="text-sm text-gray-300 p-3 bg-white/5 rounded-md border border-white/10">
                        <p className="font-medium text-gray-200">
                           {/* FIX: Safely access description property, which doesn't exist on DocumentPlan. */}
                           { (currentPlan as any).description || `Type: ${(currentPlan as DocumentPlan).documentType}` }
                        </p>
                    </div>
                )}
            </Step>
            
            <Step icon={<BotIcon className="w-5 h-5"/>} title="2. Generate the content" isComplete={isCodeGenerated || status === 'finished'}>
                {messages.filter(m => m.isChangeSummary).map((m, i) => (
                    <p key={i} className="text-sm text-gray-400 italic">"{m.content}"</p>
                ))}
            </Step>
        </div>
        
        <div className="mt-6 space-y-3">
             {messages.filter(m => !m.isChangeSummary).map((msg, index) => (
                msg.analysis 
                    ? <UiAnalysisResult key={index} analysis={msg.analysis} />
                    : <p key={index} className="text-sm text-gray-400">{msg.content}</p>
             ))}
        </div>
        
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
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                    }
                }}
                placeholder={getPlaceholderText()}
                className="w-full bg-black/30 backdrop-blur-lg border border-white/10 rounded-full py-3 pl-5 pr-12 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-gray-500 text-gray-200"
                rows={1}
                disabled={isRefinementDisabled}
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-3">
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