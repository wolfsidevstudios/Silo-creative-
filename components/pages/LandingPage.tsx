import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GitHubIcon, DiscordIcon, BrainCircuitIcon, CodeIcon, UsersIcon, AtSignIcon, ChevronDownIcon } from '../common/Icons';
import GoogleSignInButton from '../auth/GoogleSignInButton';
import { useAppContext } from '../../context/AppContext';

const Header: React.FC = () => {
    const navigate = useNavigate();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-lg">
            <nav>
                <div className="flex items-center justify-between gap-4 bg-white/70 backdrop-blur-md rounded-full shadow-lg ring-1 ring-black/5 px-4 py-2 sm:px-6 sm:py-3">
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <img src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Silo Creative Logo" className="w-8 h-8 rounded-full" />
                    </Link>
                    <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-600">
                         <button onClick={() => scrollToSection('features')} className="hover:text-indigo-600 transition-colors">Features</button>
                         <button onClick={() => scrollToSection('how-it-works')} className="hover:text-indigo-600 transition-colors">How It Works</button>
                         <button onClick={() => scrollToSection('faq')} className="hover:text-indigo-600 transition-colors">FAQ</button>
                    </div>
                    <button onClick={() => navigate('/login')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-sm">
                        Get Started
                    </button>
                </div>
            </nav>
        </header>
    );
};

const Footer: React.FC = () => (
    <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Silo Creative. All rights reserved.
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                    <Link to="/terms" className="hover:text-indigo-600">Terms of Service</Link>
                    <Link to="/privacy" className="hover:text-indigo-600">Privacy Policy</Link>
                </div>
                 <div className="flex space-x-6">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">GitHub</span>
                        <GitHubIcon className="h-6 w-6" />
                    </a>
                    <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Discord</span>
                        <DiscordIcon className="h-6 w-6" />
                    </a>
                </div>
            </div>
        </div>
    </footer>
);

