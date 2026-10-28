# Menu family

Updated: 2026-10-14
Ref: a2bd21763
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

| Concept | Identity | Job |
| --- | --- | --- |
| Menu | Kitchen-scoped | One interactive or document Menu: name, slug, publication, audience and format |
| MenuSection | Menu-scoped | Groups Dish and meal-deal placements |
| MenuItem | Section-scoped | Dish or meal-deal reference, availability and display order |
| Dish | Kitchen-scoped | Food/drink identity, normal price, options, extras and preparation |
| Promotion | Kitchen-scoped | Dish offers or meal deals with set price, choices and supplements |
| MenuSourceUpload | Kitchen-scoped | Source material awaiting review; not a published Menu |

`menu/models/menu.model.ts` is the sole stored Menu model.
`menu/models/menu-storage.model.ts` owns `kitchens/{kitchenId}/menus/{menuId}`.
There is no root Menu record, standalone Menu upload, copied publication status,
or directory synchronization command. Interactive content uses sections and Dish or meal-deal
references; document content uses the Menu's `doc` attachment. Both use the same
creation, publication, audience and QR flow. Daily specials retain their separate
per-date publication feature.

Kitchen's combined Food & drinks catalogue filters the same Dish family by
`item_kind`; Menu names do not classify Dishes. Its URL retains kind, search,
category, completeness filter, layout and page. Food and drink editors return to
that combined catalogue through `kitchen/utils/dish-catalogue-route.ts`; loading
does not reset a restored page, and settled results clamp an obsolete page.
`dish-reader-internals.test.mjs` covers the round trip and delayed Kitchen/data
resolution. Kind-specific editors retain their existing authority. Named services reference stable
Menu IDs and own eligibility and serving schedules.

## Shared spine

- Menu reads use bounded server responses. Raw Menu
  Firestore rows are not the guest transport.
- `useMenuDirectory` owns Menu Directory outcomes, pagination, tenant redirect
  policy, and links.
- `useMenu` owns one resolved detail response, render kind, safe
  failure state, and relative Menu/index/QR paths.
- URL scope and Firestore ownership are separate. The server resolves
  ownership; a route slug cannot select a different App or Kitchen.
- Kitchen-directory and tenant routes resolve the same authoritative Menu.
  Global discovery links to those routes and stores no separate Menu record.
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

## Regular Menu publication tools

The routed Menu Publishing view consumes Kitchen-owned `Workspace/Menus/Publication/Actions.vue`.
Its Menu-owned `composables/publication/useMenuPublication.ts` captures the current
account, App membership, selected Kitchen and route before awaiting credentials;
obsolete intent does not dispatch. The component separately discards obsolete
UI completion and errors. Trusted `menu/server/publication` commands own content
validation and atomic Menu status changes. Regular publication and confirmed
unpublication are connected. Published regular Menus expose the existing public
QR print doorway from the same action row, using the public website origin and
Menu route builder. Daily Menus use the separate per-date publication flow below.
Broader destination distribution and immutable publication versions remain separate.

Regular Menu Settings expose Archive as the normal removal action and list the
services that reference the Menu, including disabled services. Archiving updates
only Menu status/audit, withdraws public/QR reads and keeps content/service links.
Restoring returns to draft; publishing requires that explicit restoration first.
Archived Menus remain reachable through the collection's Archived control.
Permanent deletion is available only for unpublished regular Menus with no
sections, document attachment or service references; the server repeats these
checks in its writing transaction. There is no child cascade or price mutation.
See `menu/server/publication/state.ts`, `menu/server/records/delete.ts` and `kitchen/menu-metadata.test.mjs`.
Source-owned `menu-publication-client.test.mjs` and `menu-publication.test.mjs`
protect the publication boundary; they do not prove live operator acceptance.

## Menu doorways

