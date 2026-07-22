# Create spine map
Updated: 2026-07-22
Ref: 796952bf0
Role: map, not canon

## Purpose
Map the current FireUX create families so agents do not confuse normal entity
creation with upload transactions, console onboarding, provider provisioning, or
ensure/upsert flows.

## Vertical links
- Parent: spine.md
- Child: firestore-entity.md
- Child: console.md
- Child: server-api.md

## Horizontal links
- composables.md
- components.md
- pages.md
- tool-provider.md
- collection-manager.md

## Core question
When adding or changing a create flow, first ask what is being created and
where the irreversible work happens.

## Families
- Client entity create
- Draft-state create
- Console target create
- Server transaction create
- Provider/provision create
- Ensure/upsert create

### Client entity create
Use a `useXCreate` composable when the create is mostly a Firestore entity
write from an app/runtime surface.

#### Current examples
- `useMenuCreate`
- `useKitchenCreate`
- `useSupplierCreate`
- `usePortfolioCreate`
- `useProductCreate`
- `useProfileCreate`

#### Typical shape
- Component/page gathers input.
- Domain create composable validates and shapes payload.
- Domain create composable calls `useFirestoreCreate` or `useFirestoreManager`.
- Firestore write creates the record.

#### Use this when
- The caller already has the needed app/user/context.
- The work is mostly Firestore data.
- No multipart file, external secret, webhook, payment session, or admin-only
  transaction is required.

#### Do not use this when
- The create needs server-only credentials.
- The create uploads files.
- The create calls external providers with secrets.
- The create must atomically combine file storage plus Firestore writes.

### Draft-state create
Use a local/staged draft state when the create UI has enough fields, preview,
draft persistence, or multi-part input that the user should shape the object
before the final create/publish action.

#### Current examples
- Product create
- Blog post create

#### Typical shape
- `XCreateSystem` or create page owns the submit/clear flow.
- `useXDraftState` stores local create state.
- Write and preview components read/write the same staged state.
- `useXCreateSubmit` converts staged state into a final create call.
- Final submit calls `useXCreate`, publish, or provider/provision seams.

#### Use this when
- The create form is multi-section or has a preview.
- The user may pause, clear, or revise before submitting.
- The final record should not exist until the user commits.
- Create and publish are separate concepts.

#### Do not use this when
- The create is a tiny one-step Firestore write.
- The local staged object would become more complex than the final record.
- The flow really needs server transaction create because files/secrets are
  involved.

### Console target create
Use a domain `useXCreate` plus `useConsoleCreate` when the entity is a console
target that may create both a root record and an app-scoped console record.

#### Current examples
- `useKitchenCreate`
- `useSupplierCreate`
- `usePortfolioCreate`

#### Typical shape
- Public or console create page mounts `XCreateSystem`.
- `XCreateSystem` calls `useXCreate`.
- `useXCreate` creates or reuses the root target.
- `useConsoleCreate` creates the app console scope when needed.

#### Notes
- These are usually idempotent because users may select/create the same real
  target more than once.
- Existing target IDs are normal for place-backed or app-backed entities.
- Generated IDs are normal for user-created targets without a natural ID.
- Project is a private FireUX control-plane root. It has no client create seam;
  creation belongs in a future authenticated control-plane transaction.

### Server transaction create
Use a `server/api/**.post.ts` endpoint when create is a transaction that belongs
on the server.

#### Current examples
- `POST /api/menus/create`
- `POST /api/console/kitchen/menus/upload`
- Go QR `POST /api/tools/doc/create`

#### Typical shape
- Component passes tool payload or form data.
- Server endpoint reads and validates request.
- Server endpoint performs server-only work.
- Server endpoint writes the resulting record.
- Server endpoint returns route/output URLs.

#### Use this when
- Multipart upload is involved.
- Firebase Storage write is involved.
- Download token or storage URL creation is involved.
- Admin SDK or server credentials are involved.
- A single user action must create files and records together.

#### Menu example
- `MenuCTA` uses `ProviderGoQrTools`.
- The tool posts to `/api/menus/create`.
- `/api/menus/create` stores the source file and creates a root public menu
  doorway record.
- This should not be replaced by `useMenuCreate`, because `useMenuCreate`
  creates kitchen-scoped menu entity records, not upload transactions.

### Provider/provision create
Use a server endpoint or domain composable when the create provisions an
external system or requires provider state.

#### Current examples
- Stripe product/session endpoints.
- Product create flows that prepare Stripe-backed product/price data.
- Place create flows that may hydrate from Google Places and image storage.

#### Typical shape
- Validate local input.
- Call provider/provision step.
- Store local representation.
- Return provider/local IDs needed by the caller.

#### Use this when
- A third-party provider owns part of the created thing.
- Secret keys or provider credentials are required.
- A provider object and Firestore mirror must stay related.

### Ensure/upsert create
Use an ensure/upsert create when the user intent is “make sure this exists,” not
“always create a new record.”

#### Current examples
- Place create/ensure.
- Test target create.
- Console target root create with known IDs.
- User/app membership create.

#### Typical shape
- Normalize the natural ID.
- Read existing record.
- Return `{ created: false }` if it already exists.
- Otherwise create the minimum valid record.

#### Use this when
- The target has a natural external ID.
- Re-running create should not duplicate records.
- The flow is onboarding, migration, or reconciliation.

### Staged onboarding composition

