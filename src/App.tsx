/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import InstallPrompt from './components/InstallPrompt';
import { KidId } from './types';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { KIDS } from './constants';
import { UserProvider, useUser } from './contexts/UserContext';

function AppContent() {
  const [screen, setScreen] = useState<'splash' | 'home' | 'game'>('splash');
  const [selectedKid, setSelectedKid] = useState<KidId | null>(null);
  const { user, profile, authReady } = useUser();

  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ screen: 'splash' }, '');
    }

    const handlePopState = (e: PopStateEvent) => {
      const state = e.state;
      if (state && state.screen) {
        setScreen(state.screen);
        if (state.kidId) {
          setSelectedKid(state.kidId);
        }
      } else {
        setScreen('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const checkDailyReset = async () => {
      const today = new Date().toDateString();
      const savedDate = localStorage.getItem('appDate');
      
      if (savedDate !== today) {
        // Reset local storage
        localStorage.removeItem('tasks_yuvali');
        localStorage.removeItem('tasks_maayani');
        localStorage.removeItem('tasks_palgi');
        localStorage.setItem('appDate', today);

        // Reset Firestore if logged in
        if (user && profile) {
          try {
            for (const kidId of Object.keys(KIDS)) {
              const docRef = doc(db, 'users', profile.familyId, 'kids', kidId);
              const snapshot = await getDoc(docRef);
              if (snapshot.exists()) {
                await setDoc(docRef, { completedTasks: [] }, { merge: true });
              }
            }
          } catch (error) {
            console.error('Error resetting daily tasks in Firestore:', error);
          }
        }
      }
    };
    
    if (authReady) {
      checkDailyReset();
    }
  }, [user, authReady]);

  const handleSplashFinish = () => {
    setScreen('home');
    window.history.replaceState({ screen: 'home' }, '');
  };

  const handleKidSelect = (kidId: KidId) => {
    setSelectedKid(kidId);
    setScreen('game');
    window.history.pushState({ screen: 'game', kidId }, '');
  };

  const handleBack = () => {
    window.history.back();
  };

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (screen === 'splash') {
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#c0e2eb');
    } else {
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#C5E9F1');
    }
  }, [screen]);

  const backgroundStyle = screen === 'splash' 
    ? { backgroundColor: '#f7efc8' }
    : { background: 'linear-gradient(to bottom, #C5E9F1 0%, #FDC4C1 50%, #FFFDE1 100%)' };

  return (
    <div 
      dir="rtl" 
      className="w-full h-full min-h-[100dvh] max-w-md mx-auto relative overflow-hidden flex flex-col font-sans select-none transition-all duration-500"
      style={backgroundStyle}
    >
      {screen === 'splash' && <SplashScreen onFinish={handleSplashFinish} />}
      {screen === 'home' && authReady && <HomeScreen onSelectKid={handleKidSelect} hasMagicBg={false} />}
      {screen === 'game' && selectedKid && authReady && (
        <GameScreen kidId={selectedKid} onBack={handleBack} />
      )}
      <InstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
