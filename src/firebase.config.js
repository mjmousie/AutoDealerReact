// src/firebase.config.js
// ─────────────────────────────────────────────────────────────
// Firebase SDK initialization.
// Replace placeholder values with your project's actual config
// from: Firebase Console → Project Settings → Your Apps → SDK setup
//
// NEVER commit real keys. Use a .env file and add it to .gitignore.
// All VITE_ prefixed vars are bundled at build time (client-safe).
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { initializeFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// ---------------------------------------------------------------------------
// 1. Firebase Project Configuration
//    Set these in your .env file as VITE_FIREBASE_* variables.
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
  // Optional: only needed if using Firebase Analytics
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// ---------------------------------------------------------------------------
// 2. Initialize Firebase App (singleton pattern — safe to import anywhere)
// ---------------------------------------------------------------------------
const app = initializeApp(firebaseConfig);

// ---------------------------------------------------------------------------
// 3. Initialize Services
//    Auth is intentionally omitted here — it is lazy-loaded in AuthContext.jsx
//    so the 85KB firebase/auth chunk is never fetched on public pages.
// ---------------------------------------------------------------------------
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const storage = getStorage(app);

// ---------------------------------------------------------------------------
// 4. Local Emulator Suite (development only)
//    Run: `firebase emulators:start` then set VITE_USE_EMULATOR=true in .env
//    Auth emulator is connected in AuthContext.jsx alongside auth init.
// ---------------------------------------------------------------------------
if (import.meta.env.VITE_USE_EMULATOR === "true" && import.meta.env.DEV) {
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
  console.info("[Firebase] Running against local emulator suite.");
}

export default app;

// ---------------------------------------------------------------------------
// .env template (copy to .env, fill in real values, add .env to .gitignore)
// ---------------------------------------------------------------------------
// VITE_FIREBASE_API_KEY=
// VITE_FIREBASE_AUTH_DOMAIN=
// VITE_FIREBASE_PROJECT_ID=
// VITE_FIREBASE_STORAGE_BUCKET=
// VITE_FIREBASE_MESSAGING_SENDER_ID=
// VITE_FIREBASE_APP_ID=
// VITE_FIREBASE_MEASUREMENT_ID=
// VITE_USE_EMULATOR=false
