import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

declare global {
    interface Window {
        google: any;
    }
}

const GOOGLE_CLIENT_ID = '688404458929-rsv8ua590pcain8l2jb8pa5qh3rtgah7.apps.googleusercontent.com';

const GoogleSignInButton: React.FC = () => {
    const navigate = useNavigate();
    const buttonDivRef = useRef<HTMLDivElement>(null);

    const handleCredentialResponse = (response: any) => {
        console.log("Encoded JWT ID token: " + response.credential);
        // In a real app, you would send this token to your backend for verification
        // and to create a session for the user.
        // For this demo, we'll just navigate to the main app page.
        navigate('/home');
    };

    useEffect(() => {
        const initializeGsi = () => {
            if (window.google && buttonDivRef.current) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse,
                });
                
                window.google.accounts.id.renderButton(
                    buttonDivRef.current,
                    { theme: "outline", size: "large", width: '368' } // Adjust theme and size as needed
                );

                // Optional: Prompt user to sign in on page load
                // window.google.accounts.id.prompt(); 
            }
        };
        
        // Ensure the GSI script is loaded before initializing
        if (window.google) {
            initializeGsi();
        } else {
            // If the script is loaded asynchronously, we might need to wait
            const script = document.getElementById('google-gsi-script');
            if(script){
                script.onload = initializeGsi;
            }
        }
        
    }, [navigate]);

    return <div ref={buttonDivRef} className="flex justify-center"></div>;
};

export default GoogleSignInButton;
