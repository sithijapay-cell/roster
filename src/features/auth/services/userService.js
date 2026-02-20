import { db, auth } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

// Helper to get current user ID safely
const getUserId = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return user.uid;
};

// Fetch full user data (Profile + Shifts)
export const fetchUserData = async () => {
    try {
        const userId = getUserId();

        // Parallel requests: Profile & Shifts
        const [profileSnap, shiftsSnap] = await Promise.all([
            getDoc(doc(db, "users", userId)),
            getDocs(collection(db, "users", userId, "shifts"))
        ]);

        const profile = profileSnap.exists() ? profileSnap.data() : {};

        const shifts = {};
        shiftsSnap.forEach(doc => {
            // Using date as key: shifts['2024-02-14'] = { ...data }
            shifts[doc.id] = doc.data();
        });

        return { profile, shifts };
    } catch (error) {
        console.error("[UserService] Error fetching user data:", error);
        // Return empty if something fails, or rethrow
        return { profile: {}, shifts: {} };
    }
};

export const updateUserProfile = async (userId, profileData) => {
    try {
        const uid = userId || getUserId();
        const userRef = doc(db, "users", uid);

        // Merge true to avoid overwriting existing fields not in profileData
        await setDoc(userRef, profileData, { merge: true });

        // Return updated data (simulated)
        return { ...profileData };
    } catch (error) {
        console.error("Update profile failed", error);
        throw error;
    }
};

export const addShift = async (userId, date, shiftData) => {
    try {
        const uid = userId || getUserId();

        // Use date as document ID for easy retrieval/deduplication
        const shiftRef = doc(db, "users", uid, "shifts", date);

        const data = { date, ...shiftData };
        await setDoc(shiftRef, data);

        return data;
    } catch (error) {
        console.error("Add shift failed", error);
        throw error;
    }
};

export const removeShift = async (userId, date) => {
    try {
        const uid = userId || getUserId();
        const shiftRef = doc(db, "users", uid, "shifts", date);

        await deleteDoc(shiftRef);
        return { success: true };
    } catch (error) {
        console.error("Remove shift failed", error);
        throw error;
    }
};

export const uploadLocalData = async (userId, profile, shifts) => {
    try {
        const uid = userId || getUserId();

        if (profile) {
            await updateUserProfile(uid, profile);
        }

        // Batch write for shifts if needed, or just loop for now
        // Firestore batch limit is 500
        if (shifts && Object.keys(shifts).length > 0) {
            // Note: This is simple loop, for large data consider writeBatch()
            const promises = Object.keys(shifts).map(date =>
                addShift(uid, date, shifts[date])
            );
            await Promise.all(promises);
        }

    } catch (error) {
        console.error("Upload local data failed", error);
    }
};
