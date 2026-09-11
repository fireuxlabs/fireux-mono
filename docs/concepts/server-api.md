# Server API family

Updated: 2026-09-11
Ref: 4ebf31122
Role: map, not canon

## Purpose

Map the shared shape of FireUX server endpoints without copying every current
route into documentation. Server APIs exist where bounded projection,
authentication, trusted transactions, uploads, secrets, providers, or
cross-project transport cannot safely belong in browser code.

## Related maps

- Framework: `docs/concepts/nuxt4.md`
- Runtime registration: `docs/concepts/runtime-package.md`
- Create families: `docs/concepts/create.md`
- Tool providers: `docs/concepts/tool-provider.md`
- Firestore entities: `docs/concepts/firestore-entity.md`
- Menu family: `docs/concepts/family-menu.md`
- Runtime filesystem: `docs/concepts/runtime-filesystem.md`

## Placement spine

| Location                                     | Job                                          |
| -------------------------------------------- | -------------------------------------------- |
| Package `src/runtime/server/api`             | Reusable package-owned Nitro endpoints       |
| App `server/api`                             | App-only composition or product endpoints    |
| Package `src/runtime/server/utils`           | Cross-entity shared server-only primitives   |
| App `server/utils`                           | App-only server helpers                      |
| Package `src/runtime/{entity}/server`        | Entity-owned server capabilities             |
| Package `src/config/module/server-config.ts` | Declarative registration of package handlers |

Request handlers stay near their HTTP route. A difficult handler does not earn
a vague top-level `handlers`, `processor`, or `manager` bucket.

Entity server folders are appropriate only when the entity already has real
identity or product capability. Core utility folders name reusable
cross-entity primitives such as auth, HTTP, ids, records, uploads, or slugs.
Declared Entity behaviour now lives at `src/runtime/<entity>/server`;
completed `src/runtime/server/<entity>` placements are rejected by the runtime
ownership guard and are not a second accepted destination.

Entity server structure follows the product surface. A Workspace Entity mirrors
its visible Workspace peers from top to bottom: Overview, Identity, Team, and
Operations, with `core/` and `index/` retained only for target authority and the
selection/create doorway. `ai/` is the canonical entity-owned AI capability
slice; it does not manufacture a generic AI navigation peer. An Entity without a Workspace follows its
Entity Index and the same named child capabilities exposed from that Index.
Structural deltas are exceptional and must name a real product capability;
transport or persistence mechanics do not justify a different entity tree.
Current route registration and domain handlers establish root-to-surface
behavior; the former `scripts/guards/server-ownership.mjs` is retired. Kitchen points to Index, Overview,
Identity, Team and its Dish, Drink, Ingredient, Menu, Mise, Order, Recipe,
Station, Supplier, Table and Finance operations. Supplier points to Index,
Overview, Identity, Team and its Catalogue, Ingredient and Item operations.
Project points to Index, Overview, Identity, Team and its App and Ecosystem
operations; Ignition remains separate intake/admin. A missing server slice
remains valid when its product surface has no server-owned behaviour; empty
folder symmetry is not required. The complete visible capability map is owned
by `docs/concepts/workspace.md`.

## Mutable read transport

Core `server/utils/http/defineLiveReadHandler.ts` preserves an endpoint's normal
JSON response and supports a same-origin live client using `Accept:
text/event-stream`. Core `server/utils/firestore/live-read.ts` observes the
Admin SDK reads made through the participating database resolvers within that
request. Changes rerun the same domain handler, including its authorization;
only the handler's projection crosses the boundary. Each evaluation has fresh
response-header state. Connections dispose their subscriptions on disconnect,
source removal or read failure, and renew before ordinary bearer-token expiry.

Browser readers use Core `useLiveAsyncData` or `useLiveFetch`; SSR supplies the
initial response, while stored changes trigger live updates. Subscription startup
and event-driven refresh explicitly bypass Nuxt cached data; hydration must not
return the initial payload instead of executing the live reader. `readLivePages`
rebuilds the loaded cursor chain, replacing membership rather than retaining
stale appended rows. Source/account changes dispose old connections. Data is
cleared on authorization/read failure; transport reconnects use bounded backoff.
Live JSON responses disable response caching so an update cannot be replaced
by an older HTTP-cache entry. Command validation, explicit lookup/search,
static configuration and external-provider requests are separate read jobs.

The database observation boundary is read-only and request-local. New server
resolvers must participate explicitly; importing the Admin SDK directly can
bypass it. Tests live in Core's `src/test/live-client-read.test.mjs` and
`src/test/live-server-read.test.mjs`, with Menu's consumer test in Kitchens.

## Endpoint spine

Every endpoint should be readable as three parts:

### Input

