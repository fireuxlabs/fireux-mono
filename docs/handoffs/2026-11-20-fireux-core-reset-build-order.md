# FireUX Core — Greenfield Build Order & Architectural Reset

**Date:** 2026-11-20  
**Repository:** `fireuxlabs/fireux-mono` · **Target:** `main`  
**Status:** Operator-approved *architecture and Codex implementation handoff*. The handoff commit is documentation only; it does not claim that Core has been rebuilt or Workspace extracted.

## Operator decision

Stop repairing the accumulated architecture just because downstream unfinished Apps rely on it. **Design FireUX Core as we would if building it for the first time, then make the current library conform to that simpler design.**

The operator explicitly accepts **temporary source-code breakage** in Misebox, Granite and other unshipped Apps while completing a bounded architectural cutover. Remove redundant code and outdated compatibility layers instead of protecting complexity. Do **not** interpret that freedom as authority to delete Firestore/Storage data, weaken authentication/authorization, deploy, change provider resources, or irreversibly mutate customer records.

This comes **before** rebuilding Kitchen Core, Items, Menus, Services and Orders. The same discipline applies as for Kitchen: **build in dependency order; check off one complete spine slice before touching the next.**

### North star

- **Nuxt provides the technical spine:** native pages, layouts, components, composables, middleware, plugins, server, utilities and the framework's conventional entrypoints.
- **FireUX adds domain ownership:** first-class Entity roots only where the concept has its own identity, lifecycle and responsibility; their *needed* technical roles follow the Nuxt-style pattern. No recursive Entity spines.
- **Core owns universal machinery:** identity, App foundations, Firebase/Auth/Firestore primitives, neutral UI and shared tools useful without any specific industry or optional Workspace.
- **Optional packages own optional experiences:** Workspace manages an Entity; domain packages own their business rules and data. Something being shared by two features does **not** automatically make it Core.
- **Upstream remains ignorant of downstream:** Core must not import or assume Project, Kitchen, Menu, Orders or Workspace. Workspace may depend on Core; Kitchen may depend on Workspace; never the reverse.

**Working rule:** correct ownership, placement, naming, dependencies, registration, authorisation, tests and a working consumer all count toward “done.” Merely passing a typecheck or creating tidier-looking folders does not.

## If we built Core from scratch — ordered checklist

### 0 — Inspect reality and draw the dependency map (do not redesign while blind)

- [ ] Inspect current `main` checkout, `git status`, active owners, actual imports, generated Nuxt registration and source-owned tests. Preserve concurrent changes.
- [ ] Inventory `packages/core/fireux-core/src/runtime` and `src/config` by **actual responsibility**, not by file count.
- [ ] Classify existing contents as **native Nuxt entrypoint**, **universal Core utility**, **Core-owned Entity**, **Entity-owned supporting Record**, **optional Workspace**, **optional domain**, **obsolete/duplicate**, or **unresolved**.
- [ ] Produce an exact path → owner → consumers → decision (keep, move, simplify, delete) matrix. Name any internal import from Core into an optional package, or any implementation that owns two competing authorities.
- [ ] Document a **Core-only reference App**, plus a **Workspace-enabled reference App** that will prove the extraction. Choose existing maintained consumers rather than scaffolding pretend Apps unnecessarily.

**Exit:** a precise, reviewed cutover map, including what temporarily breaks. This is the first meaningful Codex output.

### 1 — Establish the minimal Nuxt/FireUX package spine

- [ ] Retain Nuxt's required top-level layout, route, server/API, middleware, plugin and module/layer registration boundaries.
- [ ] Keep Core shared components, composables, validators, Firestore/auth helpers and other technical primitives in their actual role directories, with one clear owner.
- [ ] Follow the existing FireUX entity-root pattern: `runtime/<entity>/{models,components,composables,server,utils,...}` **only for roles that exist**. No empty scaffolds, parallel registries, arbitrary `features/` buckets, proxy composables or generic mega-controller.
- [ ] Keep App-owned and User-owned functionality under their respective roots, not global technical buckets merely because it is used often.
- [ ] Check conventions against Nuxt 4 registration, naming, auto-imports, module/layer setup and package exports; remove retired paths and registrations **with** their consumers.

**Exit:** a new developer can locate each Core responsibility by one predictable path, and Core compiles under its intended standalone package contract.

### 2 — Prove the three Core root Entities, one at a time

