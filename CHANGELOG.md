# Changelog

All notable changes to `@consenttheater/playbill` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-04-25

### Breaking changes

This release reframes the data model around **observation** rather than
**judgement**. Two renames and one removal.

#### `severity` → `consent_burden`

Every cookie and domain entry previously carried a `severity` field with
values `critical | high | medium | low`. Those labels read like school
grades and implied a normative judgement that this library has no
business making.

In v0.2.0 the field is renamed to `consent_burden` and the values are
relabeled to describe what the tracker actually demands under GDPR /
ePrivacy:

| Old (`severity`) | New (`consent_burden`) | Meaning                                                         |
|------------------|------------------------|-----------------------------------------------------------------|
| `critical`       | `required_strict`      | Cross-site profiling, ad-tech retargeting, fingerprinting       |
| `high`           | `required`             | Standard analytics / marketing tracking                          |
| `medium`         | `contested`            | Jurisdiction-dependent; treat as consent-required by default     |
| `low`            | `minimal`              | Functional / security / strictly-necessary in most readings     |

The data shape and number of levels are unchanged — only the names.
Migration is a search-and-replace. Tier semantics for `loadPlaybill()`
(`mini` / `core` / `full`) are equivalent, just expressed against the
new field.

#### `scorer` module removed

The entire `scorer` module is gone. That includes:

- `computeScore()`
- `bandForScore()`
- `SEVERITY_WEIGHTS`
- `BANDS`
- Types: `ScoreInput`, `ObservedItem`, `ObservedBanner`, `ScoreResult`,
  `Violation`, `Band`, `BandKey`

The scorer produced a 0–100 compliance number and "compliant /
non-compliant / violating" risk bands for a whole site. That is exactly
the kind of verdict this project does not want to issue on behalf of
its consumers — and it is the work of supervisory authorities and
courts in any case.

If you need a presentation hierarchy in your UI (red / amber / green
status strips, "high risk" badges, etc.), compute it in your own code
from `consent_burden` and `category`. A few lines is all it takes, and
the rule lives in your code where you can change it without a library
release.

The `./scorer` subpath export is also removed from `package.json`.

#### Type exports

Removed: `Severity`, `Band`, `BandKey`, `Violation`, `ScoreResult`,
`ScoreInput`, `ObservedItem`, `ObservedBanner`.

Added: `ConsentBurden`.

Unchanged: `Playbill`, `CookieActor`, `DomainActor`, `CookieMatch`,
`DomainMatch`, `Tier`, `Category`.

### Migration recipe

For most consumers the upgrade is mechanical:

```diff
- import { computeScore, bandForScore } from '@consenttheater/playbill';
+ // Compute your own ranking from match.consent_burden / match.category

- if (match.severity === 'critical') ...
+ if (match.consent_burden === 'required_strict') ...

- type S = Severity;
+ type S = ConsentBurden;
```

If your code previously used `computeScore()` to produce a banner-style
verdict ("compliant / violating"), the simplest replacement is a one-off
function in your own codebase that takes the array of matches and
returns whatever shape your UI expects.

### Internal

- `playbill.version` bumped from `2` to `3` (the in-memory database
  format version, distinct from the package version).
- `scripts/normalize.js` updated to recognise `consent_burden` as a
  meta key when scanning for duplicate entry keys.

## [0.1.2] — 2026-04-23

- Data: regional CDN umbrellas, B2B deanonymisers, Google cross-site leaks
  added to the catalogue.

## [0.1.1] — 2026-04-22

- Data: HubSpot root domains added for regional CDN coverage.

## [0.1.0] — 2026-04-21

- Initial public release.

[0.2.0]: https://github.com/ConsentTheater/playbill/releases/tag/v0.2.0
[0.1.2]: https://github.com/ConsentTheater/playbill/releases/tag/v0.1.2
[0.1.1]: https://github.com/ConsentTheater/playbill/releases/tag/v0.1.1
[0.1.0]: https://github.com/ConsentTheater/playbill/releases/tag/v0.1.0
