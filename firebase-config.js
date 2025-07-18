// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, RecaptchaVerifier } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("✅ Firebase initialized:", app.name);

const db = getFirestore(app);
console.log("✅ Firestore connected:", db.app.name);

const auth = getAuth(app);
console.log("✅ Auth connected:", auth.app.name);

//Check connection status of Firebase Auth
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
onAuthStateChanged(auth,
    (user) => {
        if (user) {
            console.log("✅ Auth connected, user signed in:", user.phoneNumber || user.uid);
        } else {
            console.log("✅ Auth connected, no user signed in.");
        }
    },
    (error) => {
        console.error("❌ Auth connection error:", error);
    }
);

const analytics = getAnalytics(app);

export { db, auth, RecaptchaVerifier };

// Test Firestore connection with a simple query
import { collection, query, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Create a query on the "test" collection limiting to 1 document
const q = query(collection(db, "test"), limit(1));

getDocs(q)
    .then(() => console.log("✅ Firestore connected, test query successful."))
    .catch((error) => console.error("❌ Firestore connection failed:", error));
