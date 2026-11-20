# FireUX Core · Ecosystem provisioning — walking handoff

**Date:** 2026-11-20
**Repository:** `fireuxlabs/fireux-mono` · **Branch:** `main`
**Status:** Operator-approved architectural direction; implementation awaits Codex.
**Depends on:** [Core reset build order](2026-11-20-fireux-core-reset-build-order.md), Stage 2 (App accepted; Ecosystem provisioning open).
**Starting checkpoint:** `119ae9f22b283a84612d7a29659f29c22b5aab82` — Project-optional Ecosystem reads and portal projections. Reinspect current HEAD and working tree before editing.

## Decision from the operator conversation

FireUX **Ecosystem** is the shared Firebase-backed home for an App family, conceptually corresponding to a Firebase project and its identity/data boundary. An Ecosystem **may contain zero Apps**; provisioning must not require a child App to exist. More than one App may belong to an Ecosystem, and Apps in that family may use shared Firebase Authentication identity, subject to actual domain/session configuration.

Do **not** confuse the Firebase **project ID** (infrastructure configuration) with a FireUX **Project** (optional developer-management Entity in `fireux-projects`). The existing `Ecosystem.project_id` is an **optional FireUX management relationship**, not the Firebase project identity or a prerequisite of an Ecosystem.

App is an **entry point / presentation and product boundary**, not inherently a single kitchen, customer, tenant, or Workspace. Workspace is an optional management experience; Kitchen is a domain Entity, managed through authorization that must be checked independently from App membership. A single App can expose several authorized Kitchens, and a Kitchen may have multiple Apps/surfaces that can access it with appropriate authority.

Example product journey: a restaurant starts in shared Misebox, later pays for a branded App within the same Misebox Ecosystem; an executive chef may access several kitchens in the general Misebox management App; a head chef may access one kitchen through its branded App; an operator may manage many customers' kitchens. A larger customer may commission a branded multi-kitchen management portal. This does **not** require creating a new Ecosystem for every branded App. Moving to a *different* Firebase project/Ecosystem is a distinct data and identity migration project, **not** part of this handoff. Shared Firebase Auth user records do **not** guarantee a shared browser login session across separately hosted domains. Do not promise cross-domain SSO here.

These are **architectural invariants**, not a request to implement multi-kitchen navigation, cross-App grants, paid plans, portal cloning, or automated App creation now. Keep Core ignorant of Kitchen and billing.

## Verified current seam on main (inspect again before editing)

- `packages/core/fireux-core/src/runtime/ecosystem/models/ecosystem.model.ts` has optional `project_id`; the canonical read, directory and public details now work without it.
- `packages/core/fireux-core/src/runtime/ecosystem/server/identity/provision.ts` still requires `projectId`, compares existing `project_id` to it, and creates a Project-linked Ecosystem via a trusted transaction. It accepts a `checkPrerequisites` callback.
- `packages/core/fireux-core/src/runtime/app/server/initialization/initialize.ts` only provisions Ecosystem during the old specially configured Project-linked Main App bootstrap. Project-free App initialization currently requires an *already existing* Ecosystem.
- The FireUX developer portal's Project management requires an **exact stored Project relationship match**. Do not relax it.

## Codex: next bounded implementation slice — Ecosystem provisioning

1. Read `AGENTS.md`, `docs/ai/gpt-context.md`, the Core reset handoff, the Stage 0 audit, and the current source/tests/callers of the provisioning, App initialization and Project-management commands. Check git status and current `main`. Map the **trusted actor/entrypoint** that legitimately creates an independent Ecosystem before any App exists; separate this from ordinary public self-signup or App membership. Prefer the simplest existing trusted server/owner workflow. **Do not invent a new generic provisioning platform, dashboard, or CLI** unless source inspection shows an existing supported owner; document any missing caller honestly.
2. Give Core one coherent **trusted Ecosystem creation contract**: accept an independent Ecosystem with no FireUX `Project` link, or a deliberately Project-linked Ecosystem where the caller is authorized for that link. Keep inputs validated (document id/name/description), audit stamps canonical, and creation atomic. Existing records must be **idempotent only when identity and requested linkage agree**; conflicting linkage or invalid/noncanonical existing identity must fail closed, not be silently adopted or overwritten. A Project-free request must not claim, convert, or unlink an existing Project-linked Ecosystem. Preserve existing data and references.
3. Keep the existing **Project-linked Main App bootstrap** and FireUX portal's exact Project scope intact. Ordinary Project-free App initialization still requires a known Ecosystem unless an explicitly trusted, independently verified creator provisions it first. No arbitrary authenticated App user should be able to create/manage Ecosystems. Avoid treating a missing projectId as authorization to provision.
4. Prove a standalone Ecosystem can be created **with zero Apps**, then read back through the canonical reader and directory projection. Cover retry/idempotency, simultaneous create/race, malformed inputs, existing Project-linked conflicts, existing unlinked conflicts, authorization/prerequisite failure, and the original Project-linked path. Use synthetic local data/emulators or focused fakes. Preserve server-only permissions and no unwanted mutation to Firestore/Storage.
5. Run focused Core and owning-portal tests, Core typecheck and relevant Nuxt prepare/registration checks; record exact results. Add a bounded signed-in/emulator journey if an existing harness supports it; otherwise explicitly leave that gate open, not invented. Document remaining deployed/named-database gaps.
6. Update the **existing** Stage 2 Core reset handoff/checklist and relevant canonical documentation to reflect verified behavior, including the distinction between Firebase project identity and optional FireUX Project relationship. No competing canon. Commit the implementation and updated docs, then **push to `origin/main`** through the repository's established save workflow. Verify remote HEAD and report SHA, tests, outstanding gates and working-tree status. **Stop and stand by**; do not begin User, AppUser, Workspace extraction or Kitchen.

## Acceptance boundaries

- A Project-free Ecosystem exists independently with **zero Apps**, via a **guarded trusted owner** and canonical persisted identity.
- The Core Ecosystem contract does not require an optional FireUX Project.
- A legitimately Project-linked Ecosystem retains its exact Project management authorization and record semantics.
- Existing membership, User identity, App→Ecosystem relationship, reverse App locators and stored Project links remain intact.
- Neither App identity nor Ecosystem identity implies permission to access arbitrary Kitchens. Avoid a 1 App = 1 Kitchen assumption.
- No automatic Firebase project creation, cross-project migration, new cross-domain SSO, generic multi-tenant system, paid-plan code, Workspace extraction or production deployment in this slice.

**Handoff method:** One bounded slice; verified commit and push; report; stand by for the next walking review.