| Scope             | Index                           | Detail                                   | Why it differs                                                                                 |
| ----------------- | ------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Global discovery | `/menus` | Links to Kitchen-directory detail | Reads authoritative Kitchen Menus directly |
| Kitchen directory | `/kitchens/<kitchenSlug>/menu` | `/kitchens/<kitchenSlug>/menus/<menuId>` | Explicit Kitchen namespace in a multi-Kitchen App                                              |
| Tenant            | `/menus`                        | `/<menuId>`                              | The tenant config supplies the bounded Kitchen, so repeating the Kitchen slug adds no identity |

Global discovery uses the `menus` collection group, accepting only exact
`kitchens/{id}/menus/{id}` paths. It filters unpublished/nonpublic Menus and
inactive or hidden Kitchens. It pages by full document path, so repeated Menu
IDs in different Kitchens cannot collide. Venue discovery retains Menu order.

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
- `delivery`, `collection`, `table`, `kiosk`, `pre_order` → Order projection;
- `staff_pos`, `dine_in`, `room_service` → diagnostic projection
  until a dedicated guest/authenticated renderer is proved.

Contexts append to Menu identity, for example `<menuId>.collection`. A Kitchen
slug with a suffix but no Menu identity is not a Menu context. The route model,
projection classifier, middleware layout, and QR path must agree. Public-slug
tests cover identity resolution; inspect these source consumers together when
changing route grammar. The former `scripts/` guard suite is removed.

## Source and maturity

Menu formats are `interactive` and `document`. Creating either requires a
Kitchen; generic URL-to-QR remains a separate Go QR tool, not a Menu record.

Create Menu exposes PDF or photos, Menu URL, and Start blank as separate methods.
URL imports open source review without requiring a Menu name first.
File ingestion uses a native file picker and the Kitchen-owned `useMenuSourceUpload`
coordinator. It stores the source through the existing upload endpoint, then opens
its source route for the existing FireUX AI process/review controls. Passed source
context reuses that route's acquired data; Go QR is not part of this workflow.
New source ids are internal; the reviewed Menu name supplies the public slug at
confirmed creation. See `menu-source-upload.test.mjs` and `menu-import-name.test.mjs`.

AI extraction produces reviewable candidate content. It does not become
Menu, Dish media, or published Menu truth until the owning Kitchen flow
validates and commits it.
Review completion replaces its saved process map without a nested delete marker;
`menu-ai-review-save.test.mjs` validates that update with the real Firestore SDK
without committing it. Import planning gives each Menu source its own deterministic
Dish identities; matching names never reuse catalogue Dishes. Retrying the same
source preserves its identities. Existing-Dish reuse belongs to the section's
catalogue picker. Import confirmation still blocks changed prices on a previously
created import Dish. See `menu-draft-plan.test.mjs`.
The review presents Menu items and one confirmation area. Processing and technical
reports stay in closed disclosures after extraction. Media decisions are required
only for detected image candidates; no-image items need no separate approval.
See `menu-process-composition.test.mjs` and `menu-import-media-gate.test.mjs`.

## Presentation inheritance

Menu presentation is resolved, not copied:

1. Place owns venue currency; Kitchen resolves it through its linked Place.
   Kitchen owns its four-role `theme.palette`: canvas, text, accent and accent
   contrast. Basic colour editing is available on every plan.
2. Kitchen-owned Menus consume those colours directly; they store no theme,
   kiosk skin or intermediate presentation overrides.
3. Named Kitchen services select Menus, own serving schedules and allow browse or
   ordering interactions. Menu responses derive eligible interactions with their
   exact service identity; channels reuse the same policy.
4. Document Menus inherit the same Kitchen presentation as interactive Menus.

The Menu directory uses host App chrome; Menu detail uses Kitchen colours.

When Sproochli is attached, the Kitchen's `default_language` also supplies the
Menu interface language for labels such as sections, options, and
allergy information. A visitor-selected `sproochli` language replaces that
interface copy together with the translated Menu projection; the unselected
default route never rewrites the original Menu content.

