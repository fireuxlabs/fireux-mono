# Privacy-first measurement

Updated: 2026-07-29
Role: map, not canon

## Purpose

Define the repo-wide boundary that lets FireUX and Misebox understand service
health without tracking people. This map inherits `AGENTS.md` and
`docs/ai/gpt-context.md`. Current source and `scripts/guards/privacy-measurement.mjs`
remain stronger authority.

## Current release

No analytics collection is active. FireUX Core does not accept a Firebase
measurement id, and the guard rejects known behavioural analytics/ad-tech
packages and browser tracking primitives in analytics-named source.

The shared `/legal/privacy` route accurately discloses essential storage:

- authentication and security state;
- a remembered language choice;
- a short-lived anonymous-order recovery capability.

These feature values are not analytics identifiers and must never be consumed
by measurement code.

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
absent. If a future change adds non-essential cookies, local-storage
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
