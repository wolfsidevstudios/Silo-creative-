
import React, { useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';

declare global {
    interface Window {
        google: any;
    }
}

const GOOGLE_CLIENT_ID = '688404458929-rsv8ua590pcain8l2jb8pa5qh3rtgah7.apps.googleusercontent.com';

const GoogleSignInButton: React.FC = () => {
    const buttonDivRef = useRef<HTMLDivElement>(null);

    const handleCredentialResponse = async (response: any) => {
        console.log("Google Sign-In successful, authenticating with Supabase...");
        const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,
        });

        if (error) {
            console.error('Error signing in with Google token:', error.message);
            // Handle error (e.g., show a message to the user)
        }
        // On success, the onAuthStateChange listener in AppContext will handle the rest.
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
                    { theme: "outline", size: "large", type: "standard", width: '368', shape: 'pill' }
                );
            }
        };
        
        const script = document.getElementById('google-gsi-script');
        if (script) {
             if (window.google) {
                initializeGsi();
            } else {
                script.onload = initializeGsi;
            }
        }
    }, []);

    return <div ref={buttonDivRef} className="flex justify-center"></div>;
};

export default GoogleSignInButton;