- [x] **App:** canonical model, App identity and configuration, initialization, exact/public readers, guarded commands and owned supporting records. Prove creation/lookup/update where actually supported.
- [ ] **Ecosystem:** canonical ecosystem identity, its App relationship, independent reader/commands and evidence of its true owner. It is not a copy of the FireUX developer portal.
- [ ] **User:** canonical person identity, private account support with its own privacy boundary, authentication/setup and independent readers/commands. The same person exists across Apps.
- [ ] Reuse shared stamp/value primitives; **do not** introduce one universal Entity superclass or automatically copy a root model across domains.

**App verification, 2026-11-20.** The focused App suite and installation gate
passed. A Project-free Nuxt fixture used the actual Core App shell, Auth and
Dashboard routes with synthetic accounts in the local Firebase Auth and
Firestore emulators. The administrator signed in, passed the App membership
guard, and saved a tagline through the App editor. The canonical App endpoint
returned the saved text and actor stamp. Sign-out cleared access and revisiting
the protected route required authentication. A signed-in basic member was
redirected away from the admin screen and the edit endpoint returned 403. The
saved tagline remained intact. The browser used the emulator's default
database. Deployed sign-in, named-database browser behavior and live data
remain outside this evidence.

**Ecosystem read checkpoint, 2026-11-20.** The canonical reader and directory
projection accept an Ecosystem without a Project link. Public App and Ecosystem
details render the Project relation only when a link is present. The FireUX
management portal still requires an exact match with the stored Project link.
Focused tests cover the optional link, rendered App detail, portal scoping and
existing bootstrap checks. Core typechecking and FireUX portal Nuxt preparation
passed. This checkpoint changes source and projections only.

**Ecosystem provisioning checkpoint, 2026-11-20.** Core's server-only command
creates the Ecosystem root atomically in the configured identity database,
with an optional FireUX Project link. The caller must verify authority and
prerequisites even on retry. The command checks the canonical record and exact
linkage before accepting an existing root. For standalone creation, the
name and description must agree. Project-linked Main App configuration
continues to seed copy once and preserves later edits.

All 137 focused tests passed, including Core installation and App composition.
Core typechecking, focused lint and FireUX portal Nuxt preparation passed.
The tests created an independent Ecosystem with zero Apps, read it back
through the canonical reader and directory projection, and exercised a
transaction retry, conflicting linkage, malformed identity and denied
prerequisites. The existing developer-only Main App bootstrap and the
portal's exact Project management filters retain their checks. Ordinary Apps
configured without a Project still require an existing Ecosystem.

**Open · Standalone operator entrypoint.** The Main App initializer remains
the only supported caller. No existing standalone operator workflow was
identified. The standalone command was exercised with focused fakes. Signed-in
standalone provisioning, deployed behavior and named-database verification
remain open. Keep Ecosystem acceptance open until a trusted operator workflow
is identified and verified. No live data or App locators were changed.

**Exit:** App, Ecosystem and User each stand on their own root and shared Core infrastructure. No Project import/authority is necessary for a normal Core App.

### 3 — Simplify AppUser into App-owned membership support

**Agreed product concept:** **User is the person. App membership describes that User's relationship with one App.** Role, subscription and membership lifecycle vary per App, not per person.

- [ ] Inspect `runtime/app/app-user/` models, consumers, access checks, identity/profile uses, commands, routes and registration.
- [ ] Treat `AppUser` as the *existing App-scoped membership record/contract*, not another top-level person or independent root Entity. Keep its necessary authoritative lifecycle, access and subscription data.
- [ ] Where the existing nested `app-user` directory represents an entire second technical Entity spine, collapse/reposition it under **App-owned records and App technical roles**, without creating a sibling top-level `app-user` Entity root merely to preserve historical terminology.
- [ ] Preserve the precise App/User pair identity, existing membership data paths, account session behavior, role/subscription decisions, security checks, public/private projections and trusted server commands unless a separate migration has been explicitly agreed.
- [ ] Delete old wrappers, duplicate AppUser facade paths and stale names only when their real consumers have moved. Update Core docs and tests that currently describe AppUser as a first-class nested Entity.

**Exit:** one canonical User identity plus App-owned membership records; no competing User identity, no duplicate grant owner, no second Entity spine nested in App. An App may have members without Core needing Workspace.

### 4 — Reduce Core to genuinely universal services

- [ ] Prove neutral auth, sessions, Firebase/Firestore reads, guarded writes, server/API boundaries, App config, shared UI and SEO/manifest infrastructure can run without Workspace or a domain extension.
- [ ] Review suspicious cross-domain imports and utility/helpers by **owner and consumer**. Move only those that belong to a named optional package; don't just create a new package as a dumping ground.
- [ ] Keep product/catalogue/public portal presentation in owning App/Ecosystem layers, not Core if Core merely provides generic primitives.
- [ ] Maintain strict Core → external dependencies only; avoid a Core → optional package import cycle.