Use the domain-free `useOnboarding` composable only for step mechanics: stable
step IDs, navigation, progress, validation gates, pending/error state, reset,
and one finish transition. A named domain adapter such as
`usePlacesOnboarding` owns provider hydration, draft truth, domain validation,
the final mutation, and completion routing.

#### Place reference

- Place onboarding confirms provider identity and user-owned local defaults
  before one authenticated completion transaction.
- Provider identity remains server-verified; optional image and brand values
  stay sparse and do not overwrite existing truth.
- `POST /api/places/ensure` remains the narrow idempotent identity seam for
  non-interactive callers.

#### Kitchen reference

- Public and Console create routes compose the same Kitchen create system;
  route mode changes chrome and destination, not entity truth.
- Kitchen onboarding reuses canonical Place identity, then owns only Kitchen
  draft decisions and the trusted root/App-support/UserApp transaction.
- New Kitchen roots stay sparse and unpublished. Place fields, Menu content,
  ordering, payment, profiles, and publication are not create side effects.
- Tenant onboarding is bounded by configured targets, and route query state
  never mutates an existing Kitchen automatically.

## Current create plan primitive
`createStrategy.ts` currently exposes:
- `family`: `idempotent` or `with_provision`
- `transport`: `client` or `server`
- `location`: `root`, `scoped`, or `app-support`
- `id`: `generated` or `known`
- `steps`: `single` or `multi`

This is emerging, not complete. Treat existing `CreatePlan` exports as useful
markers, not a complete registry.

## Source evidence

- Core create-plan vocabulary:
  `packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/createStrategy.ts`
- Console-target examples:
  `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenCreate.ts`,
  `packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/mutations/useSupplierCreate.ts`,
  and
  `packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/mutations/usePortfolioCreate.ts`
- Draft-state example:
  `packages/extensions/fireux-products/src/runtime/composables/fireux/product/create/useCreateProductState.ts`
- Root Menu upload transaction:
  `packages/extensions/fireux-kitchens/src/runtime/server/api/menus/create.post.ts`
- Scoped Kitchen Menu mutation:
  `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/menu/mutations/useMenuCreate.ts`

The Menu split is settled: root `Menu` is a public doorway/upload entity while
`KitchenMenu` is scoped Kitchen content. See `family-menu.md`; do not reopen
that distinction inside the create family.

## Decision checklist
- Is this just a Firestore entity record? Use `useXCreate`.
- Is this a rich authoring form with preview or draft persistence? Use a
  draft-state create seam, then submit into `useXCreate` or publish.
- Does it create a root target plus console scope? Use `useXCreate` with
  `useConsoleCreate`.
- Does it upload a file or need server credentials? Use `server/api/**.post.ts`.
- Does it call Stripe, Google, Go QR, Sproochli, or another provider? Use a
  provider/provision create seam.
- Can the same real thing already exist? Make it idempotent/ensure-style.
- Are optional fields empty? Do not write them. Omit them and let read DTOs
  normalize display shape if needed.

## Naming notes
- `useXCreate`: domain create composable for entity/console create.
- `useXDraftState`: local/staged authoring state before final persistence.
- `useXCreateSubmit`: converts staged authoring state into final create/publish
  work.
- `XCreateSystem`: component surface that owns create UI flow.
- `server/api/<thing>/create.post.ts`: acceptable for server transaction create,
  but prefer a more specific route if it avoids ambiguity, such as
  `upload.post.ts`, `checkout-session.post.ts`, or `source.post.ts`.
- `create.post.ts` should not hide broad domain logic; keep it as input/process/
  output transaction code with helpers when needed.

## Delta register

| Difference | State | Reason or alignment trigger |
| --- | --- | --- |
| Client entity, server transaction, provider/provision, and ensure creates use different transports | `accepted` | Irreversible work and credential authority differ; all must still expose one named create boundary |
| Console-target create may write root identity plus App support | `accepted` | Console entities require both canonical identity and app-scoped access; `useConsoleCreate` owns the shared support step |
| Place and Kitchen use staged onboarding rather than a one-step form | `accepted` | Provider confirmation, inherited defaults, and access review require explicit stages |
| `createStrategy.ts` is implemented by only a subset of create families | `to-confirm` | Keep it as descriptive metadata until at least one guard or consumer proves registry value |
| Product uses `useCreateProductState` rather than `useProductDraftState` | `migration` | Rename when Product Create is next changed; do not add the older ordering to new families |
| Optional blank-field omission is described but not uniformly enforced | `drift` | Audit `useXCreate` payload builders and extract a shared primitive only if repetition is genuinely identical |
| Root Menu upload and scoped Kitchen Menu mutation both contain “Menu create” language | `accepted` | They create different entities; route, type, and composable names must retain the root-versus-scoped distinction |

## Alignment roadmap

### Now

- Choose the create family before naming a component, composable, or endpoint.
- Keep root Menu upload transactions separate from scoped Kitchen Menu
  mutations.
- Do not adopt `CreatePlan` metadata in another family merely for symmetry.

### Next

- Audit create payload builders for blank optional fields and align the actual
  repeated rule.
- Rename Product draft state when that surface next receives functional work.
- Record create-family membership in entity concept maps where ambiguity still
  causes callers to choose the wrong seam.

### Later

- Promote `CreatePlan` into a registry or guard only if multiple consumers need
  to query it.
- Add transaction tests around multi-write console onboarding and file-backed
  create flows before extracting further shared machinery.
