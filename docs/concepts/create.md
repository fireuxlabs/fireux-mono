# Create spine map

Updated: 2026-08-23
Ref: d1a7d5eec
Role: map, not canon

## Purpose

Map the current FireUX create families so agents do not confuse normal entity
creation with upload transactions, workspace onboarding, provider provisioning, or
ensure/upsert flows.

## Vertical links

- Parent: spine.md
- Child: firestore-entity.md
- Child: workspace.md
- Child: server-api.md

## Horizontal links

- composables.md
- components.md
- pages.md
- tool-provider.md
- collection-manager.md

## Component entrypoints and sections

An existing Entity Create or Edit entry lives at
`components/Create/Index.vue` or `components/Edit/Index.vue`, retaining Nuxt's
`EntityCreate` / `EntityEdit` name. Named form sections stay beside that entry.
This is placement, not a mandatory scaffold: do not add an Index where no
entry responsibility exists, or manufacture empty editors.

Creation doorways and full workflows remain distinct. A directory's Create
entry may link to a workflow; a consumed `Create/System.vue` still owns its
existing submit/lifecycle flow. Ingredient’s consumed workflow now enters through `Create/Index.vue`. Product
and Blog creation routes own their submit/clear composition directly; their
unconsumed System implementations have been retired. Do not rename a System to Index when
it would collide with a real doorway or create a second workflow owner.
Place Edit composes its focused Profile, Brand, Photos, Location, Contact and
Visit sections; Kitchen and Supplier consume that Place-owned capability.
Company's nested Edit entry remains under Place's Company capability and its
existing explicit component registration.

## Core question

When adding or changing a create flow, first ask what is being created and
where the irreversible work happens.

## Families

- Client entity create
- Draft-state create
- Workspace target create
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
- Domain create composable calls the typed Client Create touchpoint or a
  guarded Server Create seam with a domain-owned authority target.
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

### Workspace entity create

Use the domain-owned `useXCreate` and trusted onboarding transaction when an
entity may be created as a root or attached to a Workspace.

#### Current examples

- `useKitchenCreate`
- `useSupplierCreate`
- `usePortfolioCreate`

#### Typical shape

- Root or Workspace create page mounts `XCreateSystem`.
- `XCreateSystem` calls `useXCreate`.
- `useXCreate` delegates to its domain-owned trusted transaction.
- The transaction creates or reuses the root and writes the caller's exact
  `team/{uid}` authority beneath that root.
- `workspace` resolves conventionally to `<ecosystem>-app`; only `app` stores an
  `app_id`.

#### Notes

- These are usually idempotent because users may select/create the same real
  target more than once.
- Existing target IDs are normal for place-backed or app-backed entities.
- Generated IDs are normal for user-created targets without a natural ID.
- Project is a FireUX control-plane root. Its `useProjectWorkspaceCreate`
  adapter invokes the trusted Project command at
  `/api/internal/control/projects`; Project execution remains ecosystem-owned.
  Its `{name}` action creates nested Identity (name, description, image URL and
  inactive status), not flat profile fields. Anonymous authority and audit stay
  at the root; Team and access remain separate. Caller form and route lifetime
  are guarded before credentials, and response id/action are validated.
- Portfolio public and Workspace forms call one `usePortfolioCreate` adapter
  and the same trusted onboarding command. Nested Identity input is validated
  by the domain; the transaction creates the root, Team, membership-bound access
  and App management. Workspace mode selects the committed root, while public
  mode does not auto-select it. A new root with an existing slug conflicts;
  explicit existing-root attachment retains its separate authority checks.
  Credential waits are guarded against account, App, membership, route, disposal
  and caller form changes. The client validates the exact returned root id and
  preserves a truthful committed result; obsolete UI completion is suppressed.
  See Properties' `portfolio-model-shape.test.mjs` and
  `portfolio-identity-scope.test.mjs`.

### Server transaction create

Use a `server/api/**.post.ts` endpoint when create is a transaction that belongs
on the server.

#### Current examples

- `POST /api/menus/create`
- `POST /api/workspace/kitchen/menus/upload`
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

#### App initialization

App initialization is complete only when its canonical App record and all five
Storage-backed media roles exist together. The trusted media sync validates the
bundled `logo.png`, both surface wordmarks, `cover.png` and `thumbnail.png`,
uploads them under `apps/<appId>/img/app/*`, and records their URLs on
`App.media`. A partial upload remains an incomplete, retryable setup; it must
not release the App shell or report success.

New App source declares its complete reviewed eight-colour semantic palette.
Fresh initialization stores it while the App has no lower Workspace layer;
initialization of an existing App backfills only an absent palette and never
overwrites authored storage. When a domain-owned onboarding transaction creates
or attaches Workspace support, it seeds missing Workspace roles from the complete
source, preserves existing Workspace colours, and compacts `App.theme.palette`
to the roles that extend or override Workspace. Runtime presentation resolves the
effective eight colours from both layers. Root entity creation remains
independently valid and does not receive App colours.

#### Menu example

- `MenuDirectoryPromotion` uses `ProviderGoQrTools`.
- The tool posts to `/api/menus/create`.
- `/api/menus/create` stores the source file and creates a root Menu
  doorway record.
