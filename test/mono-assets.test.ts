import {describe, it, expect} from 'vitest';
import {loadPlaybill, matchDomain} from '../src/index.js';
import catalog from '../src/actors/functional.json' with {type: 'json'};
const entries = {
  "site-assets.cdnmns.com": {
    "company": "Mono Solutions",
    "service": "Mono Website Asset CDN",
    "category": "functional",
    "consent_burden": "minimal",
    "docs_url": "https://www.monosolutions.com/",
    "note": "Mono vendor HTML uses this specific host for CSS and JavaScript resources. Does not attribute all cdnmns.com subdomains and does not attribute the host to Duda."
  }
};
const excludedParents = ["cdnmns.com"];
describe("Identify the specific Mono website resource CDN", () => {
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
