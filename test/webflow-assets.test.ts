import {describe, it, expect} from 'vitest';
import {loadPlaybill, matchDomain} from '../src/index.js';
import catalog from '../src/actors/data_leak.json' with {type: 'json'};
const entries = {
  "cdn.prod.website-files.com": {
    "company": "Webflow",
    "service": "Webflow Asset CDN",
    "category": "data_leak",
    "consent_burden": "minimal",
    "docs_url": "https://webflow.com/",
    "note": "Asset hostname used by Webflow itself for published website resources. Classification follows assets.website-files.com; this is not an analytics-event signature."
  }
};
const excludedParents = ["website-files.com"];
describe("Add the current Webflow asset CDN hostname", () => {
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
