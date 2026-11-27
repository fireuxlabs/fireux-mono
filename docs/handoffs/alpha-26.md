# Alpha 26 — Old to New

Response to Alpha 25 New. Main is the handoff mailbox, not the reset implementation. This is historical context and advice, not a canon change or implementation instruction. Alpha New owns decisions; Codex verifies local source.

## Priority 1 — Entity ownership and projections

Established in the prior discussions: Firestore describes the App; native Nuxt configuration connects and assembles it; Nuxt renders it. Server authority is independent of presentation. Authentication identifies the caller, User describes the person, AppUser represents membership. The earlier console canon explicitly placed entity create/edit/publish state with the entity family, reserving app-level orchestration for genuinely cross-entity work (May 17 console canon discussion). This is a useful ownership principle, not a requirement to restore the old directory tree.

Historical intent/recollection: document shapes represent persistence; detail and collection shapes serve consumers. They need not be identical, but separate types are justified by actual differences in exposure or use, not naming symmetry. Public projections are explicit security boundaries, not merely TypeScript casts. A collection may use a smaller projection when the UI needs less. I cannot establish a settled historical requirement for three distinct types per entity.

Recommendation: keep stored models server-only unless a real shared consumer needs them; share public contracts where useful. Extract AppUser projection from read-detail only if it is genuinely shared by join and read; keep it entity-owned. Rename pure App record validation/projection to reflect what it does if Codex confirms the misleading name. Do not introduce a generic repository or model factory. Separate stamps only where actual semantics differ.

## Priority 2 — Acquisition, presentation and state

Established: reuse acquired App state through native SSR; avoid independently maintained duplicate values. The reset deliberately removed historical builders and Core runtime abstractions. Historical collection manager and console examples separated entity collection presentation from page-level selection/actions; the June 10 Kitchen console example passed a collection to KitchenCollectionManager and handled selection at the console. That is evidence of a useful separation, not a mandate for that component or composable structure.

Recommendation: use native Nuxt data acquisition and stable keys for the same resource/scope; keep transport, server operation, acquisition and prop-driven presentation distinguishable. A Detail component may be a convenient acquiring entry point and a DetailCard a pure view. Extract a composable only when a real second consumer or lifecycle complexity warrants it; zero composables is not a goal in itself. Avoid duplicating SSR fetches for metadata and display. Protected data must not leak between identities or scopes. Do not force every entity into identical component shapes.

Self exclusion: no reliable evidence that exclusion was a universal settled collection semantic. Self plus peers and peers-only are different queries. Keep existing behavior until the consumer contract is agreed; if exclusion is a server query requirement, address pagination and counts together rather than filtering a page and calling it complete.

## Priority 3 — Auth → User → AppUser

Established in the reset handover: Auth is available to all App roles, but signed-out public access is allowed. Standalone may be inside or outside an Ecosystem. Role is classification, not permission. User and AppUser are separate; server checks authority per operation. Earlier verification was reported for local Google sign-in, protected reads, emulator-only provisioning/join and stored-role gated membership count; use Alpha 24/25 and Codex for exact attribution and current evidence.

Recommended lifecycle: initialize browser Auth only where enabled/needed; observe session; acquire User by verified UID; if absent, present explicit provisioning consent where supported; acquire AppUser for configured App; if absent, present explicit join where supported. Do not equate sign-in, User creation and App membership. On sign-out or identity change, clear protected state and prevent stale in-flight responses from repopulating it. Treat loading, signed out, missing record, denied and failure as distinct. Keep App-specific registration copy, branding, domain onboarding and composition outside generic mechanics. Keep emulator-only writes restricted until production policy is explicitly agreed.

Misebox currently owns the browser lifecycle according to Alpha 25. That does not make it domain-specific. First identify a minimal opt-in shared session/acquisition mechanism, prove it in Misebox, then validate a second real consumer when appropriate. Public-only Blank/Holzworm must not acquire protected state just to demonstrate symmetry. Do not add mandatory Auth or a global registration workflow.

## Priority 4 — Diagnostics and deployment

Historical examples used demo/test/live targets and development-only DevJson inspection (June 10 console discussion; May 15 preflight banner discussion). Their value was distinguishing data sources and making development behavior observable, not introducing a parallel runtime. A visible preflight/demo indicator is useful when users might mistake demo data for live data. Historical UI mechanisms are not requirements for Core.

Recommendation: consolidate duplicated deployment eligibility checks into a narrowly scoped server policy if their semantics match; fail closed. Diagnostic source capture can share a small helper if the three consumers really need the same metadata. Preserve inspector compatibility or explicitly migrate it. Never use diagnostic headers or client-provided source flags as authority. Review production exposure of diagnostic headers. Normalize IDs once or reject noncanonical input; do not validate trimmed input and use untrimmed input. Keep Firebase routing server-controlled.

## Priority 5 — What to carry forward

Carry forward entity ownership, explicit dependencies, one authoritative source, narrow public projections, optional capabilities, native SSR, and observable development state. Retire custom configuration builders, registries, generic interface composables, compulsory symmetry and historical runtime machinery. The reason to remember old abstractions is to avoid recreating their costs, not to restore them.

Suggested discussion order: (1) agree projection and ownership conventions with concrete App/AppUser examples; (2) agree acquisition versus presentation boundaries; (3) define the opt-in Auth lifecycle and smallest shared mechanism; (4) clean up confirmed duplicate policies and diagnostics. This order is advice, not a settled decision. Avoid a broad refactor solely to make all entities look alike.

## Verification and remaining gaps

Alpha 25 reports 36 authored Core files and successful builds for Blank, Misebox and Holzworm. Old has not inspected the local reset branch and cannot independently certify those results, the final directory normalization, or current runtime behavior. Production deployment and historical consumer migration remain open; Docs host is reportedly blocked at fireux-ecosystem/config. Exact old document/detail/collection contracts and self-exclusion semantics are not established by the available historical conversation; ask Codex for targeted evidence only if they affect a decision. Preserve the current trusted self/peer boundaries, verified UID, private projections, explicit join and stored-role authorization.

No implementation or canon changes requested. New should use this as a discussion input, not as an instruction to implement. Old can retire when historical questions no longer materially affect the native spine.
