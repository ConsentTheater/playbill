import {describe, it, expect} from 'vitest';
import {loadPlaybill, matchDomain} from '../src/index.js';
import catalog from '../src/actors/analytics.json' with {type: 'json'};
const entries = {
  "lf-discover.com": {
    "company": "Dealfront",
    "service": "Leadfeeder Visitor Enrichment",
    "category": "analytics",
    "consent_burden": "required_strict",
    "docs_url": "https://help.leadfeeder.com/en/articles/13921693-how-to-use-ga4-to-enhance-google-analytics-reporting",
    "note": "Vendor instructs customers to allow this domain for visitor-company enrichment in Google Analytics. Classification follows existing cdn.leadfeeder.com; loading resources alone is not proof that enrichment succeeded."
  }
};
const excludedParents = [];
describe("Add the documented Leadfeeder enrichment domain", () => {
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
