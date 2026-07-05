# Changelog

All notable changes to `@consenttheater/playbill` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] — 2026-07-05

### Highlights

Catalogue grew to **10,595 entries** (4,205 cookies + 6,390 domains). This
release adds 45 new cookie patterns from a gap-filling pass over SaaS,
authentication, CDN, and analytics vendors.

### Added

- **Advertising (31 patterns)** — Beamer in-app messaging (5), SAP Gigya
  identity (4), RD Station marketing automation (6), Bidence DSP (2),
  Leadinfo B2B visitor ID (2), SOVRN header bidding, Trustpilot/Amplitude,
  Between Digital, Media.net, OnAudience, Salesforce (3), Ezoic, Instagram
  Pixel, Active Campaign, FreeWheel.
- **Analytics (3 patterns)** — Google Tag Manager request throttle
  (`_dc_gtm_`), Intercom visitor and session identifiers.
- **Functional (10 patterns)** — Hotjar session/user (`_hjSession_`,
  `_hjSessionUser_`), VWO goal experiments (`_vis_opt_exp_`), Braze user
  storage, Clerk auth, CleanTalk anti-spam, Imperva/Incapsula CDN (2),
  Supabase auth, SAP COPPA age gate.
- **Security (1 pattern)** — ASP.NET Core anti-forgery token.

### Fixed

- **README stats corrected.** The README claimed 14,285 entries and 4,351
  companies — these were inflated from a state where cross-file domain
  collisions were double-counted. Actual counts: 10,595 entries, 3,000
  unique companies.

## [0.5.0] — 2026-06-07

### Highlights

Catalogue grew to **10,550 entries** (4,160 cookies + 6,390 domains). This
release adds 39 new cookie/domain entries from a live-scan gap-filling pass
over major SaaS, martech, e-commerce, and consumer sites, removes one
dangerously over-broad pattern, and corrects two corrupted attributions.

### Added

- **B2B visitor identification / lead scoring** — `snitcher_device_id`
  (Snitcher), `mkjs_user_id` / `mkjs_group_id` / `mkjs_anonymous_id`
  (MadKudu), `wc_visitor` / `wc_client` / `wc_client_current` / `wc_swap`
  (WhatConverts).
- **Marketing attribution** — `flaretrk` (Attributer),
  `__ps_r` / `__ps_sr` / `__ps_lu` / `__ps_slu` / `__ps_fva` / `__ps_did`
  (Podscribe podcast-ad attribution), `partnero_*` (Partnero affiliate /
  referral).
- **Advertising** — `_uetmsclkid` (Microsoft Ads UET click ID), `_twpid`
  (X / Twitter Pixel), `IR_*` (Impact.com), `_yjsu_yjad` (Yahoo Japan Ads).
- **Analytics / experimentation** — `optimizelySession` (Optimizely),
  `sc_is_visitor_unique` (StatCounter), `tk_ai_explat` / `explat_*`
  (Automattic ExPlat).
- **Session recording** — `QuantumMetricSessionID` / `QuantumMetricUserID`
  (Quantum Metric).
- **Security** — `aws-waf-token` (AWS WAF bot-control challenge token).
- **Consent / CMP & functional** — TrustArc cookies (`TAsessionID`,
  `notice_preferences`, `notice_gdpr_prefs`, `cmapi_gtm_bl`,
  `cmapi_cookie_privacy`), `ccpa_applies`, `sensitive_pixel_option(s)`,
  `_wixUIDX` (Wix).
- **Data-leak** — `avatars.githubusercontent.com` (GitHub/Microsoft avatar
  CDN; exposes viewer IP, Gravatar analog).

### Changed

- Repository references now point to Codeberg — active development moved
  there; GitHub is a read-only mirror.
- Minimum Node version raised to 24.

### Fixed

- Corrected two corrupted Awin attributions (`AwinChannelCookie`, `lantern`)
  where the `company` and `lifetime` fields had been swapped during an earlier
  import (`company` read `"29 days"`, `lifetime` read `"Awin"`).

