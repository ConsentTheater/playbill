# @consenttheater/playbill

[![npm version](https://img.shields.io/npm/v/@consenttheater/playbill.svg)](https://www.npmjs.com/package/@consenttheater/playbill)
[![npm downloads](https://img.shields.io/npm/dm/@consenttheater/playbill.svg)](https://www.npmjs.com/package/@consenttheater/playbill)
[![License: AGPL-3.0-or-later](https://img.shields.io/badge/License-AGPL--3.0--or--later-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-types%20included-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/node/v/@consenttheater/playbill.svg)](package.json)

**The Playbill** — an open-source, tiered knowledge base of GDPR-relevant web trackers, with pure-function matching and risk-scoring utilities.

A theater playbill lists every actor and their role on stage. This package does the same for the web: every tracking cookie, every tracking domain, every company behind them — identified, categorized, and scored against GDPR.

A standalone library — no browser dependencies, no runtime side effects, no lock-in. Useful for anyone building privacy tooling:

- Cookie banner auditors and Consent Management Platforms (CMPs)
- Browser extensions and user-agent privacy features
- CI/CD compliance scanners (catch GDPR regressions before they ship)
- Web crawlers, site-grading services, accessibility and privacy dashboards
- Academic research, regulatory studies, journalism projects
- Your own privacy tools, commercial or otherwise (subject to the AGPL — see License)

## What's in the Playbill

- **Cookie signatures** — name, owning company, service, purpose, severity, lifetime, docs link
- **Domain signatures** — hostname, owning company, service, category, severity
- **2,800+ companies** — from Google and Meta to regional EU ad networks and niche SaaS tools
- **8,000+ entries** across 11 categories — one of the largest AGPL-licensed tracker databases available
- **Matching utilities** — exact + pattern (trailing `*`) cookie matching, exact + subdomain hostname matching
- **Scoring utilities** — GDPR-weighted compliance score with four risk bands

### Current stats

| Metric | Count |
|--------|-------|
| Cookie signatures | 2,307 |
| Domain signatures | 6,297 |
| Total entries | 8,604 |
| Unique companies | 2,839 |
| Categories | 11 |

## Tiers

Choose what you need — everything is **computed at runtime** from a single set of source files, no pre-built tier bundles to drift out of sync:

| Tier | Entries | Companies | Size (gzip) | Use case |
|------|---------|-----------|-------------|----------|
| `mini` | ~620 | ~45 | ~25 KB | Lightweight widgets, top-50 company quick checks |
| `core` | ~7,000 | ~2,470 | ~275 KB | CI/CD scanners, most compliance tools |
| `full` | ~8,100 | ~2,825 | ~320 KB | Complete audits, regional/niche coverage |

**Tier semantics:**
- `mini` — top 50 companies by entry count, `critical` + `high` severity only
- `core` — all `critical` + `high` + `medium` severity, any company
- `full` — everything, including `low` severity, regional, and niche

## Usage

```ts
import { loadPlaybill, matchCookie, matchDomain, computeScore } from '@consenttheater/playbill';

// Load the tier you need
const playbill = loadPlaybill('core');

// Identify a cookie
const cookie = matchCookie(playbill, '_ga');
// → {
//     name: '_ga',
//     company: 'Google',
//     service: 'Google Analytics',
//     category: 'analytics',
//     severity: 'high',
//     description: 'Distinguishes unique users...',
//     lifetime: '2 years',
//     docs_url: 'https://developers.google.com/...'
//   }

// Identify a domain (exact or subdomain match)
const domain = matchDomain(playbill, 'connect.facebook.net');
// → { hostname: 'connect.facebook.net', company: 'Meta',
//     service: 'Meta Pixel', category: 'advertising', severity: 'critical' }

// Score a page's compliance against GDPR
const result = computeScore({
  preConsentCookies: [cookie],
  preConsentRequests: [domain],
  dataLeakRequests: [],
  banner: { detected: true, hasAcceptButton: true, hasRejectButton: false }
});
// → { score: 45,
//     band: { key: 'non_compliant', label: 'Non-Compliant' },
//     violations: [...] }
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

### Matcher-only / scorer-only

If you only need matching (no scoring) or scoring (no DB):

```ts
import { matchCookie, matchDomain } from '@consenttheater/playbill/matcher';
import { computeScore, bandForScore, SEVERITY_WEIGHTS, BANDS } from '@consenttheater/playbill/scorer';
import type { Playbill, CookieActor, ScoreResult } from '@consenttheater/playbill/types';
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

Entries scored as `data_leak` (Google Fonts, Typekit, YouTube embeds, Google Maps, etc.) are counted as violations **even after consent**. Rationale: the Austrian DPA ruling (2022) and LG München judgments hold that IP exfiltration to third parties violates GDPR regardless of consent, because the request fires before any dialog can mediate.

## Severity levels

| Severity | GDPR weight | Meaning |
|----------|-------------|---------|
| `critical` | -25 points | Ad/retargeting trackers — clear GDPR violation if set before consent |
| `high` | -15 points | Analytics without legal basis; banner missing reject option |
| `medium` | -10 points | Session recording, data leaks — elevated risk exposure |
| `low` | -5 points | Functional/security — typically exempt under legitimate interest |

## Risk bands

`computeScore()` returns one of four bands based on the total score (100 − Σ weights):

| Score | Band | Meaning |
|-------|------|---------|
| ≥ 90 | `compliant` | GDPR-clean or near-clean |
| 70–89 | `at_risk` | Minor issues — one critical violation drops you here |
| 40–69 | `non_compliant` | Two critical violations or equivalent |
| < 40 | `violating` | Four+ critical violations; systemic failure |

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
  Severity, Category,
  ScoreInput, ScoreResult, Violation,
  Band, BandKey,
} from '@consenttheater/playbill';
```

## License

**AGPL-3.0-or-later** — free to use, including commercially, but modifications and derivative works must remain open source under a compatible license. This applies even when the software is offered as a hosted service (SaaS). See [LICENSE](./LICENSE).

The AGPL is a deliberate choice: the tracker knowledge encoded here represents substantial community research, and we want forks, hosted scanners, and downstream tools to stay open so the ecosystem as a whole improves.

## Contributing

Found a tracker we're missing? Want to fix an incorrect severity or update a lifetime? PRs welcome.

Each entry needs:
- Cookie name or domain
- Owning company and service name
- Category and severity
- One-sentence description
- Cookie lifetime (for cookies)
- Link to official documentation

After editing any file under `src/actors/`, run:

```sh
npm run normalize   # sorts keys, reformats, flags duplicates, updates stats
```
