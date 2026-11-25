# FireUX — App MVP cull and rebuild

Walking-mode handoff, 2026-11-25. Supersedes the continuation audit approach. Read alongside the earlier Nuxt spine and GitHub Issues handoffs in this directory; Issues remains separate.

## Starting point
Reported local checkpoint: 8f556b955 on codex/app-architecture-reset, worktree /private/tmp/fireux-app-architecture-reset. Original checkout remains intact. Verify the checkpoint and recoverability locally before deletion; this handoff on main does not imply the local reset branch has been pushed.

## Direction
Stop proving existence from existence. Existing consumers establish migration scope, not architectural necessity. Aggressively cull App client runtime outside the working MVP. Git history is the reference library; no legacy/archive directories, compatibility adapters or speculative replacements. Do not relocate unnecessary complexity.

## MVP
Native Nuxt, Nuxt UI and Firebase; configured App and Ecosystem identity; canonical App model; App Detail; active Ecosystem peers excluding self; shared presentation and actual component-library examples. Preserve correct pagination, validation and public-data boundaries. Blank is the first runnable consumer.

## Spine and ownership
Separate App entity from running App system. Challenge all surviving directories recursively, especially media (these are assets), contracts, Cards and fragmented capability directories. Eliminate before relocating. Do not automatically rename media to assets. Detail surfaces are explicitly named (AppDetailCard, Pill, Cell, Profile as needed), consume canonical fields and do not require a session. AppUser is a deliberate nested ownership exception, outside this MVP. No styling exercise.

## Rebuild
Define a genuine requirement, check native functionality, implement the minimum, consult Git selectively if useful, test and checkpoint. Do not restore a subsystem for one function. Authentication, User, AppUser, provisioning and administration come later. Extend the proven pipeline to maintained Apps only after the baseline is sound.

## Safety and scope
Code reset only; no data deletion, migration, production access, deployment or Rules release. Preserve trusted server handlers, authorization and storage contracts. Temporary downstream breakage is accepted only in the isolated reset. Verify committed recovery points before removing code. Do not merge the reset into main.

## Deliverables
Cull unnecessary App client code against the MVP, test Blank with disposable loopback data, report remaining tree, files and lines removed, complete surviving MVP source, verification results and remaining dependencies with concrete requirements. Verify one detail read, one query per collection page, zero per-card/status/AppUser reads, correct active and Ecosystem filtering and self-exclusion. Report blockers and deliberate downstream breakage.

## Execution boundary
This handoff records the requested direction, not walking-bridge execution approval. The local reset implementation must be carried out in its isolated worktree by Codex under the user's separate approval. If using the walking bridge, propose only docs/reviews/2026-11-25-app-mvp-cull.md as the bounded review output; do not authorize runtime edits via this handoff. Reconcile current main and local checkpoint first.