### Removed

- Over-broad `aw*` cookie pattern that matched **any** cookie beginning with
  `aw` and mislabelled it as Awin advertising (`required_strict`). It was
  swallowing unrelated AWS cookies such as `aws-waf-token`. The legitimate
  Awin click cookie `awc` retains its own exact-match entry, so no real
  coverage is lost.

## [0.4.0] — 2026-05-09

### Highlights

Catalogue grew from 8,664 to 10,504 entries (+21%, +1,842). Cookies nearly
doubled (2,340 → 4,119, +76%). 71 long-standing cross-file company-mismatch
attributions reported by `normalize.js` are zeroed out. A focused re-
classification moved 413 confident ad-tech entries (DSPs, SSPs, DMPs,
retargeting networks) from `marketing` to `advertising` with `consent_burden`
upgraded to `required_strict`.

### Data — new entries

- 1,794 new cookies + 131 new domains across `analytics`, `marketing`,
  `functional`, and `security`. See *Acknowledgements* below for the
  upstream community source we want to credit.
- ShortPixel image-optimisation CDN: `shortpixel.ai`, `cdn.shortpixel.ai`,
  `shortpixel.io`, `shortpixel.com`, `api.shortpixel.com`
  (`functional`/`minimal`).

### Data — cross-file company-mismatch cleanup

71 cases of the same cookie/domain key attributed to different companies
across actor files resolved across four root causes:

- **4 self-name-vs-domain** — entries had `company` set to a domain string
  (e.g. `Branch.io`, `Split.io`) instead of the proper company name.
  Domain-named entries removed.
- **8 known-related** — subsidiary / parent / rebrand pairs (Salesforce
  DMP/Krux, Atlassian/Loom, Block/Afterpay, etc.). Canonical attribution
  kept; redundant entries removed.
- **40 name-format-diff** — same company under slightly different formats
  (`Heap` vs `Heap (Contentsquare)`, `Adjust` vs `Adjust (AppLovin)`,
  `OpenStreetMap` vs `OpenStreetMap Foundation`, etc.). Pure category
  disputes — kept the entry in the most accurate category.
- **19 distinct-company** — real attribution conflicts including
  misattributed cookies: `_fs_uid` was attributed to "FullSession" but is
  actually FullStory; `_lr_env_src_ats` to LogRocket but is actually
  LiveRamp ATS; `csrftoken` to Meta but is actually Django; `match.prod
  .bidr.io` to RhythmOne but is actually Beeswax (Comcast); `_lr_env_src
  _ats` to LogRocket but is LiveRamp ATS; `prebid.adnxs.com` re-attributed
  to advertising/Xandr (Microsoft) instead of fingerprinting; `top.mail
  .ru` re-attributed to analytics/MyTracker; `addtl_consent` and
  `usprivacy` re-attributed to consent (IAB-managed signals) rather than
  generic functional.

### Data — ad-tech re-routing

413 entries moved from `marketing.json` → `advertising.json` with
`consent_burden` upgraded to `required_strict`. Affected vendors include
Nexx360, Epsilon, Outbrain, Adform, Yieldmo, Equativ (formerly Smart
AdServer), Adhese, Sonobi, Groovinads, Magnite (formerly Rubicon Project),
Smaato, Perfect Audience, Teads, ID5, PubMatic, Platform161, Ortec,
Seedtag, Lotame, Zeotap, MediaMath, OpenX, Admatic, MediaVine, Audrte,
Acuity, Emetric, 33Across, Atlas, Tappx, Xandr, richAudience, LiveRamp,
JustPremium, LiveIntent, Underdog Media, TripleLift, plus single-entry
confident-ad-tech entries (Snapchat ads, RTB House, Pangle, Vidoomy,
Roku ad-sync, Demandbase, Tapad, ComScore, etc.).

Mixed-type companies (Adobe, Microsoft, Google, Meta, Facebook, LinkedIn,
HubSpot/Clearbit) deliberately **NOT included** — their entries span both
categories and need entry-by-entry review in a future pass.

