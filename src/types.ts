/**
 * @consenttheater/playbill — Type definitions
 *
 * The Playbill is a theater program that lists every actor (tracker) and
 * its role on the web stage. These types define the shape of that program.
 *
 * The library deliberately does **not** assign verdicts to whole websites
 * or carry school-grade severity labels. It classifies trackers by the
 * consent burden each one creates under EU/GDPR rules, leaves judgement
 * to supervisory authorities and courts, and lets downstream consumers
 * present the data however they like.
 */

/**
 * How much explicit consent the tracker requires under GDPR / ePrivacy.
 *
 * - `required_strict` — Cross-site profiling, ad-tech retargeting,
 *   fingerprinting, session recording. Always needs prior, informed,
 *   freely-given consent.
 * - `required`        — Standard analytics and marketing tracking.
 *   Consent required in nearly all interpretations.
 * - `contested`       — Tracking-adjacent or jurisdiction-dependent.
 *   Some authorities allow under legitimate interest, others require
 *   consent. Treat as consent-required by default.
 * - `minimal`         — Functional, security, or strictly-necessary in
 *   most interpretations. Often exempt from consent requirements.
 */
export type ConsentBurden =
  | 'required_strict'
  | 'required'
  | 'contested'
  | 'minimal';

export type Category =
  | 'advertising' | 'analytics' | 'marketing' | 'functional'
  | 'tag_manager' | 'data_leak' | 'social' | 'session_recording'
  | 'security' | 'consent' | 'fingerprinting';

export type Tier = 'mini' | 'core' | 'full';

/** A cookie actor in the playbill — a known tracking cookie signature. */
export interface CookieActor {
  company: string;
  service: string;
  category: Category;
  description?: string;
  consent_burden: ConsentBurden;
  pattern?: boolean;
  note?: string;
  lifetime?: string;
  docs_url?: string;
}

/** A domain actor in the playbill — a known tracking domain. */
export interface DomainActor {
  company: string;
  service: string;
  category: Category;
  consent_burden: ConsentBurden;
  note?: string;
  docs_url?: string;
}

/** The Playbill — the complete cast of known trackers. */
export interface Playbill {
  version: number;
  tier: Tier;
  generated: string;
  stats: {
    cookies: number;
    domains: number;
    companies: number;
  };
  cookies: Record<string, CookieActor>;
  domains: Record<string, DomainActor>;
}

/** Result of matching a cookie name against the playbill. */
export interface CookieMatch extends CookieActor {
  name: string;
  matchedPattern?: string;
}

/** Result of matching a domain against the playbill. */
export interface DomainMatch extends DomainActor {
  hostname: string;
  matchedDomain?: string;
}
