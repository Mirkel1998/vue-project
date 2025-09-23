//Connection to Firebase

import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3SH2yxHNvoqMpDjKlmOTGgzJSm19NZkc",
  authDomain: "avj-exam-project-2025.firebaseapp.com",
  projectId: "avj-exam-project-2025",
  storageBucket: "avj-exam-project-2025.firebasestorage.app",
  messagingSenderId: "276463342217",
  appId: "1:276463342217:web:8bbd3cc62d09ec03b1ec58"
};

// Ensure only one app is initialized
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export function useFirebase() {
  return { app, db };
}

// Export firebaseApp for direct import
export { app as firebaseApp }