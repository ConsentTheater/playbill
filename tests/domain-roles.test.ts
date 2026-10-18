import { describe, expect, it } from 'vitest';
import { loadActors, loadPlaybill, matchDomain } from '../src/index.js';
import { mergeDomainRoles } from '../src/domain-roles.js';
import type { DomainActor } from '../src/types.js';
import advertising from '../src/actors/advertising.json';
import analytics from '../src/actors/analytics.json';
import consent from '../src/actors/consent.json';
import dataLeak from '../src/actors/data_leak.json';
import fingerprinting from '../src/actors/fingerprinting.json';
import functional from '../src/actors/functional.json';
import marketing from '../src/actors/marketing.json';
import security from '../src/actors/security.json';
import recording from '../src/actors/session_recording.json';
import social from '../src/actors/social.json';
import tags from '../src/actors/tag_manager.json';

const actors = [advertising, analytics, consent, dataLeak, fingerprinting, functional,
  marketing, security, recording, social, tags] as unknown as {
    category: string; cookies: Record<string, unknown>; domains: Record<string, DomainActor>;
  }[];
const full = loadPlaybill();

it('preserves every legacy exact full-tier domain result and all cookies', () => {
  const domains = Object.assign({}, ...actors.map(a => a.domains));
  expect(full.domains).toEqual(domains);
  expect(full.cookies).toEqual(Object.assign({}, ...actors.map(a => a.cookies)));
  for (const [host, entry] of Object.entries(domains)) {
    // Existing mixed-case/path keys are not exact hostname signatures.
    if (host === host.toLowerCase()) {
      expect(matchDomain(full, host)).toEqual({ ...entry, hostname: host });
    }
  }
});

const groups = new Map<string, { source: string; entry: DomainActor }[]>();
for (const actor of actors) {
  for (const [host, entry] of Object.entries(actor.domains)) {
    const roles = groups.get(host) ?? [];
    roles.push({ source: actor.category, entry });
    groups.set(host, roles);
  }
}

it('retains complete provenance only for multi-role hosts', () => {
  const expected = Object.fromEntries([...groups].filter(([, roles]) => roles.length > 1));
  expect(full.domainRoles).toEqual(expected);
  expect(Object.keys(full.domainRoles ?? {})).toHaveLength(Object.keys(expected).length);
  expect(Object.keys(full.domains)).toHaveLength(groups.size);
});

it.each([actors, [...actors].reverse(), [...actors.slice(4), ...actors.slice(0, 4)]])
  ('selects the same primary and roles regardless of input file order', (...inputs) => {
    expect(mergeDomainRoles(inputs)).toEqual(mergeDomainRoles(actors));
  });

it('keeps the Sentry default while restoring its eligible core roles', () => {
  expect(matchDomain(full, 'browser.sentry-cdn.com')?.category).toBe('functional');
  expect(full.domainRoles?.['browser.sentry-cdn.com'].map(r => r.source))
    .toEqual(['analytics', 'data_leak', 'functional']);
  const core = loadPlaybill('core');
  expect(matchDomain(core, 'browser.sentry-cdn.com')?.company).toBe('Sentry');
  expect(core.domainRoles?.['browser.sentry-cdn.com'].map(r => r.entry.consent_burden))
    .toEqual(['required', 'contested']);
});

it.each(['mini', 'core', 'full'] as const)('filters %s role metadata and keeps counts consistent', tier => {
  const db = loadPlaybill(tier);
  expect(db.stats.domains).toBe(Object.keys(db.domains).length);
  expect(db.stats.cookies).toBe(Object.keys(db.cookies).length);
  expect(db.stats.companies).toBe(new Set([...Object.values(db.cookies), ...Object.values(db.domains)].map(e => e.company)).size);
  const allowed = tier === 'mini' ? ['required_strict', 'required'] : tier === 'core'
    ? ['required_strict', 'required', 'contested'] : ['required_strict', 'required', 'contested', 'minimal'];
  for (const [host, roles] of Object.entries(db.domainRoles ?? {})) {
    expect(roles.length).toBeGreaterThan(1);
    for (const role of roles) expect(allowed).toContain(role.entry.consent_burden);
    expect(db.domains[host]).toEqual(roles[roles.length - 1].entry);
  }
});

it('retains only selected categories and omits metadata for single roles', () => {
  const db = loadActors(['functional', 'analytics']);
  expect(db.domainRoles?.['browser.sentry-cdn.com'].map(r => r.source)).toEqual(['analytics', 'functional']);
  expect(loadActors(['analytics', 'functional']).domainRoles).toEqual(db.domainRoles);
  const single = loadActors(['analytics']);
  expect(single.domainRoles).toEqual({});
  expect(matchDomain(single, 'browser.sentry-cdn.com')?.category).toBe('analytics');
  expect(loadActors([]).domains).toEqual({});
});

it('does not let role metadata edits mutate the source catalogue', () => {
  const db = loadPlaybill();
  db.domainRoles!['browser.sentry-cdn.com'][0].entry.company = 'Changed';
  expect(loadPlaybill().domainRoles!['browser.sentry-cdn.com'][0].entry.company).toBe('Sentry');
});

// Independent tier oracle: retain every role allowed by the documented tier.
it.each(['core', 'mini'] as const)('preserves old %s entries and adds exactly the eligible hidden hosts', tier => {
  const cookies = Object.assign({}, ...actors.map(a => a.cookies)) as Record<string, DomainActor>;
  const legacy = Object.assign({}, ...actors.map(a => a.domains)) as Record<string, DomainActor>;
  const counts = new Map<string, number>();
  for (const entry of [...Object.values(cookies), ...Object.values(legacy)]) {
    counts.set(entry.company, (counts.get(entry.company) ?? 0) + 1);
  }
  const top = new Set([...counts].sort((a, b) => b[1] - a[1]).slice(0, 50).map(([name]) => name));
  const eligible = (e: DomainActor) => tier === 'core' ? e.consent_burden !== 'minimal'
    : ['required', 'required_strict'].includes(e.consent_burden) && top.has(e.company);
  const db = loadPlaybill(tier);
  for (const [host, entry] of Object.entries(legacy)) {
    if (eligible(entry)) expect(db.domains[host]).toEqual(entry);
  }
  const expectedHosts = new Set(actors.flatMap(actor => Object.entries(actor.domains)
    .filter(([, entry]) => eligible(entry)).map(([host]) => host)));
  expect(new Set(Object.keys(db.domains))).toEqual(expectedHosts);
});
