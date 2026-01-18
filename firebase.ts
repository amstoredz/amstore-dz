
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { FIREBASE_CONFIG, isFirebaseConfigured } from './constants';

let db: any = null;

if (isFirebaseConfigured()) {
  try {
    const app = initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export { db };
