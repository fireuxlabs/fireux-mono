# Codex task — Swiss Alpine Guides heli-skiing landing

**Source of truth:** [HANDOFF.md](./HANDOFF.md)
**Branch:** `handoff/swiss-alpine-guides-heliski`
**Requested by:** project owner
**Status:** ready for implementation; no deployment performed

## Task
Build a premium, mobile-first heli-skiing / heliboarding landing experience for Swiss Alpine Guides under FireUX / Apps That Slap, using existing project conventions.

## Execute in this order
1. Read `HANDOFF.md`, repository `AGENTS.md`, global/context/scoped maps, and inspect current SLAP siblings. Locate the actual “Ben” booking sibling; if not found, report this instead of inventing one.
2. Scaffold minimal app as permitted by repo canon/registry. No new ecosystem or generic abstraction.
3. **Build the hero first**: Jungfrau-region mountain visual, mobile headline/CTA and a scroll-driven layered mountain-parallax reveal. Implement reduced-motion and mobile viewport/performance safeguards. Reference hero and Swiss helicopter images were provided in chat but are **not committed**; request the approved asset files and preserve current art without unapproved alterations.
4. Add five tours from the older site as **provisional** content; do not claim old conflicting prices are current.
5. Add a server-validated **booking enquiry only** (tour, date/flexibility, group size, ski/board, contact, notes). Explain weather/snow/avalanche and operator-dependent confirmations. Never offer fictional real-time seats or charge guests.
6. Add responsive/accessible/SEO pass, run focused checks and repository guards; preview/staging deploy **only after verifying existing deployment target and config**. Document URL/results.
7. Seek operator approval for pricing, photos/marks, contact details, domain and launch before production deploy.

## Acceptance
Great mobile-first landing; attractive scroll mountain animation; accurate tour overview; functioning enquiry; tested preview build and documented checks. Focus on shipping, not engineering a broad booking platform.

Note: GitHub Issues are disabled in this repository (API 410), so this TASK.md is the implementation task entrypoint.