Dish owns reusable food media. MenuItem may reference Dish but does not own a
second food-image field. Kitchen `services.item_images` supplies the customer
text-only/image-enabled preference through the existing presentation projection.
Missing and failed images never remove item text, prices or choices. Zero-priced
items display an explicit zero; absent prices remain absent. Verify with
`item-presentation.test.mjs` and `food-foundation-journey.test.mjs`.
Storage normalization and exact image constraints are
implementation contracts in the Kitchen server/media source, not this family
map.

## Component and ownership boundaries

- Menu Directory routes compose the current Hero/Create/Collection surface;
  `runtime/menu/components/Index` is a retained older presentation, not the
  current root Directory entry.
- `runtime/menu/components/Detail` owns context-free Menu reading.
- `runtime/menu/components/Order` owns the canonical ordering shell.
- `runtime/kitchen/components/FoodAndDrink/Menus` owns upload,
  processing, editing, publishing, sections, items, QR management, and
  links to Kitchen service configuration.
- `runtime/menu/components/Json` is temporary diagnostic rendering for
  contexts that do not yet have a dedicated projection.
- Project Apps configure or compose these surfaces; they do not recreate a
  competing Menu renderer.

Menu uses its domain-owned component and composable roles.

The selected Kitchen Menu record is composed once by
`provideKitchenMenuRecordContext`; nested record tools consume its scoped
instance. Menu-owned `useKitchenMenuRead` resolves the exact slug with a bounded
live query, rejects duplicate matches and rebinds with account/App scope. The Menus collection controller retains selection and creation,
while section items retain their focused item/Dish workflow. See the
Misebox context and `menu-record-controller.test.mjs` for this boundary.

## File responsibilities and input contracts

Menu catalogue creation, metadata editing and removal live in
`menu/server/records/{create,update,delete}.ts`; scoped item writes live in
`menu/server/items/write.ts`. `menu/server/creation-capacity.ts` is the shared
transaction-time allowance check for manual creation and reviewed draft imports.
The HTTP adapters call those owners directly; there is no mixed command barrel
or forwarding compatibility entrypoint.

Pure `menu/utils/menu-metadata.ts` validates and copies editable catalogue
metadata. Creation and metadata editing share complete document metadata and
description limits, while route-name validation stays with the trusted Menu
name owner. Placement writes reject commercial terms; Dish commands validate
normal prices, options and extras. Command
inputs are detached before awaiting actor credentials. Publication, source
review and Dish pricing retain their separate owners.
See `src/test/menu-record-input-internals.test.mjs` and the command, content,
metadata and publication tests; these are controlled source checks.

The Menus collection and source-upload readers bind only after the selected
Kitchen has an exact ready Workspace outcome. Kitchen failures/loading remain
distinct from empty Menu collections, and independent upload failures retain
their own outcome without hiding loaded Menus. Section/item and uploaded-source
pages render failure and loading before missing/empty copy or counts.
`src/test/menu-reader-internals.test.mjs` checks these owners and full templates.

Menu creation, URL import and Dish pricing editors capture
their account/App/membership, destination and local editing lifetime. Completed
writes stay truthful, while obsolete navigation, draft resets and feedback are
discarded. Upload credentials are cleared immediately on scope change and an
older token cannot replace the current token. Scope/disposal checks live in
`menu-create-scope.test.mjs` and `kitchen/menu-tool-completion.test.mjs`; they do
not establish a signed-in browser or provider transaction.

## Accepted boundaries

- A Menu belongs to one Kitchen, whether interactive or document.
- Global discovery is a query and response, not another stored Menu identity.
- Tenant routes omit the Kitchen slug because App configuration supplies it.
- Browse, service presentations and QR reuse the same published Menu.
- Generic document/URL QR generation belongs to Go QR, outside Menu storage.
- Retained old root records are outside the runtime contract; deleting stored
  data requires a separately reviewed cutover, not a runtime fallback.

