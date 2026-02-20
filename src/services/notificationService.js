import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';

let unsubscribeListener = null;
let lastNotifId = null;

// ─── Request Permission ────────────────────────────────────────
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.warn('[Notif] Notifications not supported in this browser');
        return 'unsupported';
    }

    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';

    const result = await Notification.requestPermission();

    // Store permission status in user profile
    if (auth.currentUser) {
        try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                notificationsEnabled: result === 'granted',
                notificationPermission: result
            });
        } catch (e) { /* non-critical */ }
    }

    return result;
};

// ─── Show Native Notification ──────────────────────────────────
const showNativeNotification = (title, options = {}) => {
    if (Notification.permission !== 'granted') return;

    try {
        // Use service worker registration if available (works better on mobile)
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body: options.body || '',
                    icon: '/pwa-192x192.png',
                    badge: '/pwa-192x192.png',
                    vibrate: [200, 100, 200],
                    tag: options.tag || 'shiftmaster-notification',
                    renotify: true,
                    data: {
                        url: options.url || '/',
                        timestamp: Date.now()
                    },
                    ...options
                });
            });
        } else {
            // Fallback: direct Notification constructor
            new Notification(title, {
                body: options.body || '',
                icon: '/pwa-192x192.png',
                tag: options.tag || 'shiftmaster-notification',
                ...options
            });
        }
    } catch (e) {
        console.warn('[Notif] Failed to show notification:', e.message);
    }
};

// ─── Start Listening for New Notifications ─────────────────────
export const startNotificationListener = () => {
    if (unsubscribeListener) return; // Already listening
    if (!auth.currentUser) return; // Wait for auth

    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(1));

    unsubscribeListener = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) return;

        const latestDoc = snapshot.docs[0];
        const data = latestDoc.data();

        // Only fire for NEW notifications (not the initial load)
        if (lastNotifId === null) {
            // First load — just store the ID, don't fire
            lastNotifId = latestDoc.id;
            return;
        }

        if (latestDoc.id !== lastNotifId) {
            lastNotifId = latestDoc.id;

            // Fire native notification
            showNativeNotification(data.title || 'ShiftMaster', {
                body: data.body || data.message || '',
                tag: `notif-${latestDoc.id}`,
                url: data.actionLink || '/roster'
            });
        }
    }, (err) => {
        console.warn('[Notif] Listener error:', err.message);
    });
};

// ─── Stop Listening ────────────────────────────────────────────
export const stopNotificationListener = () => {
    if (unsubscribeListener) {
        unsubscribeListener();
        unsubscribeListener = null;
        lastNotifId = null;
    }
};

// ─── Check Permission Status ──────────────────────────────────
export const getNotificationStatus = () => {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
};
