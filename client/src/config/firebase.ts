import { getAuth, RecaptchaVerifier, ConfirmationResult } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyApWwA7nKRX-b9RsYmR8W3dYKVXfISd2_M",
    authDomain: "qwiklabs-gcp-02-01d47808a95c.firebaseapp.com",
    projectId: "qwiklabs-gcp-02-01d47808a95c",
    storageBucket: "qwiklabs-gcp-02-01d47808a95c.firebasestorage.app",
    messagingSenderId: "612709331959",
    appId: "1:612709331959:web:a2e8d0a3c6e58ff9bfb4f2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const getFirebaseErrorMessage = (code: string) => {
    switch (code) {
        case 'auth/invalid-app-credential':
            return 'Invalid app credentials. Please try again later.';
        case 'auth/invalid-phone-number':
            return 'Invalid phone number format. Please enter a valid phone number.';
        case 'auth/missing-verification-code':
            return 'Please enter the verification code.';
        case 'auth/invalid-verification-code':
            return 'Invalid verification code. Please try again.';
        case 'auth/code-expired':
            return 'Verification code has expired. Please request a new one.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/quota-exceeded':
            return 'Service temporarily unavailable. Please try again later.';
        default:
            return 'An error occurred. Please try again.';
    }
};

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier | null;
        confirmationResult: ConfirmationResult | null;
    }
}