## Source map

Start with:

- Menu declaration and storage: `runtime/menu/models/menu.model.ts` and
  `runtime/menu/models/menu-storage.model.ts`.
- Normal commercial terms: `runtime/kitchen/models/dish.model.ts` and
  `runtime/kitchen/utils/dish-pricing.ts`.
- Direct discovery: `runtime/menu/server/index/read.ts` and
  `src/test/menu-canonical-discovery.test.mjs`.
- Route grammar: `runtime/menu/utils/menu-route.ts`.
- Ownership resolution: `runtime/menu/server/ownership/target.ts`.
- Menu Directory: `runtime/menu/composables/useMenuDirectory.ts`.
- Menu detail: `runtime/menu/composables/useMenu.ts`.
- Workspace operation:
  `runtime/kitchen/composables/workspace/menus`.
- Ordering details: `menu-ordering.md` and the Menu Order source it references.

## Component responsibility sections

Menu keeps its technical-role spine. `components/Collection` owns collection
headers, entry actions, passed results and controller-backed collections.
`RouteSurface.vue` dispatches the resolved Menu route to Detail, Order or Diagnostics;
`Detail` owns its header/exit, catalogue/document
presentation, section navigation and service links. `Order` composes item
selection, Checkout and Response; `Create` links to Kitchen-owned Menu creation;
`QR` owns QR output; `Cards` owns collection representations and their entrance
actions; `FireDiagnostics` owns JSON inspection. Components use Menu-prefixed Nuxt
registration, with real consumers updated together. `RouteSurface` is Menu-specific
URL dispatch, not a required section or component for every Entity. Collection,
Detail, Cards and Create keep the shared Entity vocabulary.

`Collection/Results.vue` collates eligible Collection/Delivery Menu rows into one result per Kitchen, with menu names leading, secondary venue identity and only matching service times. Other menus sit behind a quiet venue browse link. It adds no Kitchen reader. Service choices open the venue service presentation; browse choices open the individual Menu.
`Collection/Index.vue` consumes a scoped controller, paging, outcomes and
presentation choices. Their differing inputs/lifetimes remain explicit; both
reuse collection search. The retired `Preview/ItemOptions.vue` and
`Record/SurfaceSwitcher.vue` had no consumers and were removed, not promoted into
new shared controls. Current item options remain with Detail Item and Order
MenuItems, which have materially different read-only and selection contracts.

`utils/menu-route.ts` owns root, tenant and directory Menu route scopes; Kitchen
surfaces consume it rather than owning root Menu navigation. `RouteSurface.vue`
retains only active dispatch branches. Global Menu frame tokens are explicitly
registered from `assets/styles/menu-frame.css`; QR and section-navigation CSS are
colocated with their named projection components. There is no component `styles`
catch-all. Detail and Order item presentation remain separate until comparison
proves a common contract without combining browse and purchase actions.

The inspected repository retains one Kitchen-owned Menu shape, alongside distinct
Ingredient, KitchenIngredient association and SupplierIngredient offering contracts.
Same nouns do not authorize merging their data or mutation owners. This is a bounded
ownership comparison, not a complete repository duplication certification.

## Menu responsibility boundaries

Menu storage targets, defaults and input contracts live in
`menu/models/menu-storage.model.ts`; utilities retain pure
transformations and policy helpers. Order cart/input contracts live in
`menu/models/menu-order-flow.model.ts`, independent of the flow controller.
`useMenuDetail` owns the public browse read/presentation lifecycle, including
canonical SEO and language intent. The Detail composition retains its optional
SSR readiness wait and response status.
`useMenuQrRenderer` owns QR generation and disposal; the QR composition retains
Menu availability and print presentation. Components use the existing named
Nuxt registrations. No storage schema or publication authority changes accompany
this organisation.

## Daily Menu publication

