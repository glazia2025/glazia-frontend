import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1TqvrLNBA2Fl25_lQ9gInWbgx2R6I0YQ",
  authDomain: "glazia-61de6.firebaseapp.com",
  projectId: "glazia-61de6",
  storageBucket: "glazia-61de6.firebasestorage.app",
  messagingSenderId: "217531730759",
  appId: "1:217531730759:web:096b3b7c9a6e48339a1a62",
  measurementId: "G-BFDY433WS5"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);