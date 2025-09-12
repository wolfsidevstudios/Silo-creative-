import React, { useState, FormEvent, useEffect } from 'react';
import { AtSignIcon, CheckIcon, XIcon } from './Icons';
import { useAppContext } from '../../context/AppContext';

interface StudentSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudentSignUpModal: React.FC<StudentSignUpModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { setIsStudent } = useAppContext();

  useEffect(() => {
    // Reset form when modal is closed
    if (!isOpen) {
      setTimeout(() => {
        setEmail('');
        setStatus('idle');
        setMessage('');
      }, 300); // Wait for closing animation
    }
  }, [isOpen]);

  const validateSchoolEmail = (email: string) => {
    // A simple regex for common educational domains. Not exhaustive.
    const schoolEmailRegex = /\.(edu|ac\.|k12\.)/i;
    return schoolEmailRegex.test(email);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateSchoolEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid school email address (e.g., ending in .edu).');
      return;
    }
    
    setStatus('loading');
    setMessage('');

    // Simulate an API call
    setTimeout(() => {
      // On success, update global state and show message
      setIsStudent(true);
      setStatus('success');
      setMessage('Success! Your unlimited credits have been applied. Welcome!');
      
      // Automatically close the modal after showing the success message
      setTimeout(() => {
        onClose();
      }, 2500);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-indigo-600">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                    <path d="m9 12 2 2 4-4"></path>
                </svg>
            </div>
            <h2 id="signup-modal-title" className="text-2xl font-bold text-gray-900 mt-4">Student Sign Up</h2>
            <p className="mt-2 text-gray-600">
              Enter your school-issued email to unlock 1 year of free app builds with unlimited credits.
            </p>
        </div>

        {status === 'success' ? (
          <div className="mt-6 text-center p-4 bg-green-50 border border-green-200 rounded-lg animate-scale-in">
            <CheckIcon className="w-8 h-8 mx-auto text-green-500" />
            <p className="mt-2 font-semibold text-green-800">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <AtSignIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border-gray-300 py-3 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="you@school.edu"
                      required
                      aria-describedby="email-error"
                  />
              </div>
              {status === 'error' && <p id="email-error" className="mt-2 text-sm text-red-600">{message}</p>}
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : 'Get Unlimited Credits'}
            </button>
          </form>
        )}
      </div>
      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default StudentSignUpModal;
