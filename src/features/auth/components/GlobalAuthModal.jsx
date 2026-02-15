import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const GlobalAuthModal = () => {
    const { isAuthModalOpen, closeAuthModal, authModalView } = useAuth();

    // Optional: Reset internal state of AuthModal if needed by using a key
    // or relying on AuthModal to handle prop updates.
    // Since AuthModal uses `useState(initialView)`, we might want to force remount
    // or just pass a key when it opens.

    if (!isAuthModalOpen) return null;

    return (
        <AuthModal
            isOpen={isAuthModalOpen}
            onClose={closeAuthModal}
            initialView={authModalView}
            key={authModalView} // Force remount if view changes (e.g. login -> signup)
        />
    );
};

export default GlobalAuthModal;
