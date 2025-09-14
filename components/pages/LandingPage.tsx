import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GitHubIcon, DiscordIcon, BrainCircuitIcon, CodeIcon, UsersIcon, AtSignIcon, ChevronDownIcon, CheckIcon } from '../common/Icons';
import GoogleSignInButton from '../auth/GoogleSignInButton';
import { useAppContext } from '../../context/AppContext';

const AdsterraComponent: React.FC = () => {
    useEffect(() => {
        const containerId = 'container-e9754facbac6b493647ba99f86d63a4c';
        const container = document.getElementById(containerId);
        
        if (container && !container.querySelector('script')) {
            const script = document.createElement('script');
            script.async = true;
            script.setAttribute('data-cfasync', 'false');
            script.src = "//pl27645172.revenuecpmgate.com/e9754facbac6b493647ba99f86d63a4c/invoke.js";
            container.appendChild(script);
        }
    }, []);

    return (
        <div id="container-e9754facbac6b493647ba99f86d63a4c"></div>
    );
};

const AdComponent: React.FC = () => {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <ins className="adsbygoogle"
             style={{display: 'block', textAlign: 'center'}}
             data-ad-layout="in-article"
             data-ad-format="fluid"
             data-ad-client="ca-pub-7029279570287128"
             data-ad-slot="7988731574"></ins>
    );
};

