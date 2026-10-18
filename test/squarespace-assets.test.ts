import {describe, it, expect} from 'vitest';
import {loadPlaybill, matchDomain} from '../src/index.js';
import catalog from '../src/actors/data_leak.json' with {type: 'json'};
const entries = {
  "media-www.sqspcdn.com": {
    "company": "Squarespace",
    "service": "Squarespace Media CDN",
    "category": "data_leak",
    "consent_burden": "minimal",
    "docs_url": "https://www.squarespace.com/",
    "note": "Specific media resource host used by the vendor website; does not attribute every sqspcdn.com subdomain."
  },
  "images.squarespace-cdn.com": {
    "company": "Squarespace",
    "service": "Squarespace Image CDN",
    "category": "data_leak",
    "consent_burden": "minimal",
    "docs_url": "https://support.squarespace.com/hc/en-us/articles/205812748-Image-and-file-URLs-in-Squarespace",
    "note": "Vendor guide identifies this hostname for uploaded image URLs. Classification follows the existing static1.squarespace.com asset entry."
  }
};
const excludedParents = ["sqspcdn.com","squarespace-cdn.com"];
describe("Add specific Squarespace media resource hosts", () => {
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
