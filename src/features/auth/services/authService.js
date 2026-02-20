import { auth, googleProvider, db } from '../../../lib/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    sendEmailVerification,
    updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, increment } from 'firebase/firestore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Login with Email & Password
export const loginWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Track lastLogin for admin analytics
        try {
            await setDoc(doc(db, 'users', userCredential.user.uid), { lastLogin: serverTimestamp() }, { merge: true });
        } catch (e) { /* non-critical */ }
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

        // Update Auth Profile (Display Name) for emails
        if (profileData?.name) {
            await updateProfile(user, { displayName: profileData.name });
        }

        // Check for referral
        const referrerUid = sessionStorage.getItem('referrer_uid');

        // Create Profile in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            uid: user.uid,
            createdAt: new Date().toISOString(),
            referralCount: 0,
            referredBy: referrerUid || null,
            ...profileData
        });

        // Increment referrer's count
        if (referrerUid && referrerUid !== user.uid) {
            try {
                const referrerRef = doc(db, 'users', referrerUid);
                const referrerSnap = await getDoc(referrerRef);
                if (referrerSnap.exists()) {
                    await setDoc(referrerRef, { referralCount: increment(1) }, { merge: true });
                }
            } catch (e) {
                console.warn('Referral increment failed:', e.message);
            }
            sessionStorage.removeItem('referrer_uid');
        }

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
    return auth.onAuthStateChanged((user) => {
        callback(user);
    });
};

// Google Login (Redirect)
// Google Login (Popup)
export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if profile exists
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Check for referral
            const referrerUid = sessionStorage.getItem('referrer_uid');

            // Create new profile for Google User
            await setDoc(userRef, {
                email: user.email,
                uid: user.uid,
                name: user.displayName || 'Nurse',
                photoURL: user.photoURL,
                createdAt: new Date().toISOString(),
                lastLogin: serverTimestamp(),
                referralCount: 0,
                referredBy: referrerUid || null,
                role: 'nurse' // data model default
            });

            // Increment referrer's count
            if (referrerUid && referrerUid !== user.uid) {
                try {
                    const referrerRef = doc(db, 'users', referrerUid);
                    const referrerSnap = await getDoc(referrerRef);
                    if (referrerSnap.exists()) {
                        await setDoc(referrerRef, { referralCount: increment(1) }, { merge: true });
                    }
                } catch (e) {
                    console.warn('Referral increment failed:', e.message);
                }
                sessionStorage.removeItem('referrer_uid');
            }
        } else {
            // Track lastLogin for admin analytics
            try {
                await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
            } catch (e) { /* non-critical */ }
        }

        return { success: true, user };
    } catch (error) {
        console.error("Google Login Popup failed", error);
        return { success: false, error: error.message };
    }
};

// Handle Redirect Result - No longer needed for Popup, keeping as no-op to avoid breaking imports
export const handleGoogleRedirect = async () => {
    return { success: true, noResult: true };
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

// Sync User with Backend
export const syncUserWithBackend = async (user) => {
    try {
        const token = await user.getIdToken();
        const response = await fetch(`${API_URL}/auth/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to sync user with backend');
        }

        return { success: true, data: await response.json() };
    } catch (error) {
        console.error("Sync with backend failed", error);
        return { success: false, error: error.message };
    }
};

// Legacy/Unused Placeholders to avoid breaking imports
export const verifyGoogleToken = async () => ({ success: true }); // No-op
export const checkGoogleRedirect = async () => ({ success: true }); // No-op
