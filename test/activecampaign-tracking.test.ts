import {describe, it, expect} from 'vitest';
import {loadPlaybill, matchDomain} from '../src/index.js';
import catalog from '../src/actors/marketing.json' with {type: 'json'};
const entries = {
  "prism.app-us1.com": {
    "company": "ActiveCampaign",
    "service": "ActiveCampaign Site Tracking",
    "category": "marketing",
    "consent_burden": "required",
    "docs_url": "https://help.activecampaign.com/hc/en-us/articles/360000256220-Enable-site-tracking-for-your-Magento-Store",
    "note": "Vendor installation guide identifies this request host for website visit tracking."
  },
  "diffuser-cdn.app-us1.com": {
    "company": "ActiveCampaign",
    "service": "ActiveCampaign Site Tracking SDK",
    "category": "marketing",
    "consent_burden": "required",
    "docs_url": "https://plugins.svn.wordpress.org/activecampaign-subscription-forms/trunk/site_tracking.js",
    "note": "Distribution host used by the vendor-published WordPress site-tracking integration. Loading the SDK alone does not establish that a visit event was sent."
  }
};
const excludedParents = ["app-us1.com"];
describe("Add documented ActiveCampaign site-tracking hosts", () => {
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
