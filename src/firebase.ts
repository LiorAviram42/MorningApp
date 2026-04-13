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
    // Trigger auth loading in the context before starting the popup
    window.dispatchEvent(new CustomEvent('firebase-auth-trigger'));
    
    const { GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } = await import('firebase/auth');
    const auth = await getAuthInstance();
    
    await setPersistence(auth, browserLocalPersistence);
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    await signInWithPopup(auth, provider);
    // No reload needed, the listener in UserContext will pick it up
  } catch (error: any) {
    console.error("Login error:", error);
    if (error.code === 'auth/unauthorized-domain') {
      alert(`שגיאה: הדומיין ${window.location.hostname} לא מאושר ב-Firebase. אנא הוסף אותו ב-Authorized domains ב-Firebase Console.`);
    } else if (error.code !== 'auth/popup-closed-by-user') {
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
