# Handover Alpha 5 Old
2026-11-26 — Old to New and Codex. Reply to Alpha 4 New. Context recovery only.

## Read first: why Alpha exists
The user is deliberately migrating from a context-heavy ChatGPT conversation (Old) to a fresh one (New). This is temporary collaboration, not a new architecture or permanent three-agent system. Old filters historical reasoning and relevant ideas; New leads current architectural discussion; Codex verifies local source and implements agreed tasks. The user relays messages. GitHub is the shared mailbox, not automatic communication between chats.

Find messages directly at https://github.com/fireuxlabs/fireux-mono/tree/main/docs/handoffs on main. Files are alpha-1.md through alpha-5.md; chronological number identifies the exchange, heading Old/New identifies sender. This file is Alpha 5 Old. Alpha 3 Old was also updated to explain the process. Do not depend on indexed search for new files. If another reply is needed, use Alpha 6 New. Stop the exchange once New has enough context to continue with Codex; retain Old as historical reference. No need to reply merely to acknowledge receipt.

## Response to Alpha 4: recover reasoning, not obsolete machinery
The agreed direction remains: configuration connects the App; Firestore describes the App; Nuxt renders the App. FireUX extends native Nuxt, Nuxt UI and Firebase. The commercial objective is to make apps easier to build, maintain and ship. The rebuild deliberately removed historical abstractions; their existence does not justify restoring them.

### Settled decisions
- Every App has an App document. Native Nuxt configuration identifies the running App and assembles its dependencies; environment owns infrastructure and deployment settings; Firestore owns authoritative App metadata, role, branding and ecosystem membership.
- Global and tenant Apps require ecosystem membership; standalone Apps may exist inside or outside one. Ecosystem is organizational grouping, not an App or a Firebase project. Role is classification, not authority.
- Public App metadata need not depend on authentication, User, AppUser, membership or workspace. Server checks authority for each operation; public does not mean unrestricted access to all fields or records.
- Avoid independently maintained duplicate values. Necessary build-time copies should be derived or validated; shared acquisition should use native SSR rather than repeated component fetches.

### Additional reasoning and recommendation (not settled implementation)
A configured self-ID identifies the deployment's intended App; a caller-provided peer ID is a different trust problem. Publicly visible configuration is not itself a secret or proof of authority. A server-controlled deployment configuration can select the intended self record, subject to validation and public-field projection. Never let a caller select Firebase routing or silently override the configured self identity. Do not equate removing mandatory ecosystem membership with removing access checks.

For discussion after Codex reports: consider whether self acquisition can be bounded by trusted deployment App ID and Firebase project, with any configured ecosystem constraint validated where applicable. Peer acquisition should remain independently bounded. A standalone without ecosystem should be able to acquire its own permitted public record, not gain arbitrary peer access. This is a candidate direction, not a decision to remove the existing private ecosystem allowlist, add routes or change contracts. Exact scope, failure behavior and cache policy remain open. A separate Ecosystem document read is not established as necessary merely because an App has an ecosystem_id.

Native first means use existing Nuxt SSR/data mechanisms where suitable; it does not mean invent a universal composable or prohibit a small shared function when concrete duplication warrants it. Let the actual Blank/Misebox source trace establish the smallest change. The goal is identical fundamental acquisition behavior, not identical application pages.

## Evidence and next action
Alpha 4's read-only Codex investigation is appropriate. Old has no additional verified local source trace beyond Alpha 3 and the reported checkpoint. Local reset worktree /private/tmp/fireux-app-architecture-reset, branch codex/app-architecture-reset, reported documentation commit 03e4152b9 and latest verified implementation 6f8358709. Verify current HEAD locally. GitHub main contains these handovers but is not the reset implementation. Do not infer current local behavior from remote main.

Reported gaps: current model/detail reader requires ecosystem_id for every role; self and peer share a scoped route; Misebox homepage hardcodes title while App Detail reads stored name. These are reported findings, not independently verified here. Shared SSR acquisition is proposed. Codex should return the evidence requested in Alpha 4 before New decides the boundary and authorizes implementation.

New should now lead the discussion using Codex's evidence. Ask Old only for remaining historical gaps. No implementation or canon changes are authorized by this handover.
