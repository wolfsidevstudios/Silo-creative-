
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from '../common/Icons';

interface Change {
    type: 'new' | 'improvement' | 'fix';
    text: string;
}

interface ChangelogEntry {
    version: string;
    date: string;
    changes: Change[];
}

const changelogData: ChangelogEntry[] = [
    {
        version: "v1.2.0",
        date: "July 25, 2024",
        changes: [
            { type: "new", text: "Added the Changelog page to keep you updated on new features and fixes." },
            { type: "improvement", text: "Improved AI self-correction logic for more accurate bug fixes." },
            { type: "fix", text: "Fixed a bug where the agent selector would sometimes not close properly." }
        ]
    },
    {
        version: "v1.1.0",
        date: "July 20, 2024",
        changes: [
            { type: "new", text: "Introduced Native App Builder mode for creating React Native apps." },
            { type: "new", text: "Added AI-powered testing to automatically verify core functionality after code generation." },
            { type: "improvement", text: "Enhanced the UI for the 'Silo OneDrive' page for better organization." }
        ]
    },
    {
        version: "v1.0.0",
        date: "July 15, 2024",
        changes: [
            { type: "new", text: "Initial launch of Silo Create App Builder!" },
            { type: "new", text: "Features included: Web App Builder, Form Generator, and Study Mode." },
            { type: "new", text: "Implemented user authentication with Google, GitHub, and email." }
        ]
    }
];

const ChangeTag: React.FC<{ type: Change['type'] }> = ({ type }) => {
    const styles = {
        new: 'bg-green-500/20 text-green-300',
        improvement: 'bg-blue-500/20 text-blue-300',
        fix: 'bg-yellow-500/20 text-yellow-300'
    };
    const text = {
        new: 'New',
        improvement: 'Improvement',
        fix: 'Fix'
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type]}`}>
            {text[type]}
        </span>
    );
};


const ChangelogPage: React.FC = () => {
    return (
        <div className="flex-1 bg-black p-6 sm:p-10">
            <div className="max-w-4xl mx-auto">
                <Link to="/home" className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-200 mb-6">
                    <ChevronLeftIcon className="w-4 h-4" />
                    Back to Home
                </Link>
                <header className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-100">Changelog</h1>
                    <p className="text-lg text-gray-400 mt-1">Updates, improvements, and bug fixes for Silo Create.</p>
                </header>

                <div className="space-y-12">
                    {changelogData.map((entry, entryIndex) => (
                        <div key={entry.version} className="relative pl-12">
                            {entryIndex < changelogData.length -1 && (
                                <div className="absolute left-4 top-4 h-full w-0.5 bg-white/10"></div>
                            )}
                            <div className="absolute left-0 top-0">
                                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center z-10 ring-8 ring-black">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mb-4">
                                <h2 className="text-2xl font-bold text-gray-200">{entry.version}</h2>
                                <p className="text-sm text-gray-500">{entry.date}</p>
                            </div>
                            <div className="space-y-4">
                                {entry.changes.map((change, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <ChangeTag type={change.type} />
                                        <p className="text-gray-300 flex-1">{change.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChangelogPage;