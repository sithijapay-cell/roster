import api from '../../../services/api';

// Fetch full user data (Profile + Shifts) - helper for StoreContext
export const fetchUserData = async () => {
    try {
        const [profileRes, shiftsRes] = await Promise.all([
            api.get('/roster/profile'),
            api.get('/roster/shifts')
        ]);
        return {
            profile: profileRes.data,
            shifts: shiftsRes.data
        };
    } catch (error) {
        console.error("Error fetching user data", error);
        throw error;
    }
};

export const updateUserProfile = async (userId, profileData) => {
    // userId is ignored, backend uses token
    try {
        const response = await api.put('/roster/profile', profileData);
        return response.data;
    } catch (error) {
        console.error("Update profile failed", error);
        throw error;
    }
};

export const addShift = async (userId, date, shiftData) => {
    // userId ignored
    try {
        const response = await api.post('/roster/shift', {
            date,
            shifts: shiftData.shifts, // e.g., ["M"] or ["DN"]
            type: shiftData.type      // e.g., "DO" or "PH"
        });
        return response.data;
    } catch (error) {
        console.error("Add shift failed", error);
        throw error;
    }
};

export const removeShift = async (userId, date) => {
    try {
        await api.delete(`/roster/shift/${date}`);
    } catch (error) {
        console.error("Remove shift failed", error);
        throw error;
    }
};

// Legacy functions from old implementation - keep as empty or redirect?
// The StoreContext might call these if we didn't fully update it yet.
// We'll update StoreContext next.

export const createNewUserDoc = async () => {
    // Backend handles creation on Register
    return;
};

export const uploadLocalData = async (userId, profile, shifts) => {
    // Migration helper: iterate and upload
    // Warning: This could be slow if many shifts.
    try {
        await api.put('/roster/profile', profile);
        // Bulk shift upload not supported by backend yet, or iterate
        const dates = Object.keys(shifts);
        for (const date of dates) {
            await addShift(userId, date, shifts[date]);
        }
    } catch (error) {
        console.error("Upload local data failed", error);
    }
};
