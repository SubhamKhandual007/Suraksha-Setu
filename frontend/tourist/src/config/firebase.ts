import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDB6id5RnADk6vhRHzB2HSk2IetP0Tajug",
  authDomain: "tour-safe-6ce22.firebaseapp.com",
  projectId: "tour-safe-6ce22",
  storageBucket: "tour-safe-6ce22.firebasestorage.app",
  messagingSenderId: "356632459372",
  appId: "1:356632459372:web:a048fafd128a7da32f8049",
  measurementId: "G-K0SFPLWT9X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let analytics: any = null;

const initAnalytics = async () => {
  try {
    const { getAnalytics } = await import("firebase/analytics");
    analytics = getAnalytics(app);
  } catch (e) {
    // Analytics load failure is non-critical
  }
};

if (typeof window !== "undefined") {
  if (document.visibilityState === "visible") {
    initAnalytics();
  } else {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        initAnalytics();
        document.removeEventListener("visibilitychange", initAnalytics);
      }
    }, { once: true });
  }
}

export { app, auth, googleProvider, analytics, initAnalytics };
export default app;