Daily Menus retain dated MenuSections and ordinary dish-backed items. The focused
`Workspace/Menus/Publication/Daily.vue` control reviews the chosen date through
Dates & selections and calls `menu/server/publication/daily.ts` through the existing scoped
Menu mutation adapter. The command requires current membership, Kitchen authority
and Plus, validates every active selection/item for that date, and updates
`published_dates` on the canonical Menu in one transaction. Copying a date
copies content only; it never publishes the destination.

Tenant and Kitchen-directory Menu/QR routes read that canonical Menu.
Public reads resolve today using the linked Place timezone, return only explicitly
published selections for that date, and show an empty-day message without falling
back to past or future content. The server supplies the next local date boundary;
the mounted reader clears old content and refreshes once at that boundary, with
scope disposal. Existing live reads reflect edits and date withdrawal. Withdrawing
one date preserves other published dates and the doorway. Daily Menus are browse-only:
public order entrances, service links and transactional submission remain blocked.

Verify `daily-menu-publication.test.mjs`, `daily-menu.test.mjs`, the public projection
checks, and the publication/client-scope checks. Controlled checks do not establish
live operator publication or provider/deployment acceptance.

## Meal-deal entries

Regular interactive Menu placements reference one Kitchen Dish (`dish_id`) or
Kitchen meal-deal Promotion (`promotion_id`). The Menu owns organisation and
availability; Dish owns normal terms, Promotion owns its set price and choices.
Daily specials do not accept meal-deal placements. Section editing exposes both
entry kinds, and public Menu cards display read-only deal choices/supplements.
Venue-local weekdays and service serving windows control deal visibility.
See `menu-meal-deals.test.mjs`, Menu publication/content-command checks and
`menu-pricing.test.mjs` for catalogue presentation. Collection selection and
transactional Order pricing have separate owners and checks below.

## Catalogue and Order dependency direction

Dish and Promotion definitions do not depend on Orders. Menu catalogue resolution
reads venue presentation, language and service eligibility/serving schedules; it
does not load Kitchen delivery zones or payment methods. The dedicated fulfilment
endpoint and Order adapters retain their own policy reads. Order selection, cart
lines and submission belong to those consumers, not the read-only item model.
`menu-public-slug.test.mjs` verifies catalogue resolution without a fulfilment read.

## Collection checkout

Collection's Menu-owned Selection composition retains one local basket across
catalogue refreshes and errors and composes a focused checkout. The existing
Menu-submit adapter delegates to the Kitchen submission command; no second Order
store or submission authority is introduced. `menu/server/ordering.ts` coordinates
canonical reads across Menu sources. Its focused `ordering/selections.ts` parser
and `ordering/items.ts` transaction reader reuse Dish pricing, Promotion policy
and `serviceBasketLine` choice calculations. Kitchen, service and Menu hours all
constrain ordering. Options, extras, meal groups/supplements and bottle choices
remain in structured saved selections; canonical Order line notes carry the
choices to the customer response and Kitchen ticket. Normal catalogue records
are read, never repriced or written by checkout.

`useCollectionCheckout` reuses scoped Order exchange for submission and responses,
freezes an unresolved attempt for idempotent retry and checks for an existing
receipt before permitting edits after a rejection. `useCollectionRecovery` saves
the basket, customer fields and immutable attempt in tab session storage, scoped
by App, Kitchen, Collection entrance and customer. Refresh restores selections
without silently repricing them, then checks the existing response for a saved
attempt; restoration never submits. Current catalogue readiness and stale-item
checks still gate new attempts. Reset removes the saved session. Malformed local
data is discarded, and unavailable browser storage is reported without breaking
the local basket. The current Collection flow
orders during serving hours; next-day slots and payment processing are separate.
Collection composes a customer-focused `Selection/Confirmation.vue` over the
existing response. It shows saved quantities, canonical choice notes, line totals
and total, distinct execution status and Kitchen estimates. Collection details
come from the already-acquired public venue projection; missing details are
omitted, and no counter location or payment status is assumed. Failed response
refreshes retain the receipt and expose the existing read-only refresh action.
The staff Ticket and other Menu order presentations keep their existing owners.
Verify `collection-confirmation.test.mjs`, `collection-checkout.test.mjs`,
`menu-service-basket.test.mjs`, existing
Order submission/flow and ticket checks. These fixture tests are not evidence of
live submission or physical fulfilment.

