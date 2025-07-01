'use client';

import { useEffect } from 'react';

export function AccessibilityHelper() {
  useEffect(() => {
    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-background';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Enhance focus management
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('user-is-tabbing');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return null;
}