- This should not be replaced by `useMenuCreate`, because `useMenuCreate`
  creates kitchen-scoped menu entity records, not upload transactions.

### Provider/provision create

Use a server endpoint or domain composable when the create provisions an
external system or requires provider state.

#### Current examples

- Stripe product/session endpoints.
- Product create flows that prepare Stripe-backed product/price data.
- Place create flows that may enrich a draft from Google Places and image storage.

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
- Workspace target root create with known IDs.
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
`usePlacesOnboarding` owns provider enrichment, draft truth, domain validation,
the final mutation, and completion routing.

#### Place reference

- Place onboarding confirms provider identity and user-owned local defaults
  before one authenticated completion transaction.
- Provider identity remains server-verified; optional image and brand values
  stay sparse and do not overwrite existing truth.
- `POST /api/places/ensure` remains the narrow idempotent identity seam for
  non-interactive callers.

#### Kitchen reference

- Directory and Workspace create routes compose the same Kitchen create system;
  route mode changes chrome and destination, not entity truth.
- Kitchen creation ensures canonical Place identity, then owns the trusted
  root/Team transaction. AppUser membership is verified independently; Kitchen
  stores no management relationship.
- New Kitchen roots stay sparse and unpublished. Place fields, Menu content,
  ordering, payment, profiles, and publication are not create side effects.
- Kitchen onboarding is bounded by the same-ID Place, Team, and AppUser
  authority, and route query state never mutates an existing Kitchen
  automatically.

## Current create plan primitive

`createStrategy.ts` currently exposes:

- `family`: `idempotent` or `with_provision`
- `transport`: `client` or `server`
- `location`: `root`, `scoped`, or `user-owned`
- `id`: `generated` or `known`
- `steps`: `single` or `multi`

This is emerging, not complete. Treat existing `CreatePlan` exports as useful
markers, not a complete registry.

## Source evidence

- Core create-plan vocabulary:
  `packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/createStrategy.ts`
- Workspace-target examples:
  `packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/firestore/useKitchenCreate.ts`,
  `packages/extensions/fireux-suppliers/src/runtime/supplier/composables/firestore/mutations/useSupplierCreate.ts`,
  and
  `packages/extensions/fireux-properties/src/runtime/portfolio/composables/firestore/mutations/usePortfolioCreate.ts`
- Draft-state example:
  `packages/extensions/fireux-products/src/runtime/product/composables/create/useCreateProductState.ts`
- Root Menu upload transaction:
  `packages/extensions/fireux-kitchens/src/runtime/server/api/menus/create.post.ts`
- Scoped Kitchen Menu mutation:
  `packages/extensions/fireux-kitchens/src/runtime/menu/composables/firestore/mutations/useMenuCreate.ts`

The Menu split is settled: root `Menu` is a directory doorway/upload entity while
`KitchenMenu` is scoped Kitchen content. See `family-menu.md`; do not reopen
that distinction inside the create family.

## Decision checklist

- Is this just a Firestore entity record? Use `useXCreate`.
- Is this a rich authoring form with preview or draft persistence? Use a
  draft-state create seam, then submit into `useXCreate` or publish.
- Does it create a root target plus Workspace management? Keep root validation and
  the trusted transaction in the domain-owned `useXCreate`/server command. Core
  does not own a domain-enumerating create factory.
- Does it upload a file or need server credentials? Use `server/api/**.post.ts`.
- Does it call Stripe, Google, Go QR, Sproochli, or another provider? Use a
  provider/provision create seam.
- Can the same real thing already exist? Make it idempotent/ensure-style.
- Are optional fields empty? Do not write them. Omit them and let read DTOs
  normalize display shape if needed.

## Naming notes

- `useXCreate`: domain create composable for entity/workspace create.
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

| Difference                                                                                         | State        | Reason or alignment trigger                                                                                                                              |
| -------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client entity, server transaction, provider/provision, and ensure creates use different transports | `accepted`   | Irreversible work and credential authority differ; all must still expose one named create boundary                                                       |
| Workspace-target create writes root identity plus Team                                             | `accepted`   | The domain transaction writes its canonical root, any family-declared relationship, and caller Team record; Kitchen deliberately has no management field |
| Place and Kitchen creation compose provider confirmation with trusted domain commands              | `accepted`   | Place owns provider resolution; Kitchen may present a compact search modal or review route while both call the same entity-owned command                 |
| `createStrategy.ts` is implemented by only a subset of create families                             | `to-confirm` | Keep it as descriptive metadata until at least one guard or consumer proves registry value                                                               |
| Product uses `useCreateProductState` rather than `useProductDraftState`                            | `migration`  | Rename when Product Create is next changed; do not add the older ordering to new families                                                                |
| Optional blank-field omission is described but not uniformly enforced                              | `drift`      | Audit `useXCreate` payload builders and extract a shared primitive only if repetition is genuinely identical                                             |
| Root Menu upload and scoped Kitchen Menu mutation both contain “Menu create” language              | `accepted`   | They create different entities; route, type, and composable names must retain the root-versus-scoped distinction                                         |

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
- Add transaction tests around multi-write workspace onboarding and file-backed
  create flows before extracting further shared machinery.
