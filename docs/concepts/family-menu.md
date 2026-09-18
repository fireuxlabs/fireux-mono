# Menu family

Updated: 2026-09-18
Ref: d0caff27b
Role: map, not canon

## Purpose

Map the Menu family without conflating globally addressable Menu identity,
Kitchen-scoped structured content, directory route responses, or ordering.

## Links

- Parents: `family-entity-collection-page.md`, `family-entity-detail.md`,
  `server-api.md`, `tool-provider.md`
- Child: `menu-ordering.md`
- Horizontal: `entities.md`, `firestore-entity.md`, `workspace.md`,
  `family-tenant-global.md`, `ai-document-processing.md`,
  `runtime-filesystem.md`
- Route tests: `packages/extensions/fireux-kitchens/src/test/menu-public-slug.test.mjs`

## Family in one view

| Concept          | Kind   | Identity           | Job                                                                                                                |
| ---------------- | ------ | ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Menu             | Entity | Root               | Globally addressable doorway; owns identity, publication, and either a document source or a pointer to KitchenMenu |
| KitchenMenu      | Entity | Kitchen-scoped     | Catalogue identity, publication, sections and items                                                                |
| MenuSection      | Record | KitchenMenu-scoped | Groups MenuItem records; no independent lifecycle                                                                  |
| MenuItem         | Record | MenuSection-scoped | Menu placement, price, options, and order; always references a Dish                                                |
| MenuSourceUpload | Record | Kitchen-scoped     | Source file or URL awaiting Kitchen menu processing                                                                |
| Dish             | Entity | Kitchen-scoped     | Reusable food or drink identity and image, classified by `item_kind`                                               |

Menu and KitchenMenu are distinct confirmed entities. A root Menu may stand
alone as a photo/PDF/document doorway or point to a KitchenMenu. A KitchenMenu
may exist without a root Menu. Publishing or migration may connect them; it
must not copy the whole scoped menu into the root doorway.

Dish is a confirmed parent-scoped Entity: it has its own lifecycle inside one
Kitchen, but no root identity. MenuItem is a MenuSection-owned placement Record
and must reference a Dish from that same Kitchen. Dish owns food copy and media;
MenuItem owns price, variants, add-ons, availability, and order.

The Kitchen Workspace presents that one Dish entity through two named sibling
catalogues: `/workspace/kitchen/food/dishes` contains food and
`/workspace/kitchen/food/drinks` contains drinks. `/workspace/kitchen/menus` composes
both. This is a navigation and operating split over `Dish.item_kind`, not a
second Drink entity or a duplicated collection.

Kitchen has no primary/specials Menu configuration. Published Menus and their
`sort_order` define browsing. Named Kitchen services select eligible Menus by
stable ID; catalogue order does not grant ordering eligibility.

## Shared spine

- Menu reads use bounded server responses. Raw Menu or KitchenMenu
  Firestore rows are not the guest transport.
- `useMenuDirectory` owns Menu Directory outcomes, pagination, tenant redirect
  policy, and links.
- `useMenu` owns one resolved detail response, render kind, safe
  failure state, and relative Menu/index/QR paths.
- URL scope and Firestore ownership are separate. The server resolves
  ownership; a route slug cannot select a different App or Kitchen.
- A structured Menu with a valid Kitchen source is canonical at its
  Kitchen-directory doorway. Its global root doorway remains a discovery
  alias over the same bounded Browse projection. Root document Menus without a
  Kitchen remain canonical at their global root doorway; tenant Menus remain
  canonical on their tenant doorway.
- Root Menu stores no copied Kitchen name, image, route, currency, hours, or
  ordering policy. Bounded responses join presentation truth.
- Missing, unpublished, wrong-scope, malformed, or configuration-invalid
  Menus fail closed. Missing content is 404; configuration/read failure remains
  5xx and exposes no raw server detail.
- Menu count may change index presentation but not detail route grammar.
- QR is a distribution doorway to an existing Menu response. It is not Menu
  data ownership and does not choose the canonical route.
- Browse is readable by default. Ordering availability belongs to the
  ordering contract in `menu-ordering.md`.
