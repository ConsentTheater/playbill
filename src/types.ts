/**
 * @consenttheater/playbill — Type definitions
 *
 * The Playbill is a theater program that lists every actor (tracker) and their role
 * (category/severity) on the web stage (website). These types define the shape of
 * that program.
 */

export type Severity = 'critical' | 'high' | 'medium' | 'low';

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
  severity: Severity;
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
  severity: Severity;
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

/** Risk band derived from the compliance score. */
export type BandKey = 'compliant' | 'at_risk' | 'non_compliant' | 'violating';

export interface Band {
  key: BandKey;
  label: string;
}

export interface Violation {
  type: string;
  severity: Severity;
  count: number;
  description: string;
  items?: Array<{ name?: string; hostname?: string; company?: string; note?: string }>;
}

export interface ScoreResult {
  score: number;
  band: Band;
  violations: Violation[];
}
