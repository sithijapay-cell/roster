import api from '../../../services/api';

// Fetch full user data (Profile + Shifts)
export const fetchUserData = async () => {
    try {
        // Parallel requests for efficiency
        const [profileRes, shiftsRes] = await Promise.all([
            api.get('/auth/me'),
            api.get('/roster/shifts')
        ]);

        return {
            profile: profileRes.data || {},
            shifts: shiftsRes.data || {}
        };
    } catch (error) {
        console.error("Error fetching user data", error);
        // If 404, return empty (new user)
        if (error.response && error.response.status === 404) {
            return { profile: {}, shifts: {} };
        }
        throw error;
    }
};

export const updateUserProfile = async (userId, profileData) => {
    try {
        const response = await api.put('/roster/profile', profileData);
        return response.data;
    } catch (error) {
        console.error("Update profile failed", error);
        throw error;
    }
};

export const addShift = async (userId, date, shiftData) => {
    try {
        const response = await api.post('/roster/shift', { date, ...shiftData });
        return response.data;
    } catch (error) {
        console.error("Add shift failed", error);
        throw error;
    }
};

export const removeShift = async (userId, date) => {
    try {
        await api.delete(`/roster/shift/${date}`);
        return { success: true };
    } catch (error) {
        console.error("Remove shift failed", error);
        throw error;
    }
};

// Legacy support: We might not need this if we rely on the backend sync
export const uploadLocalData = async (userId, profile, shifts) => {
    // This requires a batch endpoint or sequential calls. 
    // For now, let's just sync the profile. 
    // Ideally, we'd have a specific endpoint for bulk upload.
    try {
        if (profile) {
            await updateUserProfile(userId, profile);
        }
        // Shifts upload would be heavy loop. Let's skip valid implementation for now 
        // to avoid complexity unless explicitly needed.
        console.warn("Bulk upload of local data not fully implemented in API migration yet.");
    } catch (error) {
        console.error("Upload local data failed", error);
    }
};
