import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { generateAppPlan, generateAppCode } from '../../services/geminiService';
import type { Message, AppPlan } from '../../types';

interface PlanDisplayProps {
  plan: AppPlan;
  onGenerate: () => void;
  isGenerated: boolean;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onGenerate, isGenerated }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 my-2">
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

const ESTIMATED_BUILD_TIME = 20; // 20 seconds

interface BuildStatusCardProps {
  status: string;
  countdown: number;
}

const BuildStatusCard: React.FC<BuildStatusCardProps> = ({ status, countdown }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 my-2">
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
  const { prompt, setGeneratedCode, resetApp } = useAppContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [buildStatus, setBuildStatus] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const buildIntervalRef = useRef<number | null>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (prompt) {
      const userMessage: Message = { role: 'user', content: prompt };
      setMessages([userMessage]);
      setIsLoading(true);
      generateAppPlan(prompt)
        .then(plan => {
            const modelMessage: Message = { role: 'model', content: JSON.stringify(plan), isPlan: true };
            setMessages(prev => [...prev, modelMessage]);
        })
        .catch(error => {
            console.error("Error generating plan:", error);
            const errorMessage: Message = { role: 'model', content: "Sorry, I couldn't generate a plan right now. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        })
        .finally(() => {
            setIsLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, buildStatus]);
  
  useEffect(() => {
    let timer: number;
    if (isLoading && isCodeGenerated && countdown > 0) {
        timer = window.setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isLoading, isCodeGenerated, countdown]);
  
  const handleGenerateCode = async (plan: AppPlan) => {
      if (isCodeGenerated) return;

      setIsLoading(true);
      setIsCodeGenerated(true);
      setCountdown(ESTIMATED_BUILD_TIME);

      const buildSteps = [
          "Laying the foundation...",
          ...plan.features.map(feature => `Implementing: ${feature}`),
          "Styling the components...",
          "Finalizing the script..."
      ];
      
      let stepIndex = 0;
      setBuildStatus(buildSteps[stepIndex]);

      const stepDuration = (ESTIMATED_BUILD_TIME * 1000) / buildSteps.length;
      
      if (buildIntervalRef.current) clearInterval(buildIntervalRef.current);

      buildIntervalRef.current = window.setInterval(() => {
          stepIndex++;
          if (stepIndex < buildSteps.length) {
              setBuildStatus(buildSteps[stepIndex]);
          } else {
              if (buildIntervalRef.current) clearInterval(buildIntervalRef.current);
          }
      }, stepDuration);
      
      try {
          const code = await generateAppCode(plan);
          setGeneratedCode(code);
          const successMessage: Message = { role: 'model', content: "I've generated the app for you. You can see it in the preview panel!" };
          setMessages(prev => [...prev, successMessage]);
      } catch (error) {
          console.error("Error generating code:", error);
          const errorMessage: Message = { role: 'model', content: "Sorry, there was an error generating the code. Please try again." };
          setMessages(prev => [...prev, errorMessage]);
          setIsCodeGenerated(false); // Allow retry
      } finally {
          setIsLoading(false);
          if (buildIntervalRef.current) clearInterval(buildIntervalRef.current);
          setBuildStatus('');
      }
  };
  
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    // In a real app, you'd handle follow-up messages here.
    console.log("Follow-up message:", input);
    setInput('');
  };

  return (
    <div className="w-1/2 flex flex-col h-full bg-gray-50">
      <header className="p-4 border-b border-gray-200 flex items-center">
        <h2 className="text-xl font-semibold">Conversation</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
              {msg.isPlan ? (
                  <PlanDisplay 
                      plan={JSON.parse(msg.content)} 
                      onGenerate={() => handleGenerateCode(JSON.parse(msg.content))}
                      isGenerated={isCodeGenerated}
                  />
              ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
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
        {isLoading && isCodeGenerated && buildStatus && (
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
            placeholder="Ask for modifications..."
            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
            disabled={isLoading}
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 disabled:bg-gray-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;