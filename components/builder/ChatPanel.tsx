

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { generateAppPlan, generateAppCode, generateFlashcards, generateFormPlan, generateFormCode, refineAppCode, generateNativeAppCode, refineNativeAppCode, generateReactAppPlan, generateReactAppCode, refineReactAppCode } from '../../services/geminiService';
import { saveApp } from '../../services/storageService';
import type { Message, AppPlan, FormPlan, ReactAppPlan } from '../../types';

interface PlanDisplayProps {
  plan: AppPlan;
  onGenerate: () => void;
  isGenerated: boolean;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onGenerate, isGenerated }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-800">{plan.title}</h3>
        <p className="text-gray-600 mb-4">{plan.description}</p>
        <ul className="space-y-2 mb-6">
            {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                </li>
            ))}
        </ul>
        <button
            onClick={onGenerate}
            disabled={isGenerated}
            className="w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
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
        <button
            onClick={onGenerate}
            disabled={isGenerated}
            className="w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            {isGenerated ? 'Form Generated' : 'Looks good, create the form!'}
        </button>
    </div>
);

const ReactAppPlanDisplay: React.FC<{ plan: ReactAppPlan, onGenerate: () => void, isGenerated: boolean }> = ({ plan, onGenerate, isGenerated }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <h3 className="text-xl font-bold mb-2 text-gray-800">{plan.title}</h3>
    <p className="text-gray-600 mb-4">{plan.description}</p>
    <div className="mb-6">
      <h4 className="font-semibold text-gray-700 mb-2">File Structure:</h4>
      <div className="bg-gray-100 rounded-md p-3 max-h-48 overflow-y-auto">
        <ul className="space-y-1">
          {plan.files.map((file) => (
            <li key={file.name} className="text-sm font-mono text-gray-600">
              {file.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
    <button
      onClick={onGenerate}
      disabled={isGenerated}
      className="w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {isGenerated ? 'App Generated' : 'Looks good, create the app!'}
    </button>
  </div>
);


const ESTIMATED_BUILD_TIME = 20; // 20 seconds

interface BuildStatusCardProps {
  status: string;
  countdown: number;
}

const BuildStatusCard: React.FC<BuildStatusCardProps> = ({ status, countdown }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-gray-800">Silo is building...</h4>
            <span className="text-sm text-gray-500 font-mono">~{countdown}s left</span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
                className="bg-indigo-500 h-full rounded-full absolute top-0 left-0 transition-all duration-1000 ease-linear" 
                style={{ width: `${((ESTIMATED_BUILD_TIME - countdown) / ESTIMATED_BUILD_TIME) * 100}%` }}
            ></div>
        </div>
        <div className="flex items-center mt-3 text-gray-600">
             <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse mr-3"></div>
             <span className="text-sm">{status}</span>
        </div>
    </div>
);

const ChatPanel: React.FC = () => {
  const { 
    prompt, 
    generatedCode, setGeneratedCode, 
    generatedFileTree, setGeneratedFileTree,
    appMode, setGeneratedFlashcards, agents, selectedAgentId 
  } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<AppPlan | FormPlan | ReactAppPlan | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [buildStatus, setBuildStatus] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const buildIntervalRef = useRef<number | null>(null);

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
      setGeneratedFileTree(null);
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
      } else if (appMode === 'react_web') {
        generateReactAppPlan(prompt, agentInstruction)
            .then(plan => {
                setCurrentPlan(plan);
                const modelMessage: Message = { role: 'model', content: JSON.stringify(plan), isPlan: true, planType: 'react_web' };
                setMessages(prev => [...prev, modelMessage]);
            })
            .catch(error => handleErrors(error, 'react web app plan'))
            .finally(() => setIsLoading(false));
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, appMode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, buildStatus]);
  
  useEffect(() => {
    let timer: number;
    if (isLoading && countdown > 0) {
        timer = window.setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isLoading, countdown]);

  const startBuildProcess = (steps: string[]) => {
      setIsLoading(true);
      setCountdown(ESTIMATED_BUILD_TIME);
      
      let stepIndex = 0;
      setBuildStatus(steps[stepIndex]);

      const stepDuration = (ESTIMATED_BUILD_TIME * 1000) / steps.length;
      
      if (buildIntervalRef.current) clearInterval(buildIntervalRef.current);

      buildIntervalRef.current = window.setInterval(() => {
          stepIndex++;
          if (stepIndex < steps.length) {
              setBuildStatus(steps[stepIndex]);
          } else {
              if (buildIntervalRef.current) clearInterval(buildIntervalRef.current);
          }
      }, stepDuration);
  }

  const endBuildProcess = () => {
    setIsLoading(false);
    if (buildIntervalRef.current) clearInterval(buildIntervalRef.current);
    setBuildStatus('');
  }
  
  const handleGenerateCode = async (plan: AppPlan) => {
      if (isCodeGenerated) return;
      startBuildProcess([
          "Laying the foundation...",
          ...plan.features.map(feature => `Implementing: ${feature}`),
          "Styling the components...",
          "Finalizing the script..."
      ]);
      
      try {
          const agentInstruction = selectedAgent?.systemInstruction;
          const code = await generateAppCode(plan, agentInstruction);
          setGeneratedCode(code);
          saveApp(plan.title, code, 'build');
          setIsCodeGenerated(true);
          const successMessage: Message = { role: 'model', content: "I've generated the app for you. You can see it in the preview panel!" };
          setMessages(prev => [...prev, successMessage]);
      } catch (error) {
          console.error("Error generating code:", error);
          const errorMessage: Message = { role: 'model', content: "Sorry, there was an error generating the code. Please try again." };
          setMessages(prev => [...prev, errorMessage]);
      } finally {
          endBuildProcess();
      }
  };
  
  const handleGenerateReactAppCode = async (plan: ReactAppPlan) => {
    if (isCodeGenerated) return;
    startBuildProcess([
      "Setting up Vite project...",
      ...plan.files.map(file => `Generating file: ${file.name}`),
      "Installing dependencies...",
      "Finalizing the app..."
    ]);
    try {
      const agentInstruction = selectedAgent?.systemInstruction;
      const files = await generateReactAppCode(plan, agentInstruction);
      setGeneratedFileTree(files);
      saveApp(plan.title, files, 'react_web');
      setIsCodeGenerated(true);
      const successMessage: Message = { role: 'model', content: "I've generated the React app! The live preview is starting up now." };
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      console.error("Error generating React app code:", error);
      const errorMessage: Message = { role: 'model', content: "Sorry, there was an error generating the React app. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      endBuildProcess();
    }
  };

  const handleGenerateNativeCode = async (plan: AppPlan) => {
      if (isCodeGenerated) return;
      startBuildProcess([
          "Drafting native components...",
          ...plan.features.map(feature => `Implementing: ${feature}`),
          "Writing stylesheets...",
          "Finalizing the Expo app..."
      ]);
      
      try {
          const agentInstruction = selectedAgent?.systemInstruction;
          const code = await generateNativeAppCode(plan, agentInstruction);
          setGeneratedCode(code);
          saveApp(plan.title, code, 'native');
          setIsCodeGenerated(true);
          const successMessage: Message = { role: 'model', content: "I've generated the native app for you. Scan the QR code in the preview panel with Expo Go to run it!" };
          setMessages(prev => [...prev, successMessage]);
      } catch (error) {
          console.error("Error generating native code:", error);
          const errorMessage: Message = { role: 'model', content: "Sorry, there was an error generating the native app code. Please try again." };
          setMessages(prev => [...prev, errorMessage]);
      } finally {
          endBuildProcess();
      }
  };

  const handleGenerateForm = async (plan: FormPlan) => {
    if (isCodeGenerated) return;
    startBuildProcess([
        "Drafting the HTML structure...",
        ...plan.fields.map(field => `Adding field: ${field.name}`),
        "Applying Tailwind styles...",
        "Setting up Netlify integration..."
    ]);

    try {
        const agentInstruction = selectedAgent?.systemInstruction;
        const code = await generateFormCode(plan, agentInstruction);
        setGeneratedCode(code);
        saveApp(plan.title, code, 'form');
        setIsCodeGenerated(true);
        const successMessage: Message = { role: 'model', content: "I've generated the form for you. It's ready for Netlify!" };
        setMessages(prev => [...prev, successMessage]);
    } catch (error) {
        console.error("Error generating form code:", error);
        const errorMessage: Message = { role: 'model', content: "Sorry, there was an error generating the form code." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        endBuildProcess();
    }
};
  
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isCodeGenerated && (generatedCode || generatedFileTree)) {
        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');

        startBuildProcess([
            `Understanding: "${currentInput}"`,
            "Analyzing existing code...",
            "Applying modifications...",
            "Finalizing new version..."
        ]);

        try {
            const agentInstruction = selectedAgent?.systemInstruction;
            let successMessage: Message;

            if (appMode === 'react_web' && generatedFileTree) {
                const newFileTree = await refineReactAppCode(generatedFileTree, currentInput, agentInstruction);
                setGeneratedFileTree(newFileTree);
                const title = currentPlan?.title ? `Update: ${currentPlan.title}` : 'Updated App';
                saveApp(title, newFileTree, 'react_web');
                successMessage = { role: 'model', content: "I've updated the React app with your changes." };
            } else if (appMode === 'native' && generatedCode) {
                const newCode = await refineNativeAppCode(generatedCode, currentInput, agentInstruction);
                setGeneratedCode(newCode);
                const title = currentPlan?.title ? `Update: ${currentPlan.title}` : 'Updated App';
                saveApp(title, newCode, 'native');
                successMessage = { role: 'model', content: "I've updated the native app." };
            } else if (generatedCode) { // build or form
                const newCode = await refineAppCode(generatedCode, currentInput, agentInstruction);
                setGeneratedCode(newCode);
                const title = currentPlan?.title ? `Update: ${currentPlan.title}` : 'Updated App';
                saveApp(title, newCode, appMode as 'build' | 'form');
                successMessage = { role: 'model', content: "I've updated the app with your changes. Take a look!" };
            } else {
                throw new Error("No code available to refine.");
            }
             setMessages(prev => [...prev, successMessage]);
        } catch (error) {
            console.error("Error refining code:", error);
            const errorMessage: Message = { role: 'model', content: "Sorry, I couldn't apply those changes. The previous version is still active." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            endBuildProcess();
        }
    } else {
      console.log("Cannot send message. App not generated yet.");
    }
  };

  return (
    <div className="w-1/2 flex flex-col h-full bg-gray-50">
      <header className="p-4 border-b border-gray-200 flex items-center">
        <div className="flex items-center gap-3">
          {selectedAgent && (
            <img src={selectedAgent.imageUrl} alt={selectedAgent.name} className="w-10 h-10 rounded-full" />
          )}
          <h2 className="text-xl font-semibold">{selectedAgent ? selectedAgent.name : "Conversation"}</h2>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.isPlan ? (
              <div className="w-full max-w-lg">
                {msg.planType === 'app' ? (
                    <PlanDisplay 
                        plan={JSON.parse(msg.content)} 
                        onGenerate={() => {
                            const plan = JSON.parse(msg.content);
                            if (appMode === 'native') {
                                handleGenerateNativeCode(plan);
                            } else {
                                handleGenerateCode(plan);
                            }
                        }}
                        isGenerated={isCodeGenerated}
                    />
                ) : msg.planType === 'react_web' ? (
                     <ReactAppPlanDisplay
                        plan={JSON.parse(msg.content)}
                        onGenerate={() => handleGenerateReactAppCode(JSON.parse(msg.content))}
                        isGenerated={isCodeGenerated}
                    />
                ) : (
                    <FormPlanDisplay
                        plan={JSON.parse(msg.content)}
                        onGenerate={() => handleGenerateForm(JSON.parse(msg.content))}
                        isGenerated={isCodeGenerated}
                    />
                )}
              </div>
            ) : (
              <div className={`max-w-lg p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            )}
          </div>
        ))}
        {isLoading && !isCodeGenerated && (
           <div className="flex justify-start">
             <div className="max-w-lg p-4 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.1s]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <span className="ml-2 text-sm text-gray-600">Silo is thinking...</span>
                </div>
             </div>
           </div>
        )}
        {isLoading && buildStatus && (
            <div className="flex justify-start">
                <div className="w-full max-w-lg">
                    <BuildStatusCard status={buildStatus} countdown={countdown} />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isCodeGenerated ? "Ask for modifications..." : "Describe your app to start..."}
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
};

export default ChatPanel;