- Parse route, query, body, multipart data, or provider callback.
- Authenticate the caller where required.
- Derive App, database, actor, and owning scope from fixed runtime authority.
- Reject caller-selected authority fields.

### Process

- Validate the exact domain input.
- Resolve canonical records with bounded reads.
- Enforce product authority on the server.
- Perform one named query, command, transaction, upload, or provider action.
- Reuse a focused server primitive when several endpoints perform the same
  security-sensitive job.

### Output

- Return an explicit allowlisted DTO or named command result.
- Preserve truthful HTTP status.
- Never turn source failure into an empty successful collection.
- Never expose raw Admin errors, secrets, private records, or broad canonical
  documents.

If this shape cannot be explained briefly, split domain preparation from the
HTTP handler rather than hiding it in another generic layer.

## Route families

| Family                    | Typical job                                                   | Accepted delta                                                             |
| ------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Directory list/detail     | Bounded projection for directory pages                        | Pagination, joins, and publication filters differ by entity authority      |
| Internal                  | Authenticated owner/member/admin work                         | Required role and fixed domain scope differ                                |
| Workspace                 | Selected-target commands and projections                      | Target family and operation differ; selection alone never grants authority |
| Onboarding                | Idempotent root/Team creation or attachment                   | Domain seed and validation differ; transaction shape remains fixed-runtime |
| Upload                    | Multipart validation, Storage write, and metadata transaction | Accepted files and storage owner differ                                    |
| Tool provider             | Return or execute a reusable provider contract                | Tool payload differs; provider never steals consumer data ownership        |
| Webhook/callback          | Verify provider signature and advance trusted state           | Signature and event vocabulary are provider-specific                       |
| Cross-project publication | Signed owner-to-receiver projection transport                 | Requires OIDC/source allowlists and server-only support databases          |
| Dev                       | Bounded developer inspection                                  | Development build plus configured developer identity are mandatory         |

These are server endpoint families, not new Entity kinds.

## Authority rules

- Browser state such as `canWrite`, selected Workspace target, or hidden UI is not
  server authority.
- Firebase bearer identity proves the caller; stored App/Entity relationships
  prove the requested action.
- Fixed-runtime endpoints do not accept client App ids, database ids,
  collection paths, owner ids, support ids, lifecycle stamps, or visibility
  authority.
- Directory routes return bounded responses and related canonical records;
  they never manufacture replacement Entity types.
- Workspace onboarding writes the root, its Team authority, and required
  relationships in one trusted transaction or not at all.
- Named lifecycle commands are preferred over generic document patches.
- Destructive operations require explicit authority and dependency checks.
- Cross-project publishers use verifiable service identity, fixed audience,
  exact source scope, and allowlisted entity identity. Firebase user tokens or
  shared webhook secrets are not publisher authority.

## Directory projection contract

Directory list and detail endpoints for one Entity must share:

- the same publication decision;
- the same field allowlist;
- the same linked-identity validation;
- truthful 404 versus 5xx behavior;
- bounded pagination and joins;
- no browser N+1 loading of private/canonical records.

The Entity Collection Page and Entity Detail maps own page-family expectations. This
map owns only the server transport boundary.

## Trusted create and command contract

Use a server create/command endpoint when work requires one or more of:

- a multi-document transaction;
- Admin-only access;
- multipart upload or Storage writes;
- provider credentials;
- idempotency reservation;
- lifecycle transition validation;
- immutable audit/event emission.

An endpoint named `create.post.ts` is acceptable when it truly performs one
named create transaction. Prefer specific commands such as `publish`,
`transition`, `checkout-session`, `upload`, or `complete` when those names
describe the job better.

## Shared primitives

Current reusable server evidence includes:

- bearer auth:
  `packages/core/fireux-core/src/runtime/server/utils/auth/bearer.ts`;
- module handler registration:
  `packages/core/fireux-core/src/config/module/module-helpers.ts`;
- tool-provider registry and response headers:
  `packages/core/fireux-core/src/runtime/server/utils/tool-provider.ts`;
- App membership mutation:
  `packages/core/fireux-core/src/runtime/app/server/app-user/command.ts`;
- Core App HTTP handlers remain in Nuxt's `runtime/server/api/**/app/` route
  tree and delegate environment checks, Index projections, initialization,
  media, settings, membership, and Team work to `runtime/app/server/`;
- Workspace Entity onboarding authority:
  `packages/core/fireux-core/src/runtime/server/utils/workspace-entity/onboarding-authority.ts`;
- Menu ownership/manifest/ordering workflows:
  `packages/extensions/fireux-kitchens/src/runtime/menu/server/`;
- Kitchen order transition enforcement:
  `packages/extensions/fireux-kitchens/src/runtime/kitchen/server/operations/orders/transition.ts`.