## Safe Dish removal

Dish's removal control reads its live Menu-section and Promotion usages. Saved
references count even in archived placements or paused Promotions. The trusted
Dish delete command repeats the same scoped check inside its writing transaction
and refuses deletion until references are removed; it never cascades or reprices.
Section editing exposes an explicit confirmed placement removal action. It deletes one placement through the Menu command and
keeps the referenced Dish or Promotion intact. Usage links can open archived
sections for this cleanup using the already acquired section rows; ordinary
section navigation still lists active sections.
The protected usage reader observes current membership and Kitchen access as well
as the referenced collections. Public Menu projection omits missing/archived
Dishes and hides an entire meal deal when any included choice is unavailable,
keeping other entries readable. Malformed prices and currency still fail validation.
See `kitchen/dish-commands.test.mjs`, `kitchen/dish-ui-scope.test.mjs` and
`menu-meal-deals.test.mjs`.

## Focused section editing

Menu section detail composes one item list and one Add items entrance. The add
modal selects catalogue food/drinks, new Dish names or meal deals, mounting only
the selected workflow against the parent's existing scoped section state.
Item rows use simple dividers, show name and Dish-owned price, and expose a
labelled Remove from section action in the vertical three-dot menu, with
confirmation. The same menu contains secondary editing actions. Adding a removed Dish back uses the catalogue in Add items;
there is no availability toggle in this editor. Daily specials retain their own date
flow and do not expose meal-deal entry. Source checks live in
`menu-editor-composition.test.mjs` and `kitchen/menu-tool-completion.test.mjs`.

Menu editing rows show a single normal price directly. When a Dish has variants,
the row says “Multiple prices”; names and prices are tucked into its vertical
three-dot menu. These editing surfaces omit repeated currency codes because the
linked Place owns the currency. The Menu/section editing header shows that
Place currency once; public currency formatting remains with its existing owner. Full editing stays with Dish pricing; stored terms are unchanged.

## Display ordering

Manual Menu section and entry creation assigns the next position from the highest
saved position inside the writing transaction, including retained archived rows.
The parent audit update serializes concurrent appends. Catalogue/Dish prices are
not part of the position write. Reviewed imports retain their own replacement
plan ordering.

Items and sections expose Move up / Move down in the same vertical three-dot
menu. `menu/server/display-order.ts` rereads current Kitchen authority, Menu,
section and scoped rows, swaps adjacent entries and normalizes their ranks in
one guarded transaction. Boundary moves do nothing. Daily section moves stay
within the selected date and retain Plus authority. Section rows use dividers.
The former multi-request reorder helpers are removed. Check
`menu-display-order.test.mjs`, `kitchen/menu-content-commands.test.mjs` and
`kitchen/dish-ui-scope.test.mjs` for append gaps, tied ranks, atomic failure,
price preservation, exact scope and obsolete client completion.

Section rows expose Archive section and Restore section in the same vertical
action menu. The existing section status command preserves the section’s entries
and catalogue Dishes. Archived sections are available through a quiet collection
control, scoped to the selected date for Daily specials, and remain excluded from
public manifests. Confirmation and pending completion retain Menu/account scope;
no additional reader or deletion command is introduced. Publishing’s public Menu
link and QR use the same configured public origin. Verify section lifecycle scope
in `kitchen/menu-content-scope.test.mjs` and origin parity in
`menu-publication-client.test.mjs`.

Menu rename changes the display name only. The creation-time slug stays stable,
so existing public and QR destinations continue to resolve. Display names need
not be unique; slug uniqueness remains a creation responsibility. Verify
`kitchen/menu-metadata.test.mjs`.

