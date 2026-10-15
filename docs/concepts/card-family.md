# Card family

Role: source map, not executable certification

## Purpose and authority

Classify reusable record cards separately from acquisition, editing and full
profile/detail compositions. Inherit `AGENTS.md`, `docs/ai/gpt-context.md` and
`components.md`. Current source, Nuxt registration, real consumers and tests
establish behavior; this map does not certify every entity as identical.

## Responsibilities

| Section | Owns | Does not own |
| --- | --- | --- |
| `Cards/Cell.vue` | Collection entry with enough identity and context to choose a record | Record acquisition or the full detail page |
| `Cards/Pill.vue` | Compact inline identity, link or selection control | A miniature detail page |
| `Cards/Summary.vue` | Bounded standalone record information | A preview workflow or full profile |
| `Profile/Index.vue` or named `Detail/*` section | Rich identity, profile sections and domain composition | A compulsory fourth card variant |

Cards receive props or a typed domain projection. Formatting, conditional anatomy,
pure presentation helpers, supplied destinations and emitted actions are valid.
Cards do not acquire records, mutate storage or decide authority. Only add the
variants a consumer actually needs; field shapes and domain content remain local.
A Summary can display draft input inside a Preview surface without becoming a
Preview component itself. Cell, Pill and Summary differ by use, not a universal
size ladder or a mandatory four-file scaffold.

## Composition and interaction

Reuse Nuxt UI for controls and Core `MoleculesActionSurface` for ordinary whole-card
link, action or static rendering. A supplied enabled link renders a link; an action
without a link renders a native button; a passive card remains noninteractive.
Keep domain actions explicit. A card with separate service buttons or nested
controls, such as Menu, retains its named interactive regions rather than making
the whole card a button. Disabled, focus and reduced-motion behavior follow the
shared mechanism and existing design system.

Specialist Agent, Professional, Chef and Driver profiles compose Core's
`UserProfileHero`, `UserProfileSection` and `UserProfileDirectoryCard` primitives.
Their full presentations live in each role's `Profile/Index.vue`; domain content
and permissions remain with their owners. Place and Company retain their rich
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
