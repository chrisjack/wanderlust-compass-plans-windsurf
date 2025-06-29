import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface UseIdleTimeoutOptions {
  timeoutDays?: number;
  warningMinutes?: number;
  onLogout?: () => void;
}

export function useIdleTimeout({
  timeoutDays = 14,
  warningMinutes = 5,
  onLogout
}: UseIdleTimeoutOptions = {}) {
  const navigate = useNavigate();
  const [isWarning, setIsWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();

  // Convert days to milliseconds
  const TIMEOUT_MS = timeoutDays * 24 * 60 * 60 * 1000;
  const WARNING_MS = warningMinutes * 60 * 1000;

  const updateLastActivity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Store last activity in localStorage for persistence across sessions
        localStorage.setItem('lastActivity', Date.now().toString());
        
        // Also store in Supabase user metadata for server-side tracking
        await supabase.auth.updateUser({
          data: { lastActivity: Date.now().toString() }
        });
      }
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  };

  const resetTimers = () => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Update last activity
    updateLastActivity();

    // Set new warning timer
    warningRef.current = setTimeout(() => {
      setIsWarning(true);
      startCountdown();
    }, TIMEOUT_MS - WARNING_MS);

    // Set new logout timer
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_MS);
  };

  const startCountdown = () => {
    const endTime = Date.now() + WARNING_MS;
    
    countdownRef.current = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeRemaining(Math.ceil(remaining / 1000));
      
      if (remaining <= 0) {
        handleLogout();
      }
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      // Clear all timers
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);

      // Clear localStorage
      localStorage.removeItem('lastActivity');

      // Call custom logout function if provided
      if (onLogout) {
        onLogout();
      } else {
        // Default logout behavior
        await supabase.auth.signOut();
        navigate('/auth');
      }

      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const extendSession = () => {
    setIsWarning(false);
    setTimeRemaining(0);
    resetTimers();
    
    toast({
      title: "Session Extended",
      description: "Your session has been extended.",
    });
  };

  const checkExistingSession = async () => {
    try {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity) {
        const lastActivityTime = parseInt(lastActivity);
        const timeSinceLastActivity = Date.now() - lastActivityTime;
        
        if (timeSinceLastActivity >= TIMEOUT_MS) {
          // Session has already expired
          handleLogout();
          return;
        } else if (timeSinceLastActivity >= TIMEOUT_MS - WARNING_MS) {
          // Session is in warning period
          setIsWarning(true);
          const remainingTime = TIMEOUT_MS - timeSinceLastActivity;
          setTimeRemaining(Math.ceil(remainingTime / 1000));
          startCountdown();
        } else {
          // Session is still valid, set timers based on remaining time
          const remainingTime = TIMEOUT_MS - timeSinceLastActivity;
          
          // Set warning timer
          warningRef.current = setTimeout(() => {
            setIsWarning(true);
            startCountdown();
          }, remainingTime - WARNING_MS);
          
          // Set logout timer
          timeoutRef.current = setTimeout(() => {
            handleLogout();
          }, remainingTime);
        }
      } else {
        // No previous activity recorded, start fresh
        resetTimers();
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
    }
  };

  useEffect(() => {
    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (!isWarning) {
        resetTimers();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Check existing session on mount
    checkExistingSession();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return {
    isWarning,
    timeRemaining,
    extendSession,
    resetTimers
  };
} 