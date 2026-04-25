/**
 * @consenttheater/playbill
 *
 * The world's largest open-source GDPR tracker knowledge base.
 * Every cookie, every domain, every actor on the web stage —
 * identified, categorised, and tagged with its consent burden.
 *
 * This library deliberately does **not** assign verdicts or scores. It
 * gives you the facts about each tracker; what (if anything) you do with
 * those facts is up to you. Consumers needing visualisation hierarchies
 * (red / amber / green, "high risk", etc.) compute them in their own UI
 * layer from the `consent_burden` and `category` fields.
 *
 * @example
 * ```ts
 * import { loadPlaybill, matchCookie } from '@consenttheater/playbill';
 *
 * const playbill = loadPlaybill('core');
 * const actor = matchCookie(playbill, '_ga');
 * // actor?.consent_burden === 'required'
 * ```
 */

export type {
  Playbill,
  CookieActor,
  DomainActor,
  CookieMatch,
  DomainMatch,
  Tier,
  ConsentBurden,
  Category
} from './types.js';
export {
  matchCookie,
  matchDomain,
  isSameOrSubdomain,
  listCompanies,
  listCategories
} from './matcher.js';

import type { Playbill, Tier, CookieActor, DomainActor, ConsentBurden } from './types.js';

// All actor category files
import advertising from './actors/advertising.json' with { type: 'json' };
import analytics from './actors/analytics.json' with { type: 'json' };
import consent from './actors/consent.json' with { type: 'json' };
import dataLeak from './actors/data_leak.json' with { type: 'json' };
import fingerprinting from './actors/fingerprinting.json' with { type: 'json' };
import functional from './actors/functional.json' with { type: 'json' };
import marketing from './actors/marketing.json' with { type: 'json' };
import security from './actors/security.json' with { type: 'json' };
import sessionRecording from './actors/session_recording.json' with { type: 'json' };
import social from './actors/social.json' with { type: 'json' };
import tagManager from './actors/tag_manager.json' with { type: 'json' };

interface ActorFile {
  category: string;
  cookies: Record<string, CookieActor>;
  domains: Record<string, DomainActor>;
}

const ALL_ACTORS: ActorFile[] = [
  advertising, analytics, consent, dataLeak, fingerprinting,
  functional, marketing, security, sessionRecording, social, tagManager
] as ActorFile[];

const TOP_N_COMPANIES = 50;

function mergeActors(actors: ActorFile[]): { cookies: Record<string, CookieActor>; domains: Record<string, DomainActor> } {
  const cookies: Record<string, CookieActor> = {};
  const domains: Record<string, DomainActor> = {};
  for (const actor of actors) {
    Object.assign(cookies, actor.cookies);
    Object.assign(domains, actor.domains);
  }
  return { cookies, domains };
}

function getTopCompanies(cookies: Record<string, CookieActor>, domains: Record<string, DomainActor>, n: number): Set<string> {
  const counts: Record<string, number> = {};
  for (const e of [...Object.values(cookies), ...Object.values(domains)]) {
    counts[e.company] = (counts[e.company] || 0) + 1;
  }
  return new Set(
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([company]) => company)
  );
}

function uniqueCompanyCount(cookies: Record<string, CookieActor>, domains: Record<string, DomainActor>): number {
  const set = new Set<string>();
  for (const e of [...Object.values(cookies), ...Object.values(domains)]) set.add(e.company);
  return set.size;
}

type EntryWithBurden = { consent_burden: ConsentBurden; company: string };

function filterEntries<T extends EntryWithBurden>(
  entries: Record<string, T>,
  filterFn: (entry: T, topCompanies: Set<string>) => boolean,
  topCompanies: Set<string>
): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [key, entry] of Object.entries(entries)) {
    if (filterFn(entry, topCompanies)) result[key] = entry;
  }
  return result;
}

const CONSENT_REQUIRED: readonly ConsentBurden[] = ['required_strict', 'required', 'contested'];

const TIER_FILTERS: Record<Tier, (entry: EntryWithBurden, topCompanies: Set<string>) => boolean> = {
  mini: (entry, topCompanies) =>
    (entry.consent_burden === 'required_strict' || entry.consent_burden === 'required') &&
    topCompanies.has(entry.company),
  core: (entry) => CONSENT_REQUIRED.includes(entry.consent_burden),
  full: () => true
};

/**
 * Load a playbill tier by merging actor category files and filtering by
 * consent burden.
 *
 * @param tier - 'mini' (~50 top companies, required_strict + required only),
 *               'core' (all entries that require or might require consent),
 *               'full' (everything, including minimal-burden entries)
 */
export function loadPlaybill(tier: Tier = 'full'): Playbill {
  const { cookies: allCookies, domains: allDomains } = mergeActors(ALL_ACTORS);
  const topCompanies = getTopCompanies(allCookies, allDomains, TOP_N_COMPANIES);
  const filter = TIER_FILTERS[tier];

  const cookies = filterEntries(allCookies, filter, topCompanies);
  const domains = filterEntries(allDomains, filter, topCompanies);

  return {
    version: 3,
    tier,
    generated: new Date().toISOString(),
    stats: {
      cookies: Object.keys(cookies).length,
      domains: Object.keys(domains).length,
      companies: uniqueCompanyCount(cookies, domains)
    },
    cookies,
    domains
  };
}

/**
 * Load only specific actor categories (e.g. just advertising + analytics).
 *
 * @example
 * ```ts
 * const db = loadActors(['advertising', 'analytics']);
 * ```
 */
export function loadActors(categories: string[]): Playbill {
  const selected = ALL_ACTORS.filter(a => categories.includes(a.category));
  const { cookies, domains } = mergeActors(selected);

  return {
    version: 3,
    tier: 'full',
    generated: new Date().toISOString(),
    stats: {
      cookies: Object.keys(cookies).length,
      domains: Object.keys(domains).length,
      companies: uniqueCompanyCount(cookies, domains)
    },
    cookies,
    domains
  };
}