- Kiosk ordering enters its catalogue through a section landing rather than
  preselecting the first section. The landing renders Food first and Drinks
  beneath it without a family toggle. Selecting a section reveals only that
  section's items; the complete section list remains available in a
  closed-by-default drawer and through an explicit return to the landing.
  The kiosk skin may own the catalogue background and keyed section-card
  artwork; without keyed artwork, a section card derives its representative
  image from that section's canonical Dish media.

## Menu doorways

| Scope             | Index                           | Detail                                   | Why it differs                                                                                 |
| ----------------- | ------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Global root       | `/menus`                        | `/menus/<globalMenuId>`                  | Globally addressable Menu namespace across the App                                             |
| Kitchen directory | `/kitchens/<kitchenSlug>/menus` | `/kitchens/<kitchenSlug>/menus/<menuId>` | Explicit Kitchen namespace in a multi-Kitchen App                                              |
| Tenant            | `/menus`                        | `/<menuId>`                              | The tenant config supplies the bounded Kitchen, so repeating the Kitchen slug adds no identity |

All three may resolve the same KitchenMenu source. Adding a tenant App is
additive: it must not remove or replace global or Kitchen-directory doorways.

Tenant index behavior is bounded and count-aware:

- one published Menu and no next page: temporary redirect to `/<menuId>`;
- zero: empty index;
- two or more: Menu list.

The detail route remains `/<menuId>` if the tenant later gains more Menus.

Appending `/qr` creates the corresponding QR doorway. Contextual identities
append a guarded suffix before `/qr` when needed.

## Route contexts

The current route vocabulary is:

- `generic` → Browse projection;
- `delivery`, `collection`, `kiosk`, `pre_order` → Order projection;
- `table`, `staff_pos`, `dine_in`, `room_service` → diagnostic projection
  until a dedicated guest/authenticated renderer is proved.

Contexts append to Menu identity, for example `<menuId>.collection`. A Kitchen
slug with a suffix but no Menu identity is not a Menu context. The route model,
projection classifier, middleware layout, and QR path must agree. Public-slug
tests cover identity resolution; inspect these source consumers together when
changing route grammar. The former `scripts/` guard suite is removed.

## Source and maturity

Root Menu kinds:

- `doc`: uploaded photo, PDF, generic document, or source URL doorway;
- `menu`: structured doorway pointing to KitchenMenu through minimal
  `source.app_id`, `source.kitchen_id`, and `source.menu_id` identity.

Document file kinds are `photo`, `pdf`, `document`, and `url`.

No Kitchen is needed to:

- upload and publish a quick document Menu;
- render its source;
- generate a stable Menu and QR doorway;
- invite the owner into a richer workflow.

A Kitchen is needed to:

- own KitchenMenu identity;
- process a source into sections, items, and Dish references;
- configure Kitchen operational policy;
- use tenant/directory Kitchen routing;
- enable translation and ordering layers.

AI extraction produces reviewable candidate content. It does not become
KitchenMenu, Dish media, or published Menu truth until the owning Kitchen flow
validates and commits it.

## Presentation inheritance

Menu presentation is resolved, not copied:

1. Kitchen owns currency and its four-role `theme.palette`: canvas, text, accent
   and accent contrast. Basic colour editing is available on every plan.
2. Kitchen-owned Menus consume those colours directly; they store no theme,
   kiosk skin or intermediate presentation overrides.
3. Named Kitchen services select Menus, own serving schedules and allow browse or
   ordering interactions. Menu responses derive eligible interactions with their
   exact service identity; channels reuse the same policy.
4. Standalone document Menus retain their own existing source authority.

The Menu directory uses host App chrome; Menu detail uses Kitchen colours.

When Sproochli is attached, the Kitchen's `default_language` also supplies the
Menu interface language for labels such as sections, options, and
allergy information. A visitor-selected `sproochli` language replaces that
interface copy together with the translated Menu projection; the unselected
default route never rewrites the original Menu content.

Dish owns reusable food media. MenuItem may reference Dish but does not own a
second food-image field. Storage normalization and exact image constraints are
implementation contracts in the Kitchen server/media source, not this family
map.

## Component and ownership boundaries

- `runtime/menu/components/Index` owns Menu Directory composition.
- `runtime/menu/components/Browse` owns context-free Menu reading.
- `runtime/menu/components/Order` owns the canonical ordering shell.
- `runtime/kitchen/components/Workspace/Menus` owns upload,
  processing, editing, publishing, sections, items, QR management, and
  links to Kitchen service configuration.
