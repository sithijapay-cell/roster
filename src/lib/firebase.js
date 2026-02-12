import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
// You can get this from the Firebase Console -> Project Settings -> General -> Your Apps -> SDK Setup and Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBfJuoshLNBummrjhC93eBsM9JBldItee8",
    authDomain: "designink-roster.web.app",
    projectId: "designink-roster",
    storageBucket: "designink-roster.firebasestorage.app",
    messagingSenderId: "363453470292",
    appId: "1:363453470292:web:b372339579ee1b600bbfc1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
