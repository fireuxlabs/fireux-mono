# Swiss Alpine Guides — FireUX / SLAP implementation handoff

Date: 2026-11-12
Status: implementation brief; not deployed.
Source website: https://www.swissalpineguides.ch/
User-identified original: https://www.swissalpineguides.ch/Deutsch/Heliboarding/default.html
Related: https://www.swissalpineguides.ch/Deutsch/Heliskiing/heliskiing.html

## Goal and launch posture

Ship a beautiful, mobile-first Jungfrau-region heli-skiing/heliboarding landing site using existing FireUX and Apps That Slap conventions. User's priority is **hero image first** with a **scroll-driven mountain-depth animation**, followed by lightweight tour discovery and a **booking enquiry** workflow. This is a quick, incremental launch, not a rebuild of the entire Swiss Alpine Guides website, a new bookings framework, or a confirmed instant-booking engine.

The user described the desired booking experience as “similar to Ben”. **Locate and verify the Ben app** before choosing what to reuse; its source has not yet been identified in this handoff.

## Existing business and source content

Swiss Alpine Guides is an Interlaken/Matten-area mountain-guiding business. The full source site covers other winter and summer mountain activities; Phase 1 is heli-skiing/heliboarding only.

Older supplied heliboarding page — provisional figures **must be verified with the operator** before publishing:

| Experience | Legacy listed price | Descent / conditions |
| --- | --- | --- |
| Ebnefluh 3900m + Petersgrat 3200m combo | CHF 430/person; min 7 | Two flights; up to 35km and 4,000m vertical; Feb–May |
| Sustenlimi 3200m | CHF 330/person; min 7 | 12km / 2,000m vertical; skiers; Feb–Apr; optional extra flight CHF 120 |
| Ebnefluh 3900m | CHF 330/person; min 7 | 21km / 2,400m vertical; skiers; Feb–May |
| Petersgrat 3200m → Blatten | CHF 330/person; min 7 | 10km / 1,700m vertical; skis/boards; Feb–Apr |
| Petersgrat 3200m → Stechelberg | CHF 330/person; min 7 | 15km / 2,300m vertical; experienced skiers; Feb–Apr |

**Important:** The original and newer heli-skiing pages show conflicting pricing (including CHF 350 and CHF 430 variants); do **not** present the figures above as current or take payment until confirmed. Weather, mountain/snow and avalanche conditions, guide and aircraft availability determine operating feasibility. The original site advertises a Heli-Hotline/condition-dependent departures.

Contacts displayed on the website (confirm operational address and preferred enquiries before release):
- Swiss Alpine Guides — Eyacheri 2, 3800 Matten bei Interlaken, Switzerland
- Phone +41 33 822 60 00
- WhatsApp +41 79 652 60 00
- info@swissalpineguides.ch and heli1@swissalpineguides.ch appear in site content.

## Creative direction — first priority

- Premium, editorial, mobile-first Alpine travel design; cinematic snow-capped Jungfrau-region scene.
- A portrait hero image has already been generated in the planning conversation. **The currently depicted helicopter is wrong.** User provided two photographs as Swiss helicopter references and explicitly said **do not alter the generated hero yet**. Obtain/copy the approved image and helicopter references from the project owner; images have NOT been committed with this text handoff.
- Begin with an immersive ~100svh mobile hero, minimal legible headline and primary “Explore tours” / “Request a flight” CTA.
- **Scroll mountain animation:** background, middle and foreground mountain layers move at different speeds, revealing the next scene/tour catalogue. Gentle parallax and depth rather than one giant zoom. Prefer performant CSS transforms and a small local composable; respect `prefers-reduced-motion`, touch scrolling, sticky navigation and mobile address-bar behavior. Avoid introducing heavyweight animation/core abstractions.
- The app owns its composition; don't add motion code to the SLAP ecosystem package.
- Ship first working hero, visually verify on a real-sized phone viewport, then expand.

## MVP scope

1. Landing route: hero, mountain-scroll transition, five tour cards, conditions/safety explanation, contact and WhatsApp CTA, footer.
2. Tour detail via modest local data/content, optionally routes only if the nearest FireUX sibling warrants them. Do not build a CMS for five tours.
3. **Request, not confirmation:** selected tour, desired/flexible date, group size, ski vs snowboard, name, email/phone, notes and conditions acknowledgement. Securely validate input; send/store using existing approved FireUX patterns and protect against spam. Show explicit “request received / subject to confirmation” messaging; no fictional live flight availability.
4. Operator follows up to confirm conditions, guide, flight, participant numbers and terms. No payment gateway for MVP.
5. Responsive QA, SEO/social metadata, accessible content, image optimization. Agree primary language (DE/EN) with operator; don't launch fake/incomplete translations.

## FireUX source pointers verified

Repo: https://github.com/fireuxlabs/fireux-mono

- `AGENTS.md` requires reading `docs/ai/gpt-context.md`, ownership and scoped maps; inspect status/source/nearest sibling and perform the mandatory composition checks before editing implementation code.
- `docs/concepts/apps-that-slap.md` — SLAP eligibility, ownership, app-local presentation and source guards. The stable ecosystem key is `slap`.
- `packages/ecosystem/fireux-slap/README.md` — SLAP owns ecosystem identity/config, not page presentation.
- `packages/extensions/fireux-bookings/src/runtime/server/booking.ts` — existing bookings capability.
- `projects/slap/interlaken-bike-tours/server/utils/tour-booking.ts` — existing tour booking sibling.
- Also inspect `packages/ecosystem/fireux-slap/docs/ai/apps-that-slap-context.md`, bookings context, nearest project manifest/config, registry, relevant guards, staging deploy script.
- Reuse existing FireUX/SLAP patterns and Firebase binding. Do not create a parallel Firebase project/brand, introduce an unnecessary generic module or infer production deployment permissions.

## Execution checklist

- [ ] Identify Ben app's actual repo/path and compare its booking UX; use existing Interlaken Bike Tours as another inspected sibling.
- [ ] Read required AGENTS / FireUX / SLAP / booking context and inspect project registration, build/deploy instructions and current git status.
- [ ] Confirm this app belongs under `projects/slap/swiss-alpine-guides/` (working assumption) and create the minimal app using repo's established scaffold.
- [ ] Import the supplied approved hero/reference assets once accessible; keep helicopter correction for explicit design review.
- [ ] Implement hero and mountain-scroll reveal; test on mobile, reduced motion and slow devices.
- [ ] Add five provisional tour records (omit or mark prices pending operator verification) and minimum safety/conditions copy.
- [ ] Implement validated booking enquiry with clear manual follow-up semantics; no automatic confirmation.
- [ ] Add SEO, responsive/accessibility passes and relevant guards/typecheck/build.
- [ ] Preview deploy with existing project convention; record URL and review. **Production deploy only once domain, rights, pricing, contacts and client approval are confirmed.**

## Out of scope

Whole parent-site migration; other outdoor activities; real-time flight/weather/avalanche API; live inventory; payments; automated tour confirmation; broad booking-system refactor; shared animation library.

## Open decisions (not blockers for the first local hero)

Operator sign-off and photo/logo usage rights; approved up-to-date prices/minimum groups; whether enquiry should go to email/WhatsApp/admin dashboard; primary language; production domain and deployment target; Ben app location.

## Acceptance criteria

An excellent mobile hero, smooth scroll mountains, accurate tour introduction and a functional enquiry capture; verified staging deploy. Keep implementation focused on shipping and avoid overengineering.

