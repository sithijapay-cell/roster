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
                try {
                    // Check if we already have a token to avoid redundant verification
                    const currentToken = localStorage.getItem('token');
                    if (!currentToken) {
                        // Get the ID token
                        const idToken = await firebaseUser.getIdToken();

                        // Verify with backend and get full user profile
                        const result = await authService.verifyGoogleToken(idToken);

                        if (result.success) {
                            setUser(result.user);
                            localStorage.setItem('token', result.token);
                        } else {
                            // Backend verification failed
                            console.error("Backend verification failed:", result.error);
                            authService.logout();
                        }
                    } else {
                        // We have a token, just fetch the user profile if missing
                        if (!user) {
                            const userData = await authService.getCurrentUser();
                            if (userData) {
                                setUser(userData);
                            } else {
                                // Token invalid
                                localStorage.removeItem('token');
                                // Retry verification
                                const idToken = await firebaseUser.getIdToken();
                                const result = await authService.verifyGoogleToken(idToken);
                                if (result.success) {
                                    setUser(result.user);
                                    localStorage.setItem('token', result.token);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error syncing auth state:", error);
                    // Don't clear user immediately on error, might be network glitch
                }
            } else {
                // User is signed out from Firebase
                // Check if we have a token manually (e.g. email/pass login - though Firebase usually handles this too if using Firebase Auth for everything)
                // For this app, we trust Firebase Auth as the primary source of truth for "session"

                // However, if we use custom JWTs for email/pass, we need to preserve them.
                // But typically mixed auth (Firebase Google + Custom Email) is tricky.
                // Let's assume onAuthStateChanged handles Google. 
                // For Email/Pass, if it doesn't use Firebase, this listener won't fire "signed out" when email user logs out unless we integrate them.

                // If the user was Google logged in, they are now out.
                // If they were Email logged in (custom), this might not trigger?
                // Actually, if we only use Firebase for Google, this listener is only for Google users.

                // Let's keep the local storage check for non-Firebase sessions (if any)
                const token = localStorage.getItem('token');
                if (token) {
                    // We have a token. verify it.
                    // But if Firebase says "signed out", likely we should respect it IF it was a Firebase session.
                }

                // Simplest approach: Trust the listener for Firebase users.
                // If no firebase user, we MIGHT still be logged in via custom auth.
                // So we do NOT auto-logout here unless we know it was a firebase session.

                if (!user) { // Only do this check if we aren't already set (initial load) or if we want to support persistent custom auth
                    const token = localStorage.getItem('token');
                    if (token) {
                        const userData = await authService.getCurrentUser();
                        if (userData) {
                            setUser(userData);
                        } else {
                            localStorage.removeItem('token');
                            setUser(null);
                        }
                    } else {
                        setUser(null);
                    }
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        const result = await authService.loginWithEmail(email, password);
        if (result.success) {
            setUser(result.user);
            closeAuthModal();
        }
        return result;
    };

    const register = async (email, password) => {
        const result = await authService.signupWithEmail(email, password);
        if (result.success) {
            setUser(result.user);
            closeAuthModal();
        }
        return result;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
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
        ...authService // Expose other helpers if needed
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
