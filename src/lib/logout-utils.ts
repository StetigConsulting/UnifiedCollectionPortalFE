import { signOut } from 'next-auth/react';
import { clearCache } from './token-manager';

/**
 * Client-side logout - clears cache and signs out without server call
 * Use this for automatic logouts (token expiry, etc.)
 * 
 * @param redirect - Whether to redirect to login page (default: true)
 */
export const clientLogout = async (redirect: boolean = true) => {
  clearCache();
  await signOut({ 
    redirectTo: redirect ? '/auth/signin' : undefined, 
  });
};

/**
 * Server-side logout - calls backend logout endpoint then signs out
 * Use this for manual logout actions
 * 
 * This is handled by handleSignOut() in authActions.ts
 */