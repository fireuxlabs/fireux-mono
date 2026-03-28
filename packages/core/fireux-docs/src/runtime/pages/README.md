# Pages Directory

Authority: Operational
Updated: 2026-03-28
Scope: `packages/*/fireux-*/src/runtime/pages` and child directories under `pages/*`.

Learn how FireUX runtime pages are grouped, which create surfaces matter first, and which entity buckets are still being deferred.

## Pages Directory

`runtime/pages/` contains package-delivered Nuxt route surfaces.

This directory can contain:
- public entity pages
- console workspaces
- dashboard workspaces
- admin surfaces
- system routes such as auth, docs, and legal
- dev-only package pages

Pages are a delivery layer, not a second package architecture.

Route ownership matters more than visual similarity.

Implementation notes for specific page trees belong beside the real owning package or app.
This README stays at repo and directory level only.

## Current Focus

The pages pass has done its first job:
- identify the real create owners
- separate public create, console create, setup-if-missing, and ensure-first routes
- clarify which entities are still deferred

The active seam has now moved down into components.

Why:
- create behaviour is mostly implemented in `runtime/components/**/Create/System.vue`
- many route pairs already share the same create system under the page shell
- the next alignment question is about component behaviour, not route naming alone

Use this README to understand route ownership.
Use `packages/core/fireux-docs/src/runtime/concepts/create/README.md` for create canon.
Use `packages/core/fireux-docs/src/runtime/concepts/connect/README.md` for relationship and authority canon.
Use `packages/core/fireux-docs/src/runtime/concepts/console-entry/README.md` for family-entry canon.
Use `packages/core/fireux-docs/src/runtime/components/README.md` to understand current create-system families.

## CRUD Lens

For the current alignment pass, start with `create`.

Do not group pages by filename alone.
Group them by:
- owner
- audience
- public versus operational role
- whether creation is normal, setup-if-missing, or ensure-first

## Create Modes

### Normal Create

A form-driven create surface that makes a new root or admin-managed record.

Examples:
- `places/create.vue`
- `companies/create.vue`
- `jobs/create.vue`
- `admin/blogs/create.vue`
- `admin/products/create.vue`

### Public Console Create

A public create surface for a console entity.

This page creates the root canonical console record:
- `/kitchens/<kitchenId>`
- `/portfolios/<portfolioId>`
- `/suppliers/<supplierId>`

Examples:
- `kitchens/create.vue`
- `portfolios/create.vue`
- `suppliers/create.vue`

These pages create the console entity at root.
They do not need to create the app overlay every time.

### Setup-if-missing

A role or identity setup surface that creates the record if it does not exist yet.

Examples:
- `dashboard/chef/profile.vue`
- `dashboard/agent/profile.vue`
- `dashboard/professional/profile.vue`

These are not ordinary public CRUD pages.

### Ensure Create

A state-driven create surface that is idempotent and safe to run multiple times.

Examples:
- `users/create.vue`
- `apps/create.vue`

These pages should:
- inspect current state first
- create only when missing
- repair missing overlays or bootstrap state where needed
- avoid behaving like free-form record creation

### Console Ensure Create

A console-owned create surface that ensures the app-scoped console overlay.

This page should:
- ensure the root public entity exists
- create the root public entity first if it is missing
- ensure the app-scoped console overlay

Examples:
- `console/kitchen/create.vue`
- `console/portfolio/create.vue`
- `console/supplier/create.vue`

This is the operational onboarding path for consoles.

For console-backed domains, the structural rule is:
- public page creates the root public entity
- console page ensures the app-hosted console overlay
- child records for that console live beneath the app-hosted overlay, not beside the root entity

### Relationship / Link Surface

A relationship surface connects a person, team, company, or profile to an entity.

It means:
- association
- history
- membership
- affiliation

It does not mean:
- console overlay creation
- console authority

This is where labels should prefer:
- `Link X`
- `Add X To Profile`
- `Assign X`

Avoid calling these surfaces `Create X` or `Activate X Console`.

## Console-backed Entry Pattern

Console-backed families should be read in this order:

- `/console`
  - choose the family
- `/console/X`
  - choose instance, mode, or create console
- `/X`
  - public discovery plus the same chooser when useful
- `/X/create`
  - public create
- `/console/X/create`
  - console create

Kitchen is currently the clearest proof of this pattern.

Console visibility is now app-config driven:
- each app declares visible families with `consoleFamilies`
- `/console` should only show those declared families
- route registration alone is not the visibility contract

Main console page ownership is now read like this:
- `Project` main console pages are core-owned
- `Kitchen`, `Portfolio`, and `Supplier` main console pages are domain-owned
- app and ecosystem packages may still own child pages when those are delivery-specific

## Three Truths Of Console-backed Domains

