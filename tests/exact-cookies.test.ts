import { expect, it } from 'vitest';
import { loadPlaybill, matchCookie } from '../src/index.js';

const db = loadPlaybill('full');
it.each([
  ['_shopify_analytics', 'Shopify', 'analytics', 'required', '1 year'],
  ['_shopify_marketing', 'Shopify', 'marketing', 'required', '1 year'],
  ['_shop_app_essential', 'Shopify', 'functional', 'minimal', '1 year'],
  ['ss_cvt', 'Squarespace', 'analytics', 'contested', '30 minutes'],
  ['ss_cvr', 'Squarespace', 'analytics', 'contested', '2 years'],
  ['moyaCookieConsent', 'Stefna', 'consent', 'minimal', '1 year']
])('identifies documented exact cookie %s before any pattern', (name, company, category, burden, lifetime) => {
  const result = matchCookie(db, name);
  expect(result).toMatchObject({ company, category, consent_burden: burden, lifetime });
  expect(result?.matchedPattern).toBeUndefined();
});
