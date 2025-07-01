"use client";

import React, { useState, useEffect } from 'react';
import SplashScreen from '../SplashScreen';

export default function SplashScreenGate({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Optionally, you can check for persisted state to skip splash on repeat visits
  }, []); // Add empty dependency array to run only once

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }
  return <>{children}</>;
}
