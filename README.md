# @consenttheater/playbill

[![npm version](https://img.shields.io/npm/v/@consenttheater/playbill.svg)](https://www.npmjs.com/package/@consenttheater/playbill)
[![npm downloads](https://img.shields.io/npm/dm/@consenttheater/playbill.svg)](https://www.npmjs.com/package/@consenttheater/playbill)
[![License: AGPL-3.0-or-later](https://img.shields.io/badge/License-AGPL--3.0--or--later-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-types%20included-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/node/v/@consenttheater/playbill.svg)](package.json)

**The Playbill** — an open-source, tiered knowledge base of GDPR-relevant web trackers, with pure-function matching helpers. Each entry is tagged with the **consent burden** it creates under EU/GDPR rules. No verdicts, no risk scores — just facts you can build on.

A theater playbill lists every actor and their role on stage. This package does the same for the web: every tracking cookie, every tracking domain, every company behind them — identified, categorised, and labelled with how much consent work each one creates.

A standalone library — no browser dependencies, no runtime side effects, no lock-in. Useful for anyone building privacy tooling:

- Cookie banner auditors and Consent Management Platforms (CMPs)
- Browser extensions and user-agent privacy features
- CI/CD compliance scanners (catch GDPR regressions before they ship)
- Web crawlers, site-grading services, accessibility and privacy dashboards
- Academic research, regulatory studies, journalism projects
- Your own privacy tools, commercial or otherwise (subject to the AGPL — see License)

## Why no scoring?

Earlier releases (v0.1.x) shipped a `computeScore()` helper that produced a 0–100 compliance score and "compliant / violating" risk bands for whole sites. We removed it in v0.2.0.

Whether a site complies with GDPR is the work of supervisory authorities and courts. We are an evidence library, not a regulator. Downstream consumers — extensions, scanners, dashboards — can compute whatever ranking they want from the raw `consent_burden` and `category` fields. Keeping the judgement layer out of this package is the cleanest way to stay neutral.

## What's in the Playbill

- **Cookie signatures** — name, owning company, service, purpose, consent burden, lifetime, docs link
- **Domain signatures** — hostname, owning company, service, category, consent burden
- **2,800+ companies** — from Google and Meta to regional EU ad networks and niche SaaS tools
- **8,000+ entries** across 11 categories — one of the largest AGPL-licensed tracker databases available
- **Matching utilities** — exact + pattern (trailing `*`) cookie matching, exact + subdomain hostname matching

### Current stats

| Metric | Count |
|--------|-------|
| Cookie signatures | 2,197 |
| Domain signatures | 5,936 |
| Total entries | 8,133 |
| Unique companies | 2,829 |
| Categories | 11 |

## Tiers

Choose what you need — everything is **computed at runtime** from a single set of source files, no pre-built tier bundles to drift out of sync:

| Tier | Selection | Use case |
|------|-----------|----------|
| `mini` | Top 50 companies; `required_strict` + `required` only | Lightweight widgets, top-50 company quick checks |
| `core` | All consent-requiring entries (`required_strict`, `required`, `contested`) | CI/CD scanners, most compliance tools |
| `full` | Everything, including `minimal`-burden entries | Complete audits, regional/niche coverage |

## Usage

```ts
import { loadPlaybill, matchCookie, matchDomain } from '@consenttheater/playbill';

// Load the tier you need
const playbill = loadPlaybill('core');

// Identify a cookie
const cookie = matchCookie(playbill, '_ga');
// → {
//     name: '_ga',
//     company: 'Google',
//     service: 'Google Analytics',
//     category: 'analytics',
//     consent_burden: 'required',
//     description: 'Distinguishes unique users...',
//     lifetime: '2 years',
//     docs_url: 'https://developers.google.com/...'
//   }

// Identify a domain (exact or subdomain match)
const domain = matchDomain(playbill, 'connect.facebook.net');
// → { hostname: 'connect.facebook.net', company: 'Meta',
//     service: 'Meta Pixel', category: 'advertising', consent_burden: 'required_strict' }
```

### Loading individual categories

For tools that only care about a subset (e.g. an analytics-opt-out helper doesn't need ad trackers):

```ts
import { loadActors } from '@consenttheater/playbill';

const playbill = loadActors(['advertising', 'analytics']);
```

### Direct category imports (tree-shakeable)

Each of the 11 categories is available as its own subpath export. Useful when your bundler can tree-shake and you want to skip categories entirely:

```ts
import advertising from '@consenttheater/playbill/actors/advertising';
import analytics from '@consenttheater/playbill/actors/analytics';
import dataLeak from '@consenttheater/playbill/actors/data-leak';
// Also: marketing, functional, social, session-recording, security,
//       consent, fingerprinting, tag-manager
```

### Matcher-only

If you only need matching (and want to skip importing the bundled actor JSON):

```ts
import { matchCookie, matchDomain } from '@consenttheater/playbill/matcher';
import type { Playbill, CookieActor } from '@consenttheater/playbill/types';
```

## Categories

| Category | Description |
|----------|-------------|
| `advertising` | Ad targeting, retargeting, DSPs, SSPs, conversion tracking, programmatic |
| `analytics` | Usage measurement, audience insights, A/B testing, CDP, attribution |
| `marketing` | Email, SMS, push, CRM tracking, marketing automation, lead capture |
| `functional` | Chat widgets, forms, payments, CMS features, loyalty, accessibility |
| `social` | Social media embeds, sharing widgets, social login |
| `session_recording` | Heatmaps, session replays, screen recording, click/scroll tracking |
| `data_leak` | Third-party resources that expose visitor IP — fonts, embeds, CDNs, maps |
| `security` | Bot detection, CAPTCHA, CSRF protection, fraud prevention |
| `consent` | Consent Management Platforms (CMPs), banners, preference management |
| `fingerprinting` | Browser fingerprinting, device identification, cross-device tracking |
| `tag_manager` | Tag management systems — container scripts that load other trackers |

### The `data_leak` category is special

Entries categorised as `data_leak` (Google Fonts, Typekit, YouTube embeds, Google Maps, etc.) are noteworthy **even after consent**. Rationale: the Austrian DPA ruling (2022) and LG München judgments hold that IP exfiltration to third parties is a separate concern from cookie consent, because the request fires before any dialog can mediate. We tag the entries; how you treat them in your UI is your call.

## Consent burden

Every entry carries a `consent_burden` value describing how much explicit consent the tracker needs under GDPR / ePrivacy.

| Value | Meaning | Examples |
|-------|---------|----------|
| `required_strict` | Cross-site profiling, ad-tech retargeting, fingerprinting, session recording. Always needs prior, informed, freely-given consent. | DoubleClick, Meta Pixel, Hotjar, FingerprintJS |
| `required` | Standard analytics and marketing tracking. Consent required in nearly all interpretations. | Google Analytics, Mixpanel, HubSpot tracking |
| `contested` | Tracking-adjacent or jurisdiction-dependent. Some authorities allow under legitimate interest, others require consent. Treat as consent-required by default. | Some session storage IDs, certain CDP cookies |
| `minimal` | Functional, security, or strictly-necessary in most interpretations. Often exempt from consent requirements. | CSRF tokens, language preferences, opt-out flags |

These labels describe **what kind of GDPR work the tracker creates**, not whether any particular site is compliant. Two trackers in the same category can carry different burdens depending on the operator's role and how they're used.

## Pattern cookies

Cookie entries marked `"pattern": true` use **prefix matching with a trailing `*`**:

```json
"_ga_*": { "pattern": true, "company": "Google", ... }
```

This matches `_ga_ABC123`, `_ga_XYZ789`, etc. Wildcards in the middle of a key are not supported — only trailing `*`.

## Types

All types are exported:

```ts
import type {
  Playbill, Tier,
  CookieActor, DomainActor,
  CookieMatch, DomainMatch,
  ConsentBurden, Category
} from '@consenttheater/playbill';
```

## License

**AGPL-3.0-or-later** — free to use, including commercially, but modifications and derivative works must remain open source under a compatible license. This applies even when the software is offered as a hosted service (SaaS). See [LICENSE](./LICENSE).

The AGPL is a deliberate choice: the tracker knowledge encoded here represents substantial community research, and we want forks, hosted scanners, and downstream tools to stay open so the ecosystem as a whole improves.

## Contributing

Found a tracker we're missing? Want to correct a `consent_burden` value or update a lifetime? PRs welcome.

Each entry needs:
- Cookie name or domain
- Owning company and service name
- Category and `consent_burden`
- One-sentence description
- Cookie lifetime (for cookies)
- Link to official documentation

After editing any file under `src/actors/`, run:

```sh
npm run normalize   # sorts keys, reformats, flags duplicates, updates stats
```

## Migrating from v0.1.x

v0.2.0 is a breaking change. See [CHANGELOG.md](./CHANGELOG.md) for the full migration guide. In short:

- `severity` field renamed to `consent_burden` with descriptive labels:
  - `critical` → `required_strict`
  - `high` → `required`
  - `medium` → `contested`
  - `low` → `minimal`
- The whole `scorer` module (`computeScore`, `bandForScore`, `SEVERITY_WEIGHTS`, `BANDS`, `Violation`, `ScoreResult`, `Band`, `BandKey`) was removed. Compute presentation hierarchies in your own UI layer.