### Compatibility

No API changes. Two semantic shifts that downstream consumers will
notice:

- 413 entries that previously appeared in `marketing` rollups now appear
  in `advertising`. Consumers filtering by `category === 'marketing'` will
  see fewer results; `advertising` grows by the same amount. The new
  `marketing` set is closer to its label — email/SMS/push, CRM
  automation, lead capture, loyalty programmes — without the ad-tech
  noise.
- Those same 413 entries had `consent_burden: 'required'` and now have
  `consent_burden: 'required_strict'`. UIs that bucket consent burden
  into display levels will see those entries shift up one level. The new
  burden reflects the GDPR posture of these vendors more accurately —
  the old categorisation was a default applied during earlier bulk
  import passes, not editorial intent.

### Acknowledgements

Catalogue informed by
[`jkwakman/Open-Cookie-Database`](https://github.com/jkwakman/Open-Cookie-Database)
(Apache-2.0 — with thanks). Their community-maintained cookie catalogue
contributed 1,794 new cookie + 131 new domain entries to our database in
this release. Their 5-category schema was mapped into our 11-category +
`consent_burden` model, descriptions were retained where accurate, and
941 entries already in our DB were deduplicated. Open-Cookie-Database is
a separate project under different governance — we recommend it directly
to anyone who wants the raw upstream catalogue. Without that work, this
release would have been substantially smaller.

## [0.3.0] — 2026-05-01

### Highlights

This release is a data-quality pass driven by ten end-to-end scans of major B2B
SaaS sites (HubSpot, Salesforce, Adobe, 6sense, Demandbase, ZoomInfo, Clearbit,
Notion, Linear, Airtable, monday.com, ClickUp, Loom, Gong, Mutiny). Every change
below is a real misattribution or omission observed in production traffic, not
speculative cleanup.

### Tooling

- **`scripts/normalize.js` now detects cross-file collisions.** When the same
  cookie name or domain key appears in two or more actor files, the script
  reports each occurrence with file name, attributed company, category, and
  consent burden — and explicitly marks `COMPANY MISMATCH` cases as bugs. The
  alphabetical merge order in `loadPlaybill()` means later files silently
  overwrite earlier ones, which had been hiding wrong attributions for
  high-traffic vendors. The check ran on the existing data and surfaced 109
  cookie + 344 domain collisions as a backlog for future passes.

### Data — wrong attributions corrected

- **`_dd_s` → Datadog Browser SDK** (was DataDome bot protection). Two
  different vendors with confusingly similar `_dd_*` prefixes. `_dd_s` is the
  primary session cookie of the Datadog RUM agent; DataDome's persistent cookie
  is `datadome` and its test cookies use `_dd_cookie_test_*`. Category moves
  from `security/contested` to `analytics/required` — every site running
  Datadog RUM was previously mis-audited as running bot protection.
- **`_gd_session` / `_gd_svisitor` / `_gd_visitor` → 6sense Visitor ID** (was
  "Google Analytics Debug" / `minimal`). Confirmed across 6sense's own site,
  Airtable, Gong, and others — the cookie value matches the `svisitor=`
  parameter on `b.6sc.co` beacons in the same scan window. New burden:
  `required_strict`. The `_gd_visitor` short variant added.
- **`_ttp` → TikTok Pixel** (was Kakao Pixel). `_ttp` is TikTok's primary
  pixel cookie; Kakao uses `_kp_clk` / `_kawlt`. Burden upgraded to
  `required_strict`.
- **`cb_user_id` / `cb_group_id` / `cb_anonymous_id` → HubSpot (Clearbit)
  Reveal** (was Cxense via an over-greedy `cb_*` pattern). The pattern is
  deleted; explicit Clearbit entries take its place. Cxense (Piano DMP) uses
  `cX_*` (capital X), not `cb_`.
- **`ar_debug` → Pinterest Conversion Tag** (was Google). The Chrome
  Attribution Reporting API debug cookie is set per-advertiser by their pixel,
  not by Google directly; the canonical setter is Pinterest's tag.
- **`cg_uuid`, `greencolumnart.com` → CHEQ AI Technologies** (was
  "GreenColumnArt", category `advertising`). `greencolumnart.com` is a CHEQ
  cloak domain (the `ch=cheq4ppc` URL marker is the tell). Category moved to
  `fingerprinting/required_strict`. CHEQ rotates per-tenant cloak domains
  (`obs.<random>`, `ob.<random>`) explicitly to evade tracker blocklists, so
  the entry includes a note about path signatures (`/ct`, `/mon`,
  `/tracker/tc_imp.gif`, `/i/<hex>.js`) for matcher-side detection.
- **`a.usbrowserspeed.com`, `usbrowserspeed.com` → Experian (Tapad)
  Cross-Device Identity** (was New Relic Browser Speed Test, plus a separate
  USBrowserSpeed cookie attribution). Same cloak pattern as CHEQ — the URL
  itself contains `purpose=Retargeting + ID Resolution`, which New Relic
  doesn't do. Tapad was acquired by Experian in 2020. Category moved to
  `fingerprinting/required_strict`.
- **`px.ads.linkedin.com` → LinkedIn (Microsoft) Insight Tag** (was Roku /
  DataXu / Roku OneView). DataXu's real domains are `w55c.net` and
  `dxlive.com`; this entry was simply wrong.
- **`laboratory-anonymous-id` → HubSpot Laboratory** (was "Various / Lab/Testing
  Tools"). HubSpot's internal A/B testing framework.
- **`bb_*` over-greedy Blackboard pattern removed.** It was matching every
  cookie starting with `bb_` as Blackboard LMS, including monday.com's
  internal cookies. No replacement — the correct fix for the surfacing
  cookies needs site-by-site investigation, and a wrong attribution is worse
  than no attribution.

### Data — cross-file duplicates resolved

The losing entry was deleted in each pair so the merger picks the better
attribution. Notable cases:

- `snap.licdn.com` (kept advertising / "LinkedIn Insight Tag", deleted social)
- `alb.reddit.com` (added bare hostname under advertising / Reddit Pixel —
  was previously only matched as `social/contested` via a wrong entry that
  understated the consent burden of conversion pixels)
- `fast.wistia.com` (3-way collision: kept data_leak, deleted analytics + social)
- `tag.demandbase.com` (kept analytics / "Demandbase ABM" with reverse-IP note,
  deleted marketing)
- `secure.adnxs.com` (kept fingerprinting, deleted advertising)
- `js-agent.newrelic.com` (default agent reclassified as `analytics/required`
  RUM, not `session_recording/contested` — replay is a separately-licensed
  feature using `/replay/` paths which retain their entry)

### Data — new entries

**Cookies (previously unmatched in production scans):**

- `_dd_s`, `dd_anonymous_id` (Datadog Browser SDK)
- `_biz_uid`, `_biz_nA`, `_biz_pendingA`, `_biz_flagsA` (Adobe / Bizible / Marketo Measure)
- `pxcts`, `_pxde` (HUMAN / PerimeterX bot defense — extends the existing family)
- `_zitok` (ZoomInfo WebSights first-party visitor token)
- `ttcsid`, `ttcsid_*` (TikTok Conversion Source ID)
- `dicbo_id` (Outbrain click ID)
- `__q_state_*` (Qualified Conversational Sales — pattern with workspace hash)
- `Indr*` (Unify base64-encoded workspace-prefixed cookie variants)
- `mutiny.user.*` (Mutiny B2B website personalization — reverse-IP firmographic)
- `tracking-preferences` (Twilio Segment consent storage)
- `g_state` (Google Sign-In / GSI state)
- `tcm` (Transcend Consent Manager)
- `cookiehub` (CookieHub CMP)
- `hubspot_id_sent` (HubSpot internal flag)
- `cloudfront_viewer_country` (AWS CloudFront geo header echoed to cookie)
- `sequelUserId`, `sequelSessionId`, `sequel-consent` (Sequel.io B2B virtual events)
- `atlCohort`, `atl_session`, `atl_xid.current`, `atl_xid.ts`, `atlUserHash`,
  `__Host-psifi.*` (Atlassian cross-product tracking — covers Loom, Trello,
  and other Atlassian-acquired properties)
- `_otPreferencesSynced`, `ovtc_*` (OneTrust virtual tag capture for SPA
  navigation re-evaluation)

**Domains:**

- `www.google.com/ccm/collect`, `/rmkt/collect`, `/pagead/1p-user-list`,
  `/pagead/1p-conversion`, `/gmp/conversion` — Google Ads first-party endpoints
  used as consent-mode workarounds. Each carries a note explaining the
  `1p-` naming and the role in the Privacy Sandbox transition.
- `pagead2.googlesyndication.com/ccm/collect` — Google Customer Match Connect
  (correctly distinguished from AdSense, which is the bare-hostname entry).
- `fls.doubleclick.net` — Floodlight conversion tracking (subdomain match
  catches per-advertiser hosts like `14611606.fls.doubleclick.net`).
- `sgtm-amer.hubspot.com`, `sgtm-emea.hubspot.com`, `sgtm-apac.hubspot.com` —
  HubSpot's hosted server-side GTM proxies, used to tunnel GA4 hits through
  HubSpot's first-party domain.

### Notes

- The `munchkin.marketo.net` entry now documents that Marketo's bundled JS
  ships JavaScript errors (which can include form values, URL params, and
  DOM content) to Adobe's Sentry tenant `o209747.ingest.us.sentry.io` —
  observed across multiple Marketo customer sites including Adobe's own
  `business.adobe.com`, Airtable, and Gong. This is invisible to most
  privacy reviews and worth surfacing in audit reports.
- Several reverse-IP firmographic vendors (6sense, Demandbase, ZoomInfo,
  Clearbit, Mutiny, Leadfeeder/Dealfront) carry notes about their legal
  posture: company-level identification from IP creates GDPR-personal data
  even on sites with no consent banner.
- The matcher itself was not changed in this release. A separate
  `urlParamPattern` matching feature (for detecting enrichment vendors via
  GA4 `up.db_*` / `up.*_6si` user-property leaks) is on the backlog.

### Compatibility

No breaking API changes. Two semantic changes that downstream consumers may
notice:

- `_dd_s`-using sites will now appear in `analytics/required` rollups instead
  of `security/contested`. If you bucket consent-burden levels into UI bands,
  this will shift Datadog deployments from "minimal concern" toward "consent
  required" — which matches reality.
- The `bb_*` and `cb_*` pattern removals mean cookies that previously matched
  via these patterns will now return `null` from `matchCookie()`. If any
  consumer relied on the old (wrong) attributions, those calls now correctly
  surface as unmatched. Affected real-world cookies were re-attributed where
  the actual vendor was identifiable (Clearbit's `cb_*` family), or left
  unmatched where it wasn't (`bb_visitor_id`).

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

[Unreleased]: https://codeberg.org/ConsentTheater/playbill/compare/v0.5.0...HEAD
[0.5.0]: https://codeberg.org/ConsentTheater/playbill/releases/tag/v0.5.0
[0.4.0]: https://codeberg.org/ConsentTheater/playbill/releases/tag/v0.4.0
[0.3.0]: https://codeberg.org/ConsentTheater/playbill/releases/tag/v0.3.0
[0.2.0]: https://codeberg.org/ConsentTheater/playbill/releases/tag/v0.2.0
[0.1.2]: https://codeberg.org/ConsentTheater/playbill/releases/tag/v0.1.2
[0.1.1]: https://codeberg.org/ConsentTheater/playbill/releases/tag/v0.1.1
[0.1.0]: https://codeberg.org/ConsentTheater/playbill/releases/tag/v0.1.0
