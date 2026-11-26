# Handover Alpha 2 New
2026-11-26 — from the incumbent fresh conversation to Alpha 1 Old. Next reply: Alpha 3 Old. Discussion and context recovery only; no implementation or canon changes.

## Part 1 — What we learned
Alpha 1 Old restored the conceptual spine: configuration connects the App; Firestore describes the App; Nuxt renders the App. Native first, explicit dependencies, one authoritative owner per datum. Environment owns infrastructure/deployment/secrets; Nuxt configuration owns assembly and running App identification; Firestore owns App metadata, branding, role and ecosystem membership. One App model with global, tenant and standalone organizational roles; standalone membership is optional, and role does not inject capabilities or grant permissions. Firebase project is a technical boundary, ecosystem a functional grouping. No special central orchestrator is settled.

The developer explicitly wants a minimum viable pipeline before a minimum viable product: each app should render its basic information on its landing page. The brutal cull is intentional: preserve historical work in Git, but rebuild upward from a known structure rather than repeatedly repairing a long chain of derived properties, circular references and unnecessary dissemination. The developer considers the spine clear, although one qualification in our explanation did not quite resonate; do not treat every assistant formulation as agreed canon.

Blank and Misebox should align at the foundation before progressing into users, memberships, domain entities and workspaces. The developer questioned whether Blank needs any of these, and whether it should serve as the testing ground for User later. Misebox is centered on a domain entity and workspace, but that does not necessarily make either a prerequisite of its initial landing-page pipeline.

Alpha 1 reports the local reset branch codex/app-architecture-reset, documentation checkpoint 03e4152b9 and implementation 6f8358709. The fresh conversation has not independently inspected that local worktree. Remote main must not be confused with the reset branch. Alpha is an on-demand historical context channel, not routine reporting; New is now the incumbent conversation.

## Part 2 — Suggestions from New (not yet canon)
- First prove the same minimal pipeline in Blank and Misebox: configuration identifies the running App; Firebase connectivity enables authorized acquisition of its own Firestore App document; Nuxt renders basic stored information on the landing page, using Nuxt UI for presentation.
- Do not require authentication, User, AppUser/membership, domain profiles, domain entities or workspace for that public pipeline unless an actual requirement proves otherwise. The App document itself is already an entity; distinguish it from a domain entity such as Kitchen.
- Blank tests reusable foundations; Misebox demonstrates domain extension. Do not turn Blank into a miniature Misebox. Consider introducing authentication and User in Blank only after the first pipeline is aligned, as a separate incremental capability test.
- Add back historical functionality only when a concrete requirement justifies it. Avoid unnecessary intermediate state, computed/derived copies and dissemination chains; do not ban necessary derivation or native state mechanisms categorically.
- Keep the trusted deployment boundary and optional ecosystem membership issue from Alpha 1 in view. Do not weaken server authority to simplify public rendering. No deletion or implementation is requested by this handoff.

## Part 3 — Questions for Old
1. Does the established minimum viable App contract match the proposed public landing-page pipeline? What exactly did Blank already prove, and what remains incomplete in Misebox?
2. What is the smallest shared set of native layers, modules, configuration, server acquisition and rendering mechanisms both apps need? Which are truly mandatory versus optional capabilities?
3. What is the current exact path from configured App ID to Firestore App document to landing-page rendering? Identify actual files and ownership from the reset checkpoint, and flag duplicated state or metadata if known. Do not reconstruct from historical main.
4. Is App acquisition itself dependent on ecosystem acquisition, authentication, User, AppUser or membership today? Which dependencies are intentional, which are accidental, and which are merely historical?
5. What was already agreed about Blank as a test ground for authentication and User? Should Blank remain a permanently minimal reference, or progressively test optional capabilities without making them mandatory? Is there an existing testing strategy we have forgotten?
6. What is the established distinction between App entity, domain entity, workspace entity and workspace? Is 'no domain entity, no workspace' a valid rule, or too broad? Keep this contextual; do not redesign workspace now.
7. What exact decisions were already made during the brutal cull, and what should not return? What known circular dependencies or dissemination patterns motivated it?
8. What is the smallest acceptance test for both apps, including authoritative metadata, SSR if required, and failure handling? What has Codex actually verified versus merely proposed?
9. For the next slice, what deployment trust boundary options were already considered for self-record acquisition and ecosystem-free standalone apps? Which questions genuinely remain open? How can the public pipeline be proven without introducing a new abstraction or weakening access control?
10. What is the correct dependency/build order after the pipeline is proven? Recover existing decisions, especially any distinction between core capability availability and an app opting into it.

Please respond as Alpha 3 Old in docs/handoffs/alpha-3.md. Separate established canon, verified implementation, reported implementation, proposals and unresolved questions. Provide exact local references where known, and explicitly identify anything requiring Codex verification. Focus on the minimum viable pipeline and Blank/Misebox alignment; defer lower-level redesign. No implementation instructions or code changes.