## Publication readiness

`menu/utils/publication-readiness.ts` evaluates active placements against current
Dish and meal-deal definitions. The trusted regular publication validator uses
that report to reject empty content and unavailable entries, with section/name
reasons. It reads only Menu content, Dishes and Promotions and writes no terms.
Document and per-date Daily validation remain separate.
`Workspace/Menus/Publication/Readiness.vue` owns the live content warning and its
focused section diagnostic children. The record reuses its section list; section
editing passes its existing catalogue, promotion and current-item readers rather
than acquiring duplicates. Other active sections use the existing scoped item
reader. Loading/failure never imply an empty Menu; a genuinely empty published
Menu warns without automatically changing publication. Scheduled meal-deal
weekdays do not make structurally valid future content incomplete.
Verify `menu-publication.test.mjs` and `menu-publication-readiness.test.mjs`,
including archived Dishes, paused deals, grouped diagnostics, disappearing last
items and explicit read-state outcomes. Live checks remain read-only.

Menu item Add is idempotent for the same Dish or meal-deal reference within one
section. `menu/server/items/write.ts` checks that reference in its existing
transaction after authority and reference validation. Active matches return their
saved ID without writes; archived matches restore in place, retaining position
and provenance. New additions still update the read parent section, so competing
transactions retry and converge on one placement. Other sections and Menus may
use the same reference independently. No Dish, Promotion or Order data is written.
Verify repeat requests, optimistic transaction conflicts, archived matches and
scope separation in `menu-item-idempotency.test.mjs`; this simulated conflict
coverage is not a claim of a live concurrent Firestore test.

Section item editing aligns a single currency label with the amount column and
the item count beside the section name; the action-menu column stays unlabelled.
Add items lives in the navigation toolbar above the divider list. Header and rows
share their column sizing so the layout remains aligned on narrow screens.

Item removal is a labelled Remove from section action inside the vertical menu,
reusing the existing confirmation and preserving catalogue Dishes.

Menu items, their column header and editable section rows reuse Core
`FireCollectionRow` for the plain content/value/actions layout. Their actions,
permissions and commands remain Menu-owned; the shared primitive adds no reads.
See the plain collection-row contract in `docs/concepts/components.md`.

Kitchen discovery cards link directly to each venue’s singular `/menu` entrance;
the individual published Menu destinations remain plural `/menus/<slug>`.
Collection and Delivery pass the already loaded Place currency to the shared
venue Menu header, where it appears once as “Prices in …”. No amount formatting
or stored commercial terms change. `menu-public-entrance.test.mjs` renders the
actual card destinations and shared header and checks reactive Place currency.

## Food-first venue entrance

`pages/kitchens/[slug]/menu.vue` is the default browse entrance: existing venue
identity, prominent eligible Collection/Delivery actions, then published menu
rows with their existing serving-time presentation. `Detail/MenuServices.vue`
owns the shared eligibility reads and navigation. Direct `.collection` and
`.delivery` links preserve intent, display the active service and allow switching
to the other eligible service. They have no All menus return control. A quiet
Explore other menus link opens `/kitchens/`, including above long service lists.
Table and room entrances retain their separate context and do not mount this
public service selector. No referrer inference, storage copy, checkout or price
policy is introduced. Verify `menu-food-landing.test.mjs`, the public entrance
checks, and live desktop/mobile journeys including empty eligibility and the
cross-venue exit.

Kitchen directory cards list a public label-only service summary from enabled
Kitchen offerings with attached menus. Staff table service and QR table ordering
are distinct; both Workspace and directory use `tableChannelEnabled`, including
its established default when channel configuration is absent. The existing
Kitchen directory read owns this projection, not a reader per card. The Browse menus badge is derived from a public published Menu by the Menu-owned
`server/index/browse-availability.ts` reader, independently of service settings.
Private-link, protected-group, draft and archived Menus do not grant the badge.
The read scans past private published records in bounded pages; empty service
settings add no filler message. Labels do not claim current opening hours
or kiosk availability. Verify `kitchen-service-summary.test.mjs`.

