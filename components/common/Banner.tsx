import React, { useState, useEffect } from 'react';
import { GraduationCapIcon, XIcon } from './Icons';
import StudentSignUpModal from './StudentSignUpModal';
import { useAppContext } from '../../context/AppContext';

const Banner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isStudent } = useAppContext();

  useEffect(() => {
    // Check local storage to see if the user has already dismissed the banner
    const isDismissed = localStorage.getItem('studentBannerDismissed');
    if (isDismissed !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember the user's choice
    localStorage.setItem('studentBannerDismissed', 'true');
  };

  if (!isVisible || isStudent) {
    return null;
  }

  return (
    <>
      <div className="relative w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center p-3 text-sm font-medium z-20">
        <div className="flex items-center gap-3">
          <GraduationCapIcon className="w-5 h-5 flex-shrink-0" />
          <p>
            <span className="hidden sm:inline">Students get 1 year of free app builds. Enter a school email to get unlimited credits.</span>
            <span className="sm:hidden font-semibold">Students get 1 year free!</span>
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="py-1 px-4 bg-white text-indigo-600 rounded-full font-bold hover:bg-gray-100 transition-colors text-xs flex-shrink-0"
          >
            Sign Up
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20"
          aria-label="Dismiss banner"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
      <StudentSignUpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Banner;
