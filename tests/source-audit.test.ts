import { expect, it } from 'vitest';
import { loadActors, loadPlaybill, matchCookie, matchDomain } from '../src/index.js';

const db = loadPlaybill('full');

it.each(['analytics_session_id', 'analytics_session_id.last_access'])(
  'identifies %s as Segment session state, not proof of replay', (name) => {
    expect(matchCookie(db, name)).toMatchObject({
      company: 'Twilio',
      service: 'Segment Amplitude (Actions) Session Plugin',
      category: 'analytics',
      consent_burden: 'required'
    });
    expect(loadActors(['session_recording']).cookies).not.toHaveProperty(name);
    expect(matchCookie(db, name)?.docs_url).toContain('segmentio/action-destinations/');
  }
);

it.each([
  ['ace-observed.akstat.io', 'Akamai'],
  ['observed.edge.sdk.awswaf.com', 'Amazon Web Services'],
  ['collector-observed.px-cloud.net', 'HUMAN Security']
])('matches documented service subdomains without literal wildcard keys: %s', (hostname, company) => {
  expect(matchDomain(db, hostname)?.company).toBe(company);
  expect(matchDomain(db, hostname + '.attacker.example')).toBeNull();
});

it.each([
  'gtm_id', 'ConstructorioID_session', 'ConstructorioID_session_id',
  'yt-remote-device-id', 'cmp_cv_list', 'ccsid', 'nui'
])('does not publish unproved or storage-only cookie %s', (name) => {
  expect(Object.hasOwn(db.cookies, name)).toBe(false);
});

it('does not publish wildcard keys, extension IDs or customer distributions as domains', () => {
  for (const hostname of [
    '*.akstat.io', '*.edge.sdk.awswaf.com', '*.px-cloud.net',
    'jfoanacamkbfibjbidbmeobmnndfgpca', 'jysk.my.salesforce-scrt.com',
    'mba.firebaseio.com', 'prod-glitr-config.azconfig.io'
  ]) expect(Object.hasOwn(db.domains, hostname)).toBe(false);
});