const Header: React.FC = () => {
    const navigate = useNavigate();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-2xl">
            <nav>
                <div className="flex items-center justify-between gap-4 bg-white/70 backdrop-blur-md rounded-full shadow-lg ring-1 ring-black/5 px-4 py-2 sm:px-6 sm:py-3">
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <img src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Silo Create Logo" className="w-8 h-8 rounded-full" />
                    </Link>
                    <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-600">
                         <button onClick={() => scrollToSection('features')} className="hover:text-indigo-600 transition-colors">Features</button>
                         <button onClick={() => scrollToSection('pricing')} className="hover:text-indigo-600 transition-colors">Pricing</button>
                         <button onClick={() => scrollToSection('faq')} className="hover:text-indigo-600 transition-colors">FAQ</button>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href="https://discord.gg/sPt7bZAB" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/80 text-gray-700 text-sm font-semibold rounded-full hover:bg-white transition-colors shadow-sm ring-1 ring-gray-200">
                           <DiscordIcon className="h-5 w-5 text-[#5865F2]" />
                           <span>Join Discord</span>
                        </a>
                        <a href="https://discord.gg/sPt7bZAB" target="_blank" rel="noopener noreferrer" className="sm:hidden flex items-center justify-center w-10 h-10 bg-white/80 rounded-full text-gray-700 hover:bg-white transition-colors shadow-sm ring-1 ring-gray-200">
                            <DiscordIcon className="h-5 w-5 text-[#5865F2]" />
                        </a>
                        <button onClick={() => navigate('/login')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-sm">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

const Footer: React.FC = () => (
    <footer className="bg-white/50 border-t border-gray-200 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Silo Create. All rights reserved.
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
    <div className="w-full max-w-3xl mx-auto mt-8 rounded-2xl shadow-2xl ring-1 ring-gray-900/10 bg-[#2a2734] font-mono text-sm overflow-hidden h-80 flex flex-col">
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
        <div className="relative bg-white text-gray-800 overflow-x-hidden">
            <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 -left-80 w-[40rem] h-[40rem] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 -right-40 w-[40rem] h-[40rem] bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-40 left-20 w-[40rem] h-[40rem] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                <div className="absolute -bottom-80 -right-20 w-[40rem] h-[40rem] bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
            </div>

            <Header />
            <main>
                {/* Hero Section */}
                <div className="relative isolate">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
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
                        <div className="mt-8 flex justify-center">
                            <a href="https://www.producthunt.com/products/silo-creative-app-builder?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-silo&#0045;creative&#0045;app&#0045;builder" target="_blank" rel="noopener noreferrer">
                                <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1015728&theme=light&t=1757771222673" alt="Silo&#0032;Creative&#0032;App&#0032;Builder - AI&#0032;app&#0032;builder | Product Hunt" style={{width: '250px', height: '54px'}} width="250" height="54" />
                            </a>
                        </div>
                        
                        {/* Gemini Section */}
                        <div className="mt-12 text-center">
                            <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase">POWERED BY</p>
                            <a href="https://deepmind.google/technologies/gemini/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block transition-transform hover:scale-105">
                                <img src="https://i.ibb.co/pvVQHjkw/Gemini-2-5-cover.webp" alt="Gemini 2.5 Flash Logo" className="h-12 w-auto mx-auto rounded-md shadow-sm" />
                            </a>
                            <p className="mt-4 text-gray-600 max-w-xl mx-auto">
                                Silo Create is built on Gemini 2.5 Flash, bringing you state-of-the-art speed and intelligence in AI-powered app generation.
                            </p>
                        </div>

                        <AppPreview />
                    </div>
                </div>

                {/* Who We Are Section */}
                <section id="about" className="relative isolate py-20 sm:py-28">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <img 
                            src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" 
                            alt="Silo Create Logo" 
                            className="w-24 h-24 rounded-full mx-auto mb-6"
                        />
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Who We Are</h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                            At Silo Create, we believe that a great idea shouldn't be limited by coding skills. We are a passionate team of developers and designers dedicated to making technology accessible to everyone. Our mission is to empower creators, entrepreneurs, and students to bring their digital ideas to life, instantly.
                        </p>
                        
                        <div className="mt-20">
                             <h3 className="text-2xl font-semibold text-gray-800 mb-8">Meet the Founder</h3>
                             <div className="inline-block bg-white/50 backdrop-blur-sm border border-gray-200/80 rounded-2xl shadow-lg p-8">
                                <img 
                                    src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" 
                                    alt="Emanuel Martinez" 
                                    className="w-28 h-28 rounded-full mx-auto mb-4"
                                />
                                <h4 className="text-xl font-semibold text-gray-800">Emanuel Martinez</h4>
                                <p className="text-indigo-600 font-medium">Founder</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="relative isolate py-20 sm:py-28 bg-gray-50/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Why Choose Silo Create?</h2>
                            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                                We combine powerful AI with an intuitive interface to make app development accessible to everyone.
                            </p>
                        </div>
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="text-center p-6 bg-white border border-gray-200/80 rounded-2xl">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg mb-4">
                                    <BrainCircuitIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">AI-Powered Generation</h3>
                                <p className="mt-2 text-gray-600">
                                    Describe your app in plain English and watch our AI bring it to life, generating clean, functional code in seconds.
                                </p>
                            </div>
                            <div className="text-center p-6 bg-white border border-gray-200/80 rounded-2xl">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg mb-4">
                                    <CodeIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">Instant Live Previews</h3>
                                <p className="mt-2 text-gray-600">
                                    See your application as it's being built. No more guessing—what you see is what you get, updated in real-time.
                                </p>
                            </div>
                            <div className="text-center p-6 bg-white border border-gray-200/80 rounded-2xl">
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

                {/* Ad Section */}
                <section className="py-10 bg-gray-50/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <AdComponent />
                    </div>
                </section>

                {/* Adsterra Ad Section */}
                <section className="py-10 bg-gray-50/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                        <AdsterraComponent />
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="relative isolate py-20 sm:py-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">What Our Users Say</h2>
                            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                                We're helping creators and developers build faster than ever.
                            </p>
                        </div>
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200/80">
                                <p className="text-gray-700 relative">
                                    "As a student, Silo is a game-changer. I can instantly create study tools and small apps for my projects. The unlimited student plan is amazing!"
                                </p>
                                <div className="mt-6 flex items-center gap-4">
                                    <img className="w-12 h-12 rounded-full" src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Silo Create Logo" />
                                    <div>
                                        <div className="font-semibold text-gray-800">Sarah L.</div>
                                        <div className="text-gray-500 text-sm">Computer Science Student</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200/80">
                                <p className="text-gray-700 relative">
                                    "This tool has supercharged my prototyping workflow. I can go from a client's idea to a working demo in minutes. It's an indispensable part of my toolkit now."
                                </p>
                                <div className="mt-6 flex items-center gap-4">
                                    <img className="w-12 h-12 rounded-full" src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Silo Create Logo" />
                                    <div>
                                        <div className="font-semibold text-gray-800">Mike R.</div>
                                        <div className="text-gray-500 text-sm">Freelance Developer</div>
                                    </div>
                                </div>
                            </div>
                             <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200/80">
                                <p className="text-gray-700 relative">
                                    "I don't code, but I have a lot of ideas. Silo Create bridges that gap perfectly. I can finally build and test my concepts without hiring a developer."
                                </p>
                                <div className="mt-6 flex items-center gap-4">
                                    <img className="w-12 h-12 rounded-full" src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Silo Create Logo" />
                                    <div>
                                        <div className="font-semibold text-gray-800">Jessica P.</div>
                                        <div className="text-gray-500 text-sm">Product Manager</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                 {/* Pricing Section */}
                <section id="pricing" className="relative isolate py-20 sm:py-28 bg-gray-50/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
                            <p className="mt-4 text-lg text-gray-600">Choose the plan that's right for you. Get started for free.</p>
                        </div>
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Free Plan */}
                            <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-2xl p-8 flex flex-col">
                                <h3 className="text-2xl font-semibold text-gray-800">Hobbyist</h3>
                                <p className="mt-2 text-gray-500">For personal projects and exploration.</p>
                                <div className="mt-6">
                                    <span className="text-5xl font-bold">$0</span>
                                    <span className="text-lg text-gray-500">/ month</span>
                                </div>
                                <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-500"/>1,250 free credits per month</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-500"/>Generate apps, forms, and flashcards</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-500"/>Access to Silo Agents</li>
                                </ul>
                                <button onClick={() => navigate('/login')} className="mt-8 w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                                    Get Started
                                </button>
                            </div>
                             {/* Student Plan */}
                            <div className="bg-white/80 backdrop-blur-md border-2 border-indigo-500 rounded-2xl p-8 flex flex-col relative">
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 text-white text-sm font-semibold rounded-full">
                                    Most Popular
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-800">Student</h3>
                                <p className="mt-2 text-gray-500">For learners and educators.</p>
                                <div className="mt-6">
                                    <span className="text-5xl font-bold">Free</span>
                                    <span className="text-lg text-gray-500"> for 1 year</span>
                                </div>
                                <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-500"/><strong>Unlimited</strong> credits</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-500"/>Generate apps, forms, and flashcards</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-500"/>Create and use Custom Agents</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-500"/>Requires a valid .edu email</li>
                                </ul>
                                <button onClick={() => navigate('/login')} className="mt-8 w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                                    Sign Up with School Email
                                </button>
                            </div>
                            {/* Ultra Plan */}
                            <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-2xl p-8 flex flex-col relative overflow-hidden">
                                <div className="absolute top-4 right-4 px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                                    Coming Soon
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-800">Ultra</h3>
                                <p className="mt-2 text-gray-500">For professionals and power users.</p>
                                <div className="mt-6">
                                    <span className="text-5xl font-bold">$20</span>
                                    <span className="text-lg text-gray-500">/ month</span>
                                </div>
                                <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-500"/><strong>Unlimited</strong> credits</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-500"/>Advanced AI models</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-500"/>Team collaboration features</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-500"/>Priority support</li>
                                </ul>
                                <button disabled className="mt-8 w-full py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed">
                                    Coming Soon
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="relative isolate py-20 sm:py-28">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
                            <p className="mt-4 text-lg text-gray-600">
                                Have questions? We've got answers.
                            </p>
                        </div>
                        <div className="mt-12">
                            <FaqItem question="What is Silo Create?">
                                <p>Silo Create is an AI-powered platform that lets you build simple, single-page web applications just by describing them. It's designed for makers, students, and developers who want to quickly prototype and build ideas without writing code from scratch.</p>
                            </FaqItem>
                            <FaqItem question="Do I need to know how to code?">
                                <p>Not at all! You can generate complete, functional applications just by writing a prompt. If you are a developer, you can also view and download the generated HTML and Tailwind CSS code to customize it further.</p>
                            </FaqItem>
                             <FaqItem question="What are credits?">
                                <p>Credits are used to power the AI generation. Each time you create or modify an app, form, or set of flashcards, it consumes a small number of credits. Our free Hobbyist plan provides more than enough for regular use, and our Student plan offers unlimited credits.</p>
                            </FaqItem>
                             <FaqItem question="What can I build with it?">
                                <p>You can build a wide variety of single-page applications, tools, and components. Think things like calculators, to-do lists, landing pages, forms, timers, and small interactive widgets. The complexity of what you can build will continue to grow as we improve our AI models.</p>
                            </FaqItem>
                        </div>
                    </div>
                </section>
                
                {/* Contact Section */}
                <section id="contact" className="relative isolate py-20 sm:py-28 bg-gray-50/50 backdrop-blur-sm">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Get in Touch</h2>
                        <p className="mt-4 text-lg text-gray-600">Have questions or feedback? We'd love to hear from you.</p>
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <a href="mailto:survivalcreativeminecraftadven@gmail.com" className="group p-8 bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl hover:border-indigo-500 transition-all">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg mb-4">
                                    <AtSignIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">General Inquiries</h3>
                                <p className="mt-2 text-gray-600">survivalcreativeminecraftadven@gmail.com</p>
                            </a>
                            <a href="mailto:support@silodev.com" className="group p-8 bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl hover:border-indigo-500 transition-all">
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
                           Stop wondering and start building. Join Silo Create today and turn your vision into reality.
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
            <style>{`
              .animation-delay-2000 {
                animation-delay: 2s;
              }
              .animation-delay-4000 {
                animation-delay: 4s;
              }
              .animation-delay-6000 {
                animation-delay: 6s;
              }
              @keyframes blob {
                0% {
                  transform: translate(0px, 0px) scale(1);
                }
                33% {
                  transform: translate(30px, -50px) scale(1.1);
                }
                66% {
                  transform: translate(-20px, 20px) scale(0.9);
                }
                100% {
                  transform: translate(0px, 0px) scale(1);
                }
              }
              .animate-blob {
                animation: blob 10s infinite;
              }
            `}</style>
        </div>
    );
};

export default LandingPage;