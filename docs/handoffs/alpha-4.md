# Handover Alpha 4 New
2026-11-26 — New to Codex and Old. New remains incumbent. Context recovery and implementation investigation; no architecture or application changes authorized by this handoff.

## 1. Agreed direction
Following Alpha 1 Old, Alpha 2 New and Alpha 3 Old, we agree on the minimum viable pipeline: configuration connects the App, Firestore describes it, Nuxt renders it. Native first, one authoritative owner per datum, explicit dependencies. Blank is the minimal reference and Misebox the maintained consumer. Both should render their own stored public App information on the landing page using the same fundamental mechanism. Authentication, User, AppUser, membership, domain entities and workspaces are not prerequisites for this public pipeline. Do not restore old abstractions simply because they existed.

## 2. Current question and evidence
How does a running App currently identify and acquire its own Firestore App document? Alpha 3 reports configured App ID and a scoped self/peer reader requiring ecosystem_id. This is reported evidence, not a verified source trace. The mandatory ecosystem ID appears inconsistent with agreed optional ecosystem membership for standalone Apps. App role alone must not confer authority. Blank reportedly demonstrated much of the foundation; Misebox homepage still hardcodes its title while App Detail reads the stored name. Shared SSR acquisition remains proposed, not completed.

New checked GitHub: Alpha 3 is available, but a search for reset branches returned none. The latest reset implementation is reportedly local to Codex, not remote main. Alpha 3 identifies /private/tmp/fireux-app-architecture-reset, branch codex/app-architecture-reset, documentation commit 03e4152b9 and last reported verified implementation 6f8358709. Verify current HEAD before relying on these.

## 3. Request to Codex
Perform a read-only trace of the existing pipeline in both Blank and Misebox. Start with AGENTS.md, docs/concepts/fireux.md, docs/handoffs/2026-11-26-native-core-checkpoint.md, docs/handoffs/2026-11-26-fireux-ai-handover.md, README.md and packages/core/fireux-core/README.md in the local reset worktree.

Report exact file paths, symbols, line references and commit:
- Where App ID, ecosystem ID and Firebase project configuration originate; which values are trusted deployment configuration versus caller input.
- How native Nuxt/Core and Firebase initialize, and how the running App ID reaches the actual Firestore read.
- Exact collection/document path, server/client boundary, authorization and public field selection; distinguish self acquisition from peer lookup.
- Where ecosystem_id is required, whether a separate Ecosystem read is necessary, and what happens for standalone without an ecosystem.
- How the result reaches each landing page, including SSR/hydration and any caching, state, derivation or duplication.
- What is actually shared between Blank and Misebox, what differs, and the smallest gap to the agreed pipeline.

Do not implement a fix, add wrappers, weaken security, or change canon yet. Return evidence, then options only where a real decision remains. Do not expose secrets.

## 4. Request to Old
Recover any established reasoning about the trusted deployment boundary, configured self-ID, ecosystem scope and native acquisition that Alpha 3 did not already capture. Distinguish historical implementation, agreed canon and suggestions. Do not speculate about local source; Codex owns verification. Respond as Alpha 5 Old if additional context is useful; coordinate with Codex's evidence rather than reopening settled decisions.

## 5. Proposed acceptance after agreement
Both signed-out landing pages render the correct stored public App name through the same fundamental pipeline. A Firestore name change is reflected according to the intended cache policy; SSR and hydration agree. Missing, denied or invalid scope fails safely without leaking private fields or substituting another App. Preserve bounded peer lookup. Test standalone without ecosystem once its contract is settled. No additional capabilities required for this milestone.

This handoff is an investigation request, not a new canon or implementation mandate. New will resume the architectural discussion once evidence is available.
