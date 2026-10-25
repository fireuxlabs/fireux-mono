# Interlaken bike client notes

Updated: 2026-10-25
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
- **Yellow Velo**: Independent bike shop in Interlaken; it also has cycling/tour content. Existing FireUX tenant app under `projects/slap/yellow-velo`, part of the `slap` ecosystem. Its existing app config composes Core, Slap, Blogs and Products.

## Repository state observed on 2026-10-22

- The `fireuxlabs/fireux-mono` default branch contains Yellow Velo's tenant app.
- Search of the default branch did **not** find a dedicated Interlaken Bike Tours app. This does not establish whether work exists uncommitted on a local laptop or in a Codex session.
- Do not assume local or unsynced work is lost simply because a laptop is closed.

## Discussion and documentation agreement

- The user prefers talking through project ideas first.
- During the conversation, preserve substantive, implementation-relevant facts and decisions in concise GitHub project notes **without interrupting to request confirmation each time**. Do not turn casual brainstorming into requirements, and clearly label provisional ideas and unverified facts.
- This agreement covers **documentation**; it is not blanket approval to alter application code, deploy, publish sensitive information, or take unrelated external actions.
- ChatGPT Memory may retain useful context automatically, but GitHub notes are the explicit, reviewable record for these discussions.

## Next time

- Recheck the current App and brief before taking further client work.
- Ask for or record actual scope, deliverables and relationship between the two clients when discussed.
