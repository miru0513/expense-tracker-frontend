import { useEffect, useRef, useState, useCallback } from 'react';

const INACTIVITY_MS  = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE = 60 * 1000;       // warn 60 s before logout

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

export function useInactivityLogout(onLogout, enabled = true) {
  const [secondsLeft, setSecondsLeft] = useState(null); // null = no warning shown
  const logoutTimer  = useRef(null);
  const warningTimer = useRef(null);
  const countdownRef = useRef(null);

  const clearAllTimers = () => {
    clearTimeout(logoutTimer.current);
    clearTimeout(warningTimer.current);
    clearInterval(countdownRef.current);
  };

  const startTimers = useCallback(() => {
    clearAllTimers();
    setSecondsLeft(null);

    // Fire warning 60 s before the logout deadline
    warningTimer.current = setTimeout(() => {
      setSecondsLeft(Math.round(WARNING_BEFORE / 1000));
      countdownRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) { clearInterval(countdownRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
    }, INACTIVITY_MS - WARNING_BEFORE);

    // Logout after full inactivity period
    logoutTimer.current = setTimeout(() => {
      clearAllTimers();
      setSecondsLeft(null);
      onLogout();
    }, INACTIVITY_MS);
  }, [onLogout]);

  const resetActivity = useCallback(() => {
    if (enabled) startTimers();
  }, [enabled, startTimers]);

  useEffect(() => {
    if (!enabled) { clearAllTimers(); setSecondsLeft(null); return; }

    startTimers();

    ACTIVITY_EVENTS.forEach(ev => window.addEventListener(ev, resetActivity, { passive: true }));

    return () => {
      clearAllTimers();
      ACTIVITY_EVENTS.forEach(ev => window.removeEventListener(ev, resetActivity));
    };
  }, [enabled, startTimers, resetActivity]);

  return { secondsLeft, resetActivity };
}
