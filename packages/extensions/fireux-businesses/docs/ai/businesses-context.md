# Business context

Updated: 2026-11-05
Role: living context
Scope: Business identity, Workspace and migration from Company

## Purpose and inheritance

Inherit root `AGENTS.md` and `docs/ai/gpt-context.md`. Business is the reusable
organisation managed by a User through a Workspace. Business identity is
independent of subscription tier. A Business can use Free.

## Ownership and authority

`fireux-businesses` owns the independent `businesses` root, profile commands,
optional Place links, membership-bound Business access and the organisational
Team roster. Place owns locations. App owns branding, deployment and membership.
Bookings owns its reusable lifecycle and provider operations. Core owns the
Workspace shell, selection, membership lifetime checks and shared Team controls.
Roster membership alone never grants account access. The existing Place-based directory contribution used by Jobs and Supplier selection creates a root-managed Business identity only, without Team or access grants. An employee recording an employer does not become its operator. Managed Workspace creation is the separate root/Team/access transaction. It honors the App's explicit Workspace creation policy and `business` capacity. The shared creation control counts retained membership grants, including missing roots. Team capacity is separately configured as `business.team`. Current protected commands
require current App membership and its exact Business access grant, and validate
management scope. Business profile fields do not confer a Business subscription.

## Current sources

- `src/module.ts` and `src/config/module`: registration and native layer.
- `src/runtime/business/models` and `utils/normalize-business.ts`: independent root, storage identity and browser-safe canonical validation.
- `src/runtime/business/server/create.ts`, `update.ts`, `profile.ts`: trusted
  creation, profile validation and location-link changes.
- `src/runtime/business/server/team`: authority and roster commands.
- `src/runtime/business/server/mutation-targets.ts`: root, Team and access targets.
- `src/runtime/business/composables/useBusinessWorkspace.ts`: selected authorised
  collection and captured browser command intent.
- `src/runtime/business/components/Workspace`: profile, locations and roster tools.
- `src/runtime/pages/workspace/business`: Core-framed Workspace entrance.
- `tools/workspace-migrations/business-identity.mjs`: offline source-to-destination
  plan retaining preimages. It does not connect to Firebase or apply writes.

## Migration boundary

Company's former same-id Place role is retired from active package APIs.
Legacy `companies` records and `company_id` fields require an explicit data
cutover. Keep ids when converting records so existing references remain stable,
copy public business identity from the former Place, and retain that Place as an
explicit location. Never infer Business access from a public Company marker,
Place attribution or Team roster. Operators must supply reviewed membership-bound
ownership. Refuse destination collisions. Copy, verify and retirement are separate
operations. No runtime fallback reads old Company records.

## Refresh and verification

Before changing scope, inspect the model, authority, native registration, real
Suppliers/Jobs consumers and the first App. Verify source-owned Business tests,
affected consumer tests, package build and App typecheck. Test membership
revocation, cross-App targets, creation retries and profile field validation.
Rendered checks establish the UI only; fixtures do not prove deployed Rules,
real membership or live Calendar integration. No live migration or deployment is
implied by source changes.

## Living maintenance

Update this context with stable owner, source or verification changes in the same
patch. Keep transient task state and chat history out. Global context changes
only for repo-wide rules; AGENTS.md remains the sole scope router.
