import { describe, expect, it } from 'vitest';
import { matchCookie } from '../src/matcher.js';
import type { CookieActor, Playbill } from '../src/types.js';

function playbill(cookies: Record<string, CookieActor>): Playbill {
  return {
    version: 3,
    tier: 'full',
    generated: '2026-10-17T00:00:00Z',
    stats: { cookies: Object.keys(cookies).length, domains: 0, companies: 1 },
    cookies,
    domains: {}
  };
}

const actor: CookieActor = {
  company: 'Example',
  service: 'Example service',
  category: 'analytics',
  consent_burden: 'required',
  pattern: true
};

describe('matchCookie pattern syntax', () => {
  it.each([
    ['ss_*_analytics', 'ss_cvt'],
    ['ss_*_analytics', 'ss_123_analytics'],
    ['mp_*_mixpanel', 'mp_unrelated'],
    ['mp_*_api_host_override', 'mp_unrelated'],
    ['jwplayer.*.v', 'jwplayer.unrelated'],
    ['sb-*-auth-token', 'sb-unrelated'],
    ['sb-*-auth-token-code-verifier', 'sb-unrelated'],
    ['prefix**', 'prefix123'],
    ['prefix*middle*', 'prefix123'],
    ['*', 'anything']
  ])('does not widen unsupported pattern %s into a prefix', (pattern, name) => {
    expect(matchCookie(playbill({ [pattern]: actor }), name)).toBeNull();
  });

  it('skips an unsupported entry before a supported trailing wildcard', () => {
    const result = matchCookie(playbill({ 'ss_*_analytics': actor, 'ss_*': actor }), 'ss_cvt');
    expect(result?.matchedPattern).toBe('ss_*');
  });

  it.each(['_ga_', '_ga_ABC123'])('retains trailing wildcard matching for %s', name => {
    expect(matchCookie(playbill({ '_ga_*': actor }), name)?.matchedPattern).toBe('_ga_*');
  });

  it('keeps exact identities ahead of broader prefixes', () => {
    const exact = { ...actor, company: 'Exact vendor', pattern: false };
    const result = matchCookie(playbill({ '_s*': actor, '_shopify_analytics': exact }), '_shopify_analytics');
    expect(result?.company).toBe('Exact vendor');
    expect(result?.matchedPattern).toBeUndefined();
  });

  it('keeps cookie names case-sensitive', () => {
    const db = playbill({ '_ga_*': actor, exact: { ...actor, pattern: false } });
    expect(matchCookie(db, '_GA_123')).toBeNull();
    expect(matchCookie(db, 'Exact')).toBeNull();
  });

  it('does not apply wildcards to entries without the pattern flag', () => {
    expect(matchCookie(playbill({ '_ga_*': { ...actor, pattern: false } }), '_ga_123')).toBeNull();
  });

  it('retains null results for missing input', () => {
    expect(matchCookie(null, '_ga_123')).toBeNull();
    expect(matchCookie(undefined, '_ga_123')).toBeNull();
    expect(matchCookie(playbill({ '_ga_*': actor }), '')).toBeNull();
  });
});