**Exit:** one small **Core-only App** loads and its canonical App/User/membership journeys function with no Workspace package installed.

### 5 — Extract optional `fireux-workspace` package

This is a **separate explicitly selected implementation slice**, not a reason to keep Workspace in Core indefinitely. The proposed name is `fireux-workspace`; choose its lane and module registration using existing package conventions (likely an extension), not a second hidden Core runtime.

- [ ] Move Workspace-specific selection, selected-record scope guarding, safe switching, management shell/layout, sidebar/nav/breadcrumbs, page framing, optional Team UI/selection and Workspace-owned capability presentation together with their real consumers.
- [ ] Move/register native Workspace layout, components, composables, routes and associated CSS at the new package's actual Nuxt module/layer boundary. Core-only Apps must not import those implementation paths or automatically register Workspace components.
- [ ] Audit Core files that currently call Workspace directly, including `app/composables/useAppManifest.ts` and module wiring/configuration: retain any neutral **App-level contract** required to compose an optional Workspace without a reverse import. Do not subtly break manifests, SEO or regular app navigation.
- [ ] Preserve the **distinction between Workspace Team UI and authority**: Workspace can present a generic Team roster; AppUser membership, User identity and each domain's role/grant/command authority remain owned by their real records and trusted commands.
- [ ] Keep a Workspace a **management surface over an existing Entity**, not another stored `WorkspaceEntity` or general-purpose CRUD super-entity.
- [ ] Verify an existing Core-only App remains functional without Workspace installed; verify a Workspace-enabled reference (Project or Kitchen) with it installed. Check registration, SSR, exact selection/access, navigation, refresh and error states.

**Exit:** `Core → optional Workspace → Workspace-owning domain` is the *dependency direction* (arrows mean “is depended on by”), while Core can genuinely run alone. Moving source without moving Nuxt registration/import boundaries is **not** an extraction.

### 6 — Clean cutover and evidence

- [ ] Remove obsolete folders, duplicate models, stale composables/controllers, aliases and obsolete registrations only after their real consumers have moved.
- [ ] Update the **existing** source-backed maps: `docs/concepts/runtime-filesystem.md`, `docs/concepts/core-models.md`, `docs/concepts/entities.md`, `docs/concepts/workspace.md`, `docs/concepts/family-workspace-entity.md` and routed package contexts as appropriate. Do not create a second canon.
- [ ] Run focused Core source-owned tests for root models, membership, selection, access and scope transitions. Run owning package checks, relevant App prepare/typechecks and a real rendered Core-only plus Workspace App journey.
- [ ] List *exact* surviving broken consumers of optional packages as **known, intentional follow-on repairs**. A broken downstream screen is acceptable during the rebuild; a broken Core-only contract, leaked authority, incorrect data scope or unexamined write is not.
- [ ] Report actual commands and results, not assumptions. For code changes, finish with `git diff --check` and path-level registration/import review.

**Exit:** a checked-off Core architectural baseline, optional Workspace boundary and explicit remaining downstream repairs. **Only then return to Kitchen Core.**

## Operator decision — simplest proof first (20 Nov 2026)

**Verification order:** use the simpler **FireUX Ecosystem and Project portal** as the first real Core/Ecosystem proving ground; complement it with the already established **Project-free Core/App fixture** so that testing a Project-linked FireUX portal does not hide a dependency on Project. Only then test the richer Kitchen/Workspace behavior in **Misebox**, which is the product/domain proof, not the first Core smoke test. Prefer existing maintained fixtures/consumers; do not create a new App purely to inflate coverage.

**Deferred, not forgotten:** the independent Ecosystem server provisioner and zero-App behavior are verified in focused tests, but the *authorized standalone operator creation workflow* and real signed-in/deployed verification remain open. Do not block User, AppUser or Misebox progress on a polished workflow. Reopen **before onboarding/provisioning another independent Ecosystem for real use** or offering Ecosystem creation to operators/customers. Specify authorized operator, trusted entrypoint, real Firebase/project prerequisites, retry/conflict behavior and acceptance checks; do not assume creating a Firestore Ecosystem record automatically creates a Firebase project. Keep the existing FireUX Project-linked portal checks intact.

This ordering is about low-complexity proof, **not** making Project mandatory again, or treating an App as one Kitchen/Workspace/customer. The FireUX Ecosystem can be intentionally simple; Misebox proves the domain complexity later.

## Source-backed initial findings (inspect again before editing)

The following are **observations on committed source, not claims of verified test outcomes**:

| Current owner/path | Finding | Decision to investigate |
| --- | --- | --- |
| `packages/core/fireux-core/src/runtime/app/models/model.ts` | Canonical App root includes `ecosystem_id`. | Keep as App's upstream relationship; App must not depend on Project UI. |
| `packages/core/fireux-core/src/runtime/ecosystem/models/ecosystem.model.ts` | Canonical Ecosystem root has `project_id`. | Review how optional Project references can be kept outside Core's required foundation without losing data or authority. |
| `packages/core/fireux-core/src/runtime/user/models/user.model.ts` | Canonical User public identity and stored audit record. | Keep one person identity; do not duplicate in AppUser. |
| `packages/core/fireux-core/src/runtime/app/app-user/models/model.ts` | AppUser currently owns role/subscription/stamps. | Preserve record but reclassify as App membership support; avoid second Entity spine. |
| `packages/core/fireux-core/src/config/module/components-config.ts` | Core directly registers Workspace components and AppUser components. | Review and cut over registration with the corresponding source. |
| `packages/core/fireux-core/src/module.ts` | Core module directly registers Workspace composables. | Make optional Workspace registration truly opt-in. |
| `packages/core/fireux-core/src/runtime/layouts/workspace.vue` | Native Workspace layout currently resides in Core. | Move with Workspace package and verify route/layout behavior. |
| `packages/core/fireux-core/src/runtime/app/composables/useAppManifest.ts` | App manifest imports Workspace route and entry helpers. | Untangle reverse dependency while preserving app-wide PWA behavior. |
| `packages/core/fireux-core/src/runtime/workspace/composables/useWorkspace.ts`, `useWorkspaceRecord.ts`, `useWorkspaceSwitch.ts` | Shared selection, exact scoped reads and switching already exist. | Reuse logic; relocate ownership without inventing a new framework. |
| `packages/core/fireux-core/src/runtime/workspace/composables/useWorkspaceTeam.ts` | Generic Team selection/capacity/presentation coordination exists. | Move to Workspace; preserve domain membership/grant/commands elsewhere. |

Current docs `core-models.md` and `runtime-filesystem.md` deliberately call AppUser a first-class, nested Entity pending a sibling-root move. **This handoff supersedes that *proposed classification direction* as a product decision, not the current implementation reality.** Codex must evaluate and update the actual consumers and docs during implementation rather than blindly move it to a sibling.

## Invariants — what “breaking everything is fine” means

**Allowed:** delete unshipped application code and dead wiring, temporarily break unfinished apps, change imports/registration, simplify models and file layout, remove unneeded compatibility paths once real consumers are deliberately cut over.

**Not implicitly allowed:** delete or bulk-migrate Firestore/Storage records; delete accounts/membership history; change production provider settings or deployment; circumvent domain authority; expose private User/App context; silently turn missing access into public access; fabricate successful tests. Preserve deployed or shared data even when apps are still prototypes.

Avoid over-engineering: no automatic migration engine, Entity registry, multi-tenant schema rewrite, mandatory generated scaffolds, or new “Core Core” package.

## Codex's first bounded assignment (start here)

1. Read `AGENTS.md`, `docs/ai/gpt-context.md`, relevant current source and ownership maps, this handoff, and actual maintained consumers. Check branch and working tree before edits.
2. Draw the **current and intended Core dependency/ownership tree**, with paths. Identify the precise first independent slice.
3. Begin at the **Core Nuxt spine + three canonical root models**. Propose and execute bounded simplifications where real source confirms they are safe for data/authority—even if they temporarily break downstream source consumers. Do **not** start at Kitchen or Orders.
4. Treat AppUser membership reclassification and Workspace extraction as the next ordered, separately verifiable slices, not simultaneous wholesale renames.
5. At each stage, report *what was removed, where truth moved, what is still broken, and which tests prove the new spine*. If an irreversible data/schema/security action becomes necessary, isolate it for separate explicit authorization.

**Definition of done:** A developer opening Core can tell what is Nuxt plumbing, what App/Ecosystem/User own, where App membership lives, which shared services are universal, and why Workspace is optional—without trawling unrelated domain folders.

## Relation to Kitchen and Ignite

- Continue with [Kitchen real-world build order](2026-11-20-kitchen-real-world-build-order.md) **only after** the Core and Workspace seams are verified.
- The existing [Entity Core & Ignite dependency-flow handoff](2026-11-20-entity-core-ignite-dependency-flow.md) establishes the wider dependency principle. **Ignite remains future-facing**; the immediate method is manual development with operator + Codex. Do not rewrite Ignite during this Core reset.
- This document is the **first Codex job** in the reset sequence, not an invitation to implement every downstream capability in one pass.
