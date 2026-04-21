/**
 * @consenttheater/playbill — Matcher
 *
 * Pure functions to identify actors (trackers) from the playbill by cookie name
 * or domain hostname. No side effects, no browser API access.
 */
import type { Playbill, CookieMatch, DomainMatch } from './types.js';

/**
 * Match a cookie name against the playbill. Checks exact names first,
 * then pattern entries (e.g. `_ga_*` matches `_ga_ABC123`).
 */
export function matchCookie(playbill: Playbill | null | undefined, cookieName: string): CookieMatch | null {
  if (!playbill?.cookies || !cookieName) return null;

  const exact = playbill.cookies[cookieName];
  if (exact) return { ...exact, name: cookieName };

  for (const key of Object.keys(playbill.cookies)) {
    const entry = playbill.cookies[key];
    if (!entry.pattern || !key.includes('*')) continue;
    const prefix = key.replace(/\*.*$/, '');
    if (prefix && cookieName.startsWith(prefix)) {
      return { ...entry, name: cookieName, matchedPattern: key };
    }
  }
  return null;
}

/**
 * Match a hostname against the playbill. Checks exact domain first,
 * then subdomain matches (e.g. `www.google-analytics.com` matches `google-analytics.com`).
 */
export function matchDomain(playbill: Playbill | null | undefined, hostname: string): DomainMatch | null {
  if (!playbill?.domains || !hostname) return null;
  const host = hostname.toLowerCase();

  const exact = playbill.domains[host];
  if (exact) return { ...exact, hostname: host };

  for (const key of Object.keys(playbill.domains)) {
    if (host === key || host.endsWith('.' + key)) {
      return { ...playbill.domains[key], hostname: host, matchedDomain: key };
    }
  }
  return null;
}

/**
 * Check if two hostnames are the same domain or subdomains of each other.
 */
export function isSameOrSubdomain(hostname: string, baseHost: string): boolean {
  if (!hostname || !baseHost) return false;
  const h = hostname.toLowerCase();
  const b = baseHost.toLowerCase();
  return h === b || h.endsWith('.' + b) || b.endsWith('.' + h);
}

/**
 * List all unique companies in the playbill.
 */
export function listCompanies(playbill: Playbill): string[] {
  const set = new Set<string>();
  for (const entry of Object.values(playbill.cookies)) set.add(entry.company);
  for (const entry of Object.values(playbill.domains)) set.add(entry.company);
  return [...set].sort();
}

/**
 * List all unique categories in the playbill.
 */
export function listCategories(playbill: Playbill): string[] {
  const set = new Set<string>();
  for (const entry of Object.values(playbill.cookies)) set.add(entry.category);
  for (const entry of Object.values(playbill.domains)) set.add(entry.category);
  return [...set].sort();
}
