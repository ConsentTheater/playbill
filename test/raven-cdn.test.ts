import {describe, it, expect} from 'vitest';
import {loadPlaybill, matchDomain} from '../src/index.js';
import catalog from '../src/actors/analytics.json' with {type: 'json'};
const entries = {
  "cdn.ravenjs.com": {
    "company": "Sentry",
    "service": "Sentry Raven.js SDK CDN",
    "category": "analytics",
    "consent_burden": "required",
    "docs_url": "https://raven-js.readthedocs.io/en/stable/install.html",
    "note": "Legacy SDK distribution CDN. Loading the SDK does not establish that error events are transmitted."
  }
};
const excludedParents = ["ravenjs.com"];
describe("Add the documented legacy Raven.js CDN", () => {
  for (const [host, expected] of Object.entries(entries)) {
    it('identifies ' + host + ' in the merged full catalog', () => {
      const p = loadPlaybill('full');
      expect(matchDomain(p, host)).toMatchObject(expected);
      expect(matchDomain(p, host.toUpperCase())).toMatchObject(expected);
    });
    it('does not match a lookalike of ' + host, () => {
      expect(matchDomain(loadPlaybill('full'), host + '.attacker.example')).toBeNull();
    });
  }
  it('leaves unrelated parent domains unclassified', () => {
    const p = loadPlaybill('full');
    for (const parent of excludedParents) expect(matchDomain(p, parent)).toBeNull();
  });
  it('keeps catalog statistics and cookie keys consistent', () => {
    expect(catalog.stats.domains).toBe(Object.keys(catalog.domains).length);
    expect(catalog.stats.cookies).toBe(Object.keys(catalog.cookies).length);
  });
});
