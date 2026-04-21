/**
 * @consenttheater/playbill — Scorer
 *
 * Risk scoring — pure functions. Given observations (cookies, requests, banner),
 * produce a compliance score with risk band and violation list.
 *
 * Bands: >= 90 Compliant, 70-89 At Risk, 40-69 Non-Compliant, < 40 Violating
 * Weights: critical -25, high -15, medium -10, low -5
 */
import type { Severity, Band, BandKey, ScoreResult, Violation } from './types.js';

export const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 25,
  high: 15,
  medium: 10,
  low: 5
};

export const BANDS: readonly { min: number; key: BandKey; label: string }[] = [
  { min: 90, key: 'compliant', label: 'Compliant' },
  { min: 70, key: 'at_risk', label: 'At Risk' },
  { min: 40, key: 'non_compliant', label: 'Non-Compliant' },
  { min: 0, key: 'violating', label: 'Violating' }
];

export function bandForScore(score: number): Band {
  for (const b of BANDS) {
    if (score >= b.min) return { key: b.key, label: b.label };
  }
  return { key: 'violating', label: 'Violating' };
}

export interface ObservedItem {
  name?: string;
  hostname?: string;
  company?: string;
  service?: string;
  severity: Severity;
  category?: string;
  note?: string;
}

export interface ObservedBanner {
  detected: boolean;
  hasAcceptButton?: boolean;
  hasRejectButton?: boolean;
  hasManageButton?: boolean;
  buttonCount?: number;
  textPreview?: string;
}

export interface ScoreInput {
  preConsentCookies?: ObservedItem[];
  preConsentRequests?: ObservedItem[];
  dataLeakRequests?: ObservedItem[];
  banner?: ObservedBanner | null;
}

function bucketBySeverity<T extends { severity: Severity }>(items: T[] | undefined) {
  const out: Record<Severity, T[]> = { critical: [], high: [], medium: [], low: [] };
  for (const it of items || []) {
    if (out[it.severity]) out[it.severity].push(it);
  }
  return out;
}

export function computeScore(input: ScoreInput): ScoreResult {
  const violations: Violation[] = [];
  const cookies = bucketBySeverity(input.preConsentCookies);
  const reqs = bucketBySeverity(input.preConsentRequests);

  if (cookies.critical.length) {
    violations.push({
      type: 'critical_cookies_before_consent', severity: 'critical', count: cookies.critical.length,
      description: `${cookies.critical.length} advertising/tracking cookie(s) set before consent`,
      items: cookies.critical.map(c => ({ name: c.name, company: c.company }))
    });
  }
  if (cookies.high.length) {
    violations.push({
      type: 'high_cookies_before_consent', severity: 'high', count: cookies.high.length,
      description: `${cookies.high.length} analytics cookie(s) set before consent`,
      items: cookies.high.map(c => ({ name: c.name, company: c.company }))
    });
  }
  if (cookies.medium.length) {
    violations.push({
      type: 'medium_cookies_before_consent', severity: 'medium', count: cookies.medium.length,
      description: `${cookies.medium.length} tracking cookie(s) set before consent`,
      items: cookies.medium.map(c => ({ name: c.name, company: c.company }))
    });
  }
  if (reqs.critical.length) {
    violations.push({
      type: 'critical_requests_before_consent', severity: 'critical', count: reqs.critical.length,
      description: `${reqs.critical.length} advertising request(s) fired before consent`,
      items: reqs.critical.map(r => ({ hostname: r.hostname, company: r.company }))
    });
  }
  if (reqs.high.length) {
    violations.push({
      type: 'high_requests_before_consent', severity: 'high', count: reqs.high.length,
      description: `${reqs.high.length} analytics request(s) fired before consent`,
      items: reqs.high.map(r => ({ hostname: r.hostname, company: r.company }))
    });
  }

  const leaks = (input.dataLeakRequests || []).filter(r => r.category === 'data_leak');
  if (leaks.length) {
    violations.push({
      type: 'data_leaks', severity: 'medium', count: leaks.length,
      description: `${leaks.length} data-leak request(s) (IP exposure to third parties)`,
      items: leaks.map(r => ({ hostname: r.hostname, company: r.company, note: r.note }))
    });
  }

  const banner = input.banner;
  if (banner?.detected) {
    if (banner.hasAcceptButton && !banner.hasRejectButton) {
      violations.push({
        type: 'banner_missing_reject', severity: 'high', count: 1,
        description: 'Consent banner has Accept but no Reject/Decline option'
      });
    }
  } else if (banner === null || (banner && !banner.detected)) {
    if ((input.preConsentCookies || []).length || (input.preConsentRequests || []).length) {
      violations.push({
        type: 'no_banner_with_trackers', severity: 'high', count: 1,
        description: 'No consent banner detected but trackers are present'
      });
    }
  }

  let score = 100;
  for (const v of violations) score -= (SEVERITY_WEIGHTS[v.severity] || 0);
  score = Math.max(0, Math.min(100, score));

  return { score, band: bandForScore(score), violations };
}
