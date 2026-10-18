import {it,expect} from 'vitest';
import {loadPlaybill,matchCookie} from '../src/index.js';
const entries={
  "_shopify_analytics": {
    "company": "Shopify",
    "service": "Shopify Storefront Analytics",
    "category": "analytics",
    "consent_burden": "required",
    "description": "Stores analytics data for storefront and checkout buyer surfaces.",
    "lifetime": "1 year",
    "docs_url": "https://www.shopify.com/legal/cookies"
  },
  "_shopify_marketing": {
    "company": "Shopify",
    "service": "Shopify Storefront Marketing",
    "category": "marketing",
    "consent_burden": "required",
    "description": "Stores marketing data for storefront and checkout buyer surfaces.",
    "lifetime": "1 year",
    "docs_url": "https://www.shopify.com/legal/cookies"
  },
  "_shop_app_essential": {
    "company": "Shopify",
    "service": "Shop App Essential",
    "category": "functional",
    "consent_burden": "minimal",
    "description": "Stores information required for Shop.app functionality.",
    "lifetime": "1 year",
    "docs_url": "https://www.shopify.com/legal/cookies"
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
