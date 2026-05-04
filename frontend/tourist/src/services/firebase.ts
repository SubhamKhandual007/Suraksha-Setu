import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDB6id5RnADk6vhRHzB2HSk2IetP0Tajug",
  authDomain: "tour-safe-6ce22.firebaseapp.com",
  projectId: "tour-safe-6ce22",
  storageBucket: "tour-safe-6ce22.firebasestorage.app",
  messagingSenderId: "356632459372",
  appId: "1:356632459372:web:a048fafd128a7da32f8049",
  measurementId: "G-K0SFPLWT9X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export default app;
