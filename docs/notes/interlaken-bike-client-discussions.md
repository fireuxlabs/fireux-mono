# Interlaken bike client notes

Updated: 2026-10-22
Status: discussion notes, not implementation specification.

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

- Reconcile this note with any local Codex work once available.
- Ask for or record actual scope, deliverables and relationship between the two clients when discussed.
