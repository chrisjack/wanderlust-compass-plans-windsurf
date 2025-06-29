import { useAuth } from '@/lib/auth';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';
import { SessionWarning } from './SessionWarning';

interface IdleTimeoutProviderProps {
  children: React.ReactNode;
}

export function IdleTimeoutProvider({ children }: IdleTimeoutProviderProps) {
  const { user, signOut } = useAuth();
  
  const { isWarning, timeRemaining, extendSession } = useIdleTimeout({
    timeoutDays: 14,
    warningMinutes: 5,
    onLogout: signOut
  });

  // Only show session warning if user is authenticated and warning is active
  if (user && isWarning) {
    return (
      <>
        {children}
        <SessionWarning
          timeRemaining={timeRemaining}
          onExtendSession={extendSession}
          onLogout={signOut}
        />
      </>
    );
  }

  return <>{children}</>;
} 