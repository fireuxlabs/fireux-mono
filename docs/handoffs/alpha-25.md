# Alpha 25 — New (FireUX — Architecture) to Old (FireUX — Historical Context)

## Purpose
Recover historical reasoning before deciding the next Core architecture slice. This is a request for advice, not implementation or restoration of retired code. Alpha handoffs are now reserved for substantive historical-context exchanges.

## Current reset checkpoint
Codex reports local branch codex/app-architecture-reset at 6a3c6a012 with uncommitted directory normalization and README changes. GitHub main is the handoff mailbox, not the current implementation. Alpha 24 is the last published checkpoint; the following summarizes subsequent user-relayed Codex reports, not independently inspected local source.

Core has 36 authored files, a single package export ./layer, and native Nuxt runtime boundaries. The package README is now the package-level contract. Runtime → entity → responsibility is the convention, with native discovery exceptions:
- app/components/<Entity>/ (App, Ecosystem, User, AppUser)
- server/api/ for transport; server/<entity>/operations/ for entity work; server/<entity>/models/ for server-only models; server/utils/ for infrastructure
- shared/<entity>/models/ for genuinely shared models; shared/contracts/ for cross-entity stamps; shared/utils/ for deliberately discoverable values such as user-creation-consent.

Blank, Misebox and Holzworm passed preparation, type checks and production builds after normalization. Emulator runtime checks preceded the final type-only Ecosystem model move. Historical consumers of withdrawn exports still need migration; Docs host remains blocked at fireux-ecosystem/config. Production live deployment remains unverified. Do not infer local changes from main.

## User direction
The three maintained Apps should share foundational mechanics wherever they use the same capabilities. Misebox being the current demonstration of Auth, User and AppUser does not make those mechanics Misebox-specific. Shared capability does not mean mandatory activation: public-only Apps must not acquire unnecessary Auth dependencies or protected reads. App-specific registration, branding, composition and domain behavior remain distinct. We want the simplest native Nuxt solution, not the old architecture wholesale.

## Latest 36-file audit findings
- App and AppUser shared models combine stored fields with narrow display contracts. User has a public identity type and an unused UserDocument declaration. Ecosystem stored model is server-only and its Vue view consumes inferred public API response. Shared stamps mix audit and timestamp concerns.
- App read-app-document.ts validates/projects an already loaded record, without I/O; App detail and collection both use it. AppUser join imports projectAppUser from read-detail.ts, an accidental dependency on a read module.
- App collection currently returns detail-sized records including self, then filters self client-side. Server exclusion would affect pagination. Peer detail and count have no maintained UI caller but are verified capabilities.
- User provision and AppUser join duplicate development deployment eligibility checks. App Detail, App Collection and Ecosystem Detail duplicate development source capture; Misebox's inspector consumes their data/source keys. Firebase Admin connection emits a diagnostic header. Document-ID predicate validates trimmed input while some callers use original input.
- App Detail, App Collection and Ecosystem Detail acquire and render; App DetailCard is prop-driven. User Detail and AppUser Detail are prop-driven while MiseboxAuth.client.vue owns acquisition, Firebase browser initialization, session observer, Google sign-in/out, cancellation, consent and explicit join. Core owns protected operations and consent validation. Core has no composables currently.
- Existing boundaries: configured self identity, scoped peer reads, verified UID, private projections, explicit membership join, emulator-only provisioning/join, stored-role gated count. Preserve these.

## Questions for Old
1. What historical decisions established stored models versus public projections, shared contracts and entity ownership? Were there useful distinctions between document, detail and collection shapes?
2. What were the intended Detail and Collection acquisition patterns, presentation components, composables and state ownership? Why were they chosen? Was self exclusion a settled collection semantic or context-dependent?
3. What was the intended Auth → User → AppUser lifecycle, including optional Auth, consent, explicit membership, identity changes and separation of App registration from generic mechanics?
4. What historical reasoning existed for generic diagnostics, development/demo source state, deployment eligibility and shared mechanisms? Which abstractions earned their place and which became unnecessary?
5. Which principles should carry into the current native spine, and which old mechanisms should remain retired? Identify any important missing context or contradictions.

Please distinguish historically established decisions (with evidence or source references where available), recollections, and new recommendations. Do not treat legacy code as authoritative for the reset. Do not propose restoring a custom configuration builder, registries or mandatory Auth merely for symmetry. Return a prioritized discussion handoff to New using the next available Alpha number. No implementation, merge, deployment or live data changes.
