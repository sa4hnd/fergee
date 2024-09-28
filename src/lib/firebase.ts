import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDA3x_PxP24hWUIDZgJohTpXyxfxk4Mouo",
  authDomain: "quiz-a8740.firebaseapp.com",
  projectId: "quiz-a8740",
  storageBucket: "quiz-a8740.appspot.com",
  messagingSenderId: "739525484124",
  appId: "1:739525484124:web:df249a7b6a38a0ba685099",
  measurementId: "G-TDEXJ87YJY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { db, auth, analytics };