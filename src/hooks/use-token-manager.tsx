import { useCallback } from 'react';
import { getAccessToken, clearCache } from '@/lib/token-manager';

/**
 * Simple hook to manage tokens without re-renders
 */
export function useTokenManager() {
  const getToken = useCallback(() => {
    return getAccessToken();
  }, []);

  const clearTokens = useCallback(() => {
    clearCache();
  }, []);

  return {
    getToken,
    clearTokens
  };
}
