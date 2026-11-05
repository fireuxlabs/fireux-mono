# Interlaken bike client notes

Updated: 2026-11-05
Status: discussion notes, not implementation specification.

## Current pointer

The current checkout contains the dedicated App at
[`projects/slap/interlaken-bike-tours`](../../projects/slap/interlaken-bike-tours/package.json)
and its [Ignition brief](../../projects/slap/interlaken-bike-tours/app/ignition/brief.ts).
The older absence observation below is historical and has been superseded.
Further delivery and launch work is parked under the
[single priority list](../roadmaps/fireux-priorities.md); this note preserves
client distinctions, not another active backlog.

## Distinct businesses

- **Interlaken Bike Tours**: User identified a client contact called **Ben**. Discussion concerns guided cycling experiences in the Interlaken region. Do not conflate this business with Yellow Velo. Ben's exact role, site content, and any agreed project scope should be confirmed against the original client brief before implementation.
- **Yellow Velo**: Independent bike shop in Interlaken; it also has cycling/tour content. Existing FireUX tenant app under `projects/slap/yellow-velo`, part of the `slap` ecosystem. Its App config uses `fireux-app` for Core, Blogs and Products and selects the Slap runtime layer.

## Repository state observed on 2026-10-22

- The `fireuxlabs/fireux-mono` default branch contains Yellow Velo's tenant app.
- Search of the default branch did **not** find a dedicated Interlaken Bike Tours app. This does not establish whether work exists uncommitted on a local laptop or in a Codex session.
- Do not assume local or unsynced work is lost simply because a laptop is closed.

## Discussion and documentation agreement

- The user prefers talking through project ideas first.
- During the conversation, preserve substantive, implementation-relevant facts and decisions in concise GitHub project notes **without interrupting to request confirmation each time**. Do not turn casual brainstorming into requirements, and clearly label provisional ideas and unverified facts.
- This agreement covers **documentation**; it is not blanket approval to alter application code, deploy, publish sensitive information, or take unrelated external actions.
- ChatGPT Memory may retain useful context automatically, but GitHub notes are the explicit, reviewable record for these discussions.

## Reported request

- During a 2026-11-04 live discussion, the user reported that Ben wants a booking
  system and finds it stressful managing GetYourGuide, Booking.com, Viator, and
  other channels. TrekkSoft was identified as a competitor. Access to these
  channels and their integration options remain unverified.

## Updated Codex handoff

- The latest handoff was prepared in the separate **Audit Ben's Voice** chat on
  2026-11-04. Its author said the GitHub update was blocked, so this summary
  records the handoff direction here. These are reported product decisions, not
  proof of implementation or a public launch approval.
- Position the offer as premium, exclusive private bike tours. The audience is
  broad; couples, families, and private groups were examples, while hotels and
  concierges are phase two.
- Use fixed prices and instant booking confirmation.
- Build reusable **FireUX Bookings** (`fireux-bookings`) with Google Calendar
  integration, using Ben's existing Interlaken Bike Tours App as the first
  consumer. Improve that site's existing design using Ben's Base44 reference;
  do not rebuild from scratch.
- Focus SEO on premium private tours and destination-specific searches. The
  handoff does not specify an autonomous SEO agent workflow or a separate
  internal SEO product.
- Review the current App, prior handoffs, and existing implementation before
  changing code. Exact channel integrations, booking policies, payment scope,
  and the Base44 reference remain to be verified.

## Next time

- Recheck the current App and brief before taking further client work.
- Keep Ben's business distinct from Yellow Velo.
