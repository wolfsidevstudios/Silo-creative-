

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecentApps, getRecentFlashcards } from '../../services/storageService';
import { StoredApp, StoredFlashcards } from '../../types';
import { useAppContext } from '../../context/AppContext';

const TimeAgo: React.FC<{ timestamp: number }> = ({ timestamp }) => {
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        const calculateTimeAgo = () => {
            const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
            let interval = seconds / 31536000;
            if (interval > 1) return setTimeAgo(Math.floor(interval) + " years ago");
            interval = seconds / 2592000;
            if (interval > 1) return setTimeAgo(Math.floor(interval) + " months ago");
            interval = seconds / 86400;
            if (interval > 1) return setTimeAgo(Math.floor(interval) + " days ago");
            interval = seconds / 3600;
            if (interval > 1) return setTimeAgo(Math.floor(interval) + " hours ago");
            interval = seconds / 60;
            if (interval > 1) return setTimeAgo(Math.floor(interval) + " minutes ago");
            return setTimeAgo("Just now");
        };

        calculateTimeAgo();
        const timer = setInterval(calculateTimeAgo, 60000); // Update every minute
        return () => clearInterval(timer);
    }, [timestamp]);

    return <span className="text-xs text-gray-500">{timeAgo}</span>;
};


const SiloOneDrivePage: React.FC = () => {
    const [recentApps, setRecentApps] = useState<StoredApp[]>([]);
    const [recentFlashcards, setRecentFlashcards] = useState<StoredFlashcards[]>([]);
    const navigate = useNavigate();
    const { setGeneratedFlashcards, setPrompt, setAppMode, setGeneratedCode } = useAppContext();

    useEffect(() => {
        setRecentApps(getRecentApps());
        setRecentFlashcards(getRecentFlashcards());
    }, []);

    const handleDownload = (app: StoredApp) => {
        const filename = app.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        const blob = new Blob([app.content], { type: app.appMode === 'native' ? 'text/javascript' : 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.${app.appMode === 'native' ? 'js' : 'html'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleViewFlashcards = (deck: StoredFlashcards) => {
        setAppMode('study');
        setPrompt(deck.topic);
        setGeneratedFlashcards(deck.cards);
        setGeneratedCode('');
        navigate('/build');
    };

    return (
        <div className="flex-1 bg-black p-6 sm:p-10">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-gray-100">Silo OneDrive</h1>
                <p className="text-lg text-gray-400 mt-1">Your recently generated creations.</p>
            </header>

            <div className="space-y-12">
                {/* Recent Apps Section */}
                <section>
                    <h2 className="text-2xl font-semibold text-gray-300 mb-4 pb-2 border-b border-white/20">Recent Apps, Forms & Documents</h2>
                    {recentApps.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {recentApps.map(app => (
                                <div key={app.id} className="bg-white/5 border border-white/10 rounded-lg shadow-lg overflow-hidden flex flex-col">
                                    <div className="p-4 flex-grow">
                                        <h3 className="font-semibold text-gray-200 truncate">{app.title}</h3>
                                        <TimeAgo timestamp={app.timestamp} />
                                    </div>
                                    <div className="p-3 bg-black/20 border-t border-white/10">
                                        <button 
                                            onClick={() => handleDownload(app)}
                                            className="w-full text-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700">
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">You haven't generated any apps or forms yet.</p>
                    )}
                </section>

                {/* Recent Flashcards Section */}
                <section>
                    <h2 className="text-2xl font-semibold text-gray-300 mb-4 pb-2 border-b border-white/20">Recent Flashcard Decks</h2>
                    {recentFlashcards.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {recentFlashcards.map(deck => (
                                <div key={deck.id} className="bg-white/5 border border-white/10 rounded-lg shadow-lg overflow-hidden flex flex-col">
                                    <div className="p-4 flex-grow">
                                        <h3 className="font-semibold text-gray-200 truncate">{deck.topic}</h3>
                                        <p className="text-sm text-gray-400">{deck.cards.length} cards</p>
                                            <TimeAgo timestamp={deck.timestamp} />
                                    </div>
                                    <div className="p-3 bg-black/20 border-t border-white/10">
                                            <button 
                                            onClick={() => handleViewFlashcards(deck)}
                                            className="w-full text-center px-3 py-1.5 border border-white/20 text-sm font-medium rounded-full text-gray-300 bg-white/10 hover:bg-white/20">
                                            Study Deck
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">You haven't generated any flashcards yet.</p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default SiloOneDrivePage;