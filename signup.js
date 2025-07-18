// signup.js

import { db, auth, RecaptchaVerifier } from './firebase-config.js';
import { collection, doc, setDoc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { signInWithPhoneNumber, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { isValidVietnamesePhone, convertToE164, clearForm } from './utils.js';

// Track recaptchaVerifier
let recaptchaVerifierInstance = null;

// Show signup form and initialize reCAPTCHA only when visible
document.getElementById('signup-link').addEventListener('click', () => {
    document.getElementById('signup-container').style.display = 'block';
    document.getElementById('login-container').style.display = 'none';

    // Initialize reCAPTCHA only once
    if (!recaptchaVerifierInstance) {
        recaptchaVerifierInstance = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'normal',
            'callback': () => console.log("✅ reCAPTCHA solved."),
            'expired-callback': () => console.log("⚠️ reCAPTCHA expired, please retry.")
        });
        recaptchaVerifierInstance.render();
    }
});

// Send OTP for signup
document.getElementById('send-otp-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const rawPhone = document.getElementById('signup-phone').value.trim();

    if (!isValidVietnamesePhone(rawPhone)) {
        alert("❌ Invalid Vietnamese phone.");
        return;
    }

    const phoneNumber = convertToE164(rawPhone);

    try {
        if (await checkIfPhoneExists(phoneNumber)) {
            alert("❌ Phone already registered, please log in.");
            return;
        }

        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierInstance);
        window.confirmationResult = confirmationResult;
        document.getElementById('otp-section').style.display = 'block';
        alert("✅ OTP sent for signup.");
    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        alert("❌ Error sending OTP: " + error.message);
    }
});

// Verify OTP and save user info
document.getElementById('verify-otp-btn').addEventListener('click', async () => {
    const otp = document.getElementById('otp-code').value.trim();
    const name = document.getElementById('signup-name').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();

    if (!window.confirmationResult) {
        alert("⚠️ Please send OTP first before verifying.");
        return;
    }

    try {
        const result = await window.confirmationResult.confirm(otp);
        const user = result.user;
        console.log("✅ OTP verified, user:", user.uid);

        await setDoc(doc(db, "users", user.uid), {
            name,
            phone,
            createdAt: serverTimestamp()
        });
        
        console.log("✅ User info saved to Firestore.");
        // new line: Fetch user document to display name
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            document.getElementById('user-name').textContent = userDoc.data().name;
            document.getElementById('logout-link').style.display = 'inline';
        } else {
            document.getElementById('user-name').textContent = "User";
        }


        console.log("✅ User info saved to Firestore.");
        alert("✅ Signup successful!");

        document.getElementById('signup-container').style.display = 'none';
        document.getElementById('user-name').textContent = name;

        // Optionally reset form and reCAPTCHA after successful signup
        clearForm('signup-container', 'otp-section', recaptchaVerifierInstance);
    } catch (error) {
        console.error("❌ Error verifying OTP or saving user:", error, error.code, error.message);
        alert("❌ Error verifying OTP or saving user: " + error.message);
    }
});

// Cancel signup buttons
document.getElementById('cancel-signup-btn').addEventListener('click', () => {
    document.getElementById('signup-container').style.display = 'none';
    clearForm('signup-container', 'otp-section', recaptchaVerifierInstance);
});

document.getElementById('cancel-otp-btn').addEventListener('click', () => {
    document.getElementById('signup-container').style.display = 'none';
    clearForm('signup-container', 'otp-section', recaptchaVerifierInstance);
});

// Utility: Check if phone exists in Firestore
async function checkIfPhoneExists(phoneNumber) {
    const q = query(collection(db, "users"), where("phone", "==", phoneNumber));
    const snap = await getDocs(q);
    return !snap.empty;
}

// Real-time validation for phone input
document.getElementById('signup-phone').addEventListener('input', (e) => {
    const valid = isValidVietnamesePhone(e.target.value.trim());
    e.target.setCustomValidity(valid ? "" : "❌ Invalid VN phone. Format: 09xxxxxxxx.");
});

// Ensure Firebase Auth persistence
setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("✅ Persistence set for signup."))
    .catch((error) => console.error("❌ Persistence error:", error));
