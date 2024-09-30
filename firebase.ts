
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

// Initialize Firebase
let app;
let analytics;
let db;
let auth;

if (typeof window !== "undefined" && !getApps().length) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  if (process.env.NODE_ENV === "production") {
    analytics = getAnalytics(app);
  }
}

export { app, db, auth, analytics };