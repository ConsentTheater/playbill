import {it,expect} from 'vitest';
import {loadPlaybill,matchCookie} from '../src/index.js';
const entries={
  "ss_cvr": {
    "company": "Squarespace",
    "service": "Squarespace Analytics",
    "category": "analytics",
    "consent_burden": "contested",
    "description": "Counts unique visitors and their sessions on a Squarespace site.",
    "lifetime": "2 years",
    "docs_url": "https://support.squarespace.com/hc/en-us/articles/360001264507-The-cookies-Squarespace-uses"
  },
  "ss_cvt": {
    "company": "Squarespace",
    "service": "Squarespace Analytics",
    "category": "analytics",
    "consent_burden": "contested",
    "description": "Tracks a visitor session on a Squarespace site.",
    "lifetime": "30 minutes",
    "docs_url": "https://support.squarespace.com/hc/en-us/articles/360001264507-The-cookies-Squarespace-uses"
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
