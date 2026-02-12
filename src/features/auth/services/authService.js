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

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../../lib/firebase";

// Google Login
export const loginWithGoogle = async () => {
    try {
        // 1. Get ID Token from Firebase Client
        const userCredential = await signInWithPopup(auth, googleProvider);
        const idToken = await userCredential.user.getIdToken();

        // 2. Send to Backend for Verification & JWT
        const response = await api.post('/auth/google', { idToken });

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            return { success: true, user: response.data.user };
        }
        return { success: false, error: "No token received from backend" };

    } catch (error) {
        console.error("Google Login failed", error);
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
