import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from '../common/Icons';

const DocsPage: React.FC = () => {
    return (
        <div className="h-full overflow-y-auto bg-black p-6 sm:p-10">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-100">Documentation</h1>
                    <p className="text-lg text-gray-400 mt-1">Learn how to use all the features of Silo Labs Build.</p>
                </header>

                <div className="prose prose-invert max-w-none text-gray-300 space-y-12">
                    
                    <section id="getting-started">
                        <h2>Getting Started</h2>
                        <p>Welcome to Silo Labs! This guide will walk you through the core features. To start, simply go to the <Link to="/home">Home page</Link>, choose a mode (like 'Web App'), describe what you want to build in the prompt bar, and hit send. The AI will generate a plan and then the code for your creation.</p>
                    </section>

                    <section id="github">
                        <h2>Pushing to GitHub</h2>
                        <p>You can push your generated code directly to a new or existing GitHub repository. To do this, you'll need a GitHub Personal Access Token (Classic).</p>
                        <h4>How to get a GitHub Personal Access Token:</h4>
                        <ol>
                            <li>Go to <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer">github.com/settings/tokens/new</a>.</li>
                            <li>Give your token a descriptive name in the 'Note' field.</li>
                            <li>Set an 'Expiration' period for your token.</li>
                            <li>Under 'Select scopes', check the box next to <strong>repo</strong>. This grants the token permission to access and write to your repositories.</li>
                            <li>Click 'Generate token' at the bottom of the page.</li>
                            <li><strong>Important:</strong> Copy your new token immediately. You won't be able to see it again.</li>
                        </ol>
                        <p>Once you have your token, click the GitHub icon in the preview panel's toolbar, choose whether to create a new repository or push to an existing one, and paste your token into the modal.</p>
                    </section>
                    
                    <section id="vercel">
                        <h2>Deploying to Vercel</h2>
                        <p>Deploy your static web apps with one click using Vercel. You'll need a Vercel Access Token.</p>
                        <h4>How to get a Vercel Access Token:</h4>
                        <ol>
                           <li>Go to your Vercel account settings at <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer">vercel.com/account/tokens</a>.</li>
                            <li>Enter a name for your token and click 'Create'.</li>
                            <li>Copy the generated token. This is the only time you'll see it.</li>
                        </ol>
                        <p>In the preview panel, click the Vercel (triangle) icon. In the modal, enter a name for your project and paste your Vercel Access Token to deploy.</p>
                    </section>

                    <section id="integrations">
                        <h2>Adding Integrations</h2>
                        <p>You can easily add boilerplate code for popular services by clicking the puzzle piece icon in the preview toolbar.</p>
                        
                        <h4>Connecting Supabase</h4>
                        <p>Adds the Supabase client to your app. You'll need your Project URL and Anon Key.</p>
                        <ol>
                            <li>Go to your Supabase project dashboard.</li>
                            <li>Navigate to <strong>Project Settings</strong> (the gear icon).</li>
                            <li>Click on <strong>API</strong> in the side menu.</li>
                            <li>You will find your <strong>Project URL</strong> and your public <strong>Anon Key</strong> here.</li>
                            <li>Copy these values into the integration modal in Silo Labs.</li>
                        </ol>

                        <h4>Adding Stripe Payments</h4>
                        <p>Integrates Stripe.js for payments. You'll need your Publishable Key.</p>
                         <ol>
                            <li>Go to your Stripe Dashboard.</li>
                            <li>Navigate to the <strong>Developers</strong> section.</li>
                            <li>Click on <strong>API keys</strong>.</li>
                            <li>You will find your <strong>Publishable key</strong> here (it starts with `pk_`).</li>
                            <li>Copy this key into the integration modal.</li>
                        </ol>
                        
                        <h4>Adding Gemini API</h4>
                        <p>This integration adds UI components to your generated app that allow your app's <strong>users</strong> to enter their own Gemini API key. This is a secure way to add AI features without exposing your own key in the frontend code.</p>
                    </section>

                </div>
            </div>
            <style>{`
                .prose-invert h2 {
                    color: #e5e7eb;
                    margin-bottom: 1em;
                    padding-bottom: 0.5em;
                    border-bottom: 1px solid #374151;
                }
                 .prose-invert h4 {
                    color: #d1d5db;
                }
                .prose-invert a {
                    color: #818cf8;
                }
                .prose-invert a:hover {
                    color: #a78bfa;
                }
                .prose-invert ol, .prose-invert ul {
                    margin-left: 1.5rem;
                }
                .prose-invert li {
                    margin-top: 0.5em;
                }
                .prose-invert code {
                    background-color: #374151;
                    padding: 0.2em 0.4em;
                    border-radius: 0.25rem;
                    font-weight: 600;
                    color: #e5e7eb;
                }
            `}</style>
        </div>
    );
};

export default DocsPage;
