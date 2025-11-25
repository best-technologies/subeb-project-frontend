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

/**
 * Verify if a JWT token is valid and not expired
 * @param token - The JWT token to verify
 * @returns Promise<boolean> - true if valid, false otherwise
 */
export async function verifyToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    // Split JWT into parts (header.payload.signature)
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Decode the payload (middle part)
    const base64Payload = parts[1];
    // Handle base64 padding
    const paddedBase64 = base64Payload.padEnd(
      base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
      "="
    );
    const payload = JSON.parse(atob(paddedBase64));

    // Check if token has expiration
    if (!payload.exp) {
      return false;
    }

    // Convert expiry to milliseconds and check
    const expiryTime = payload.exp * 1000;
    const now = Date.now();

    // Token is valid if not expired (with 60 second buffer)
    return now < expiryTime - 60000;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
}

/**
 * Sync tokens and user role to cookies for middleware access
 * This allows the middleware to read tokens and role for server-side validation
 */
export function syncTokensToCookies(userRole?: string): void {
  if (typeof window === "undefined") return;

  const tokens = getTokens();
  if (!tokens) {
    // Clear cookies if no tokens
    document.cookie =
      "asubeb_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      "asubeb_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      "asubeb_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    return;
  }

  // Set cookies with expiry
  const expiryDate = new Date(tokens.expiresAt);
  document.cookie = `asubeb_access_token=${
    tokens.accessToken
  }; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict`;
  document.cookie = `asubeb_refresh_token=${
    tokens.refreshToken
  }; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict`;

  // Set role cookie if provided
  if (userRole) {
    document.cookie = `asubeb_user_role=${userRole}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict`;
  }
}

/**
 * Clear token and role cookies
 */
export function clearTokenCookies(): void {
  if (typeof window === "undefined") return;

  document.cookie =
    "asubeb_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  document.cookie =
    "asubeb_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  document.cookie =
    "asubeb_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}
