# Sharer context

Updated: 2026-09-11
Ref: 53fa40ee6
Role: living context
Scope: Sharer ecosystem identity, sharing profiles, tenant Apps, and branded PWA boundary

## Inheritance

This context inherits `AGENTS.md` and `docs/ai/gpt-context.md`. Product wording
also follows `docs/concepts/product-language.md`; App identity and runtime
assets follow `docs/concepts/theming.md` and `docs/concepts/brand-assets.md`.

## Purpose

Keep Sharer a first-class ecosystem for persistent personal sharing profiles
and customer-owned branded PWAs without moving QR transport into the ecosystem
or treating a tenant App as a cosmetic profile theme.

## Scope and ownership boundaries

- `sharer` is the stable package, project-routing, database, and ecosystem key.
- Sharer owns sharing profiles, ordered public links, public profile doorways,
  the free Sharer-branded experience, and the commercial tenant-App boundary.
- Sharer may enrich a supported social link from that link's public platform
  identity. Enrichment is server-owned, optional, and must never require a
  second administrator-entered URL or prevent the base link from rendering.
- Cross-platform enrichment uses one sparse normalised metrics contract.
  Missing values remain absent, source capture times remain explicit, and
  reported follower totals must never be described as unique audience.
- The public profile route family is `/shared/**`; it uses no ordinary App
  layout by default. Tenant roots may select the same naked presentation.
- A premium customer receives a genuine tenant App with its own App identity,
  PWA assets, Firebase Hosting target, and project registration.
- Go QR remains the reusable QR provider. Sharer owns the meaning and target of
  each QR; it does not duplicate QR encoding or provider transport.
- User identity remains Core-owned. Sharer may reference a User but does not
  duplicate authentication identity or silently turn a mutable User avatar
  into an App icon.
- Sharer's development Firestore template selects the shared Core open policy
  described in `docs/ai/firestore-mutations-context.md`. It permits direct public
  CRUD, including identity records; retained identity and Share Profile policy
  fragments are inactive. Product permissions must be restored and tested
  before shipping; server handlers retain their own checks in the meantime.
- Public Share Profile viewing and QR generation do not require Authentication.
  Sharer and its tenant Apps enable Core Authentication only when an owned
  management or member capability is provisioned; ownership checks belong on
  those private writers, never on the public profile reader.
- Tenant App configuration, including its public sharing links, belongs to the
  persisted App and Share Profile records and is managed by App administrators.
  Runtime developer identity bootstraps and diagnoses the App but is not the
  tenant's everyday content-management role.
- Admin presentation follows data scope rather than package provenance: the
  Sharer package supplies the Share Profile capability, while a
  `share_profiles/{appId}` record is presented as configuration for that App.
  Ecosystem-wide controls and generic FireUX App controls remain visibly
  separate.
- App brand assets remain App-owned under `public/img/app/*`. A tenant supplies
  the complete standard App bundle, including favicon and 192/512 PWA icons;
  Core assembles the versioned manifest from that bundle and the tenant's App
  identity and semantic palette. Tenant identity is not borrowed from the
  Sharer global App and tenants do not add project-local manifests.

## Authority and current source

Use this order:

1. `packages/ecosystem/fireux-sharer/src/module.ts` and `src/config/**`.
2. `projects/sharer/sharer-app` and `projects/sharer/kjordi` App source.
3. `packages/ecosystem/fireux-sharer/src/config/firebase/ecosystem.config.ts`,
   its sibling `firestore.template.rules`, and App-owned manifests and
   deployment configuration.
4. `docs/concepts/sharer.md`.
5. This context.

## Refresh process

Before Sharer work, inspect the ecosystem package, both registered Apps, the
nearest current ecosystem and tenant sibling, Go QR provider boundaries, and
the relevant source-owned tests. Update this context when the stable key, product
ownership, free-versus-tenant boundary, QR dependency direction, or branded
PWA contract changes. Keep temporary launch tasks and individual profile data
out of living context.

## Verification expectations

- Build or type-check `fireux-sharer` after package contract changes.
- Inspect affected module/layer registration and run relevant source-owned tests.
- Run focused smoke checks for the Sharer and Kjordi root routes.
- Run `git diff --check` before handoff; the former guard suite is removed.
- Verify remote Firebase Auth before enabling a private management or member
  capability. Both Apps bind to the declared `sharer-ecosystem` Firebase
  project; Kjordi does not own a second Auth backend. An Identity Toolkit
  `CONFIGURATION_NOT_FOUND` response means that project Authentication is not
  initialized and cannot be repaired in tenant UI or Firestore Rules. Verify
  the named database, Hosting targets, and the actual deployment procedure
  separately when those remote resources change.
- Auth and the named `sharer` Firestore database are ecosystem-owned backend
  resources. The former backend deployment command and generated configuration
  were removed; no supported repository replacement exists. Retained ecosystem
  bindings and Rules templates are source evidence, not a runnable release
  procedure. An authorized release still requires exact-target validation,
  backups and deployed-source verification from the mutation context; tenant
  Hosting configurations must not duplicate backend authority.
- Tenant server integrations bind credentials through Firebase Functions
  secrets declared by the tenant deployment configuration; API keys must not
  be written into runtime manifests, public configuration, or generated output.

## Living-context maintenance

Keep this file source-directed and durable. Update repo-wide context only when
a Sharer decision becomes a FireUX-wide rule. Point to current source, available
tests, and `docs/concepts/sharer.md` instead of copying implementation details or task
history here.
