import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBJadLgRQ-mWuLET2Orsnpo-cyJld_BFrE",
    authDomain: "qwiklabs-gcp-03-08abd4d72d2c.firebaseapp.com",
    projectId: "qwiklabs-gcp-03-08abd4d72d2c",
    storageBucket: "qwiklabs-gcp-03-08abd4d72d2c.firebasestorage.app",
    messagingSenderId: "590401122347",
    appId: "1:590401122347:web:4e969db09276a4fc8a7a6e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Add proper error messages
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

// Add type declarations
declare global {
    interface Window {
        recaptchaVerifier: any;
        confirmationResult: any;
    }
}