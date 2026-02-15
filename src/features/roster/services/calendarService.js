// Google Calendar Service
import { googleProvider } from '../../../lib/firebase';
import { getAuth } from 'firebase/auth';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

// Helper to get access token (requires user to trigger re-auth if missing)
export const getCalendarToken = async () => {
    // Note: Firebase Auth doesn't persist the provider access token indefinitely or directly expose it easily 
    // without a session. A common pattern for client-side only apps without a backend proxy 
    // is to re-trigger a silent popup or rely on the initial sign-in credential if stored.
    // However, for a robust PWA, we might need to ask the user to "Connect Calendar" which triggers a popup 
    // to get a fresh token.

    // For this implementation, we will assume we need to request a fresh token via a user interaction
    // if we don't store it. Firebase properly manages the auth token, but NOT the provider access token (for Calendar).
    // The previously agreed plan implies client-side integration.

    // We will return null if we can't get it, and the UI should prompt to "Connect".
    return sessionStorage.getItem('google_calendar_token');
};

export const connectCalendar = async () => {
    const auth = getAuth();
    // We need to trigger a popup to get the provider token
    // This is required because we need the OAUTH access token for Google APIs, not just the Firebase ID token.
    const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');

    try {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/calendar.events');

        // Re-authenticate or Sign-in
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;

        if (token) {
            sessionStorage.setItem('google_calendar_token', token);
            return { success: true, token };
        }
        return { success: false, error: 'No access token found' };
    } catch (error) {
        console.error("Error connecting calendar:", error);
        return { success: false, error: error.message };
    }
};

export const syncShiftToCalendar = async (shift, date) => {
    const token = await getCalendarToken();
    if (!token) {
        return { success: false, error: 'auth_required' }; // UI should show "Connect Calendar"
    }

    const event = {
        summary: `Shift: ${shift.shiftType} - ${shift.location || 'Ward'}`,
        description: `Duty: ${shift.shiftType}\nLocation: ${shift.location || 'N/A'}\nNote: ${shift.note || ''}`,
        start: {
            date: date // All-day event for simplicity, or map shiftType to hours
        },
        end: {
            date: date
        }
    };

    // For specific times, we would need to map shiftType (Morning, Evening, Night) to actual hours.
    // Let's refine this mapping:
    // Morning: 07:00 - 13:00
    // Evening: 13:00 - 19:00
    // Night: 19:00 - 07:00 (next day)

    // Simplified mapping for now (using user's local time)
    const startTimeMap = {
        'Morning': '07:00:00',
        'Evening': '13:00:00',
        'Night': '19:00:00',
        'Day': '07:00:00'
    };

    const endTimeMap = {
        'Morning': '13:00:00',
        'Evening': '19:00:00',
        'Night': '07:00:00', // +1 day handled below
        'Day': '19:00:00'
    };

    if (startTimeMap[shift.shiftType]) {
        event.start = {
            dateTime: `${date}T${startTimeMap[shift.shiftType]}`,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        let endDateTime = `${date}T${endTimeMap[shift.shiftType]}`;
        // Handle Night shift ending next day
        if (shift.shiftType === 'Night') {
            const d = new Date(date);
            d.setDate(d.getDate() + 1);
            const nextDate = d.toISOString().split('T')[0];
            endDateTime = `${nextDate}T${endTimeMap[shift.shiftType]}`;
        }

        event.end = {
            dateTime: endDateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }


    try {
        const response = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });

        if (!response.ok) {
            if (response.status === 401) {
                return { success: false, error: 'auth_required' };
            }
            const err = await response.json();
            throw new Error(err.error?.message || 'Failed to create event');
        }

        const data = await response.json();
        return { success: true, eventId: data.id, link: data.htmlLink };
    } catch (error) {
        console.error("Calendar sync failed:", error);
        return { success: false, error: error.message };
    }
};
