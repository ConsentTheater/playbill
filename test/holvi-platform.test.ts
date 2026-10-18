import {describe, it, expect} from 'vitest';
import {loadPlaybill, matchDomain} from '../src/index.js';
import catalog from '../src/actors/functional.json' with {type: 'json'};
const entries = {
  "holvi.com": {
    "company": "Holvi",
    "service": "Holvi Platform and Online Store",
    "category": "functional",
    "consent_burden": "contested",
    "docs_url": "https://www.holvi.com/cookie-policy/",
    "note": "Includes hosted online stores at holvi.com/shop/. Vendor policy distinguishes necessary cookies from consent-based cookies; this domain-wide entry is not a verdict on every cookie or a claim that every Holvi request is necessary."
  }
};
const excludedParents = [];
describe("Add Holvi platform and online-store identification", () => {
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
