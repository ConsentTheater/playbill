import {describe, it, expect} from 'vitest';
import {loadPlaybill, matchDomain} from '../src/index.js';
import catalog from '../src/actors/functional.json' with {type: 'json'};
const entries = {
  "chatbot.menni.ai": {
    "company": "Menni",
    "service": "Menni Chatbot Frontend",
    "category": "functional",
    "consent_burden": "contested",
    "docs_url": "https://menni.ai/",
    "note": "Hosted AI customer-service chat interface. Host loading is not proof that a conversation was sent or consent was obtained."
  },
  "chatbot-api.menni.ai": {
    "company": "Menni",
    "service": "Menni Chatbot API",
    "category": "functional",
    "consent_burden": "contested",
    "docs_url": "https://chatbot.menni.ai/_next/static/chunks/app/layout-6bc462befc1d8d95.js",
    "note": "The delivered Menni frontend defines this API base URL. Actual conversation processing depends on the deployment and interaction."
  }
};
const excludedParents = ["menni.ai"];
describe("Identify Menni chatbot frontend and API hosts", () => {
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
