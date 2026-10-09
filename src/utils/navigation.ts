/**
 * Navigation and active route matching utilities.
 */

export interface IsRouteActiveOptions {
  /**
   * If true, requires exact match between pathname and href.
   * Root path ('/') defaults to exact match automatically.
   */
  exact?: boolean;
  /**
   * List of additional path aliases that should activate this route.
   */
  aliases?: string[];
}

/**
 * Normalizes a URL path by removing query parameters, hash fragments,
 * and trailing slashes (while preserving the single root slash).
 */
export function normalizePath(path: string | null | undefined): string {
  if (!path) return "/";
  const withoutQuery = path.split("?")[0].split("#")[0].trim();
  const withoutTrailing = withoutQuery.replace(/\/+$/, "");
  return withoutTrailing === "" ? "/" : withoutTrailing;
}

/**
 * Known route patterns that map non-standard child paths to their parent navigation link.
 * E.g., /officer/[id]/profile -> /officer/profile
 */
const PATTERN_PARENT_MAPPINGS: Array<{ pattern: RegExp; parentHref: string }> = [
  { pattern: /^\/officer\/[^/]+\/profile$/, parentHref: "/officer/profile" },
  { pattern: /^\/officer\/[^/]+\/grade-record$/, parentHref: "/officer/results" },
  { pattern: /^\/officer\/[^/]+\/add-student$/, parentHref: "/officer/results" },
];

/**
 * Determines whether a given navigation item `href` should be highlighted
 * given the current `pathname`.
 *
 * It returns true if:
 * 1. `pathname` exactly matches `href` (e.g. `/officer/results` === `/officer/results`).
 * 2. `pathname` is a child or detail page of `href` (e.g. `/officer/results/sch_123` -> `/officer/results`).
 * 3. `pathname` matches any provided `aliases`.
 * 4. `pathname` matches known legacy/dynamic route pattern mappings.
 *
 * Prevents false positives:
 * - Root path ('/') only matches exactly.
 * - Sibling paths with common prefixes do not match (e.g. `/enrol-student` does not activate `/students`).
 */
export function isRouteActive(
  pathname: string | null | undefined,
  href: string,
  options?: IsRouteActiveOptions
): boolean {
  if (!pathname || !href) return false;

  const cleanPath = normalizePath(pathname);
  const cleanHref = normalizePath(href);

  // 1. Exact match
  if (cleanPath === cleanHref) {
    return true;
  }

  // 2. Exact mode or Root route '/' must match exactly
  if (options?.exact || cleanHref === "/") {
    return false;
  }

  // 3. Explicit aliases match
  if (options?.aliases && options.aliases.length > 0) {
    for (const alias of options.aliases) {
      const cleanAlias = normalizePath(alias);
      if (
        cleanPath === cleanAlias ||
        cleanPath.startsWith(`${cleanAlias}/`)
      ) {
        return true;
      }
    }
  }

  // 4. Pattern mappings for non-standard routes
  for (const mapping of PATTERN_PARENT_MAPPINGS) {
    if (mapping.parentHref === cleanHref && mapping.pattern.test(cleanPath)) {
      return true;
    }
  }

  // 5. Standard hierarchical child / detail page matching
  // Must be followed by '/' so that /students/123 matches /students,
  // but /enrol-student does NOT match /students.
  return cleanPath.startsWith(`${cleanHref}/`);
}

/**
 * Given a list of candidate navigation hrefs and the current pathname,
 * returns the best (most specific) matching href, or null if none match.
 */
export function getActiveNavigationHref(
  pathname: string | null | undefined,
  candidateHrefs: string[]
): string | null {
  if (!pathname || !candidateHrefs.length) return null;

  const matches = candidateHrefs.filter((href) =>
    isRouteActive(pathname, href)
  );

  if (matches.length === 0) return null;

  // The match with the longest normalized href is the most specific
  return matches.sort((a, b) => normalizePath(b).length - normalizePath(a).length)[0];
}
