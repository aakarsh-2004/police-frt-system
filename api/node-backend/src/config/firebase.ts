import * as admin from 'firebase-admin';

const serviceAccount = {
    // You'll paste your Firebase service account credentials here
    // I'll show you the exact format once you share the JSON
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
}

export default admin; 