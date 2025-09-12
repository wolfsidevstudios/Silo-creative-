import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    GitHubIcon, 
    DiscordIcon, 
    BookIcon, 
    CodeIcon, 
    FormIcon, 
    BrainCircuitIcon 
} from '../common/Icons';

// Custom hook for scroll animations
const useScrollAnimation = () => {
    const [elements, setElements] = useState<Map<HTMLElement, () => void>>(new Map());

    const observer = useRef<IntersectionObserver | null>(
        new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('opacity-0', 'translate-y-10');
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    observer.current?.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 })
    );

    useEffect(() => {
        const currentObserver = observer.current;
        elements.forEach((_, el) => currentObserver?.observe(el));
        return () => {
             elements.forEach((_, el) => currentObserver?.unobserve(el));
        };
    }, [elements]);
    
    const observe = (el: HTMLElement | null) => {
      if (el) {
        el.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700', 'ease-out');
        setElements(prev => new Map(prev).set(el, () => {}));
      }
    };

    return [observe];
};

const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-md' : 'bg-transparent'}`}>
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3">
                    <img src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Silo Creative Logo" className="w-9 h-9 rounded-full" />
                    <span className="text-xl font-bold text-gray-800">Silo Creative</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-gray-600 font-medium">
                    <a href="#features" className="hover:text-indigo-600">Features</a>
                    <a href="#privacy" className="hover:text-indigo-600">Privacy</a>
                </nav>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-gray-600 font-medium hover:text-indigo-600">
                        Sign In
                    </Link>
                    <Link to="/login" className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-sm">
                        Get Started
                    </Link>
                </div>
            </div>
        </header>
    );
};

