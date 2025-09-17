
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from '../common/Icons';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="flex-1 bg-black p-6 sm:p-10">
            <div className="max-w-4xl mx-auto">
                <Link to="/home" className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-200 mb-6">
                    <ChevronLeftIcon className="w-4 h-4" />
                    Back to Home
                </Link>
                <header className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-100">Privacy Policy</h1>
                    <p className="text-lg text-gray-400 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
                </header>

                <div className="prose prose-invert max-w-none text-gray-300">
                    <p>Welcome to Silo Create App Builder ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>
                    
                    <h2>1. Information We Collect</h2>
                    <p>We may collect information that you provide directly to us, such as:</p>
                    <ul>
                        <li><strong>API Keys:</strong> We store your Gemini API key in your browser's local storage. This key is used solely for making requests to the Gemini API on your behalf and is never transmitted to our servers.</li>
                        <li><strong>User Prompts:</strong> The prompts you enter to generate applications are sent to the Gemini API for processing. We do not store your prompts on our servers.</li>
                        <li><strong>Custom Agents:</strong> Information you provide for custom agents (name, instructions, image URL) is stored in your browser's local storage.</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li>Provide, operate, and maintain our application.</li>
                        <li>Enable you to generate applications and other content via the Gemini API.</li>
                        <li>Personalize and improve your experience.</li>
                    </ul>

                    <h2>3. Information Sharing</h2>
                    <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. Your prompts and API key are sent directly to the Google Gemini API for processing as required for the app's functionality. We encourage you to review Google's Privacy Policy.</p>

                    <h2>4. Data Security</h2>
                    <p>We implement a variety of security measures to maintain the safety of your personal information. Since sensitive data like API keys and custom agents are stored locally on your device, you are responsible for securing your own device.</p>

                    <h2>5. Third-Party Services</h2>
                    <p>Our application relies on the Google Gemini API. Your use of our application is also subject to Google's terms and policies. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites or services.</p>

                    <h2>6. Changes to This Privacy Policy</h2>
                    <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

                    <h2>7. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at support@silo-creative.example.com.</p>
                </div>
            </div>
                <style>{`
                .prose-invert h2 {
                    color: #e5e7eb;
                }
                .prose-invert a {
                    color: #818cf8;
                }
                .prose-invert a:hover {
                    color: #a78bfa;
                }
                `}</style>
        </div>
    );
};

export default PrivacyPolicyPage;