
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Helper to check if it's "8 PM"
const isTimeForReminder = () => {
    const now = new Date();
    // Default 8 PM check (20:00). 
    // We allow a window, e.g., 20:00 - 21:00, or just check if it's "PM".
    // For strict daily, we should check if we ALREADY sent it today.
    return now.getHours() >= 20;
};

// Key for storing "Last Notification Date" in localStorage
const LAST_NOTIF_KEY = 'shiftmaster_last_reminder_date';
const IS_REMINDER_ON_KEY = 'shiftmaster_daily_reminder_on';

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('This browser does not support desktop notification');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return false;
};

// To be called usually on Dashboard Mount
export const checkAndSendDailyReminder = async (user) => {
    // 0. Strict Auth Check
    if (!user || !user.uid) {
        console.warn("Daily Reminder: No user/uid. Aborting.");
        return;
    }

    // 1. Check if Feature is Enabled
    const isEnabled = localStorage.getItem(IS_REMINDER_ON_KEY) !== 'false'; // Default TRUE
    if (!isEnabled) return;

    // 2. Check if Permission Granted
    if (Notification.permission !== 'granted') return;

    // 3. Check Time (Strict client-side check)
    // If it's earlier than 8 PM, do nothing.
    if (!isTimeForReminder()) return;

    // 4. Check if already sent TODAY
    const todayStr = new Date().toDateString();
    const lastSent = localStorage.getItem(LAST_NOTIF_KEY);

    if (lastSent === todayStr) {
        // Already sent today
        return;
    }

    // 5. Fetch Roster for TOMORROW
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Format YYYY-MM-DD
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        const tomorrowDateKey = `${yyyy}-${mm}-${dd}`;

        const rosterRef = doc(db, 'rosters', user.uid);
        const rosterSnap = await getDoc(rosterRef);

        let body = "ShiftMaster: Tomorrow is your day off. Enjoy!";
        let title = "ShiftMaster Alert";

        if (rosterSnap.exists()) {
            const data = rosterSnap.data();
            // Data structure assumed: { "2023-10-27": { shift: "Morning", ... } }
            const shiftData = data[tomorrowDateKey];

            if (shiftData && shiftData.shift && shiftData.shift !== 'Off') {
                body = `You have a ${shiftData.shift} shift tomorrow. Get some rest!`;
            } else {
                body = `Tomorrow is your day off. Enjoy!`;
            }
        }

        // 6. Send Notification
        const notification = new Notification(title, {
            body: body,
            icon: '/shiftmasterlogo.png', // PWA Icon
            badge: '/shiftmasterlogo.png'
        });

        // 7. Mark as Sent
        localStorage.setItem(LAST_NOTIF_KEY, todayStr);

    } catch (error) {
        console.error("Daily Reminder Error:", error);
    }
};

export const toggleDailyReminder = (status) => {
    localStorage.setItem(IS_REMINDER_ON_KEY, status);
};

export const getDailyReminderStatus = () => {
    return localStorage.getItem(IS_REMINDER_ON_KEY) !== 'false';
};
