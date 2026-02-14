const admin = require('firebase-admin');

let initialized = false;
let initError = null;

// Try to get credentials from ENV first (Render), otherwise from file (Local)
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var", e);
        initError = `Env Var Parsing Failed: ${e.message}`;
    }
} else {
    try {
        serviceAccount = require('./serviceAccountKey.json');
    } catch (e) {
        console.warn("No serviceAccountKey.json found and no FIREBASE_SERVICE_ACCOUNT env var set.");
    }
}

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
    // Only set default error if not already set by parsing error
    if (!initError) {
        initError = "No service account provided (Env var missing/empty or file missing)";
    }
    console.error(initError);
}

module.exports = { admin, initialized, initError };
