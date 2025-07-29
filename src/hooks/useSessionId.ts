import { useState, useEffect } from 'react';

export const useSessionId = () => {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Get or create session ID using browser fingerprinting
    let id = localStorage.getItem('suggestion_box_session');
    
    if (!id) {
      // Create a unique session ID based on browser characteristics
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Session fingerprint', 2, 2);
      }
      
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL(),
        Date.now(),
        Math.random()
      ].join('|');
      
      id = btoa(fingerprint).substring(0, 16);
      localStorage.setItem('suggestion_box_session', id);
    }
    
    setSessionId(id);
  }, []);

  return sessionId;
};