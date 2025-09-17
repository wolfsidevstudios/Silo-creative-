import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import GoogleSignInButton from '../auth/GoogleSignInButton';
import { supabase } from '../../services/supabaseClient';
import { AtSignIcon, KeyIcon, GitHubIcon, DiscordIcon, ChevronLeftIcon } from '../common/Icons';

const LoginPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Success! Please check your email for the confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Navigation will be handled by the App.tsx wrapper monitoring auth state
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
    });
    if (error) {
        setError(error.message);
        setLoading(false);
    }
  };

  const handleDiscordSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
    });
    if (error) {
        setError(error.message);
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black">
        {/* Left Panel: Branding */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 flex-col items-center justify-center p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-16 -translate-y-16 blur-2xl opacity-75"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-20 translate-y-20 blur-3xl opacity-75"></div>
            <div className="relative z-10 text-center space-y-6">
                <img src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Silo Labs Logo" className="w-24 h-24 rounded-full mx-auto border-4 border-white/50 shadow-xl" />
                <h1 className="text-4xl font-bold">Unleash Your Creativity</h1>
                <p className="text-indigo-200 text-lg max-w-sm mx-auto">
                    Turn your ideas into fully functional web applications with the power of AI.
                </p>
            </div>
            <div className="absolute bottom-8 text-sm text-indigo-200">
                <Link to="/" className="hover:underline">Back to Landing Page</Link>
            </div>
        </div>
        
        {/* Right Panel: Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 bg-black">
            <div className="w-full max-w-md relative">
                <div className="absolute -top-12 left-0 lg:hidden">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-200">
                        <ChevronLeftIcon className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <img src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Silo Labs Logo" className="w-16 h-16 rounded-full mx-auto lg:hidden" />
                    <h2 className="text-3xl font-bold text-gray-100 mt-4">Welcome to Silo Labs</h2>
                    <p className="text-gray-400">Sign in to continue your creative journey.</p>
                </div>
          
                <div className="space-y-3">
                    <GoogleSignInButton />
                    <button
                    type="button"
                    onClick={handleGitHubSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center py-2.5 px-4 border border-white/20 rounded-full shadow-sm bg-white/5 text-gray-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
                    >
                    <GitHubIcon className="w-5 h-5 mr-3" />
                    <span className="font-medium">Continue with GitHub</span>
                    </button>
                    <button
                    type="button"
                    onClick={handleDiscordSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center py-2.5 px-4 border border-white/20 rounded-full shadow-sm bg-white/5 text-gray-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
                    >
                    <DiscordIcon className="w-5 h-5 mr-3 text-[#5865F2]" />
                    <span className="font-medium">Continue with Discord</span>
                    </button>
                </div>

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-gray-700"></div>
                    <span className="mx-4 text-sm font-medium text-gray-500">OR</span>
                    <div className="flex-grow border-t border-gray-700"></div>
                </div>
            
                <div>
                    <div className="mb-4 border-b border-gray-700">
                    <nav className="-mb-px flex space-x-6">
                        <button onClick={() => setAuthMode('signin')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${authMode === 'signin' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-500'}`}>
                        Sign In
                        </button>
                        <button onClick={() => setAuthMode('signup')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${authMode === 'signup' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-500'}`}>
                        Sign Up
                        </button>
                    </nav>
                    </div>
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <AtSignIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full rounded-full border-white/20 bg-white/5 py-2.5 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white placeholder-gray-500"
                            placeholder="you@example.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <KeyIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={authMode === 'signin' ? "current-password" : "new-password"}
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-full border-white/20 bg-white/5 py-2.5 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white placeholder-gray-500"
                            placeholder="••••••••"
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                    {message && <p className="text-sm text-green-400 text-center">{message}</p>}

                    <div className="pt-2">
                        <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-500/50 disabled:cursor-not-allowed"
                        >
                        {loading ? 'Processing...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center pt-2">
                        This site is protected by reCAPTCHA and the Google{' '}
                        <a href="https://policies.google.com/privacy" className="underline hover:text-indigo-400">Privacy Policy</a> and{' '}
                        <a href="https://policies.google.com/terms" className="underline hover:text-indigo-400">Terms of Service</a> apply.
                    </p>
                    </form>
                </div>

                <p className="text-xs text-gray-500 mt-8 text-center max-w-sm mx-auto">
                    By signing in, you agree to our{' '}
                    <Link to="/terms" className="underline hover:text-indigo-400 transition-colors">
                    Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="underline hover:text-indigo-400 transition-colors">
                    Privacy Policy
                    </Link>.
                </p>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;