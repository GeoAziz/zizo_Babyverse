"use client";

import React, { useEffect, useRef, useState } from 'react';

// Sound assets (replace with actual file paths or URLs)
const ambientSound = '/sounds/ambient.mp3';
const chimeSound = '/sounds/chime.mp3';
const whooshSound = '/sounds/whoosh.mp3';
const giggleSound = '/sounds/giggle.mp3';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const chimeRef = useRef<HTMLAudioElement | null>(null);
  const whooshRef = useRef<HTMLAudioElement | null>(null);
  const giggleRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play ambient sound
    ambientRef.current?.play();
    let last = 0;
    let interval: NodeJS.Timeout | null = null;
    let finished = false;
    setProgress(0);
    // Animate progress and play sounds at milestones
    interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next === 30 && last < 30) chimeRef.current?.play();
        if (next === 70 && last < 70) whooshRef.current?.play();
        if (next >= 100 && last < 100 && !finished) {
          giggleRef.current?.play();
          finished = true;
          setTimeout(() => {
            setExiting(true);
            setTimeout(onFinish, 1200);
          }, 600);
        }
        last = next;
        return next > 100 ? 100 : next;
      });
    }, 24); // ~2.4s total
    return () => {
      if (interval) clearInterval(interval);
      if (ambientRef.current) {
        ambientRef.current.pause();
        ambientRef.current.currentTime = 0;
      }
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary to-secondary overflow-hidden transition-opacity duration-1000 ${exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      aria-label="Splash screen loading BabyVerse"
      tabIndex={-1}
    >
      {/* Cosmic background */}
      <div className="absolute inset-0 animate-cosmic-bg pointer-events-none" />
      {/* Floating baby pod */}
      <div className="relative z-10 animate-baby-float">
        <div className="w-40 h-40 bg-gradient-to-br from-white/80 to-accent/60 rounded-full shadow-2xl flex items-center justify-center border-4 border-accent/30">
          <img src="/images/baby-pod.png" alt="Baby pod" className="w-28 h-28 object-contain animate-pulse" />
        </div>
      </div>
      {/* Animated text */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary drop-shadow-glow animate-text-fade-in">
          Welcome to Zizo's BabyVerse
        </h1>
        <p className="mt-2 text-lg md:text-2xl text-accent animate-text-fade-in delay-300">
          A cosmic journey for little stars
        </p>
      </div>
      {/* Progress ring */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="#8E44AD"
            strokeWidth="6"
            fill="none"
            opacity="0.2"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="#8E44AD"
            strokeWidth="6"
            fill="none"
            strokeDasharray={2 * Math.PI * 36}
            strokeDashoffset={2 * Math.PI * 36 * (1 - progress / 100)}
            className="transition-all duration-200"
          />
        </svg>
      </div>
      {/* Audio elements */}
      <audio ref={ambientRef} src={ambientSound} loop preload="auto" />
      <audio ref={chimeRef} src={chimeSound} preload="auto" />
      <audio ref={whooshRef} src={whooshSound} preload="auto" />
      <audio ref={giggleRef} src={giggleSound} preload="auto" />
    </div>
  );
}