- `runtime/menu/components/Json` is temporary diagnostic rendering for
  contexts that do not yet have a dedicated projection.
- Project Apps configure or compose these surfaces; they do not recreate a
  competing Menu renderer.

Menu and Kitchen Menu now use their scoped component and composable roles.
Root technical paths are completed legacy placements and must not return.

## Accepted deltas

| Delta                                                             | State      | Reason                                                                                                                                         |
| ----------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Root document Menu has no Kitchen                                 | `accepted` | Quick upload and QR must work before Kitchen onboarding                                                                                        |
| KitchenMenu has no root Menu                                      | `accepted` | A Kitchen may prepare private/unpublished structured content before creating a global doorway                                                  |
| Tenant route omits Kitchen slug                                   | `accepted` | Config provides the bounded Kitchen scope                                                                                                      |
| Global, directory, and tenant routes share data but not URL shape | `accepted` | Each route expresses a different navigation context, not different ownership                                                                   |
| Browse and Order are separate projections                         | `accepted` | Browse is readable by default; transactional controls require explicit policy and lifecycle                                                    |
| Private context identities are reserved in route grammar          | `accepted` | Stable QR and entry identities can exist before each restricted product surface is complete; unfinished rendering remains migration debt below |

## Migration and drift register

| Difference                                                            | State        | Required direction                                                                                                                                           |
| --------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Older flat `doc_*` and `kitchen_*` root Menu fields                   | `migration`  | Read during migration, emit the clean `kind`/`file`/`source` Menu contract, and stop writing flat compatibility fields                                       |
| AppKitchen `workspace.menus.style` contains legacy colour `PageStyle` | `migration`  | Move the proved four-role palette to Kitchen with protected preimages; remove the AppKitchen reader at cutover                                               |
| Exact quick Menu → KitchenMenu migration behavior                     | `to-confirm` | Preserve the root Menu/QR doorway while defining ownership transfer, source pointer update, rollback, and id collisions                                      |
| Global and Kitchen-directory routes expose one KitchenMenu            | `accepted`   | The Kitchen-directory doorway is canonical; the global route remains an additive discovery alias                                                             |
| Product demonstrations retain preview-only screens                    | `accepted`   | `menu/components/Preview` and `menu/composables/preview` own demonstration presentation; real ordering uses `MenuOrder`                                      |
| Diagnostic contexts use generic JSON rendering                        | `migration`  | Replace only when each context has a proven dedicated surface and privacy contract                                                                           |
| AI candidate images require explicit Dish media review                | `accepted`   | Kitchen persists Keep, Reprocess with AI, Generate, or No image per draft item; only reviewed Keep outputs cross canonical Dish normalization during confirm |
| Premium global Menu-id claim/reservation policy                       | `to-confirm` | Do not claim enforcement until business policy and trusted implementation exist                                                                              |

Filesystem placement is `accepted`: Menu and Kitchen Menu implementation lives
under its Menu or Kitchen owner without merging their identities or leaving
compatibility paths.

## Source map

Start with:

- Entity declarations: `models/kitchen/menu/menu.model.ts` and
  `models/kitchen/menu/kitchen-menu.model.ts`.
- Route grammar: `utils/kitchen-menu-route.ts`.
- Ownership resolution: `runtime/menu/server/ownership/target.ts`.
- Menu Directory: `runtime/menu/composables/useMenuDirectory.ts`.
- Menu detail: `runtime/menu/composables/useMenu.ts`.
- Workspace operation:
  `runtime/kitchen/composables/workspace/Menus`.
- Ordering details: `menu-ordering.md` and the Menu Order source it references.

## Alignment roadmap

### Now

- Preserve distinct Menu and KitchenMenu identity.
- Keep all Menu doorways on one bounded ownership resolver and guarded route
  grammar.
- Keep Browse readable and ordering capability explicit.

### Next

- Define and test quick Menu → KitchenMenu migration while preserving printed
  QR links.
- Remove flat root compatibility fields after data migration.
- Keep product-preview screens separate from the live `MenuOrder` transaction lifecycle.
- Route reviewed AI media through canonical Dish ingestion.

### Later

- Promote diagnostic contexts only when their product and privacy contracts
  are real.
- Decide premium global-id reservation separately from ordinary Menu identity.
