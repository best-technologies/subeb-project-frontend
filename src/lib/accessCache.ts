/**
 * Client-side Access Verification Cache
 * Caches verified access status for 15 minutes to avoid redundant verification overlays on page refreshes.
 * Also detects hard refresh keystrokes (Ctrl+F5, Ctrl+Shift+R, Cmd+Shift+R) to immediately invalidate the cache.
 */

const ACCESS_CACHE_KEY = "asubeb_access_verification_cache";
// 15 minutes TTL (safe window without posing security risks)
const CACHE_TTL_MS = 15 * 60 * 1000;

interface AccessCacheEntry {
  verifiedAt: number;
  role: string;
}

export function isAccessCacheValid(allowedRoles: string[]): boolean {
  if (typeof window === "undefined") return false;

  try {
    const raw = sessionStorage.getItem(ACCESS_CACHE_KEY);
    if (raw) {
      const entry: AccessCacheEntry = JSON.parse(raw);
      if (entry.verifiedAt && entry.role) {
        const age = Date.now() - entry.verifiedAt;
        if (age <= CACHE_TTL_MS && age >= 0) {
          const normalizedRole = entry.role.toLowerCase();
          const hasRole = allowedRoles.some((r) => r.toLowerCase() === normalizedRole);
          if (hasRole) {
            return true;
          }
        } else {
          sessionStorage.removeItem(ACCESS_CACHE_KEY);
          document.cookie = "asubeb_access_verified=; path=/; max-age=0; SameSite=Lax";
        }
      }
    }

    // Cookie fallback check
    const verifiedMatch = document.cookie.match(/(?:^|;\s*)asubeb_access_verified=1/);
    const roleMatch = document.cookie.match(/(?:^|;\s*)asubeb_user_role=([^;]+)/);
    if (verifiedMatch && roleMatch) {
      const cookieRole = decodeURIComponent(roleMatch[1]).toLowerCase();
      if (allowedRoles.some((r) => r.toLowerCase() === cookieRole)) {
        saveAccessCache(cookieRole);
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

export function saveAccessCache(role: string): void {
  if (typeof window === "undefined") return;

  try {
    const entry: AccessCacheEntry = {
      verifiedAt: Date.now(),
      role: role.toLowerCase(),
    };
    sessionStorage.setItem(ACCESS_CACHE_KEY, JSON.stringify(entry));
    // Also set 15-minute cookie
    document.cookie = `asubeb_access_verified=1; path=/; max-age=${Math.floor(CACHE_TTL_MS / 1000)}; SameSite=Lax`;
  } catch (err) {
    console.error("Failed to save access verification cache:", err);
  }
}

export function clearAccessCache(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(ACCESS_CACHE_KEY);
    document.cookie = "asubeb_access_verified=; path=/; max-age=0; SameSite=Lax";
  } catch (err) {
    console.error("Failed to clear access cache:", err);
  }
}

/**
 * Attaches a listener for hard refresh shortcuts (Ctrl+F5, Ctrl+Shift+R, Cmd+Shift+R)
 * When triggered, clears access cache so fresh data and verification are forced.
 */
export function setupHardRefreshDetector(onHardRefresh?: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleKeyDown = (e: KeyboardEvent) => {
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const key = e.key.toLowerCase();

    // Check for Ctrl+F5, Ctrl+Shift+R, Cmd+Shift+R, or Shift+F5
    if ((isCtrlOrMeta && key === "f5") || (isCtrlOrMeta && isShift && key === "r") || (isShift && key === "f5")) {
      clearAccessCache();
      if (onHardRefresh) {
        onHardRefresh();
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}
