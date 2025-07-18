// login.js
import { db, auth, RecaptchaVerifier } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { signInWithPhoneNumber, setPersistence, browserLocalPersistence, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { isValidVietnamesePhone, convertToE164, clearForm } from './utils.js';

// Setup reCAPTCHA for login
window.loginRecaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-login-container', {
    'size': 'normal',
    'callback': () => console.log("✅ Login reCAPTCHA solved."),
    'expired-callback': () => console.log("⚠️ Login reCAPTCHA expired.")
});

// Show login form
document.getElementById('login-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-container').style.display = 'block';
});

// Send OTP for login
document.getElementById('login-send-otp-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const rawPhone = document.getElementById('login-phone').value.trim();
    if (!isValidVietnamesePhone(rawPhone)) {
        alert("❌ Invalid Vietnamese phone.");
        return;
    }
    const phoneNumber = convertToE164(rawPhone);
    try {
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.loginRecaptchaVerifier);
        window.loginConfirmationResult = confirmationResult;
        document.getElementById('login-otp-section').style.display = 'block';
        alert("✅ OTP sent for login.");
    } catch (error) {
        console.error(error);
        alert("❌ Error sending OTP: " + error.message);
    }
});

// Verify OTP and log in
document.getElementById('login-verify-otp-btn').addEventListener('click', async () => {
    const otp = document.getElementById('login-otp-code').value.trim();
    if (!otp) {
        alert("❌ Please enter the OTP.");
        return;
    }
    try {
        const result = await window.loginConfirmationResult.confirm(otp);
        const user = result.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        document.getElementById('user-name').textContent = userDoc.exists() ? userDoc.data().name : "User";
        document.getElementById('logout-link').style.display = 'inline';
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('login-otp-section').style.display = 'none';
        alert("✅ Logged in successfully.");
    } catch (error) {
        console.error(error);
        alert("❌ Login failed: " + error.message);
    }
});

// Cancel login
document.getElementById('cancel-login-btn').addEventListener('click', () => {
    clearForm('login-container', 'login-otp-section', window.loginRecaptchaVerifier);
});

// Logout
document.getElementById('logout-link').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await signOut(auth);
        alert("✅ Signed out.");
        document.getElementById('user-name').textContent = "Guest";
        document.getElementById('logout-link').style.display = 'none';
    } catch (error) {
        console.error("❌ Logout error:", error);
    }
});

// Realtime user state update
// onAuthStateChanged(auth, async (user) => {
//     if (user) {
//         const userDoc = await getDoc(doc(db, "users", user.uid));
//         document.getElementById('user-name').textContent = userDoc.exists() ? userDoc.data().name : "User";
//         document.getElementById('logout-link').style.display = 'inline';
//     } else {
//         document.getElementById('user-name').textContent = "Guest";
//         document.getElementById('logout-link').style.display = 'none';
//     }
// });

// Auth persistence
setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("✅ Persistence set for login."))
    .catch((error) => console.error("❌ Persistence error:", error));
