# Card family

Updated: 2026-11-09
Ref: 5a5a26e2d
Role: source map, not executable certification

## Purpose and authority

Define the Pill, Cell, Preview and Overview presentation roles separately from
acquisition, editing and route/detail composition. Inherit `AGENTS.md`, `docs/ai/gpt-context.md` and
`components.md`. Current source, Nuxt registration, real consumers and tests
establish behavior; this map does not certify every entity as identical.

## Responsibilities

| Section              | Owns                                                                 | Does not own                                                                       |
| -------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `Cards/Cell.vue`     | Collection entry with enough identity and context to choose a record | Record acquisition or the full detail page                                         |
| `Cards/Pill.vue`     | Compact inline identity, link or selection control                   | A miniature detail page                                                            |
| `Cards/Preview.vue`  | A supplied record or draft presented for review                      | Acquisition, draft ownership, editing or submission                                |
| `Cards/Overview.vue` | Richer presentation of the supplied Entity's identity                | The route, related capability reads, membership administration or editing workflow |

Cards receive props or a typed domain projection. Formatting, conditional anatomy,
pure presentation helpers, supplied destinations and emitted actions are valid.
Cards do not acquire records, mutate storage or decide authority. Only add the
variants a consumer actually needs; field shapes and domain content remain local.
These are presentation roles, not a universal size ladder or a demand for empty
components. A member supplies the roles its consumers need. A Preview card may
appear in an editor's review step or display a saved record; the consuming
workflow still owns draft state and submission. An Overview card may be composed
within Detail, alongside separately owned membership and related capabilities.

Profile names the User-owned domain records, such as Chef or Driver profiles.
Overview names the rich Card presentation. A Workspace Overview is an upper
composition that may consume Cards/Overview alongside capabilities, counts and
navigation; the card is not restricted to that parent. Existing named profile
editors, domain projections and shared UserProfile primitives retain their roles.

## Shared User profile shape

User owns the canonical person identity. Chef, Agent, Professional, Driver and
Customer are typed User-owned profile records within one shared profile family.
Their common composition is:

```text
canonical User + typed profile data
    → owner-controlled projection
    → Pill / Cell / Preview / Overview presentation
```

Core's [profile contracts](../../packages/core/fireux-core/src/runtime/models/utils/profile.model.ts)
define the shared identity and configuration vocabulary. The shared
[`useProfile`](../../packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/useProfile.ts)
reader and provisioning mechanics support the domain owners, which retain exact
models, commands and authority. Public directory/detail consumers use
[`ProfileDirectoryEntry<TProfile>`](../../packages/core/fireux-core/src/runtime/user/models/user-directory.model.ts)
to carry `{ id, kind, user, profile }`, joining canonical User identity with typed
profile data. Each consuming surface uses the presentation roles it needs.

## User baseline and current differences

Core User proves all four roles under
[`user/components/Cards`](../../packages/core/fireux-core/src/runtime/user/components/Cards).
Its Collection consumes Pill and Cell, Current switches between Preview and
Overview, diagnostics uses Preview, and Detail composes Overview beside the
App-owned membership capability. The existing `useUserView` formats supplied
identity without acquiring a record. Overview retains its settled-Auth self-edit
link availability; protected commands remain the write authority.

User's shared Hero, Section, SectionHeading, DetailSurface and DirectoryCard
primitives remain under `user/components/Profile` for specialist profile
compositions. They are not alternate User Overview cards. There is no old
`UserCardsSummary` or `UserProfile` compatibility registration.

[`AppUser`](../../packages/core/fireux-core/src/runtime/app/models/app-user.model.ts)
is the App-owned membership of a User; person identity remains with User.
AppUser presentation reuses User Cards: [App user administration](../../packages/core/fireux-core/src/runtime/app/components/Edit/Sections/AppUsers.vue)
composes `UserCardsPill` with separate membership controls, and
[`UserDetail`](../../packages/core/fireux-core/src/runtime/user/components/Detail/Index.vue)
composes `UserCardsOverview` beside `UserAppMembership`. Role and subscription
commands remain App-owned; consuming surfaces retain their reads, states and
management controls. This relationship does not need a parallel AppUser Cards family.

Chef, Agent and Professional supply all four roles under
[`Chef/Cards` in Kitchens](../../packages/extensions/fireux-kitchens/src/runtime/user/components/Chef/Cards)
and [`Agent/Cards`](../../packages/extensions/fireux-jobs/src/runtime/user/components/Agent/Cards)
and [`Professional/Cards`](../../packages/extensions/fireux-jobs/src/runtime/user/components/Professional/Cards) in Jobs.
Current and developer previews consume their named `CardsPreview`; Detail and Identity
compose `CardsOverview` from supplied profile data and the canonical User
projection. Those parents retain acquisition, creation, permissions and management
actions. Preview retains the shared directory card's `summary` visual variant;
Overview retains Core's Hero and sections plus its supplied actions slot.
Professional retains its presentation helper. `ProfessionalProfileEvidence` and
the scoped stylesheet remain under `Professional/Profile`; its parents retain
Place enrichment and share/print actions.

