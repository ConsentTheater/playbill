import {it,expect} from 'vitest';
import {loadPlaybill,matchCookie} from '../src/index.js';
const entries={
  "moyaCookieConsent": {
    "company": "Stefna",
    "service": "Moya Cookie Notice",
    "category": "consent",
    "consent_burden": "minimal",
    "description": "Stores the timestamp acknowledging the Moya cookie notice.",
    "lifetime": "1 year",
    "docs_url": "https://hjalp.stefna.is/en/knowledge/vafrakoku-yfirlysing",
    "note": "Delivered cookie-notice code sets this exact case-sensitive name and advances expiry by one year. Acknowledgement alone does not establish granular category consent or effective tracker blocking."
  }
};
for(const [name,expected] of Object.entries(entries)) {
 it('identifies exact cookie '+name+' with source-specific details',()=>{
  const actual=matchCookie(loadPlaybill('full'),name);
  expect(actual).toMatchObject(expected);
  expect(actual?.matchedPattern).toBeUndefined();
 });
 it('does not extend the added signature to different case or a suffix: '+name,()=>{
  const p=loadPlaybill('full');
  expect(matchCookie(p,name.toUpperCase())).not.toMatchObject(expected);
  expect(matchCookie(p,name+'_unrelated')).not.toMatchObject(expected);
 });
}
