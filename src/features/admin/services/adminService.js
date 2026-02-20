import { db, auth } from '../../../lib/firebase';
import {
    collection, getDocs, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc,
    query, orderBy, limit, serverTimestamp, where
} from 'firebase/firestore';

// ─── Fetch All Users ──────────────────────────────────────────
export const fetchAllUsers = async () => {
    try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const users = [];
        usersSnap.forEach(docSnap => {
            users.push({ uid: docSnap.id, ...docSnap.data() });
        });
        return users;
    } catch (error) {
        console.error('[AdminService] fetchAllUsers error:', error);
        return [];
    }
};

// ─── Toggle Block User ────────────────────────────────────────
export const toggleBlockUser = async (uid, currentlyBlocked) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { blocked: !currentlyBlocked });
        await logAdminAction('toggle_block', { targetUser: uid, blocked: !currentlyBlocked });
        return !currentlyBlocked;
    } catch (error) {
        console.error('[AdminService] toggleBlockUser error:', error);
        throw error;
    }
};

// ─── Post News to Firestore ──────────────────────────────────
export const postNews = async ({ title, content, imageUrl, category }) => {
    try {
        const newsRef = collection(db, 'admin_news');
        const newsItem = {
            title,
            content,
            imageUrl: imageUrl || '',
            category: category || 'Admin Update',
            source: 'Admin',
            postedBy: auth.currentUser?.uid || 'admin',
            postedByName: auth.currentUser?.displayName || 'Admin',
            createdAt: serverTimestamp(),
            pubDate: new Date().toISOString(),
            isVideo: false,
            link: ''
        };
        const docRef = await addDoc(newsRef, newsItem);
        await logAdminAction('post_news', { title, docId: docRef.id });
        return { id: docRef.id, ...newsItem };
    } catch (error) {
        console.error('[AdminService] postNews error:', error);
        throw error;
    }
};

export const deleteNews = async (newsId) => {
    try {
        await deleteDoc(doc(db, 'admin_news', newsId));
        await logAdminAction('delete_news', { newsId });
    } catch (error) {
        console.error('[AdminService] deleteNews error:', error);
        throw error;
    }
};


// ─── Send Push Notification (stores in Firestore for processing) ──
export const sendPushNotification = async ({ title, body, actionLink }) => {
    try {
        const notifRef = collection(db, 'notifications');
        const notif = {
            title,
            body,
            actionLink: actionLink || '',
            status: 'pending',
            sentBy: auth.currentUser?.uid || 'admin',
            createdAt: serverTimestamp()
        };
        const docRef = await addDoc(notifRef, notif);
        await logAdminAction('send_notification', { title, docId: docRef.id });
        return { id: docRef.id, ...notif };
    } catch (error) {
        console.error('[AdminService] sendPushNotification error:', error);
        throw error;
    }
};

export const deleteNotification = async (notifId) => {
    try {
        await deleteDoc(doc(db, 'notifications', notifId));
        await logAdminAction('delete_notification', { notifId });
    } catch (error) {
        console.error('[AdminService] deleteNotification error:', error);
        throw error;
    }
};


// ─── Analytics ────────────────────────────────────────────────
export const fetchAnalytics = async (users) => {
    try {
        const totalUsers = users.length;

        // Active Today: users with lastLogin within 24h
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        const activeToday = users.filter(u => {
            const lastLogin = u.lastLogin?.toDate?.() || u.lastLogin;
            if (!lastLogin) return false;
            return new Date(lastLogin).getTime() > oneDayAgo;
        }).length;

        // Total OT hours: scan user shift subcollections for various hour fields
        let totalOTHours = 0;
        for (const user of users) {
            try {
                const shiftsSnap = await getDocs(collection(db, 'users', user.uid, 'shifts'));
                shiftsSnap.forEach(shiftDoc => {
                    const data = shiftDoc.data();
                    // Check multiple possible field names for OT hours
                    const ot = Number(data.otHours) || Number(data.overtime) || Number(data.ot) || 0;
                    const hrs = Number(data.hours) || Number(data.totalHours) || 0;
                    totalOTHours += ot > 0 ? ot : (hrs > 8 ? hrs - 8 : 0);
                });
            } catch (e) {
                // Skip if no shifts subcollection
            }
        }

        return { totalUsers, activeToday, totalOTHours: Math.round(totalOTHours) };
    } catch (error) {
        console.error('[AdminService] fetchAnalytics error:', error);
        return { totalUsers: 0, activeToday: 0, totalOTHours: 0 };
    }
};

// ─── Admin Action Logger ──────────────────────────────────────
export const logAdminAction = async (action, details = {}) => {
    try {
        await addDoc(collection(db, 'admin_logs'), {
            action,
            details,
            adminUid: auth.currentUser?.uid || 'unknown',
            adminEmail: auth.currentUser?.email || 'unknown',
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('[AdminService] logAdminAction error:', error);
    }
};

// ─── Fetch Admin Logs ─────────────────────────────────────────
export const fetchAdminLogs = async (count = 20) => {
    try {
        const q = query(collection(db, 'admin_logs'), orderBy('timestamp', 'desc'), limit(count));
        const snap = await getDocs(q);
        const logs = [];
        snap.forEach(docSnap => {
            logs.push({ id: docSnap.id, ...docSnap.data() });
        });
        return logs;
    } catch (error) {
        console.error('[AdminService] fetchAdminLogs error:', error);
        return [];
    }
};