Driver supplies Pill, Cell and Overview under
[`Driver/Cards` in Kitchens](../../packages/extensions/fireux-kitchens/src/runtime/user/components/Driver/Cards).
Current consumes Cell; Detail composes `DriverCardsOverview` with the supplied
Driver profile, canonical User projection and dashboard-action slot. Detail
retains session acquisition and its self-check. The Overview card retains public
coverage and capability presentation; no current consumer needs a Driver Preview.

Customer belongs to the same User profile family. Its
[`Cards/Pill.vue` and `Cards/Cell.vue`](../../packages/extensions/fireux-kitchens/src/runtime/user/components/Customer/Cards)
present the canonical User projection within `CustomerIdentity` and the developer
gallery. The private ordering-details editor retains ordering name, phone,
addresses and allergy notes. Identity and Edit retain their reads, creation and
update workflows. Current consumers need Pill and Cell; Preview and Overview
remain roles to add when a consumer needs them. Customer keeps its private
Identity/Edit surface without a public Directory or Detail.

Core App supplies Cell and Preview under
[`app/components/Cards`](../../packages/core/fireux-core/src/runtime/app/components/Cards).
`AppEditSectionsSurfaces` presents the supplied `AppCard` projection through
both cards. `useAppView` retains projection ownership; Preview retains its
display props and the shared preview styles. App Detail keeps its separate
route and related-capability composition.

Core Ecosystem supplies Cell and Preview under
[`ecosystem/components/Cards`](../../packages/core/fireux-core/src/runtime/ecosystem/components/Cards).
Project Workspace consumes Cell. FireUX App Detail composes `EcosystemCardsPreview`
from its existing exact Ecosystem read; the card presents that supplied record's
name, description and detail link. App Detail retains related reads and SEO,
and Ecosystem Detail retains its page header, Apps and Project composition.
The public Ecosystem collection continues to use `FireCollectionCell`.

Project's Cards belong to
[`fireux-projects/runtime/project/components/Cards`](../../packages/extensions/fireux-projects/src/runtime/project/components/Cards).
`EcosystemDetailProject` composes `ProjectCardsPreview` for the supplied public
Project's name, description and detail link. That parent retains the exact read,
active-only publication filter, outcomes and diagnostics. Project's public Detail
retains its App-owned header, related Apps and SEO; its collection uses
`FireCollectionCell`. Existing Pill and Cell sources retain their current names.

Business's four Cards belong to
[`fireux-businesses/runtime/business/components/Business/Cards`](../../packages/extensions/fireux-businesses/src/runtime/business/components/Business/Cards).
Its public Collection consumes Pill and Cell. The public Business detail page
composes `BusinessCardsOverview` from its existing supplied `BusinessProfile`
projection; the page retains the exact read, outcomes, linked Place and SEO.
Preview keeps the existing supplied-data presentation and has no current consumer.
The separate Workspace profile editor retains its draft, linked-location controls
and Business commands; it is not an Overview card.

Kitchen supplies Pill, Cell and Preview under
[`kitchen/components/Cards` in Kitchens](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Cards).
Driver delivery beacons and the developer gallery consume Pill; Misebox's
PowerCards demo consumes Cell, and the gallery consumes `KitchenCardsPreview`.
The public Collection retains its discovery-card composition. Public Detail
composes Place-owned identity with Kitchen menu and operator controls;
`Identity/Profile` retains its Workspace editors and explicit mutation authority.
Current consumers do not need a separate Kitchen Overview card.

Supplier supplies all four roles under
[`supplier/components/Cards` in Suppliers](../../packages/extensions/fireux-suppliers/src/runtime/supplier/components/Cards).
The developer gallery consumes Preview, Pill and Cell; the existing Identity
preview panel also composes Pill and Cell. Kitchen Supplier Detail composes
`SupplierCardsOverview` from its already-acquired `SupplierSurface`, preserving
identity, media, status and delivery-area presentation. Kitchen retains its
scope, reads, outcomes, catalogue and supply-option navigation. Supplier's public
Detail retains its Place-owned header, catalogue and delivery composition, and
Workspace Identity retains its editors. The public Collection uses
`FireCollectionCell`; Supplier Item Cards keep their separate record role.

Portfolio supplies Pill, Cell and Overview under
[`portfolio/components/Cards` in Properties](../../packages/extensions/fireux-properties/src/runtime/portfolio/components/Cards).
Public Detail composes `PortfolioCardsOverview` from the existing public
`PortfolioCard` projection; Detail retains that projection, SEO and operator
controls. The card keeps the supplied identity, image, status, region and summary
presentation. The public Collection uses `FireCollectionCell`; no direct
Pill/Cell consumer or Preview consumer is currently found. Workspace Identity
retains its public profile editor and separate private team context.

