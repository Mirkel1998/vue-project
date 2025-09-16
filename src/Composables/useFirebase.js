//Connection to Firebase

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3SH2yxHNvoqMpDjKlmOTGgzJSm19NZkc",
  authDomain: "avj-exam-project-2025.firebaseapp.com",
  projectId: "avj-exam-project-2025",
  storageBucket: "avj-exam-project-2025.firebasestorage.app",
  messagingSenderId: "276463342217",
  appId: "1:276463342217:web:8bbd3cc62d09ec03b1ec58"
};

let app
let db

export function useFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
  }
  return { app, db }
}