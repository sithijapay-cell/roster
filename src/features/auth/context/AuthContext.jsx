import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState('login');

    useEffect(() => {
        // Subscribe to Firebase Auth State Changes
        const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in with Firebase
                setUser(firebaseUser);

                // Sync with Backend
                try {
                    console.log("Syncing user with backend...");
                    await authService.syncUserWithBackend(firebaseUser);
                    console.log("User synced with backend");
                } catch (err) {
                    console.error("Failed to sync user with backend:", err);
                    // Optional: Logout if sync fails? For now, keep logged in but warn.
                }

            } else {
                // User is signed out
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        const result = await authService.loginWithEmail(email, password);
        if (result.success) {
            // State update handled by onAuthStateChange
            closeAuthModal();
        }
        return result;
    };

    const register = async (email, password, profileData) => {
        const result = await authService.signupWithEmail(email, password, profileData);
        if (result.success) {
            closeAuthModal();
        }
        return result;
    };

    const logout = async () => {
        await authService.logout();
        // State update handled by onAuthStateChange
    };

    const openAuthModal = (view = 'login') => {
        setAuthModalView(view);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    const value = {
        user,
        loading,
        isAuthModalOpen,
        authModalView,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        ...authService,
        // Helper to get token if needed for other services (though we removed backend)
        getToken: async () => user ? user.getIdToken() : null
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
