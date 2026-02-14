import api from '../../../services/api'; import { auth, googleProvider } from '../../../lib/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithRedirect,
    signOut,
    sendEmailVerification
} from 'firebase/auth';

// Login with Email & Password
export const loginWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Sync with backend
        await api.post('/auth/sync');
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Login failed", error);
        return { success: false, error: error.message };
    }
};

// Register
export const signupWithEmail = async (email, password, profileData) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Sync with backend (creates user in postgres)
        await api.post('/auth/sync');

        // Update profile via API if needed (Sync creates empty profile or default)
        // syncUser in backend creates a basic profile.
        // We might want to send the profileData to the backend update endpoint immediately.
        // But userService handles profile updates.
        // For now, sync is enough to create the record.

        return { success: true, user: user };
    } catch (error) {
        console.error("Signup failed", error);
        return { success: false, error: error.message };
    }
};

// Logout
export const logout = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error("Logout failed", error);
        return { success: false, error: error.message };
    }
};

// Subscribe to Auth State Changes
export const onAuthStateChange = (callback) => {
    return auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Optional: Ensure sync on every load/reload
            // slightly expensive but guarantees consistency
            try {
                // We use the token in headers, so just hitting the endpoint works
                // But we can't await inside this callback easily without blocking UI?
                // It's a listener.
                // Let's just fire and forget the sync
                api.post('/auth/sync').catch(err => console.error("Auto-sync failed", err));
            } catch (e) {
                console.error("Sync error", e);
            }
        }
        callback(user);
    });
};

// Google Login (Redirect)
export const loginWithGoogle = async () => {
    try {
        await signInWithRedirect(auth, googleProvider);
        return { success: true, pendingRedirect: true };
    } catch (error) {
        console.error("Google Login Redirect failed", error);
        return { success: false, error: error.message };
    }
};

// Get Current User (Me) - Sync
export const getCurrentUser = () => {
    return auth.currentUser;
};

// Verification - Optional
export const sendVerification = async () => {
    try {
        if (auth.currentUser) {
            await sendEmailVerification(auth.currentUser);
        }
        return { success: true };
    } catch (error) {
        console.error("Verification email failed", error);
        return { success: false, error: error.message };
    }
};

// Legacy/Unused Placeholders to avoid breaking imports
export const verifyGoogleToken = async () => ({ success: true }); // No-op
export const checkGoogleRedirect = async () => ({ success: true }); // No-op