Property's existing Pill and Cell sources belong to
[`property/components/Cards` in Properties](../../packages/extensions/fireux-properties/src/runtime/property/components/Cards).
No direct component consumer is currently found for either. The public
[Collection](../../packages/extensions/fireux-properties/src/runtime/property/components/Collection/Index.vue)
uses non-linking `FireCollectionCell`, while
[Workspace Home](../../packages/extensions/fireux-properties/src/runtime/property/components/Workspace/Home/Single.vue)
uses `WorkspaceTargetCard`. [Workspace Identity](../../packages/extensions/fireux-properties/src/runtime/property/components/Workspace/Identity/Index.vue)
retains its read states, edit workflow, permissions and dedicated-App/context
controls. Current consumers need no Preview or separate Overview card. Property
has no public Detail route; see the [Entity detail map](family-entity-detail.md).

Menu supplies Pill, Cell and Preview under
[`menu/components/Cards` in Kitchens](../../packages/extensions/fireux-kitchens/src/runtime/menu/components/Cards).
Its controller-backed Collection starts with Preview and cycles through Cell and
Pill; scoped collections and the developer gallery also consume `MenuCardsPreview`.
Cards retain the pure `useMenuCardPresentation` projection, supplied serving times
and separate `MenuCardsActions` service links. `FoodVenue` retains its grouped
venue/result role. Collection parents retain reads, filters, paging and route
scope; Detail retains the full Menu reading composition. Current consumers do
not need a separate Menu Overview card. Core's `useCollectionSearch` supports
the `preview` mode while retaining its default Pill/Cell cycle.

Other Entities still contain `Cards/Summary.vue` and richer Profile or Detail
compositions. Their correspondence to the four roles is `to-confirm`: compare
actual consumers, data and interaction before moving them. A named domain
Summary outside Cards may describe a different capability and does not become a
Preview merely because its name matches an older card.

## Composition and interaction

Reuse Nuxt UI for controls and Core `FireActionSurface` for ordinary whole-card
link, action or static rendering. A supplied enabled link renders a link; an action
without a link renders a native button; a passive card remains noninteractive.
Keep domain actions explicit. A card with separate service buttons or nested
controls, such as Menu, retains its named interactive regions rather than making
the whole card a button. Disabled, focus and reduced-motion behavior follow the
shared mechanism and existing design system.

Specialist Agent, Professional, Chef and Driver profiles compose Core's
`UserProfileHero`, `UserProfileSection` and `UserProfileDirectoryCard` primitives.
These specialist rich presentations live in their `Cards/Overview.vue` files.
Domain content and permissions remain
with their owners. Place retains its rich `Detail/Profile.vue` section.
Ingredient uses `Detail/Summary.vue` for its bounded single-record presentation.
Unconsumed
legacy Profile cards are retired rather than retained as a parallel family.

Operational Tickets, receipts, Supplier Catalogues and QR business cards retain
their named responsibilities. Blog Story and Product Purchase cards remain
purpose-specific presentations, not missing variants to add to every entity.

## Verification and maintenance

Inspect source and consumers before changing a member. Compile affected Vue
components, check the consuming Apps' Nuxt registration/types, and run relevant
source-owned tests. Core `card-action-surface.test.mjs` exercises link, button,
static and disabled interactions plus representative domain composition.
There is no current card-family guard script. Update this map when stable ownership
or interaction conventions change; do not preserve temporary inventories or old
allowlists as authority.
User's formatter and card-consumer behaviour is covered by Core's
`src/test/user/composables/useUserView.test.mjs`; Docs' `core-inventory.test.mjs`
checks the four registered card names in the internal catalogue.
The same inventory check covers App's and Ecosystem's Cell and Preview names.
FireUX App's `app/tests/app-detail-relationships.test.mjs` renders the Ecosystem
and Project Previews within App Detail and checks exact relationship reads,
active-only Project presentation and their outcomes.
Kitchens' `src/test/user/components/Chef/Cards.test.mjs` checks Chef Preview
formatting/action forwarding and Overview content/action-slot presentation.
Jobs' `src/test/user/components/Agent/Cards.test.mjs` covers Agent Preview
content/action forwarding and Overview hiring, coverage, contact links and action slots.
Jobs' `src/test/user/components/Professional/Cards.test.mjs` covers Professional
Preview image/action presentation and Overview portfolio, evidence and action slots.
Kitchens' `src/test/user/components/Driver/Cards.test.mjs` covers Driver Overview
coverage formatting, capabilities, identity fallbacks and supplied actions.
Suppliers' `src/test/supplier-identity-presentation.test.mjs` covers the Overview's
supplied identity, media, delivery counts and empty/fallback presentation.
Properties' `src/test/portfolio-public-identity.test.mjs` renders Portfolio Overview
through its public projection and checks that internal fields remain excluded.
Core's `src/test/collection-search.test.mjs` and adjacent type contract cover
allowed modes, cycling and filtering. Kitchens' `src/test/menu-presentation.test.mjs`
checks Menu's default Preview, view controls, live filtering and service states;
`src/test/menu-public-slug.test.mjs` covers scoped entrances and ordering links.