Promote a helper only when several endpoints share the same authority-sensitive
process. Shared `text()`, `record()`, or response snippets alone do not justify
a new architecture layer.

HTTP routes remain adapters. Entity and domain projections, authority reads,
and commands live under their owning `runtime/<entity>/server` capability and accept
transport-neutral inputs where practical. The route owns HTTP query/body/route
parameter parsing, response headers, and status delivery. Proven extractions
are protected by `scripts/guards/server-ownership.mjs`; this does not imply one
universal endpoint engine.

## Accepted deltas

| Delta                                                     | State      | Reason                                                                             |
| --------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| Core registers foundational routes directly in its module | `accepted` | Core owns the runtime foundation and has no parent package hook to consume         |
| Extension packages register explicit handler lists        | `accepted` | Apps opt into domain routes through installed modules                              |
| App-local APIs exist beside package APIs                  | `accepted` | App-only product composition should not become reusable package truth prematurely  |
| Public projections join different linked records          | `accepted` | Safe public meaning differs by Entity while bounded projection rules remain shared |
| Provider callbacks use provider-specific verification     | `accepted` | Signatures and event schemas are external contracts                                |
| OPTIONS handlers accompany cross-origin tools/uploads     | `accepted` | Browser preflight is part of the external tool boundary                            |

## Migration and drift register

| Difference                                                                             | State                      | Required direction                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Several package `server-config.ts` files register empty arrays                         | `drift`                    | Remove no-op hooks until a real endpoint exists; optional parity does not require empty files                                                                                                                 |
| Some domain endpoint families still repeat auth/runtime parsing                        | `migration`                | Consolidate only proven identical authority work into focused Core/domain primitives                                                                                                                          |
| Several Kitchen payment and processing routes still contain domain/storage composition | `migration`                | Continue extracting them into the existing Menu, Kitchen Operations, Customer, and payment owners while retaining thin HTTP adapters; Customer Order index and Menu index now delegate to their domain owners |
| Declared Entity server behaviour lives under `runtime/<entity>/server`                 | `accepted`                 | Preserve thin `runtime/server/api` handlers and reject completed legacy server paths                                                                                                                          |
| Menu upload/processing endpoints remain a young family                                 | `to-confirm`               | Keep input/process/output explicit and consolidate only after both quick Menu and KitchenMenu flows are stable                                                                                                |
| Cross-project directory publication details were copied into broad maps                | `drift`                    | Keep durable trust boundary here and current implementation state in source/guards or a focused family map                                                                                                    |
| Provider and consumer endpoint ownership has historically been confused                | `migration`                | Enforce the Tool Provider ownership contract and keep consumer storage local                                                                                                                                  |
| Package route registration has direct and hook-based implementations                   | `accepted` by package lane | Preserve Core's direct foundation; require extensions to use the shared registration helper                                                                                                                   |
| Kitchen Team server tools are being proven by an active Team-tool experiment           | `to-confirm`               | Keep `kitchen/team/tools` under Team ownership without treating its current internal subsystem as settled canon                                                                                               |
| Kitchen Sproochli attachment sits under Identity                                       | `accepted`                 | Its working surface is `Workspace/Kitchen/Identity/Sections/Sproochli.vue`; the command owns Kitchen identity attachment settings                                                                             |

## Alignment roadmap

### Now

1. Keep handlers visibly structured as input, process, and output.
2. Keep App/database/actor authority fixed by runtime and verified server data.
3. Preserve bounded response parity between directory list and detail routes.
4. Remove empty server registration hooks when touched.

### Next

1. Add focused contract tests for root/Team onboarding families.
2. Consolidate repeated bearer/runtime parsing only where authority semantics are
   identical.
3. Stabilize quick Menu and KitchenMenu upload/process contracts before
   extracting more shared helpers.
4. Inventory app-local endpoints that now have more than one consumer and move
   only proven reusable behavior to the owning package.

Marketplace, Job, and Place server capabilities now use guarded owner-first
domain roots. Marketplace separates directory, Store, Offer, Order, and
moderation work; Job separates identity, index, and hiring operations; Place
separates identity, index/onboarding, and external integrations. These are
domain vocabularies, not a universal server folder template.

### Later

1. Create a focused cross-project publication map if that family becomes active
   across several owners.
2. Version external provider contracts only when incompatible released
   consumers require it.
3. Add guards for repeated registration or authority failures, not optional
   folder symmetry.

## Guardrails

- Do not authorize from client presentation state.
- Do not accept caller-selected App/database/collection authority.
- Do not expose raw canonical records as convenient DTOs.
- Do not duplicate provider and consumer persistence jobs.
- Do not hide broad domain work inside `create.post.ts` or a generic helper.
- Do not create empty registration files merely to mirror siblings.
- Do not preserve one-time migration counts or deployment snapshots in this
  family map.
