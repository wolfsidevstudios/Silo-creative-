
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types';

declare global {
    interface Window {
        google: any;
    }
}

// Simple JWT decoder for client-side use after Google's validation.
// It extracts the payload without verifying the signature.
const decodeJwt = (token: string): any => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error decoding JWT", e);
        return null;
    }
};

const GOOGLE_CLIENT_ID = '688404458929-rsv8ua590pcain8l2jb8pa5qh3rtgah7.apps.googleusercontent.com';

const GoogleSignInButton: React.FC = () => {
    const buttonDivRef = useRef<HTMLDivElement>(null);
    const { setGoogleUser } = useAppContext();
    const navigate = useNavigate();

    const handleCredentialResponse = (response: any) => {
        console.log("Google Sign-In successful, processing user info...");
        const payload = decodeJwt(response.credential);
        
        if (payload) {
            const userProfile: User = {
                name: payload.name,
                email: payload.email,
                avatarUrl: payload.picture,
            };
            setGoogleUser(userProfile);
            navigate('/home');
        } else {
            console.error("Failed to decode JWT from Google");
        }
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
                    { theme: "filled_black", size: "large", type: "standard", shape: 'pill', width: '320' }
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