For console-backed families, a cold reader should always separate:

- `Create X`
  - create the public entity
- `/console/X/create`
  - ensure the app-hosted console overlay
- `Link X`
  - relationship only

On entry CTAs, the button label may still stay simply `Create X`.
The route is what carries the distinction.

This applies to:
- `Kitchen`
- `Portfolio`
- `Supplier`
- `Project`

## Current Entity Buckets

### Important Platform

These matter now because they can block onboarding or recovery.

- `User`
  Current create surface: `users/create.vue`
  Type: ensure-first create
- `App`
  Current create surface: `apps/create.vue`
  Type: ensure-first create

### Deprioritized Developer-managed Platform

These are real entities, but they are not part of the active create-page alignment pass.

- `Ecosystem`
  Current state: mutation exists, but no live canonical create page
  Current concern: developer, scaffolder, or project-console guided work
- `Module`
  Current state: mutation exists, but no live canonical create page
  Current concern: registry, developer, or manual management

These are still system entities, but they are not blocking shipping right now.

### Profiles

Important identity entities that create through setup-if-missing surfaces.

- `Chef`
  Current create surface: `dashboard/chef/profile.vue`
- `Agent`
  Current create surface: `dashboard/agent/profile.vue`
- `Professional`
  Current create surface: `dashboard/professional/profile.vue`

### Consoles

Important operational entities people enter and manage.

- `Kitchen`
  Public create: `kitchens/create.vue`
  Console create: `console/kitchen/create.vue`
  Canon: public create makes root kitchen, console create ensures app kitchen
- `Portfolio`
  Public create: `portfolios/create.vue`
  Console create: `console/portfolio/create.vue`
  Canon: public create makes root portfolio, console create ensures app portfolio
- `Supplier`
  Public create: `suppliers/create.vue`
  Console create: `console/supplier/create.vue`
  Canon: public create makes root supplier, console create ensures app supplier

Project now follows the same console rule:
- public create makes the root project
- console create ensures the app project overlay
- relationship and membership stay distinct from console authority

### Other Root or Admin-created Entities

Important entities that are neither system bootstrap nor console identity.

- `Place`
  Current create surface: `places/create.vue`
- `Company`
  Current create surface: `companies/create.vue`
  Type: normal payload create
- `Job`
  Current create surface: `jobs/create.vue`
- `BlogPost`
  Current create surface: `admin/blogs/create.vue`
- `Product`
  Current create surface: `admin/products/create.vue`

## Page Families

### Console

Where people operate.

Examples:
- `kitchens/`
- `portfolios/`
- `suppliers/`

Console page delivery normally has two faces:
- a public or shareable route surface
- an operational workspace under `console/<console>/...`

Important:
- route delivery may say `console/<console>/...`
- stored truth for that operational workspace is still app-scoped
- the console itself is not a root entity
- for console-backed domains, think:
  - root public entity
  - app-hosted console overlay
  - app-owned child records

### System

What makes FireUX run.

Examples:
- `apps/`
- `docs/`
- `auth.vue`
- `legal/`

System pages are route surfaces for platform behavior, access, documentation, or system-managed records.

### Domain Root

What exists independently of a console.

Examples:
- `companies/`
- `places/`
- `jobs/`
- `products/`
- `blog/`

These pages usually expose public discovery, detail, and entry routes around canonical root entities.

### Identity

Who is using the system.

Examples:
- `users/`
- `chefs/`
- `agents/`
- `professionals/`

Identity pages are usually:
- public listing and detail routes
- dashboard setup or edit routes
- admin or moderation routes only where needed

### Scoped Operational

What only exists because a console owns it or because a user is operating inside one.

Examples:
- `console/kitchen/...`
- `console/portfolio/...`
- `console/supplier/...`
- `dashboard/chef/...`
- `dashboard/agent/...`
- `dashboard/professional/...`
- `dashboard/supplier/...`

These pages are not global entity truth.
They are operational delivery surfaces tied to a console or a user workspace.

## Alignment Families

### Ensure Create Family

These are create pages in the route tree, but they are not normal CRUD create surfaces.

- `packages/core/fireux-core/src/runtime/pages/users/create.vue`
- `packages/core/fireux-core/src/runtime/pages/apps/create.vue`

Shared pattern:
- read active auth or runtime state first
- call the existing ensure/bootstrap logic
- create only when missing
- safe to run multiple times
- act as recovery and onboarding fallback, not free-form content creation

### Console Create Family

These are the clearest current family for operational console creation pages:
- `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/create.vue`
- `packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/create.vue`
- `packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/create.vue`
- `packages/core/fireux-core/src/runtime/pages/console/projects/create.vue`

Shared pattern:
- `layout: 'console'`
- `UDashboardPanel`
- `LayoutsConsoleNavbar`
- a `*CreateSystem` surface in the panel body

