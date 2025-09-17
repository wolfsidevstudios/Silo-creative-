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
                <div className="flex items-center justify-between gap-4 bg-black/30 backdrop-blur-lg rounded-full shadow-lg ring-1 ring-white/10 px-4 py-2 sm:px-6 sm:py-3">
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0" aria-label="Silo Labs Home">
                        <img src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Silo Labs Logo" className="w-8 h-8 rounded-full" />
                    </Link>
                    <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-300">
                         <button onClick={() => scrollToSection('features')} className="hover:text-indigo-400 transition-colors">Features</button>
                         <button onClick={() => scrollToSection('pricing')} className="hover:text-indigo-400 transition-colors">Pricing</button>
                         <button onClick={() => scrollToSection('faq')} className="hover:text-indigo-400 transition-colors">FAQ</button>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href="https://discord.gg/sPt7bZAB" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 text-gray-200 text-sm font-semibold rounded-full hover:bg-white/20 transition-colors shadow-sm ring-1 ring-white/10">
                           <DiscordIcon className="h-5 w-5 text-[#5865F2]" />
                           <span>Join Discord</span>
                        </a>
                        <a href="https://discord.gg/sPt7bZAB" target="_blank" rel="noopener noreferrer" className="sm:hidden flex items-center justify-center w-10 h-10 bg-white/10 rounded-full text-gray-200 hover:bg-white/20 transition-colors shadow-sm ring-1 ring-white/10" aria-label="Join our Discord">
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
    <footer className="bg-black/30 border-t border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} Silo Labs. All rights reserved.
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <Link to="/terms" className="hover:text-indigo-400">Terms of Service</Link>
                    <Link to="/privacy" className="hover:text-indigo-400">Privacy Policy</Link>
                    <Link to="/changelog" className="hover:text-indigo-400">Changelog</Link>
                </div>
                 <div className="flex space-x-6">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300" aria-label="Silo Labs on GitHub">
                        <span className="sr-only">GitHub</span>
                        <GitHubIcon className="h-6 w-6" />
                    </a>
                    <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300" aria-label="Join the Silo Labs Discord">
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
    <div className="w-full max-w-3xl mx-auto mt-8 rounded-2xl shadow-2xl ring-1 ring-white/10 bg-[#1a1a1a] font-mono text-sm overflow-hidden h-80 flex flex-col">
      <div className="bg-gray-800/50 px-4 py-3 flex items-center gap-2 flex-shrink-0">
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
            <span className="sr-only">An animation showing an AI generating a Pomodoro timer app from a text prompt. The final app shows a timer set to 25:00 with start and reset buttons.</span>
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
        <div className="border-b border-white/10 py-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left text-lg font-medium text-gray-200"
            >
                <span>{question}</span>
                <ChevronDownIcon className={`w-6 h-6 text-gray-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                <div className="text-gray-400">
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
        <div className="relative bg-black text-gray-300 overflow-x-hidden">
            <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 -left-80 w-[40rem] h-[40rem] bg-purple-500/30 rounded-full mix-blend-plus-lighter filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 -right-40 w-[40rem] h-[40rem] bg-yellow-500/30 rounded-full mix-blend-plus-lighter filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-40 left-20 w-[40rem] h-[40rem] bg-pink-500/30 rounded-full mix-blend-plus-lighter filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                <div className="absolute -bottom-80 -right-20 w-[40rem] h-[40rem] bg-orange-500/20 rounded-full mix-blend-plus-lighter filter blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
            </div>

            <Header />
            <main>
                {/* Hero Section */}
                <div className="relative isolate">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-100 leading-tight tracking-tight">
                            Create Web Apps Instantly
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-400">
                            Describe your idea. Our AI builds it. Go from concept to code in seconds.
                        </p>
                        <div className="mt-10 flex flex-col justify-center items-center gap-4">
                            <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-lg text-lg">
                                Get Started for Free
                            </button>
                             <div className="my-2 flex items-center w-full max-w-xs">
                                <div className="flex-grow border-t border-gray-700"></div>
                                <span className="mx-4 text-xs font-medium text-gray-500">OR</span>
                                <div className="flex-grow border-t border-gray-700"></div>
                            </div>
                            <GoogleSignInButton />
                             <button
                                onClick={handleAnonymousSignIn}
                                className="text-sm font-semibold text-gray-400 hover:text-indigo-400 transition-colors"
                            >
                                Try without an account &rarr;
                            </button>
                        </div>
                        <div className="mt-8 flex justify-center">
                            <a href="https://www.producthunt.com/products/silo-creative-app-builder?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-silo&#0045;creative&#0045;app&#0045;builder" target="_blank" rel="noopener noreferrer">
                                <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1015728&theme=dark&t=1757771222673" alt="Silo&#0032;Labs&#0032;Build - AI&#0032;app&#0032;builder | Product Hunt" style={{width: '250px', height: '54px'}} width="250" height="54" />
                            </a>
                        </div>
                        
                        <AppPreview />
                    </div>
                </div>

                {/* V2 Banner */}
                <section className="relative py-20 sm:py-28 overflow-hidden">
                     <div className="absolute inset-x-0 top-0 h-4/5 bg-black/30 backdrop-blur-sm [clip-path:ellipse(100%_70%_at_50%_30%)]"></div>
                     <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                        <div className="inline-flex items-center gap-3">
                            <h2 className="text-4xl sm:text-5xl font-bold text-gray-100">Silo Labs</h2>
                            <span className="px-4 py-1.5 bg-indigo-500 text-white text-lg font-semibold rounded-full shadow-lg">Build V2</span>
                        </div>
                        <p className="mt-6 text-2xl text-indigo-300 font-medium max-w-3xl mx-auto">
                            A New Era of Creation. Supercharged with 4 Powerful Features.
                        </p>
                        <div className="mt-8 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium text-gray-300">
                            <span className="flex items-center justify-center gap-2 p-2 bg-white/5 rounded-full"><CheckIcon className="w-4 h-4 text-green-400"/>Code Translation</span>
                            <span className="flex items-center justify-center gap-2 p-2 bg-white/5 rounded-full"><CheckIcon className="w-4 h-4 text-green-400"/>UI/UX Analysis</span>
                            <span className="flex items-center justify-center gap-2 p-2 bg-white/5 rounded-full"><CheckIcon className="w-4 h-4 text-green-400"/>Component Generation</span>
                            <span className="flex items-center justify-center gap-2 p-2 bg-white/5 rounded-full"><CheckIcon className="w-4 h-4 text-green-400"/>Generate Docs</span>
                        </div>
                        <div className="mt-10">
                            <button onClick={() => navigate('/login')} className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors shadow-lg">
                                Explore The New Features
                            </button>
                        </div>
                    </div>
                </section>

                {/* Who We Are Section */}
                <section id="about" className="relative isolate py-20 sm:py-28">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <img 
                            src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" 
                            alt="Silo Labs company logo" 
                            className="w-24 h-24 rounded-full mx-auto mb-6"
                        />
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-100">Who We Are</h2>
                        <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
                            At Silo Labs, we believe that a great idea shouldn't be limited by coding skills. We are a passionate team of developers and designers dedicated to making technology accessible to everyone. Our mission is to empower creators, entrepreneurs, and students to bring their digital ideas to life, instantly.
                        </p>
                        
                        <div className="mt-20">
                             <h3 className="text-2xl font-semibold text-gray-200 mb-8">Meet the Founder</h3>
                             <div className="inline-block bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-lg p-8">
                                <img 
                                    src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" 
                                    alt="Emanuel Martinez, Founder of Silo Labs" 
                                    className="w-28 h-28 rounded-full mx-auto mb-4"
                                />
                                <h4 className="text-xl font-semibold text-gray-200">Emanuel Martinez</h4>
                                <p className="text-indigo-400 font-medium">Founder</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="relative isolate py-20 sm:py-28 bg-black/30 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-100">Why Choose Silo Labs?</h2>
                            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                                We combine powerful AI with an intuitive interface to make app development accessible to everyone.
                            </p>
                        </div>
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="text-center p-6 bg-white/5 border border-white/10 rounded-2xl">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/20 text-indigo-300 rounded-lg mb-4">
                                    <BrainCircuitIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-200">AI-Powered Generation</h3>
                                <p className="mt-2 text-gray-400">
                                    Describe your app in plain English and watch our AI bring it to life, generating clean, functional code in seconds.
                                </p>
                            </div>
                            <div className="text-center p-6 bg-white/5 border border-white/10 rounded-2xl">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/20 text-indigo-300 rounded-lg mb-4">
                                    <CodeIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-200">Instant Live Previews</h3>
                                <p className="mt-2 text-gray-400">
                                    See your application as it's being built. No more guessing—what you see is what you get, updated in real-time.
                                </p>
                            </div>
                            <div className="text-center p-6 bg-white/5 border border-white/10 rounded-2xl">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/20 text-indigo-300 rounded-lg mb-4">
                                    <UsersIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-200">Customizable AI Agents</h3>
                                <p className="mt-2 text-gray-400">
                                    Tailor the AI's personality and expertise to match your project's needs, from a formal UX expert to a creative coder.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Ad Section */}
                <section className="py-10 bg-black/30 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <AdComponent />
                    </div>
                </section>

                {/* Adsterra Ad Section */}
                <section className="py-10 bg-black/30 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                        <AdsterraComponent />
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="relative isolate py-20 sm:py-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-100">What Our Users Say</h2>
                            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                                We're helping creators and developers build faster than ever.
                            </p>
                        </div>
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="bg-gray-900/50 p-8 rounded-2xl border border-white/10">
                                <p className="text-gray-300 relative">
                                    "As a student, Silo is a game-changer. I can instantly create study tools and small apps for my projects. The unlimited student plan is amazing!"
                                </p>
                                <div className="mt-6 flex items-center gap-4">
                                    <img className="w-12 h-12 rounded-full" src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Testimonial from Sarah L." />
                                    <div>
                                        <div className="font-semibold text-gray-200">Sarah L.</div>
                                        <div className="text-gray-500 text-sm">Computer Science Student</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-900/50 p-8 rounded-2xl border border-white/10">
                                <p className="text-gray-300 relative">
                                    "This tool has supercharged my prototyping workflow. I can go from a client's idea to a working demo in minutes. It's an indispensable part of my toolkit now."
                                </p>
                                <div className="mt-6 flex items-center gap-4">
                                    <img className="w-12 h-12 rounded-full" src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Testimonial from Mike R." />
                                    <div>
                                        <div className="font-semibold text-gray-200">Mike R.</div>
                                        <div className="text-gray-500 text-sm">Freelance Developer</div>
                                    </div>
                                </div>
                            </div>
                             <div className="bg-gray-900/50 p-8 rounded-2xl border border-white/10">
                                <p className="text-gray-300 relative">
                                    "I don't code, but I have a lot of ideas. Silo Labs bridges that gap perfectly. I can finally build and test my concepts without hiring a developer."
                                </p>
                                <div className="mt-6 flex items-center gap-4">
                                    <img className="w-12 h-12 rounded-full" src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Testimonial from Jessica P." />
                                    <div>
                                        <div className="font-semibold text-gray-200">Jessica P.</div>
                                        <div className="text-gray-500 text-sm">Product Manager</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                 {/* Pricing Section */}
                <section id="pricing" className="relative isolate py-20 sm:py-28 bg-black/30 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-100">Simple, Transparent Pricing</h2>
                            <p className="mt-4 text-lg text-gray-400">Choose the plan that's right for you. Get started for free.</p>
                        </div>
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Free Plan */}
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col">
                                <h3 className="text-2xl font-semibold text-gray-200">Hobbyist</h3>
                                <p className="mt-2 text-gray-400">For personal projects and exploration.</p>
                                <div className="mt-6">
                                    <span className="text-5xl font-bold text-white">$0</span>
                                    <span className="text-lg text-gray-400">/ month</span>
                                </div>
                                <ul className="mt-8 space-y-4 text-gray-300 flex-grow">
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-400"/>1,250 free credits per month</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-400"/>Generate apps, forms, and flashcards</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-400"/>Access to Silo Agents</li>
                                </ul>
                                <button onClick={() => navigate('/login')} className="mt-8 w-full py-3 bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 transition-colors border border-white/20">
                                    Get Started
                                </button>
                            </div>
                             {/* Student Plan */}
                            <div className="bg-white/5 backdrop-blur-md border-2 border-indigo-500 rounded-2xl p-8 flex flex-col relative">
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 text-white text-sm font-semibold rounded-full">
                                    Most Popular
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-200">Student</h3>
                                <p className="mt-2 text-gray-400">For learners and educators.</p>
                                <div className="mt-6">
                                    <span className="text-5xl font-bold text-white">Free</span>
                                    <span className="text-lg text-gray-400"> for 1 year</span>
                                </div>
                                <ul className="mt-8 space-y-4 text-gray-300 flex-grow">
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-400"/><strong>Unlimited</strong> credits</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-400"/>Generate apps, forms, and flashcards</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-400"/>Create and use Custom Agents</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-400"/>Requires a valid .edu email</li>
                                </ul>
                                <button onClick={() => navigate('/login')} className="mt-8 w-full py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors">
                                    Sign Up with School Email
                                </button>
                            </div>
                            {/* Ultra Plan */}
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col relative overflow-hidden">
                                <div className="absolute top-4 right-4 px-3 py-1 bg-gray-700 text-gray-300 text-xs font-semibold rounded-full uppercase tracking-wider">
                                    Coming Soon
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-200">Ultra</h3>
                                <p className="mt-2 text-gray-400">For professionals and power users.</p>
                                <div className="mt-6">
                                    <span className="text-5xl font-bold text-white">$20</span>
                                    <span className="text-lg text-gray-400">/ month</span>
                                </div>
                                <ul className="mt-8 space-y-4 text-gray-300 flex-grow">
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-400"/><strong>Unlimited</strong> credits</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-400"/>Advanced AI models</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-400"/>Team collaboration features</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-indigo-400"/>Priority support</li>
                                </ul>
                                <button disabled className="mt-8 w-full py-3 bg-gray-700 text-gray-400 font-semibold rounded-full cursor-not-allowed">
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
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-100">Frequently Asked Questions</h2>
                            <p className="mt-4 text-lg text-gray-400">
                                Have questions? We've got answers.
                            </p>
                        </div>
                        <div className="mt-12">
                            <FaqItem question="What is Silo Labs?">
                                <p>Silo Labs is an AI-powered platform that lets you build simple, single-page web applications just by describing them. It's designed for makers, students, and developers who want to quickly prototype and build ideas without writing code from scratch.</p>
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
                <section id="contact" className="relative isolate py-20 sm:py-28 bg-black/30 backdrop-blur-sm">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-100">Get in Touch</h2>
                        <p className="mt-4 text-lg text-gray-400">Have questions or feedback? We'd love to hear from you.</p>
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <a href="mailto:survivalcreativeminecraftadven@gmail.com" className="group p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:border-indigo-500/50 transition-all">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/20 text-indigo-300 rounded-lg mb-4">
                                    <AtSignIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-200">General Inquiries</h3>
                                <p className="mt-2 text-gray-400">survivalcreativeminecraftadven@gmail.com</p>
                            </a>
                            <a href="mailto:support@silodev.com" className="group p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:border-indigo-500/50 transition-all">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/20 text-indigo-300 rounded-lg mb-4">
                                    <AtSignIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-200">Support</h3>
                                <p className="mt-2 text-gray-400">support@silodev.com</p>
                            </a>
                        </div>
                    </div>
                </section>
                
                {/* Final CTA Section */}
                <section className="bg-indigo-700 text-white">
                     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold">Ready to Build Your Idea?</h2>
                        <p className="mt-4 text-lg text-indigo-200 max-w-2xl mx-auto">
                           Stop wondering and start building. Join Silo Labs today and turn your vision into reality.
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