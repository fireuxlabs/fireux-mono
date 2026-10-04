# Optional account connections context

Updated: 2026-10-04
Role: living context
Scope: FireUX hub and the Misebox participant

## Purpose and inheritance

Inherit `AGENTS.md` and `docs/ai/gpt-context.md`. Route recurring work on optional
cross-ecosystem sign-in into its owning source; do not turn generic SaaS identity
terminology into a new local User hierarchy.

## Scope and ownership

FireUX ecosystem User owns the hub connection service at
`packages/ecosystem/fireux-fireux/src/runtime/user/server/connections` and its
live account surface under that User's components/composables. The FireUX App
owns routes, exact origins, private runtime configuration and the separate
`identity-connections` deployment profile. Misebox App owns its participant at
`server/user/connections/fireux.ts`, Auth provider adapter and callback screens.
Core User owns the product-neutral handoff primitives, authenticated peer
transport, scoped client continuation and account confirmation control.

FireUX's account presentation is App-owned at
`projects/fireux/fireux-app/app/components/Account/Profile.vue`, entered through
its own Dashboard account route. It exposes login identity and avatar rather
than requiring handle, biography or another public-profile setup. It reuses Core
`user/components/Edit/Avatar.vue` and the existing self-only avatar command;
other Apps retain Core's full profile editor. Existing local User fields and
avatars stay compatible. This is presentation over the FireUX ecosystem's User,
not a new universal User model or an automatic profile-sharing policy.

This first integration supports the two existing un-tenanted Firebase Auth realms.
A participant is explicitly approved; adding an ecosystem is a real integration,
not a browser-selected Firebase project or redirect URL. Ordinary Auth navigation
remains Core Auth System-owned, including the retained internal destination.
Participant fallback/restart links keep that destination. An unconnected hub
journey carries a validated return to its original continuation through explicit
connection setup; it never grants access or accepts an external return URL.

## Authority

A link requires recent ownership proof of both existing Auth accounts and the
original hub/browser binding. Accounts are identified by their owning Auth realm
and UID, never matching email. The hub commits the link and reverse uniqueness
atomically in its separate server-only database. Ordinary development-open
databases cannot hold this login authority. Never add a fallback to them.

The server-to-server peer credential is private. One-use sign-in codes are bound
to the approved participant, destination browser proof and current link revision.
The participant checks that the local Auth account and canonical User still exist
before minting its own-project custom token. Disabled hub/local accounts and hub
session revocation are checked. Existing local profiles, AppUser membership,
subscriptions and workspace grants are untouched; linking creates none of them.

Disconnect blocks future exchanges, including previously issued unredeemed codes.
It does not revoke existing local sessions or undo an already authorized exchange.
Client intent invalidates on account, route and disposal epochs; server commits
remain real even when a caller no longer displays their result.

## Refresh and verification

Read the actual hub protocol, handlers, store, participant and route consumers
before changes. Verify concurrent uniqueness, expiry, code replay, browser
binding, revoked/disabled accounts, wrong-project binding, cancellation, account
switches and retained destinations through the source-owned tests. Prepare and
Vue-typecheck both Apps for registration changes. Use the deployment profile's
README for separate signed-in/browser and cloud activation acceptance.

## Living maintenance

Current source and executable checks outrank this context. Update it with stable
scope, ownership or authority changes in the same edit, and adjust the scope router
only in root `AGENTS.md`. Keep temporary progress, credentials, chat history and
unproved rollout claims out. Public product copy does not grant sign-in authority.
