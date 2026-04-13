import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Lazy Auth initialization to avoid Family Link blocks for children
let authInstance: any = null;
export const getAuthInstance = async () => {
  if (!authInstance) {
    const { getAuth } = await import('firebase/auth');
    authInstance = getAuth(app);
  }
  return authInstance;
};

export const loginWithGoogle = async () => {
  try {
    // Mark that we are intentionally loading auth to allow the library to load
    localStorage.setItem('auth_loading_requested', 'true');
    
    const { GoogleAuthProvider, signInWithRedirect, setPersistence, browserLocalPersistence } = await import('firebase/auth');
    const auth = await getAuthInstance();
    
    await setPersistence(auth, browserLocalPersistence);
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    await signInWithRedirect(auth, provider);
  } catch (error: any) {
    localStorage.removeItem('auth_loading_requested');
    console.error("Login error:", error);
    if (error.code === 'auth/unauthorized-domain') {
      alert(`שגיאה: הדומיין ${window.location.hostname} לא מאושר ב-Firebase.`);
    } else {
      alert(`שגיאת התחברות: ${error.message}`);
    }
  }
};

export const logout = async () => {
  try {
    const { signOut } = await import('firebase/auth');
    const auth = await getAuthInstance();
    await signOut(auth);
    localStorage.removeItem('auth_loading_requested');
    window.location.reload();
  } catch (error) {
    console.error("Logout error:", error);
  }
};