const AppPreview: React.FC = () => {
  const [step, setStep] = useState(0); // 0: typing, 1: showing app
  const [typedText, setTypedText] = useState('');
  const fullText = "Create a simple pomodoro timer";

  useEffect(() => {
    if (step === 0) {
      const typingInterval = setInterval(() => {
        setTypedText(prev => {
          if (prev.length < fullText.length) {
            return fullText.substring(0, prev.length + 1);
          } else {
            clearInterval(typingInterval);
            setTimeout(() => setStep(1), 1000); // Wait a bit before showing app
            return prev;
          }
        });
      }, 100);

      return () => clearInterval(typingInterval);
    }
  }, [step]);

  return (
    <div className="w-full max-w-3xl mx-auto mt-16 rounded-2xl shadow-2xl ring-1 ring-gray-900/10 bg-[#2a2734] font-mono text-sm overflow-hidden h-80 flex flex-col">
      <div className="bg-gray-700/50 px-4 py-3 flex items-center gap-2 flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
      </div>
      <div className="relative flex-1 p-6 overflow-hidden">
        {/* Step 0: Typing prompt */}
        <div className={`absolute inset-0 p-6 transition-opacity duration-500 ${step === 0 ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-gray-300">
            <span className="text-green-400">&gt; </span>{typedText}
            <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse"></span>
          </p>
        </div>

        {/* Step 1: Showing generated app */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${step === 1 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-400 rounded-lg flex flex-col items-center justify-center p-4 font-sans animate-fade-in">
                <div className="text-white text-center opacity-0 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                    <p className="text-lg font-medium tracking-wider">POMODORO</p>
                    <h2 className="text-7xl font-bold tracking-tighter my-2">25:00</h2>
                </div>
                <div className="flex space-x-4 mt-6 opacity-0 animate-slide-in-up" style={{ animationDelay: '400ms' }}>
                    <button className="px-6 py-2 bg-white/30 text-white font-semibold rounded-full hover:bg-white/40 transition-colors">Start</button>
                    <button className="px-6 py-2 bg-white/30 text-white font-semibold rounded-full hover:bg-white/40 transition-colors">Reset</button>
                </div>
                 <div className="mt-6 w-full max-w-xs bg-white/20 p-3 rounded-lg text-left text-white opacity-0 animate-slide-in-up" style={{ animationDelay: '600ms' }}>
                    <h3 className="font-bold mb-2">Tasks:</h3>
                    <ul className="text-sm space-y-1">
                        <li>- Design landing page</li>
                        <li>- Implement animation</li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
       <style>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
            @keyframes slide-in-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-slide-in-up {
                animation: slide-in-up 0.6s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 py-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left text-lg font-medium text-gray-800"
            >
                <span>{question}</span>
                <ChevronDownIcon className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                <div className="text-gray-600">
                    {children}
                </div>
            </div>
        </div>
    );
};


const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { signInAnonymously } = useAppContext();

    const handleAnonymousSignIn = async () => {
        try {
            await signInAnonymously();
            navigate('/home');
        } catch(e) {
            console.error("Anonymous sign in failed", e);
        }
    };

    return (
        <div className="bg-white text-gray-800">
            <Header />
            <main>
                {/* Hero Section */}
                <div className="relative bg-gray-50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-white to-purple-100/50 blur-3xl"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
                            Create Web Apps Instantly
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                            Describe your idea. Our AI builds it. Go from concept to code in seconds.
                        </p>
                        <div className="mt-10 flex flex-col justify-center items-center gap-4">
                            <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-lg text-lg">
                                Get Started for Free
                            </button>
                             <div className="my-2 flex items-center w-full max-w-xs">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="mx-4 text-xs font-medium text-gray-500">OR</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>
                            <GoogleSignInButton />
                             <button
                                onClick={handleAnonymousSignIn}
                                className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                Try without an account &rarr;
                            </button>
                        </div>
                        <AppPreview />
                    </div>
                </div>

                {/* Features Section */}
                <section id="features" className="py-20 sm:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Why Choose Silo Creative?</h2>
                            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                                We combine powerful AI with an intuitive interface to make app development accessible to everyone.
                            </p>
                        </div>
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="text-center p-6 border border-gray-200/80 rounded-2xl">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg mb-4">
                                    <BrainCircuitIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">AI-Powered Generation</h3>
                                <p className="mt-2 text-gray-600">
                                    Describe your app in plain English and watch our AI bring it to life, generating clean, functional code in seconds.
                                </p>
                            </div>
                            <div className="text-center p-6 border border-gray-200/80 rounded-2xl">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg mb-4">
                                    <CodeIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">Instant Live Previews</h3>
                                <p className="mt-2 text-gray-600">
                                    See your application as it's being built. No more guessing—what you see is what you get, updated in real-time.
                                </p>
                            </div>
                            <div className="text-center p-6 border border-gray-200/80 rounded-2xl">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg mb-4">
                                    <UsersIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">Customizable AI Agents</h3>
                                <p className="mt-2 text-gray-600">
                                    Tailor the AI's personality and expertise to match your project's needs, from a formal UX expert to a creative coder.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* How it Works Section */}
                <section id="how-it-works" className="py-20 sm:py-28 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                         <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Get Started in 3 Easy Steps</h2>
                         <p className="mt-4 text-lg text-gray-600">From idea to application in just a few clicks.</p>
                         <div className="mt-16 space-y-12">
                            <div className="flex flex-col md:flex-row items-center gap-8 text-left">
                                <div className="flex-shrink-0 w-16 h-16 bg-indigo-600 text-white text-2xl font-bold rounded-full flex items-center justify-center">1</div>
                                <div>
                                    <h3 className="text-xl font-semibold">Describe Your Idea</h3>
                                    <p className="mt-1 text-gray-600">Start with a simple prompt. Whether it's a 'Pomodoro timer' or a 'contact form', just tell the AI what you need.</p>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-8 text-left">
                                <div className="flex-shrink-0 w-16 h-16 bg-indigo-600 text-white text-2xl font-bold rounded-full flex items-center justify-center">2</div>
                                <div>
                                    <h3 className="text-xl font-semibold">Review the Plan</h3>
                                    <p className="mt-1 text-gray-600">Our AI generates a clear plan with a title, description, and key features. Give it the green light to start building.</p>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-8 text-left">
                                <div className="flex-shrink-0 w-16 h-16 bg-indigo-600 text-white text-2xl font-bold rounded-full flex items-center justify-center">3</div>
                                <div>
                                    <h3 className="text-xl font-semibold">Launch & Customize</h3>
                                    <p className="mt-1 text-gray-600">Your app is ready! Preview it live, view the code, and download the complete HTML file to host anywhere.</p>
                                </div>
                            </div>
                         </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-20 sm:py-28 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
                            <p className="mt-4 text-lg text-gray-600">
                                Have questions? We've got answers.
                            </p>
                        </div>
                        <div className="mt-12">
                            <FaqItem question="What is Silo Creative?">
                                <p>Silo Creative is an AI-powered platform that lets you build simple, single-page web applications just by describing them. It's designed for makers, students, and developers who want to quickly prototype and build ideas without writing code from scratch.</p>
                            </FaqItem>
                            <FaqItem question="Do I need to know how to code?">
                                <p>Not at all! You can generate complete, functional applications just by writing a prompt. If you are a developer, you can also view and download the generated HTML and Tailwind CSS code to customize it further.</p>
                            </FaqItem>
                            <FaqItem question="Is it free to use?">
                                <p>Yes, Silo Creative offers a generous free tier to get you started. We also have a special program for students to get unlimited credits. For advanced users, we will offer premium plans in the future.</p>
                            </FaqItem>
                             <FaqItem question="What can I build with it?">
                                <p>You can build a wide variety of single-page applications, tools, and components. Think things like calculators, to-do lists, landing pages, forms, timers, and small interactive widgets. The complexity of what you can build will continue to grow as we improve our AI models.</p>
                            </FaqItem>
                        </div>
                    </div>
                </section>
                
                {/* Coming Soon Section */}
                <section id="coming-soon" className="py-20 sm:py-28 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">What's Next for Silo?</h2>
                            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                                We're always working on new features. Here's a sneak peek at what's coming soon.
                            </p>
                        </div>
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="text-center p-6 bg-white border border-gray-200/80 rounded-2xl">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-lg mb-4">
                                    <UsersIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">Team Collaboration</h3>
                                <p className="mt-2 text-gray-600">
                                    Work with your team in real-time. Share projects, invite collaborators, and build together seamlessly.
                                </p>
                            </div>
                            <div className="text-center p-6 bg-white border border-gray-200/80 rounded-2xl">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-lg mb-4">
                                    <CodeIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">Custom Domains</h3>
                                <p className="mt-2 text-gray-600">
                                    Deploy your generated application to a custom domain with a single click, directly from Silo Creative.
                                </p>
                            </div>
                            <div className="text-center p-6 bg-white border border-gray-200/80 rounded-2xl">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-lg mb-4">
                                    <BrainCircuitIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">Expanded AI Capabilities</h3>
                                <p className="mt-2 text-gray-600">
                                    Generate more complex, multi-page applications and even simple backends to handle data and logic.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="py-20 sm:py-28 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Get in Touch</h2>
                        <p className="mt-4 text-lg text-gray-600">Have questions or feedback? We'd love to hear from you.</p>
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <a href="mailto:survivalcreativeminecraftadven@gmail.com" className="group p-8 border border-gray-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg mb-4">
                                    <AtSignIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">General Inquiries</h3>
                                <p className="mt-2 text-gray-600">survivalcreativeminecraftadven@gmail.com</p>
                            </a>
                            <a href="mailto:support@silodev.com" className="group p-8 border border-gray-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg mb-4">
                                    <AtSignIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">Support</h3>
                                <p className="mt-2 text-gray-600">support@silodev.com</p>
                            </a>
                        </div>
                    </div>
                </section>
                
                {/* Final CTA Section */}
                <section className="bg-indigo-700 text-white">
                     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold">Ready to Build Your Idea?</h2>
                        <p className="mt-4 text-lg text-indigo-200 max-w-2xl mx-auto">
                           Stop wondering and start building. Join Silo Creative today and turn your vision into reality.
                        </p>
                        <div className="mt-10">
                            <button onClick={() => navigate('/login')} className="px-8 py-3.5 bg-white text-indigo-600 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg text-lg">
                                Start Building Now
                            </button>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;