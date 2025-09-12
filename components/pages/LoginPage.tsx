import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleSignInButton from '../auth/GoogleSignInButton';
import { supabase } from '../../services/supabaseClient';
import { AtSignIcon, KeyIcon } from '../common/Icons';

const LoginPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (authMode === 'signup') {
        // FIX: Property 'signUp' does not exist on type 'SupabaseAuthClient'.
        // The method 'signUp' is correct in recent versions, but the error suggests an older version is in use.
        // Using the v1 method name.
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Success! Please check your email for the confirmation link.');
      } else {
        // FIX: Property 'signInWithPassword' does not exist on type 'SupabaseAuthClient'.
        // This method is from Supabase JS v2. The v1 equivalent is 'signIn'.
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/home');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Pane */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full -translate-x-16 -translate-y-16 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full translate-x-20 translate-y-20 blur-3xl"></div>
        
        <div className="z-10">
          <div className="flex items-center gap-3">
            <img src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Silo Creative Logo" className="w-10 h-10 rounded-full" />
            <span className="text-xl font-bold">Silo Creative</span>
          </div>
        </div>

        <div className="z-10">
          <h1 className="text-5xl font-bold leading-tight mb-4">
            Build Apps with a Conversation.
          </h1>
          <p className="text-lg text-gray-300">
            Describe your idea, and watch Silo Creative bring it to life. No code required, just your imagination.
          </p>
        </div>

        <div className="z-10 text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Silo Creative. All rights reserved.
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex flex-col items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 text-center">
                 <img src="https://i.ibb.co/DH3dtsXr/IMG-3806.png" alt="Silo Creative Logo" className="w-16 h-16 rounded-full mx-auto" />
            </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-8">Sign in to continue your creative journey.</p>
          
          <GoogleSignInButton />

          <div className="my-8 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-sm font-medium text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <div>
            <div className="mb-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-6">
                <button onClick={() => setAuthMode('signin')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${authMode === 'signin' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Sign In
                </button>
                <button onClick={() => setAuthMode('signup')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${authMode === 'signup' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Sign Up
                </button>
              </nav>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <AtSignIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border-gray-300 py-2.5 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="you@example.com"
                    />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                 <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <KeyIcon className="h-5 w-5 text-gray-400" />
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
                      className="block w-full rounded-lg border-gray-300 py-2.5 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="••••••••"
                    />
                </div>
              </div>
              
              {error && <p className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-green-600">{message}</p>}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
                </button>
              </div>
            </form>
          </div>

          <p className="text-xs text-gray-500 mt-8 text-center max-w-sm mx-auto">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-indigo-600 transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-indigo-600 transition-colors">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;