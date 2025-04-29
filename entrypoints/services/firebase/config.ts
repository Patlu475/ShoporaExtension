import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAssOpY4viPUehSvY1j02ob9jVtYdZK1A0",
  authDomain: "shopbot-a0199.firebaseapp.com",
  projectId: "shopbot-a0199",
  storageBucket: "shopbot-a0199.firebasestorage.app",
  messagingSenderId: "937581197986",
  appId: "1:937581197986:web:b865f159d44bc465d9b5fb",
  measurementId: "G-NVT2Y7R8PP"
};

// Initialize Firebase
// Check if Firebase app is already initialized to prevent "duplicate-app" error
let app;
try {
  // Try to get existing app instance first
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp(); // If already initialized, use that one
  }
} catch (error) {
  console.error("Firebase initialization error", error);
  // Fallback to a non-initialized state for graceful handling
  app = null;
}

// Initialize services only if app is successfully initialized
const db = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;

export { app, db, auth }; 