const admin = require('firebase-admin');

// Try to get credentials from ENV first (Render), otherwise from file (Local)
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var", e);
    }
} else {
    try {
        serviceAccount = require('./serviceAccountKey.json');
    } catch (e) {
        console.warn("No serviceAccountKey.json found and no FIREBASE_SERVICE_ACCOUNT env var set.");
    }
}

let initialized = false;
let initError = null;

if (serviceAccount) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        initialized = true;
    } catch (e) {
        initError = e.message;
        console.error("Firebase Admin Init Error:", e);
    }
} else {
    initError = "No service account provided (Env var or file missing/invalid)";
    console.error(initError);
}

module.exports = { admin, initialized, initError };
