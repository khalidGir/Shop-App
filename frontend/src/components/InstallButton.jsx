import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';

const InstallButton = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            setIsVisible(true);
        });

        window.addEventListener('appinstalled', (evt) => {
            console.log('App was installed');
            setIsVisible(false);
        });
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <Button
            variant="success"
            className="rounded-pill px-4 py-2 m-2 shadow-sm d-flex align-items-center"
            onClick={handleInstallClick}
            style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 1000 }}
        >
            <FaDownload className="me-2" />
            Install App
        </Button>
    );
};

export default InstallButton;
