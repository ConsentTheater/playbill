import {describe, it, expect} from 'vitest';
import {loadPlaybill, matchDomain} from '../src/index.js';
import catalog from '../src/actors/functional.json' with {type: 'json'};
const entries = {
  "cdn.kotisivukone.fi": {
    "company": "Kotisivukone",
    "service": "Kotisivukone Website Resource CDN",
    "category": "functional",
    "consent_burden": "minimal",
    "docs_url": "https://cdn.kotisivukone.fi/r201/b3651/clients/js/kotisivukone_responsive.js",
    "note": "Delivered vendor code implements responsive layout, menus and preview-state cookies. This identifies the website resource CDN, not every Kotisivukone cookie or a guarantee that all delivered scripts lack analytics."
  }
};
const excludedParents = ["kotisivukone.fi"];
describe("Identify the Kotisivukone website resource CDN", () => {
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
