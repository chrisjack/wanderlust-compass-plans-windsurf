import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { ensureArchiveColumn } from '@/lib/archive-setup';

/**
 * Custom hook that ensures Archive columns exist for the current user.
 * This should be used in components that need Archive functionality.
 */
export function useArchiveSetup() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      ensureArchiveColumn(user.id);
    }
  }, [user, loading]);

  return { user, loading };
} 