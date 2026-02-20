import React, { createContext, useContext, useEffect, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { SHIFT_TIMES } from '../utils/rosterCalculations';
import { useAuth } from '../features/auth/context/AuthContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import * as userService from '../features/auth/services/userService';

const StoreContext = createContext();

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error("useStore must be used within a StoreProvider");
    }
    return context;
};

export const StoreProvider = ({ children }) => {
    const { user, loading: authLoading, ...authContextProps } = useAuth();

    // Local Storage State (Fallback / Offline-ish)
    const [localProfile, setLocalProfile] = useLocalStorage('nurse_profile', {
        name: '',
        grade: '', // changed from designation to match user request "Grade"
        hospital: '',
        salaryNumber: '',
        basicSalary: '',
        otRate: '',
        ward: ''
    });
    const [localShifts, setLocalShifts] = useLocalStorage('nurse_shifts', {});

    // Data Loading State
    const [dataLoading, setDataLoading] = useState(false);

    // Cloud/Backend State
    const [cloudProfile, setCloudProfile] = useState(null);
    const [cloudShifts, setCloudShifts] = useState(null);

    // Derived State
    const profile = user ? (cloudProfile || localProfile) : localProfile;
    const shifts = user ? (cloudShifts || localShifts) : localShifts;

    // Effect: Real-time Data Sync
    useEffect(() => {
        if (!user) {
            setCloudProfile(null);
            setCloudShifts(null);
            return;
        }

        setDataLoading(true);

        // 1. Profile Listener
        const unsubProfile = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setCloudProfile(data);

                // Sync Check: If cloud is empty but local exists, trigger upload (once)
                // We do this check only if we haven't synced yet to avoid loops?
                // Actually, if doc exists, we just trust cloud.
                // The "first login sync" logic is tricky with listeners.
                // Simplified: If cloud profile is emptyish, maybe check local?
                // For stability, let's assume if we get data, we use it.
            } else {
                // If doc doesn't exist, we might want to create it or checks local
                // But normally Auth triggers profile creation.
                setCloudProfile({});
            }
            setDataLoading(false); // Valid data received
        }, (error) => {
            console.error("[Store] Profile sync error:", error);
            setDataLoading(false);
        });

        // 2. Shifts Listener
        const unsubShifts = onSnapshot(collection(db, "users", user.uid, "shifts"), (snapshot) => {
            const shiftsData = {};
            snapshot.forEach(doc => {
                shiftsData[doc.id] = doc.data();
            });
            setCloudShifts(shiftsData);

            // Initial sync check for legacy/local data could go here if needed
            // But usually we just want to read what's there.
        }, (error) => {
            console.error("[Store] Shifts sync error:", error);
        });

        // Cleanup function to prevent memory leaks
        return () => {
            unsubProfile();
            unsubShifts();
        };
    }, [user]);

    const updateProfile = async (data) => {
        try {
            if (user) {
                const updated = await userService.updateUserProfile(user.uid, data);
                setCloudProfile(prev => ({ ...prev, ...updated }));
            } else {
                setLocalProfile(prev => ({ ...prev, ...data }));
            }
        } catch (err) {
            console.error("Update profile failed", err);
            alert("Failed to save profile. Check connection.");
        }
    };

    const addShift = async (date, shiftData) => {
        try {
            if (user) {
                await userService.addShift(user.uid, date, shiftData);
                setCloudShifts(prev => ({
                    ...prev,
                    [date]: shiftData
                }));
            } else {
                setLocalShifts(prev => ({ ...prev, [date]: shiftData }));
            }
        } catch (err) {
            console.error("Add shift failed", err);
            alert("Failed to save shift. Check connection.");
        }
    };

    const removeShift = async (date) => {
        try {
            if (user) {
                await userService.removeShift(user.uid, date);
                setCloudShifts(prev => {
                    const newShifts = { ...prev };
                    delete newShifts[date];
                    return newShifts;
                });
            } else {
                setLocalShifts(prev => {
                    const newShifts = { ...prev };
                    delete newShifts[date];
                    return newShifts;
                });
            }
        } catch (err) {
            console.error("Remove shift failed", err);
            alert("Failed to delete shift. Check connection.");
        }
    };

    const value = {
        user,
        profile,
        shifts,
        loading: authLoading || dataLoading,
        ...authContextProps,
        updateProfile,
        addShift,
        removeShift,
        shiftTypes: SHIFT_TIMES // Expose constant shift definitions
    };

    return (
        <StoreContext.Provider value={value}>
            {authLoading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-primary font-medium">Loading Application...</span>
                </div>
            ) : children}
        </StoreContext.Provider>
    );
};