Behavioral rule:
- ensure the app-scoped console overlay
- create the root public entity first when missing
- act as the true operational onboarding path for the console

### Setup-if-missing Identity Family

These are not public create pages, but they are active creation surfaces for identity records:
- `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/profile.vue`
- `packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/profile.vue`
- `packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue`

Shared pattern:
- dashboard role workspace
- inspect existing record first
- create only when missing
- then switch into edit or preview mode

### Public and Admin Create Surfaces

These are real create pages, but they are not aligned enough yet to be one locked family:
- `packages/extensions/fireux-places/src/runtime/pages/places/create.vue`
- `packages/extensions/fireux-companies/src/runtime/pages/companies/create.vue`
- `packages/extensions/fireux-jobs/src/runtime/pages/jobs/create.vue`
- `packages/extensions/fireux-blogs/src/runtime/pages/admin/blogs/create.vue`
- `packages/extensions/fireux-products/src/runtime/pages/admin/products/create.vue`

These should be reviewed as a mixed bucket after the platform and console create families are settled.

### Public Console Root Create Surfaces

These are public create pages for console entities:
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/create.vue`
- `packages/extensions/fireux-properties/src/runtime/pages/portfolios/create.vue`
- `packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/create.vue`

Behavioral rule:
- create the root canonical console record
- stay distinct from console overlay enablement

Current repo truth:
- `Kitchen`, `Portfolio`, and `Supplier` now intentionally reuse one create system per console
- the behavioural split is carried by `mode="public"` and `mode="console"` rather than separate create components

### Edit Family Later

Public entity edit pages still matter, but they are not the current first pass.

Current family:
- `packages/extensions/fireux-companies/src/runtime/pages/companies/edit/[id].vue`
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/edit/[id].vue`
- `packages/extensions/fireux-places/src/runtime/pages/places/edit/[id].vue`

## Child Directories

Child directories under `pages/*` are in scope for this directory.

Important rule:
- child directory names are delivery seams
- they are not the primary canon

The primary canon for pages is:
- route family
- owner or audience
- public versus operational role
- path shape

Current child-dir notes:
- entity directories such as `kitchens/`, `jobs/`, and `places/` are a strong pattern
- `console/` and `dashboard/` are also strong patterns, but they serve different roles
- `admin/` is valid where privileged management is real
- `dev/` is intentionally non-canonical
- nested `edit/`, `admin/`, and dynamic `[id]` or `[slug]` directories should stay shallow and practical

## Local Notes

Local implementation notes should live with the real owning page trees.

Examples:
- `packages/core/fireux-core/src/runtime/pages/users/README.md`
- `packages/core/fireux-core/src/runtime/pages/apps/README.md`
- `packages/extensions/fireux-companies/src/runtime/pages/companies/README.md`
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/README.md`
- `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/README.md`
- `packages/extensions/fireux-places/src/runtime/pages/places/README.md`
- `packages/extensions/fireux-properties/src/runtime/pages/portfolios/README.md`
- `packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/README.md`
- `packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/README.md`
- `packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/README.md`

## Not Aligned Yet

- `User` and `App` now have create routes, but they are ensure-first and should not be mistaken for normal public CRUD
- `Ecosystem` and `Module` still do not have live canonical create pages
- `jobs/create.vue`, `places/create.vue`, `admin/blogs/create.vue`, and `admin/products/create.vue` are all valid create surfaces, but they do not yet form one stable family
- `kitchens/create.vue`, `portfolios/create.vue`, and `suppliers/create.vue` now have a clearer canon role as public root create pages, but their implementations are not equally separated from console create yet
- setup-if-missing identity pages still create through profile workspaces rather than explicit create routes

## Roadmap To Reconciliation

1. Start with create before edit.
2. Lock the ensure-create family for `User` and `App`.
3. Lock the public-console-create rule for `Kitchen`, `Supplier`, and `Portfolio`.
4. Lock the console-create family for `Kitchen`, `Supplier`, and `Portfolio`.
5. Review profile setup-if-missing pages as their own family.
6. Review public and admin create pages as a mixed bucket.
7. Leave `Ecosystem` and `Module` out of the active create-page pass until they become real product surfaces.
8. Return to edit-family alignment after create surfaces are stable.

## Short Version

Start with create.

Right now the important page buckets are:
- `User` and `App` as ensure-first create
- `Kitchen`, `Portfolio`, and `Supplier` as public root create plus console ensure-create
- `Chef`, `Agent`, and `Professional` as setup-if-missing identity create
- `Place`, `Company`, `Job`, `BlogPost`, and `Product` as the next mixed create bucket

`Ecosystem` and `Module` exist, but they are not part of the active create-page alignment pass right now.
