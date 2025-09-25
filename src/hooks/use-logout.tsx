import { useCallback } from 'react';
import { clientLogout } from '@/lib/logout-utils';

/**
 * Simple logout hook - uses client-side logout
 */
export function useLogout() {
  const logout = useCallback(async () => {
    await clientLogout(true);
  }, []);

  return { logout };
}
