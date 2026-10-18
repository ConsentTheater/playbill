import {describe, it, expect} from 'vitest';
import {loadPlaybill, matchDomain} from '../src/index.js';
import catalog from '../src/actors/functional.json' with {type: 'json'};
const entries = {
  "static.cdn-website.com": {
    "company": "Duda",
    "service": "Duda Asset CDN",
    "category": "functional",
    "consent_burden": "minimal",
    "docs_url": "https://www.duda.co/",
    "note": "Specific Duda resource host evidenced in vendor HTML or widget documentation. This is not a claim that all Duda services are exempt from consent."
  },
  "du-cdn.cdn-website.com": {
    "company": "Duda",
    "service": "Duda Asset CDN",
    "category": "functional",
    "consent_burden": "minimal",
    "docs_url": "https://www.duda.co/",
    "note": "Specific Duda resource host evidenced in vendor HTML or widget documentation. This is not a claim that all Duda services are exempt from consent."
  },
  "irp.cdn-website.com": {
    "company": "Duda",
    "service": "Duda Asset CDN",
    "category": "functional",
    "consent_burden": "minimal",
    "docs_url": "https://developer.duda.co/docs/javascript",
    "note": "Specific Duda resource host evidenced in vendor HTML or widget documentation. This is not a claim that all Duda services are exempt from consent."
  },
  "vid.cdn-website.com": {
    "company": "Duda",
    "service": "Duda Asset CDN",
    "category": "functional",
    "consent_burden": "minimal",
    "docs_url": "https://developer.duda.co/docs/javascript",
    "note": "Specific Duda resource host evidenced in vendor HTML or widget documentation. This is not a claim that all Duda services are exempt from consent."
  },
  "ms-cdn.multiscreensite.com": {
    "company": "Duda",
    "service": "Duda Asset CDN",
    "category": "functional",
    "consent_burden": "minimal",
    "docs_url": "https://www.duda.co/",
    "note": "Specific Duda resource host evidenced in vendor HTML or widget documentation. This is not a claim that all Duda services are exempt from consent."
  }
};
const excludedParents = ["cdn-website.com","multiscreensite.com"];
describe("Add specific documented Duda resource hosts", () => {
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
