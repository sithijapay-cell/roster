import React, { createContext, useContext, useEffect, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from '../features/auth/context/AuthContext';
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
        designation: '',
        institution: '',
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

    // Effect: Fetch Data from Backend when User logs in
    useEffect(() => {
        if (!user) {
            setCloudProfile(null);
            setCloudShifts(null);
            return;
        }

        const loadData = async () => {
            setDataLoading(true);
            try {
                // Fetch Profile and Shifts from API
                const userData = await userService.fetchUserData();

                // Logic to Sync Local Data to Cloud on First Login
                // If Backend Shifts are empty BUT we have Local Shifts, upload them.
                // (Previously only checked profile, which is created empty on signup, causing a false positive)
                const cloudHasNoShifts = Object.keys(userData.shifts || {}).length === 0;
                const localHasShifts = Object.keys(localShifts).length > 0;

                if (cloudHasNoShifts && localHasShifts) {
                    console.log("Backend shifts empty, syncing local data to cloud...");
                    await userService.uploadLocalData(user.id, localProfile, localShifts);

                    // After upload, set state to local (which is now cloud-synced)
                    setCloudProfile(localProfile);
                    setCloudShifts(localShifts);
                } else {
                    setCloudProfile(userData.profile || {});
                    setCloudShifts(userData.shifts || {});
                }
            } catch (err) {
                console.error("Failed to load user data", err);
            } finally {
                setDataLoading(false);
            }
        };

        loadData();
    }, [user]);

    const updateProfile = async (data) => {
        try {
            if (user) {
                const updated = await userService.updateUserProfile(user.id, data);
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
                await userService.addShift(user.id, date, shiftData);
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
                await userService.removeShift(user.id, date);
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
        removeShift
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
