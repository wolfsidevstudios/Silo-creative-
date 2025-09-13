import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, AtSignIcon, BookIcon } from '../common/Icons';

const ContactCard: React.FC<{ icon: React.ReactNode, title: string, email: string, description: string }> = ({ icon, title, email, description }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
        <div className="mx-auto bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600 mt-1 mb-4">{description}</p>
        <a 
            href={`mailto:${email}`}
            className="inline-block px-6 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-full hover:bg-indigo-100 transition-colors"
        >
            {email}
        </a>
    </div>
);


const ContactPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6 sm:p-10">
                <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6">
                    <ChevronLeftIcon className="w-4 h-4" />
                    Back to Landing Page
                </Link>
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-gray-800">Contact Us</h1>
                    <p className="text-lg text-gray-500 mt-1">We'd love to hear from you. Here's how you can reach us.</p>
                </header>

                <div className="grid md:grid-cols-2 gap-8">
                    <ContactCard 
                        icon={<AtSignIcon className="w-6 h-6" />}
                        title="General Inquiries"
                        description="For partnerships, questions, or general feedback."
                        email="survivalcreativeminecraftadven@gmail.com"
                    />
                     <ContactCard 
                        icon={<BookIcon className="w-6 h-6" />}
                        title="Support"
                        description="Need help with the app or have a technical question?"
                        email="support@silodev.com"
                    />
                </div>
            </div>
        </div>
    );
};

export default ContactPage;