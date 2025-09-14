import React from 'react';
import Sidebar from '../common/Sidebar';
import Banner from '../common/Banner';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from '../common/Icons';

const TermsOfServicePage: React.FC = () => {
    return (
        <div className="flex flex-col h-screen w-screen bg-white">
            <Banner />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6 sm:p-10">
                    <div className="max-w-4xl mx-auto">
                         <Link to="/home" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6">
                            <ChevronLeftIcon className="w-4 h-4" />
                            Back to Home
                        </Link>
                        <header className="mb-10">
                            <h1 className="text-4xl font-bold text-gray-800">Terms of Service</h1>
                            <p className="text-lg text-gray-500 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
                        </header>

                        <div className="prose prose-indigo max-w-none text-gray-700">
                            <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Silo Create App Builder application (the "Service") operated by Silo Create ("us", "we", or "our").</p>
                            <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>
                            
                            <h2>1. Accounts</h2>
                            <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                            
                            <h2>2. API Usage</h2>
                            <p>The Service requires you to provide your own Google Gemini API key. You are solely responsible for all activities that occur under your API key, and for any costs associated with its use. We are not responsible for any charges incurred from your use of the Google Gemini API.</p>

                            <h2>3. Content</h2>
                            <p>Our Service allows you to generate code, text, and other materials ("Content") based on your prompts. You are responsible for the Content that you generate, including its legality, reliability, and appropriateness. We do not claim ownership of the Content you generate. You grant us no rights to your Content.</p>

                            <h2>4. Prohibited Uses</h2>
                            <p>You agree not to use the Service:</p>
                            <ul>
                                <li>In any way that violates any applicable national or international law or regulation.</li>
                                <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
                                <li>To generate Content that is defamatory, obscene, indecent, abusive, offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable.</li>
                            </ul>

                            <h2>5. Termination</h2>
                            <p>We may terminate or suspend your access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                            
                            <h2>6. Disclaimer</h2>
                            <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The generated applications are for informational and demonstration purposes only and we do not guarantee their accuracy, completeness, or suitability for any particular purpose. We are not liable for any issues arising from the use of the generated code.</p>

                            <h2>7. Changes</h2>
                            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page.</p>

                            <h2>8. Contact Us</h2>
                            <p>If you have any questions about these Terms, please contact us at support@silo-creative.example.com.</p>
                        </div>
                    </div>
                </main>
            </div>
            <style>{`
                .prose h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-top: 2em;
                    margin-bottom: 1em;
                }
                .prose p, .prose ul {
                    line-height: 1.75;
                }
                .prose ul {
                    padding-left: 1.5rem;
                    list-style-type: disc;
                }
                .prose li {
                    margin-bottom: 0.5rem;
                }
            `}</style>
        </div>
    );
};

export default TermsOfServicePage;