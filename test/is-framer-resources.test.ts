import {describe, it, expect} from 'vitest';
import {loadPlaybill, matchDomain} from '../src/index.js';
import catalog from '../src/actors/functional.json' with {type: 'json'};
const entries = {
  "framerusercontent.com": {
    "company": "Framer",
    "service": "Framer User Content CDN",
    "category": "functional",
    "consent_burden": "minimal",
    "docs_url": "https://www.framer.com/help/articles/how-to-whitelist-framer-domains/",
    "note": "Vendor documents this domain for product functionality and hosted resources; vendor SEO examples use its image URLs. This does not identify Framer Analytics."
  },
  "app.framerstatic.com": {
    "company": "Framer",
    "service": "Framer Application Resources",
    "category": "functional",
    "consent_burden": "minimal",
    "docs_url": "https://www.framer.com/help/articles/how-to-whitelist-framer-domains/",
    "note": "Observed application-resource subdomain in the vendor-documented framerstatic.com family. Other Framer services and analytics remain separate."
  }
};
const excludedParents = ["framerstatic.com"];
describe("Identify documented Framer content and application resource hosts", () => {
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
