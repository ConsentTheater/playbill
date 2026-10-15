import {describe, it, expect} from 'vitest';
import {loadPlaybill, matchDomain} from '../src/index.js';
import catalog from '../src/actors/functional.json' with {type: 'json'};
const entries = {
  "assets.sitescdn.net": {
    "company": "Yext",
    "service": "Yext Answers Search SDK CDN",
    "category": "functional",
    "consent_burden": "contested",
    "docs_url": "https://assets.sitescdn.net/answers-search-bar/v1.0/answers.min.js",
    "note": "Delivered search SDK defines Yext Answers API endpoints. Loading the SDK does not establish that search or analytics events are sent; does not attribute every sitescdn.net subdomain to this role."
  }
};
const excludedParents = ["sitescdn.net"];
describe("Identify the Yext Answers search SDK resource host", () => {
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
