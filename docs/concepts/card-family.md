# Card family

Updated: 2026-11-08
Ref: 242c55e43
Role: source map, not executable certification

## Purpose and authority

Define the Pill, Cell, Preview and Profile presentation roles separately from
acquisition, editing and route/detail composition. Inherit `AGENTS.md`, `docs/ai/gpt-context.md` and
`components.md`. Current source, Nuxt registration, real consumers and tests
establish behavior; this map does not certify every entity as identical.

## Responsibilities

| Section             | Owns                                                                 | Does not own                                                                       |
| ------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `Cards/Cell.vue`    | Collection entry with enough identity and context to choose a record | Record acquisition or the full detail page                                         |
| `Cards/Pill.vue`    | Compact inline identity, link or selection control                   | A miniature detail page                                                            |
| `Cards/Preview.vue` | A supplied record or draft presented for review                      | Acquisition, draft ownership, editing or submission                                |
| `Cards/Profile.vue` | Richer presentation of the supplied Entity's identity                | The route, related capability reads, membership administration or editing workflow |

Cards receive props or a typed domain projection. Formatting, conditional anatomy,
pure presentation helpers, supplied destinations and emitted actions are valid.
Cards do not acquire records, mutate storage or decide authority. Only add the
variants a consumer actually needs; field shapes and domain content remain local.
These are presentation roles, not a universal size ladder or a demand for empty
components. A member supplies the roles its consumers need. A Preview card may
appear in an editor's review step or display a saved record; the consuming
workflow still owns draft state and submission. A Profile card may be composed
within Detail, alongside separately owned membership and related capabilities.

## User baseline and current differences

Core User proves all four roles under
[`user/components/Cards`](../../packages/core/fireux-core/src/runtime/user/components/Cards).
Its Collection consumes Pill and Cell, Current switches between Preview and
Profile, diagnostics uses Preview, and Detail composes Profile beside the
App-owned membership capability. The existing `useUserView` formats supplied
identity without acquiring a record. Profile retains its settled-Auth self-edit
link availability; protected commands remain the write authority.

User's shared Hero, Section, SectionHeading, DetailSurface and DirectoryCard
primitives remain under `user/components/Profile` for specialist profile
compositions. They are not alternate User Profile cards. There is no old
`UserCardsSummary` or `UserProfile` compatibility registration.

Core App supplies Cell and Preview under
[`app/components/Cards`](../../packages/core/fireux-core/src/runtime/app/components/Cards).
`AppEditSectionsSurfaces` presents the supplied `AppCard` projection through
both cards. `useAppView` retains projection ownership; Preview retains its
display props and the shared preview styles. App Detail keeps its separate
route and related-capability composition.

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
Their full presentations live in each role's `Profile/Index.vue`; domain content
and permissions remain with their owners. Place and Business retain their rich
`Detail/Profile.vue` sections. Ingredient, Portfolio and Kitchen Workspace Supplier
use `Detail/Summary.vue` for their bounded single-record presentations. Unconsumed
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
The same inventory check covers App's Cell and Preview names.
