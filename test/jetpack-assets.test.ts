import {describe, it, expect} from 'vitest';
import {loadPlaybill, matchDomain} from '../src/index.js';
import catalog from '../src/actors/functional.json' with {type: 'json'};
const entries = {
  "c0.wp.com": {
    "company": "Automattic",
    "service": "Jetpack Asset CDN",
    "category": "functional",
    "consent_burden": "minimal",
    "docs_url": "https://github.com/Automattic/jetpack/blob/trunk/projects/plugins/jetpack/modules/photon-cdn.php",
    "note": "Jetpack source declares this CDN for WordPress core, Jetpack and WooCommerce CSS and JavaScript assets. This entry does not classify Jetpack Stats endpoints."
  }
};
const excludedParents = ["wp.com"];
describe("Add the Jetpack static asset CDN", () => {
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
