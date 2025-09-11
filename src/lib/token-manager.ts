/**
 * Simple token management - stores tokens without re-renders
 */

interface TokenData {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
  lastUpdated: number;
}

const CACHE_KEY = 'auth_tokens_cache';
let cache: TokenData | null = null;

// Load from localStorage
const loadFromStorage = (): void => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const parsed: TokenData = JSON.parse(stored);
      const isExpired = Date.now() >= parsed.tokenExpiry;
      
      if (!isExpired && parsed.accessToken.trim() !== '') {
        cache = parsed;
      } else {
        clearCache();
      }
    }
  } catch {
    clearCache();
  }
};

// Save to localStorage
const saveToStorage = (): void => {
  try {
    if (cache) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
  } catch {
    // Silent fail
  }
};

// Set tokens
export const setTokens = (accessToken: string, refreshToken: string, tokenExpiry: number): void => {
  cache = {
    accessToken,
    refreshToken,
    tokenExpiry,
    lastUpdated: Date.now()
  };
  saveToStorage();
};

// Get access token
export const getAccessToken = (): string | null => {
  if (!cache) {
    loadFromStorage();
  }
  
  if (!cache || Date.now() >= cache.tokenExpiry) {
    clearCache();
    return null;
  }

  return cache.accessToken;
};

// Get refresh token
export const getRefreshToken = (): string | null => {
  if (!cache) {
    loadFromStorage();
  }
  
  return cache?.refreshToken || null;
};

// Clear cache
export const clearCache = (): void => {
  cache = null;
  saveToStorage();
};

// Initialize cache on load
loadFromStorage();

