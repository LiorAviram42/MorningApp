import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthInstance, db } from '../firebase';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface UserProfile {
  familyId: string;
  role: 'parent' | 'child';
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  authReady: boolean;
  authError: string | null;
  isAuthLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  authReady: false,
  authError: null,
  isAuthLoading: false,
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeProfile: (() => void) | undefined;

    const init = async () => {
      // Check for guest mode first
      const guestFamilyId = localStorage.getItem('guest_family_id');
      const guestRole = localStorage.getItem('guest_role') as 'parent' | 'child' | null;

      if (guestFamilyId && guestRole) {
        setProfile({ familyId: guestFamilyId, role: guestRole });
        setAuthReady(true);
        // We don't initialize Firebase Auth in guest mode to avoid Family Link blocks
        return;
      }

      // Check if we have a saved Firebase session or if a login was just requested
      const hasSavedSession = Object.keys(localStorage).some(key => key.startsWith('firebase:authUser'));
      const loginRequested = localStorage.getItem('auth_loading_requested') === 'true';
      
      if (!hasSavedSession && !loginRequested) {
        // No saved session and no login requested, stay in "logged out" state without loading Auth library
        setAuthReady(true);
        return;
      }

      setIsAuthLoading(true);
      // Only listen to auth if we're not in guest mode and have a reason to (saved session)
      try {
        const { onAuthStateChanged, getRedirectResult } = await import('firebase/auth');
        const auth = await getAuthInstance();
        
        // Handle redirect result
        try {
          const result = await getRedirectResult(auth);
          if (result) {
            console.log("Redirect login successful");
          }
          localStorage.removeItem('auth_loading_requested');
        } catch (redirectError: any) {
          console.error("Error handling redirect result:", redirectError);
          localStorage.removeItem('auth_loading_requested');
          setAuthError(redirectError.message);
          if (redirectError.code === 'auth/unauthorized-domain') {
            alert(`שגיאה: הדומיין ${window.location.hostname} לא מאושר ב-Firebase. אנא הוסף אותו ב-Authorized domains.`);
          }
        }
        
        unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
          setUser(currentUser);
          setIsAuthLoading(false);
          
          if (currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            
            // First check if profile exists, if not create it
            try {
              const docSnap = await getDoc(userDocRef);
              if (!docSnap.exists()) {
                const defaultProfile: UserProfile = {
                  familyId: currentUser.uid,
                  role: currentUser.isAnonymous ? 'child' : 'parent',
                };
                await setDoc(userDocRef, defaultProfile);
              }
            } catch (err) {
              console.error("Error ensuring user profile exists:", err);
            }

            // Now listen to profile changes
            unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
              if (snapshot.exists()) {
                setProfile(snapshot.data() as UserProfile);
                setAuthReady(true);
              }
            }, (error) => {
              console.error("Error fetching user profile:", error);
              setAuthReady(true);
            });
          } else {
            setProfile(null);
            setAuthReady(true);
          }
        });
      } catch (err: any) {
        console.error("Error initializing Auth:", err);
        setAuthError(err.message);
        setIsAuthLoading(false);
        setAuthReady(true);
      }
    };

    init();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, authReady, authError, isAuthLoading }}>
      {children}
    </UserContext.Provider>
  );
};
