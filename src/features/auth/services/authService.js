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

// Placeholder for Google Login (Disabled in Phase 1)
export const loginWithGoogle = async () => {
    return { success: false, error: "Google Login is temporarily disabled during migration." };
};

// Placeholder for Reset Password (Disabled)
export const resetPassword = async (email) => {
    return { success: false, error: "Password reset is not yet implemented in the new backend." };
};

// Placeholder for Verification (Disabled)
export const sendVerification = async (user) => {
    return { success: true }; // No-op
};
