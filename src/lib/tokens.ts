// JWT Token management utilities

const ACCESS_TOKEN_KEY = "asubeb_access_token";
const REFRESH_TOKEN_KEY = "asubeb_refresh_token";
const TOKEN_EXPIRY_KEY = "asubeb_token_expiry";

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Timestamp in milliseconds
}

/**
 * Store authentication tokens in localStorage
 */
export function setTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): void {
  const expiresAt = Date.now() + expiresIn * 1000; // Convert seconds to milliseconds

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
}

/**
 * Retrieve stored authentication tokens
 */
export function getTokens(): StoredTokens | null {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const expiresAt = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!accessToken || !refreshToken || !expiresAt) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: parseInt(expiresAt, 10),
    };
  } catch (error) {
    console.error("Error retrieving tokens:", error);
    return null;
  }
}

/**
 * Get only the access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get only the refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Clear all stored authentication tokens
 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

/**
 * Check if the access token is expired
 * Returns true if expired or expiry info is missing
 */
export function isTokenExpired(): boolean {
  try {
    const expiresAt = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!expiresAt) {
      return true;
    }

    const expiryTime = parseInt(expiresAt, 10);
    const now = Date.now();

    // Add 60 second buffer to refresh before actual expiry
    return now >= expiryTime - 60000;
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return true;
  }
}

/**
 * Get time remaining until token expires (in seconds)
 * Returns 0 if expired or expiry info is missing
 */
export function getTokenTimeRemaining(): number {
  try {
    const expiresAt = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!expiresAt) {
      return 0;
    }

    const expiryTime = parseInt(expiresAt, 10);
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));

    return remaining;
  } catch (error) {
    console.error("Error calculating token time remaining:", error);
    return 0;
  }
}

/**
 * Check if refresh token should be used
 * Returns true if we have a refresh token and access token is expired
 */
export function shouldRefreshToken(): boolean {
  const tokens = getTokens();
  return tokens !== null && isTokenExpired();
}
