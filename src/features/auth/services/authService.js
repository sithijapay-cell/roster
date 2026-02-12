import api from '../../../services/api';

// Login with Email & Password
export const loginWithEmail = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            return { success: true, user: response.data.user };
        }
        return { success: false, error: "No token received" };
    } catch (error) {
        console.error("Login failed", error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

// Register
export const signupWithEmail = async (email, password) => {
    try {
        const response = await api.post('/auth/register', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            return { success: true, user: response.data.user };
        }
        return { success: false, error: "No token received" };
    } catch (error) {
        console.error("Signup failed", error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

// Get Current User (Me)
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        console.error("Get current user failed", error);
        return null;
    }
};

// Logout
export const logout = async () => {
    localStorage.removeItem('token');
    return { success: true };
};

import { signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "../../../lib/firebase";

// Google Login (Redirect Flow for Mobile Compatibility)
export const loginWithGoogle = async () => {
    try {
        await signInWithRedirect(auth, googleProvider);
        // The page will redirect, so no return value is needed here immediately.
        return { success: true, pendingRedirect: true };
    } catch (error) {
        console.error("Google Login Redirect failed", error);
        return { success: false, error: error.message };
    }
};

// Check for Google Redirect Result (Call on App Mount)
export const checkGoogleRedirect = async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            // User just returned from Google
            const user = result.user;
            const idToken = await user.getIdToken();

            // Send to Backend
            const response = await api.post('/auth/google', { idToken });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                return { success: true, user: response.data.user };
            }
        }
        return { success: false, noRedirect: true };
    } catch (error) {
        console.error("Google Redirect Result failed", error);
        return { success: false, error: error.message };
    }
};

// Placeholder for Reset Password (Disabled)
export const resetPassword = async (email) => {
    return { success: false, error: "Password reset is not yet implemented in the new backend." };
};

// Placeholder for Verification (Disabled)
export const sendVerification = async (user) => {
    return { success: true }; // No-op
};
