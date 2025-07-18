// utils.js

/**
 * Validate Vietnamese phone numbers.
 * Accepts formats: 09xxxxxxxx, 03xxxxxxxx, +849xxxxxxxx, etc.
 * Returns true if valid, false otherwise.
 */
export function isValidVietnamesePhone(phone) {
    return /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(phone);
}

/**
 * Converts phone numbers to E.164 format for Firebase.
 * Example: 0901234567 -> +84901234567
 * If already in +84 format, returns as is.
 */
export function convertToE164(phone) {
    return phone.startsWith("0") ? "+84" + phone.slice(1) : phone;
}

/**
 * Clears and resets a form container by ID.
 * Hides OTP section and resets reCAPTCHA if available.
 */
export function clearForm(formContainerId, otpSectionId, recaptchaVerifier) {
    const form = document.getElementById(formContainerId);
    if (form) form.reset();
    const otpSection = document.getElementById(otpSectionId);
    if (otpSection) otpSection.style.display = 'none';
    if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        recaptchaVerifier=null;
    }
}