Menu and service terms are defined in [the service glossary](menu-service-glossary.md). Keep fulfilment, ordering channel and timing distinct; vocabulary alignment does not change stored interaction types.

The Workspace service overview presents the existing Collection, Delivery,
Pre-order, Table service, QR table ordering and Kiosk options directly. It does
not rename Table service as POS or split this mixed set into misleading Channels
and Services groups. Existing Offering setup dialogs retain command authority,
shared schedule semantics and independent table-channel switches.

The public portal requests the server directory’s combined `online` service
filter (Collection or Delivery), or the selected individual service. The existing
raw-page scanner fills eligible pages before returning their cursor, so unrelated
menus cannot hide later service matches. The route owns loading, failure/retry
and later-page failure feedback; Results retains local search/selection while
hidden during refresh and distinguishes a settled empty service from no search
matches. Service changes reset pagination and refresh the same live reader owner.
Verify `menu-service-view.test.mjs`, `menu-portal-states.test.mjs` and
`menu-directory-read.test.mjs`. This remains Menu pagination; venue grouping combines only
loaded eligible menus, not an independently stored venue catalogue.

## Food search in the portal

The directory accepts a bounded `search` string alongside its service filter.
`menu/server/index/food-search.ts` reads active section placements of eligible
public published Menus and joins their current non-archived Dishes. Case and
accent-insensitive name matches are returned as `matching_dishes`, containing
only IDs and names. Menu/venue metadata remains searchable; document Menus have
no inferred dish contents. Prices, options and Orders are not part of search.
The existing raw-page scanner applies search before filling the result page.

`useMenuDirectory` debounces search, resets pagination and refreshes its existing
live owner. Portal controls remain visible during reads; Results combines matching
dishes once per venue and keeps the selected Collection/Delivery destination.
This is a read-time search over current records, not a second catalogue or search
index. Query cost grows with scanned eligible Menu content. Verify
`menu-food-search.test.mjs`, `menu-canonical-discovery.test.mjs`,
`menu-service-view.test.mjs` and the portal/live-reader checks.

`menu/components/Cards/FoodVenue.vue` presents each portal venue result with
its existing logo/name, Menu heading, matching food, and one schedule/action row
per eligible service. Results retains grouping, filtering and reader coordination;
the card adds no acquisition. OfferingTimes can omit repeated schedule names in
these already labelled service rows. Other menus remain a secondary browse link.

Portal food cards show other offerings as quiet name-only links from enabled
Kitchen setup. `menu/server/index/other-offerings.ts` excludes public Menu IDs
already attached to enabled Collection/Delivery, and omits private, unpublished
and Daily-special content. Repeated names with the same uncovered Menu set are
collated; service variants over the same covered menus add no links.
The existing venue browse entrance accepts `?offering=<id>`; its server directory
filters that offering before pagination and its header uses the saved offering
name. Times stay on the destination, not on secondary portal links. No new
Offering identity, price or Order command is introduced. Verify
`menu-other-offerings.test.mjs` and the offering-browse pagination regression.

Kitchen service configuration is a separate visible Workspace capability at
`/workspace/kitchen/food-and-drink/services` (and `/services/<offering>` for an existing record).
`Workspace/Offerings/Index.vue` composes the unchanged scoped reader and setup
controls; navigation and Menu/hour/integration links use this entrance. Orders
keeps its board. No redirects, duplicate setup owners or record migration are added.

The visible Workspace capability is Services. The Menus navigation group and
`/menu-setup` overview exclude Recipes and Ingredients, which are children of
Prep & Production. The Food & drink index follows the same metadata; recipe
and ingredient routes keep their domain readers and commands.
