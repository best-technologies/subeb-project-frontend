// Simple localStorage-based session management for temporary frontend auth
// This will be replaced when backend authentication is implemented

const SESSION_KEY = "asubeb_session";
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export interface SessionData {
  token: string;
  timestamp: number;
  lastAccessed: number;
}

/**
 * Generate a simple session token
 */
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Create a new session after successful PIN validation
 */
export function createSession(): void {
  const sessionData: SessionData = {
    token: generateSessionToken(),
    timestamp: Date.now(),
    lastAccessed: Date.now(),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
}

/**
 * Get current session data from localStorage
 */
export function getSession(): SessionData | null {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;

    return JSON.parse(sessionStr) as SessionData;
  } catch {
    // Invalid session data, clear it
    clearSession();
    return null;
  }
}

/**
 * Check if current session is valid (not expired)
 */
export function isSessionValid(): boolean {
  const session = getSession();
  if (!session) return false;

  const now = Date.now();
  const timeSinceLastAccess = now - session.lastAccessed;

  // Session expired if more than 30 minutes since last access
  if (timeSinceLastAccess > SESSION_DURATION) {
    clearSession();
    return false;
  }

  // Update last accessed time
  updateLastAccessed();
  return true;
}

/**
 * Update the last accessed time for the current session
 */
export function updateLastAccessed(): void {
  const session = getSession();
  if (session) {
    session.lastAccessed = Date.now();
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Clear the current session
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Setup automatic session cleanup when user leaves or becomes inactive
 */
export function setupSessionCleanup(): (() => void) | void {
  // Clear session when tab is closed or user navigates away
  const handleBeforeUnload = () => {
    // Note: We don't clear session on beforeunload as it might be too aggressive
    // The session will naturally expire after 30 minutes anyway
  };

  // Clear session if user is inactive for too long
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // User switched tabs or minimized window
      // We'll let the natural timeout handle this
      return;
    }

    // User came back, check if session is still valid
    if (!isSessionValid()) {
      // Session expired while away, redirect to home
      window.location.href = "/";
    }
  };

  // Check for expired sessions periodically
  const checkExpiredSession = () => {
    if (getSession() && !isSessionValid()) {
      // Session expired, redirect to home
      window.location.href = "/";
    }
  };

  // Set up event listeners
  window.addEventListener("beforeunload", handleBeforeUnload);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Check every minute for expired sessions
  const intervalId = setInterval(checkExpiredSession, 60000);

  // Cleanup function
  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    clearInterval(intervalId);
  };
}

/**
 * Initialize session management - call this in your root layout or app
 */
export function initializeSessionManagement(): (() => void) | void {
  // Clean up any expired sessions on app start
  if (getSession() && !isSessionValid()) {
    clearSession();
  }

  return setupSessionCleanup();
}
