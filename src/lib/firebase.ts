import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDA3x_PxP24hWUIDZgJohTpXyxfxk4Mouo',
  authDomain: 'quiz-a8740.firebaseapp.com',
  projectId: 'quiz-a8740',
  storageBucket: 'quiz-a8740.appspot.com',
  messagingSenderId: '739525484124',
  appId: '1:739525484124:web:df249a7b6a38a0ba685099',
  measurementId: 'G-TDEXJ87YJY',
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
