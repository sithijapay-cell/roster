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
        const initAuth = async () => {
            // 1. Check if returning from Google Redirect
            const googleResult = await authService.checkGoogleRedirect();
            if (googleResult.success) {
                setUser(googleResult.user);
                setLoading(false);
                return;
            }

            // 2. Check Local Storage
            const token = localStorage.getItem('token');
            if (token) {
                const userData = await authService.getCurrentUser();
                if (userData) {
                    setUser(userData);
                } else {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        initAuth();
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

    const logout = () => {
        authService.logout();
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
