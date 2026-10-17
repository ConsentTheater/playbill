import { describe, expect, it } from 'vitest';
import { loadPlaybill, matchCookie } from '../src/index.js';
import analytics from '../src/actors/analytics.json' with { type: 'json' };

const db = loadPlaybill('full');

describe('Marfeel cookie attribution', () => {
  it.each([
    '_shopify_analytics',
    '_shopify_marketing',
    '_shop_app_essential',
    '_shopify_s',
    '_some_unrelated_cookie',
    '_lv_unrelated_cookie',
    '_ut_unrelated_cookie'
  ])('does not attribute unrelated cookie %s to Marfeel', name => {
    expect(matchCookie(db, name)?.company).not.toBe('Marfeel');
  });

  it.each(['___m_rec', '_nrbi', '_nrbic', 'compass_sid', 'compass_uid', 'compass_rfv_123'])
    ('retains documented Marfeel cookie %s', name => {
      expect(matchCookie(db, name)?.company).toBe('Marfeel');
      expect(matchCookie(db, name)?.category).toBe('analytics');
    });

  it('limits the RFV prefix to its documented spelling', () => {
    expect(matchCookie(db, 'compass_rfv_123')?.matchedPattern).toBe('compass_rfv_*');
    expect(matchCookie(db, 'Compass_rfv_123')).toBeNull();
    expect(matchCookie(db, 'compass_rfv')).toBeNull();
  });

  it.each(['123_s', '123_lv', '123_ut', '123_u'])
    ('does not infer a vendor from generic site-id suffix %s', name => {
      expect(matchCookie(db, name)?.company).not.toBe('Marfeel');
    });

  it('keeps analytics catalogue statistics consistent with its entries', () => {
    expect(analytics.stats.cookies).toBe(Object.keys(analytics.cookies).length);
    expect(analytics.stats.domains).toBe(Object.keys(analytics.domains).length);
    const companies = new Set([
      ...Object.values(analytics.cookies),
      ...Object.values(analytics.domains)
    ].map(entry => entry.company));
    expect(analytics.stats.companies).toBe(companies.size);
  });
});
