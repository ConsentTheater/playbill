import {describe, it, expect} from 'vitest';
import {loadPlaybill, matchDomain} from '../src/index.js';
import catalog from '../src/actors/functional.json' with {type: 'json'};
const entries = {
  "static.stefna.is": {
    "company": "Stefna",
    "service": "Stefna Moya Resource CDN",
    "category": "functional",
    "consent_burden": "minimal",
    "docs_url": "https://hjalp.stefna.is/en/knowledge/moya",
    "note": "Observed image resource host for Stefna Moya websites. The vendor help center documents Moya; this entry identifies resource delivery, not a guarantee about all vendor cookies or consent behavior."
  }
};
const excludedParents = ["stefna.is"];
describe("Identify the Stefna Moya image resource host", () => {
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
