import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const env = import.meta.env || {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY?.trim() || "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || "",
  projectId: env.VITE_FIREBASE_PROJECT_ID?.trim() || "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || "",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || "",
  appId: env.VITE_FIREBASE_APP_ID?.trim() || "",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID?.trim() || ""
};

/**
 * Validates if Firebase credentials are present and not placeholder values.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes("YOUR_") &&
  firebaseConfig.authDomain &&
  !firebaseConfig.authDomain.includes("YOUR_") &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.includes("YOUR_")
);

let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    // Always prompt user to select account on sign-in
    googleProvider.setCustomParameters({
      prompt: "select_account"
    });
  } catch (err) {
    console.error("Lỗi khởi tạo Firebase:", err);
  }
}

export { app, auth, googleProvider };

