import React from 'react';
import { Link } from 'react-router-dom';
import GoogleSignInButton from '../auth/GoogleSignInButton';

const LoginPage: React.FC = () => {
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
