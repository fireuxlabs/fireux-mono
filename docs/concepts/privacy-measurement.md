# Privacy-first measurement

Updated: 2026-10-21
Ref: d05ded3fd
Role: map, not canon

## Purpose

Define the repo-wide boundary that lets FireUX and Misebox understand service
health without tracking people. This map inherits `AGENTS.md` and
`docs/ai/gpt-context.md`. Current source and source-owned tests remain stronger
authority.

## Current release

No analytics collection is active. FireUX Core does not accept a Firebase
measurement id. Feature storage must not introduce behavioural analytics,
advertising identifiers or browser tracking.

Core splits public authority without duplicating it:

- `/legal/privacy` owns personal-data handling, providers, rights, and the
  no-tracking boundary;
- `/legal/storage` owns the exact cookies-and-browser-storage inventory;
- `packages/core/fireux-core/src/config/privacy/browser-storage.json` is the
  machine-readable feature-storage inventory.

The current essential feature storage includes:

- authentication and security state;
- a remembered language choice;
- a short-lived anonymous-order recovery capability;
- an explicitly selected colour mode, Workspace selection, and chat recovery;
- an explicitly enabled App-specific offline preference, worker and reconnect
  page cache.

These feature values are not analytics identifiers and must never be consumed
by measurement code.

Fresh public visits do not register a PWA service worker or create its cache.
Core `/install` separates native or manual browser installation from optional
offline support. Enabling offline support saves `fireux:pwa:{appId}` and
registers the App's worker; later visits may resume that saved choice. The worker
caches only self-contained reconnect HTML. Navigation uses the network, with
that generic page as a failure fallback; App pages/data, API/auth responses and
queued writes are excluded. App-specific caches and the owned registration are
removed through Disable offline support. An open page may retain worker control
until reloaded or closed. Update and reload explicitly applies a waiting worker;
the install-status display describes the current window, not a device inventory.

Public Google Maps embeds require an explicit load action. After authentication
is explicitly requested, Firebase Auth keeps the sign-in across reloads and
browser restarts until explicit sign-out or browser-data removal. Anonymous-
order recovery values expire after no more than 24 hours.

Chat contact details and message bodies remain in the current App database
behind the trusted `/api/chat` boundary. The browser receives an unguessable
30-day recovery capability; only its SHA-256 hash is stored server-side, and
conversation/message creation is atomic. Direct browser Firestore access stays
closed. New-session abuse control keeps only an ephemeral salted IP hash in
process memory; it never persists or logs a raw address.

The PWA policy and verification entrypoints are Core `src/config/app/pwa.ts`,
`src/runtime/utils/pwa-controller.ts`, `src/runtime/components/Pwa`,
`src/runtime/pages/install.vue` and `src/test/pwa.test.mjs`.
Browser checks must separately confirm fresh-visit storage, opt-in, cache
contents, removal and deliberate update/reload behavior.

## Required future aggregate seam

Before the first event is collected, one shared Core-owned server family must
land as a single coherent change:

- accepted names: `page.view`, `registration.started`,
  `registration.completed`, `onboarding.completed`, `storefront.view`,
  `offer.view`, `order_request.completed`, and `technical.error`;
- server-side validation and aggregation before persistence;
- app/tenant, UTC day, event name, route class, bounded referrer/campaign
  category, and count only;
- bot rejection before counting;
- no event-level documents or stable visitor/session identifiers;
- no names, emails, addresses, exact location, order content, auth tokens,
  Firebase UID, raw/full IP address, or high-entropy user agent;
- closed client Firestore Rules and trusted-server writes only;
- an authenticated App-admin projection that returns only the caller's App
  aggregates;
- an expiry time no later than 13 months and a verified deletion mechanism;
- no public projection and no cross-App query;
- no reconstruction of individual journeys or profiles.

Interlaken Essen is the first intended proof, but it must enable this shared
family rather than add app-local tracking.

## Consent boundary

No cookie popup is shown because analytics and advertising tracking storage is
absent and optional third-party surfaces are not loaded before the visitor
requests them. If a future change adds non-essential cookies, local-storage
identifiers, fingerprinting, cross-site/cross-App identifiers, or third-party
behavioural tracking, this contract no longer applies. That change requires
privacy and legal review before release, together with the appropriate consent
experience.

## Legal review

The implementation treats data minimisation and transparency under Swiss data
protection guidance as a floor. Counsel should review controller/processor
roles, provider retention, international transfers, the final public wording,
and any claim about whether consent is legally required in a particular
jurisdiction.