const HeroSection: React.FC = () => {
    const [observe] = useScrollAnimation();
    const sectionRef = useRef(null);
    useEffect(() => observe(sectionRef.current), [observe]);

    return (
        <section ref={sectionRef} className="py-20 md:py-32 text-center bg-gray-50 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200 rounded-full -translate-x-16 -translate-y-16 blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-200 rounded-full translate-x-20 translate-y-20 blur-3xl opacity-50"></div>
            <div className="container mx-auto px-6 relative z-10">
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                    Build Web Apps with a <br className="hidden md:block"/> Simple Conversation
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                    Describe your idea, and watch Silo's AI bring it to life in seconds.
                    From functional apps to study flashcards, your next project starts here.
                </p>
                <div className="mt-10 flex justify-center items-center gap-4">
                     <Link to="/login" className="px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-lg text-lg">
                        Start Building for Free
                    </Link>
                </div>
                <div className="mt-12">
                    <img src="https://i.ibb.co/3k2Qjct/silo-mockup.png" alt="Silo App Builder Interface" className="max-w-4xl mx-auto rounded-2xl shadow-2xl ring-1 ring-gray-900/10" />
                </div>
            </div>
        </section>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => {
    const [observe] = useScrollAnimation();
    const cardRef = useRef(null);
    useEffect(() => observe(cardRef.current), [observe]);
    
    return (
        <div ref={cardRef} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
};

const FeaturesSection: React.FC = () => (
    <section id="features" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
                 <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Everything you need to create.</h2>
                 <p className="mt-4 text-lg text-gray-600">Silo provides powerful tools to turn your thoughts into tangible, usable products.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<CodeIcon className="w-6 h-6"/>}
                    title="AI App Builder"
                    description="Describe a web app, and our AI will generate the plan and the complete, production-ready code in a single HTML file."
                />
                 <FeatureCard 
                    icon={<FormIcon className="w-6 h-6"/>}
                    title="AI Form Generator"
                    description="Need a contact, registration, or feedback form? Just ask. Get Netlify-ready forms in an instant."
                />
                 <FeatureCard 
                    icon={<BookIcon className="w-6 h-6"/>}
                    title="Study Mode"
                    description="Enter any topic, and Silo will generate a comprehensive set of flashcards to help you learn and revise effectively."
                />
            </div>
        </div>
    </section>
);


const HowItWorksSection: React.FC = () => {
    const [observe] = useScrollAnimation();
    const step1 = useRef(null);
    const step2 = useRef(null);
    const step3 = useRef(null);

    useEffect(() => {
        observe(step1.current);
        observe(step2.current);
        observe(step3.current);
    }, [observe]);
    
    const Step: React.FC<{ num: string, title: string, desc: string, refEl: React.RefObject<HTMLDivElement> }> = ({num, title, desc, refEl}) => (
        <div ref={refEl} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-indigo-600 text-white font-bold text-xl rounded-full">
                {num}
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <p className="mt-1 text-gray-600">{desc}</p>
            </div>
        </div>
    );

    return (
         <section className="py-20 md:py-28 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">From Idea to Reality in 3 Steps</h2>
                    <p className="mt-4 text-lg text-gray-600">Our process is designed to be simple, intuitive, and incredibly fast.</p>
                </div>
                <div className="max-w-3xl mx-auto grid md:grid-cols-1 gap-12">
                    <Step refEl={step1} num="1" title="Describe Your Vision" desc="Start with a simple text prompt. Explain what you want to build, whether it's an app, a form, or a study guide. The more detail, the better!" />
                    <Step refEl={step2} num="2" title="AI Plans & Builds" desc="Silo's AI agent analyzes your request, creates a structured plan for your approval, and then writes the complete code." />
                    <Step refEl={step3} num="3" title="Preview & Download" desc="Instantly see your creation live in the preview panel. When you're happy, download the code and deploy it anywhere." />
                </div>
            </div>
        </section>
    );
};


const PrivacySection: React.FC = () => {
    const [observe] = useScrollAnimation();
    const sectionRef = useRef(null);
    useEffect(() => observe(sectionRef.current), [observe]);

    return (
        <section id="privacy" ref={sectionRef} className="py-20 md:py-28 bg-white">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto bg-gray-50 border border-gray-200 rounded-2xl p-8 md:p-12 text-center">
                    <div className="mx-auto bg-green-100 text-green-700 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Your Data Stays Yours. Period.</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        We believe in privacy by design. Your API keys and custom agent configurations are stored exclusively in your browser's local storage. They are never sent to our servers, ensuring your sensitive information remains private and secure.
                    </p>
                    <div className="mt-8">
                        <Link to="/privacy" className="font-semibold text-indigo-600 hover:text-indigo-800">
                            Read our full Privacy Policy &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};


const CtaSection: React.FC = () => {
    const [observe] = useScrollAnimation();
    const sectionRef = useRef(null);
    useEffect(() => observe(sectionRef.current), [observe]);

    return (
        <section ref={sectionRef} className="bg-gray-900 text-white">
            <div className="container mx-auto px-6 py-20 text-center">
                 <BrainCircuitIcon className="w-12 h-12 mx-auto text-indigo-400 mb-4" />
                <h2 className="text-3xl md:text-4xl font-extrabold">Ready to build something amazing?</h2>
                <p className="mt-4 max-w-xl mx-auto text-lg text-gray-300">
                    Join thousands of creators and bring your ideas to life faster than ever before.
                </p>
                <div className="mt-8">
                    <Link to="/login" className="px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-200 transition-colors shadow-lg text-lg">
                        Sign Up for Free
                    </Link>
                </div>
            </div>
        </section>
    );
};


const Footer: React.FC = () => (
    <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                     <img src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Silo Creative Logo" className="w-8 h-8 rounded-full" />
                    <span className="text-lg font-bold text-gray-800">Silo Creative</span>
                </div>
                <div className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Silo Creative. All rights reserved.
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                    <Link to="/terms" className="hover:text-indigo-600">Terms</Link>
                    <Link to="/privacy" className="hover:text-indigo-600">Privacy</Link>
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


const LandingPage: React.FC = () => {
    return (
        <div className="bg-white">
            <Header />
            <main>
                <HeroSection />
                <FeaturesSection />
                <HowItWorksSection />
                <PrivacySection />
                <CtaSection />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
