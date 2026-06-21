import admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

let firebase = null;

if (projectId && privateKey && clientEmail) {
  firebase = admin.initializeApp({
    credential: admin.cert({ projectId, privateKey, clientEmail }),
  });
}

export default firebase;
