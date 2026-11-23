# Menu family

Updated: 2026-11-20
Ref: 193e5adc3
Role: map, not canon

## Purpose

Map the Menu family without conflating globally addressable Menu identity,
Kitchen-scoped structured content, directory route responses, or ordering.

## Links

- Parents: `family-entity-collection-page.md`, `family-entity-detail.md`,
  `server-api.md`, `tool-provider.md`
- Child: `menu-ordering.md`
- Horizontal: `entities.md`, `firestore-entity.md`, `workspace.md`,
  `family-tenant-global.md`, `../../packages/extensions/fireux-ai/README.md#document-processing`,
  `runtime-filesystem.md`
- Route tests: `packages/extensions/fireux-kitchens/src/test/menu-public-slug.test.mjs`

## Family in one view

| Concept          | Identity       | Job                                                                            |
| ---------------- | -------------- | ------------------------------------------------------------------------------ |
| Menu             | Kitchen-scoped | One interactive or document Menu: name, slug, publication, audience and format |
| MenuSection      | Menu-scoped    | Groups Item and meal-deal placements                                           |
| MenuEntry        | Section-scoped | Item or meal-deal reference, availability and display order                    |
| Item             | Kitchen-scoped | Stable identity, name, optional description/photo and provenance               |
| Promotion        | Kitchen-scoped | Item offers or meal deals with set price, choices and supplements              |
| MenuSourceUpload | Kitchen-scoped | Source material awaiting review; not a published Menu                          |

Kitchen Items are reusable across Menus. Each Menu owns its Sections and
[MenuEntry placements](../../packages/extensions/fireux-kitchens/src/runtime/menu/records/sections/entry.ts),
which reference Items through `item_id` (or a meal deal through `promotion_id`).
The persisted Section child remains `items`; calling these entries or placements
does not rename storage. Food/Drink is the Item type, not a Menu Section or an
Item category tier. Legacy stored category values remain untouched by unrelated
updates, but have no catalogue projection, filter, caption or editor and are not
accepted by the [Item update command](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/items/update.ts).
Ingredient taxonomy, discovery categories and external menu-category imports
retain their separate owners. Paid Menu distinctions concern additional/custom
and Daily Menus, not Item category counts.

The [Kitchen Item model](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/item.model.ts)
owns identity and selling terms on `kitchens/{kitchenId}/items/{itemId}`.
The exact Item reader resolves both from one document. Menu references the Item;
the Item has no dependency on Menu placement. Preparation and Kitchen-selected
presentation retain separate ownership.

`menu/models/menu.model.ts` is the sole stored Menu model.
`menu/models/menu-storage.model.ts` owns `kitchens/{kitchenId}/menus/{menuId}`.
There is no root Menu record, standalone Menu upload, copied publication status,
or directory synchronization command. Interactive content uses sections and Item or meal-deal
references; document content uses the Menu's `doc` attachment. Both use the same
creation, publication, audience and QR flow. Daily specials retain their separate
per-date publication feature.

Kitchen's combined Food & drinks catalogue filters the same Item family by
`item_kind` through All/Food/Drinks; unknown historical kinds remain under All.
Menu names do not classify Items. The operator catalogue reads the selected
Kitchen's Items and lists links to individual records. Add item requires a
name and accepts a description and photo. Default price and choices belong
to the detail editor. Menu publication still validates the selling terms of
its referenced Items.
Item detail shows the Item's read surfaces. Preparation specification,
prep requirements and Station management belong to Prep & Production; the Menu
Item route does not acquire their readers. Preparation owns reusable output
identity in `kitchen/records/prep/preparations/preparation.ts`; Recipe owns inputs, method
and expected yield in `runtime/recipe/models/model.ts`. Their library lives under
`/workspace/kitchen/prep`, with historical `prep-items` and `recipes` storage
paths retained by their owning readers. See the Misebox context’s
[production boundary](../../packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md#preparations-recipes-and-production).
Old preparation/spec view queries
resolve to Details. Stored preparation data is not migrated or deleted.
Removal stays under Item actions. Kind-specific editors retain their existing authority. Named services reference stable
Menu IDs and own eligibility and serving schedules.

## Shared spine

Public Kitchen and Menu discovery, venue profiles, Menu choosers and
Collection/Delivery entrances retain the host's existing default chrome.
Kitchen owns named content and presentation children; Core retains its shared
navigation, account/Workspace controls, footer and root lifecycle. Follow
[layout admission](../../packages/core/fireux-core/src/runtime/layouts/README.md#layout-admission) for a genuinely different
route-family responsibility, not for ordinary content differences.
Presentation inherits Nuxt UI, then FireUX shared conventions, then the host
App/Ecosystem theme (Misebox in its Main App). A saved Kitchen palette is the
local Menu override. A payload marked `themeSource: 'default'` inherits the host
tokens rather than imposing its transport fallback colours. Domain geometry
and media styling must continue to consume those semantic tokens.
`kitchen/components/Intro.vue` composes native `UPageHeader` for the two
discovery introductions. Existing collection-page readers, filtering and route
scopes remain authoritative. Kitchen cards use already-projected venue media;
failed or absent photos retain a named placeholder. Root Menu venue cards keep
their existing identity and service projection.

The Kitchen Menu chooser can show the existing Place cover in its shared
`Detail/MenuHeader.vue`; service headings retain the compact variant. Venue
profiles continue to compose Place's owning detail components. Published Menu
reading and ordering remain separate projections, with their existing palette,
audience, serving-time and checkout rules. A visual entrance does not establish
publication or service eligibility.

Ordering catalogue, item-picker and basket presentation stays in the existing
`menu/components/Selection` owners; read-only service browsing stays in
`menu/components/Service/Catalogue.vue`. Their local styles establish readable
item, price and action hierarchy without moving choice validation, basket
state, serving-time checks or submission authority into presentation components.

- Menu reads use bounded server responses. Raw Menu
  Firestore rows are not the guest transport.
- Kitchen discovery, Menu Directory and Menu detail acquire their mutable API
  projections through Core `useApiRead`; their three JSON endpoints declare
  `defineLiveProjection`. Existing domain readers pass `LiveProjectionSources`
  explicitly through native query/document owners. Kitchen/Place existence,
  route resolution, Menu publication and hidden-directory membership are
  authority dependencies; selected sections, Items, offerings and promotions
  are content dependencies. Core owns delivery, refresh and listener disposal.
- Existing query windows and exact Kitchen subcollections retain their read
  semantics. Some Kitchen-scoped collection reads have no record-count cap;
  listener/re-evaluation cost and Core's source budget remain scaling limits,
  never reasons to return partial successful data. Sproochli receives the same
  source collector through its lower-owned helpers: cache hits observe the
  exact cache and readiness query; memory is observed only when actually read.
  Default-language browsing never generates translations.
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
  image from that section's canonical Item media.

Item writes, Menu content writes and publication refresh only the acquired
`menu|` and `menu-collection|` Nuxt payload keys. They pass explicit key arrays
to native `refreshNuxtData`; they do not refresh App/session data and interrupt
multi-command editors. Native Firestore listeners retain their own records.
Menu service choices are scoped to the current canonical Menu ID; a basic Menu
does not advertise ordering entrances for other Menus in the Kitchen.

## Regular Menu publication tools

The routed Menu Publishing view consumes Kitchen-owned `Menu/Menus/Publication/Actions.vue`.
Its Menu-owned `composables/publication/useMenuPublication.ts` captures the current
account, App membership, selected Kitchen and route before awaiting credentials;
obsolete intent does not dispatch. The component separately discards obsolete
UI completion and errors. Trusted `menu/server/publication` commands own content
validation and atomic Menu status changes. Regular publication and confirmed
unpublication are connected. Published regular Menus expose the existing public
QR print doorway from the same action row, using the public website origin and
Menu route builder. Daily Menus use the separate per-date publication flow below.
Broader destination distribution and immutable publication versions remain separate.

`stagePublishKitchenMenu` exposes that same publication validation and write
inside an existing guarded transaction. Misebox Menu Express composes it with
its approved delivery request; there is no second Menu status writer. The
Menu-owned `publication/review.ts` projects a bounded regular document or
interactive Menu for customer review. It fingerprints document attachment and
public metadata, or structured text, prices, options and destination.
It excludes internal context and Storage paths and rejects unsupported content. The
App owns customer approval and compares that revision again before publication.
This does not create a separate immutable Menu version collection.

Free document hosting composes `menu/server/document/{authority,read,save}.ts`.
Its self-service and Workspace entrances use the same document file writer and
normal Menu/Place records. Guest hosting reuses the existing guest Kitchen and
its Main Menu, binding the recovery claim to that one Menu. Upload, preview and
explicit publication require no extraction, request or payment. Replacement
checks the acquired revision and changes only the attachment; Menu identity,
route slugs and QR target remain stable. The existing Menu viewer and QR page
render the result. Structured content cannot be overwritten by this tool.
Account adoption consumes guest proof; ordinary Kitchen authority then applies.
See `menu-document-self-service.test.mjs` and `menu-document-self-service-scope.test.mjs`.

`menu/server/document/file.ts` validates Kitchen-owned upload paths before a
privileged Storage read. Historical App-scoped paths require the Kitchen's
creating or managing App. Public payloads project the scoped file endpoint for
Storage-backed documents, keeping download tokens and bucket paths inside the
stored attachment. URL-only historical public documents retain their external
HTTP(S) destination. Daily Menus resolve dated selections even when a historical
record contains an attachment. Dedicated file writers accept regular Menus.
Verify public and private projections, rejected foreign paths, retained uploads
and withdrawal in `menu-record-shape.test.mjs` and the document suites.

Protected editor previews use `menu/server/document/protected-file.ts` through
exact document and source-file adapters. The adapters resolve current Kitchen
authority and saved record/file IDs; callers cannot select a bucket, path or URL.
The Menu owner validates path provenance and the expected revision, downloads
bounded generation-pinned bytes through Core, then resolves authority and identity
again before responding with private, non-cacheable bytes. Guest document access
is limited to the active claim-pinned Menu; Workspace readers may inspect retained
archived attachments. External source URLs remain their explicit link workflow.

`useMenuFilePreview` composes native client-only `useAsyncData` with
`useMenuEditorScope`. Existing Menu/source readers supply record identity; the
preview owner holds only temporary Blob URLs and releases them on record, authority
or lifecycle changes. Protected parents render the existing document viewer only
after a Blob is ready, avoiding its public/legacy URL fallback. Misebox's request
adapter supplies exact review proof without granting general Kitchen access.
Verify `menu-protected-file.test.mjs`, `menu-file-preview.test.mjs` and the App's
`menu-express-review-file.test.mjs`. Existing upload tokens and stored URLs remain;
this delivery path alone does not make those historical capabilities private.

Regular Menu Settings expose Archive as the normal removal action and list the
services that reference the Menu, including disabled services. Archiving updates
only Menu status/audit, withdraws public/QR reads and keeps content/service links.
Restoring returns to draft; publishing requires that explicit restoration first.
Archived Menus remain reachable through the collection's Archived control.
Confirmation retains its requested Archive or Restore action. A changed live
status closes an obsolete dialog before it can dispatch the opposite action.
Permanent deletion is available only for unpublished regular Menus with no
sections, document attachment or service references; the server repeats these
checks in its writing transaction. There is no child cascade or price mutation.
See `menu/server/publication/state.ts`, `menu/server/records/delete.ts` and `kitchen/menu-metadata.test.mjs`.
Source-owned `menu-publication-client.test.mjs` and `menu-publication.test.mjs`
protect the publication boundary; they do not prove live operator acceptance.

Specials boards use explicit `Menu.purpose: 'specials'` with a daily schedule,
separate from generic Daily Menus such as conference or staff catering. The
[date selector](../../packages/extensions/fireux-kitchens/src/runtime/menu/utils/calendar/daily.ts)
chooses today's explicitly published release, otherwise the next published date,
for specials only. Kitchen discovery's existing published-Menu scan projects the
next eligible date and canonical Menu slug onto that Kitchen's own card, including a local refresh boundary.
The shared Kitchen reader refreshes at that boundary. The existing public Menu
reader renders the selected date. Expired, draft and nonpublic specials do not
advertise the dedicated specials area. No separate homepage specials list, root Kitchen flag or
name-based identity is introduced.

## Menu doorways

| Scope             | Index                          | Detail                                   | Why it differs                                                                                 |
| ----------------- | ------------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Global discovery  | `/menus`                       | Links to Kitchen-directory detail        | Reads authoritative Kitchen Menus directly                                                     |
| Kitchen directory | `/kitchens/<kitchenSlug>/menu` | `/kitchens/<kitchenSlug>/menus/<menuId>` | Explicit Kitchen namespace in a multi-Kitchen App                                              |
| Tenant            | `/menus`                       | `/<menuId>`                              | The tenant config supplies the bounded Kitchen, so repeating the Kitchen slug adds no identity |

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

The basic document workflow has one `useMenuDocument` controller for selection,
file preview, publication and recovery. Misebox's Menu Hosting page composes
its App-owned `MenuHostingUpload` and `MenuHostingPublished` with Menu's
reusable `MenuDetailDocumentViewer`. Upload owns the input controls. Published
owns the Menu, QR and recovery links and copying feedback. The App page owns
the offer and Workspace invitation. These controls reuse Kitchen creation and
`menu/server/document` commands. The Misebox QR Menu solution page owns its
entry card linking into Kitchen Workspace.

Menu utilities contain pure calculations grouped under `calendar`, `catalogue`,
`navigation`, `ordering` and `records`; publication readiness remains a named
standalone calculation. Item, Section and source-upload storage definitions live
with their existing models. Menu storage owns its creation-capacity definition.
Guest onboarding and document preparation call the Menu-owned
[starter writer](../../packages/extensions/fireux-kitchens/src/runtime/menu/server/document/starter.ts)
with the shared [starter definition](../../packages/extensions/fireux-kitchens/src/runtime/menu/content/starter-menu.ts).
The independent Kitchen shell can start empty.
The [Misebox allowance and starter contract](../../packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md#menu-operator-entitlements)
maps creation-only capacity and preservation of existing Menus; initialization
of an existing Kitchen does not recreate missing starters.

Create Menu exposes PDF or photos, Menu URL, and Start blank as separate methods.
URL imports open source review without requiring a Menu name first.
File ingestion uses a native file picker and the Kitchen-owned `useMenuSourceUpload`
coordinator. It stores the source through the existing upload endpoint, then opens
its source route for the existing FireUX AI process/review controls. Passed source
context reuses that route's acquired data; Go QR is not part of this workflow.
New source ids are internal; the reviewed Menu name supplies the public slug at
confirmed creation. See `menu-source-upload.test.mjs` and `menu-import-name.test.mjs`.

Process cost estimates and draft confirmation reuse `useMenuEditorScope` for
account, App membership, Kitchen/source and disposal lifetime. Obsolete responses
cannot update the visible estimate, confirmation, errors or newer pending state.
Cost acquisition also fences overlapping runs. Verify
`menu-process-lifecycle.test.mjs`; server commands retain write authority.

AI extraction produces reviewable candidate content. It does not become
Menu, Item media, or published Menu truth until the owning Kitchen flow
validates and commits it.
For a single saved PDF/image, `menu/server/source/document.ts` can instead create
a draft document Menu without extraction or Item creation. It reuses
`stageCreateKitchenMenu` for creation policy, capacity and the Menu write, and
commits the source's `menu_id` link in that transaction. The attachment uses an
immutable revision through existing upload helpers. The shared preparation view
offers this choice in Workspace and Menu Express, while the existing Menu viewer,
publication and QR owners supply the resulting online Menu.
Review completion replaces its saved process map without a nested delete marker;
`menu-ai-review-save.test.mjs` validates that update with the real Firestore SDK
without committing it. Import planning gives each Menu source its own deterministic
Item identities; matching names never reuse catalogue Items. Retrying the same
source preserves its identities. Existing-Item reuse belongs to the section's
catalogue picker. Import confirmation still blocks changed prices on a previously
created import Item. See `menu-draft-plan.test.mjs`.
The review presents Menu items and one confirmation area. Processing and technical
reports stay in closed disclosures after extraction. Media decisions are required
only for detected image candidates; no-image items need no separate approval.
See `menu-process-composition.test.mjs` and `menu-import-media-gate.test.mjs`.

## Presentation inheritance

Menu presentation is resolved, not copied:

1. Current currency readers still resolve the linked Place; they are not yet
   aligned with the [entity-owned default and offer denomination contract](#item-offer-denomination).
   Kitchen owns its four-role `theme.palette`: canvas, text, accent and accent
   contrast. Basic colour editing is available on every plan.
2. A Kitchen-owned Menu selects Kitchen colours or the host App default through
   its `theme_mode` field. Existing records without a choice inherit Kitchen
   colours. The Workspace card uses the selected palette for its background.
3. Named Kitchen services select Menus, own serving schedules and allow browse or
   ordering interactions. Menu responses derive eligible interactions with their
   exact service identity; channels reuse the same policy.
4. Document and interactive Menus use the same theme selection.

The Menu directory uses host App chrome; Menu detail uses Kitchen colours.

When Sproochli is attached, the Kitchen's `default_language` also supplies the
Menu interface language for labels such as sections, options, and
allergy information. A visitor-selected `sproochli` language replaces that
interface copy together with the translated Menu projection; the unselected
default route never rewrites the original Menu content.

`menu/components/Browse/Item.vue` owns the complete public Item surface: name,
description, price, choices and optional image. Both the public Menu and Kitchen
directory special consume `MenuBrowseItem` directly. The card supplies canonical
public Items through the existing Menu payload normalizer, preserving real
choices without exposing private Item context. Selection and price calculation
remain inside the Menu surface; neither consumer owns a parallel Item layout.
The surface owns no reader or command and inherits Menu theme tokens with host
UI fallbacks. Its heading level follows the consuming document hierarchy.

Item owns reusable food media. MenuEntry may reference Item but does not own a
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
- `runtime/kitchen/components/Workspace/Menu/Menus` owns upload,
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
while section items retain their focused item/Item workflow. See the
Misebox context and `menu-record-controller.test.mjs` for this boundary.

## Item offer denomination

The [Workspace operational currency rule](../../packages/extensions/fireux-finance/README.md#operational-default-currency)
assigns the optional default to the selected Kitchen root. The canonical
[Item model](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/item.model.ts)
stores one `currency_code` for the Item's base price and choice prices.
New priced terms require an explicit denomination. A full-price group stores
prices on its options and derives the starting price for display. A fixed-price
Item stores a base price. Menu placement remains an Item reference.

The Item write and read boundary now supports this contract. Existing Menu
publication and ordering still use their historical currency resolution.
Their eventual cutover must retain single-currency Menu validation and reject
mixed or unresolved offers. Promotions, Orders, Sales and Payments retain their
existing explicit currency contracts, which require separate policy review.

Stored bare-number terms need reviewed denomination adoption with retained preimages;
country, current default or a new field alone cannot prove historical currency.
Default changes must never reinterpret existing prices. The initial guard must
transactionally reject clearing/changing an established default while retained
bare terms depend on it, including terms outside visible/active Menus and
concurrent term writes. Default and offer-write owners must participate in that
same consistency boundary. No automatic conversion, amount rewriting, runtime
cutover or live migration is authorized by this design contract.

## File responsibilities and input contracts

Menu catalogue creation, metadata editing and removal live in
`menu/server/records/{create,update,delete}.ts`; scoped item writes live in
`menu/server/items/write.ts`. `menu/server/creation-capacity.ts` is the shared
transaction-time allowance check for manual creation and reviewed draft imports.
The HTTP adapters call those owners directly; there is no mixed command barrel
or forwarding compatibility entrypoint.

Pure `menu/utils/records/metadata.ts` validates and copies editable catalogue
metadata. Generic creation and metadata updates accept authored catalogue fields.
Document attachment belongs to the file/source commands. Creation validates the
public slug through the trusted name owner. Rename validates display text and
retains that slug, including for names written in non-Latin scripts. Placement writes reject commercial terms; Item commands validate
normal prices, options and extras. Command
inputs are detached before awaiting actor credentials. Publication, source
review and Item pricing retain their separate owners.
See `src/test/menu-record-input-internals.test.mjs` and the command, content,
metadata and publication tests; these are controlled source checks.

The Menus collection and source-upload readers bind only after the selected
Kitchen has an exact ready Workspace outcome. Kitchen failures/loading remain
distinct from empty Menu collections, and independent upload failures retain
their own outcome without hiding loaded Menus. Section/item and uploaded-source
pages render failure and loading before missing/empty copy or counts.
`src/test/menu-reader-internals.test.mjs` checks these owners and full templates.

Menu creation, URL import and Item pricing editors capture
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
- Item identity: `runtime/kitchen/models/item.model.ts`.
- Normal commercial terms: `runtime/kitchen/models/item.model.ts`
  and `runtime/kitchen/utils/item-pricing.ts`.
- Direct discovery: `runtime/menu/server/index/read.ts` and
  `src/test/menu-canonical-discovery.test.mjs`.
- Route grammar: `runtime/menu/utils/navigation/route.ts`.
- Ownership resolution: `runtime/menu/server/ownership/target.ts`.
- Menu Directory: `runtime/menu/composables/useMenuDirectory.ts`.
- Menu detail: `runtime/menu/composables/useMenu.ts`.
- Workspace operation:
  `runtime/kitchen/composables/workspace/menu/menus`.
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

Menu's [Card family](card-family.md) supplies Pill, Cell and Preview. The
controller-backed Collection defaults to Preview and cycles through Cell and
Pill; scoped collections reuse Preview. Cards present supplied records through
`useMenuCardPresentation`, serving-time presentation and separate service Actions.
`Cards/FoodVenue.vue` keeps its grouped venue/result responsibility. Detail keeps
the full reading composition; current consumers need no separate Overview card.

`Collection/Results.vue` collates eligible Collection/Delivery Menu rows into one result per Kitchen, with menu names leading, secondary venue identity and only matching service times. Other menus sit behind a quiet venue browse link. It adds no Kitchen reader. Service choices open the venue service presentation; browse choices open the individual Menu.
`Collection/Index.vue` consumes a scoped controller, paging, outcomes and
presentation choices. Their differing inputs/lifetimes remain explicit; both
reuse collection search. The retired `Preview/ItemOptions.vue` and
`Record/SurfaceSwitcher.vue` had no consumers and were removed, not promoted into
new shared controls. Current item options remain with Detail Item and Order
MenuItems, which have materially different read-only and selection contracts.

`utils/navigation/route.ts` owns root, tenant and directory Menu route scopes; Kitchen
surfaces consume it rather than owning root Menu navigation. `RouteSurface.vue`
retains only active dispatch branches. Global Menu frame tokens are explicitly
registered from `assets/styles/menu-frame.css`; QR and section-navigation CSS are
colocated with their named projection components. There is no component `styles`
catch-all. Public Item presentation stays with Menu.

The inspected repository retains one Kitchen-owned Menu shape, alongside distinct
Ingredient, KitchenIngredient association and SupplierIngredient offering contracts.
Same nouns do not authorize merging their data or mutation owners. This is a bounded
ownership comparison, not a complete repository duplication certification.

## Menu responsibility boundaries

Menu storage targets, defaults and input contracts live in
`menu/models/menu-storage.model.ts`; utilities retain pure
transformations and policy helpers.
`useMenuDetail` owns the public browse read/presentation lifecycle, including
canonical SEO and language intent. The Detail composition retains its optional
SSR readiness wait and response status.
`useMenuQrRenderer` owns QR generation, settled SVG export and disposal; a
destination change or disposal clears the previous download. The public QR
composition retains Menu availability and print/download presentation. SVG
download reuses the existing renderer rather than acquiring another Menu or
adding a separate QR tool. Components use the existing named
Nuxt registrations. No storage schema or publication authority changes accompany
this organisation.

## Daily Menu publication

The blank [Menu Form](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Menus/Create/Form.vue)
defaults to Regular and offers Regular/Daily to Pro and Business actors. Daily
uses the existing [interactive creation command](../../packages/extensions/fireux-kitchens/src/runtime/menu/server/records/create.ts)
without a service date or automatic publication; choosing a schedule creates
nothing before submission. Lost entitlement resets the form to Regular and guards
Daily dispatch; schedule and paid availability join the existing command scope.
Free retains its one combined regular Menu policy.

[Menu Settings](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Menus/Detail/Settings.vue)
also exposes the existing `WorkspaceKitchenContext` for Daily Menus, with editing
controlled by the record's `canWrite`. It reuses the scoped
[authorized context endpoint](../../packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/context.get.ts)
and [command](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/context/command.ts).
Private operator context is separate from customer description, prices, schedule
and publication, and is omitted from customer projections. Daily usage is optional.

Daily Menus retain dated MenuSections and ordinary dish-backed items. The focused
`Menu/Menus/Publication/Daily.vue` control reviews the chosen date through
Dates & selections and calls `menu/server/publication/daily.ts` through the existing scoped
Menu mutation adapter. The command requires current membership, Kitchen authority
and Plus, validates every active selection/item for that date, and updates
`published_dates` on the canonical Menu in one transaction. Copying a date
copies content only; it never publishes the destination.

Tenant and Kitchen-directory Menu/QR routes read that canonical Menu.
Public reads resolve today using the linked Place timezone, return only explicitly
published selections for that date, and show an empty-day message without falling
back to past or future content. The server supplies the absolute next local date boundary as `nextChangeAt`,
not a relative countdown that changes on every read. The mounted reader derives
its delay from that instant, clears old content and refreshes once at the boundary,
with scope disposal. Unchanged public content therefore retains a stable live
projection fingerprint within the venue day. Existing live reads reflect edits and date withdrawal. Withdrawing
one date preserves other published dates and the doorway. Daily Menus are browse-only:
public order entrances, service links and transactional submission remain blocked.

Verify `daily-menu-publication.test.mjs`, `daily-menu.test.mjs`, the public projection
checks, and the publication/client-scope checks. Controlled checks do not establish
live operator publication or provider/deployment acceptance.

## Meal-deal entries

Regular interactive Menu placements reference one Kitchen Item (`item_id`) or
Kitchen meal-deal Promotion (`promotion_id`). The Menu owns organisation and
availability; Item owns normal terms, Promotion owns its set price and choices.
Daily specials do not accept meal-deal placements. Section editing exposes both
entry kinds, and public Menu cards display read-only deal choices/supplements.
Venue-local weekdays and service serving windows control deal visibility.
See `menu-meal-deals.test.mjs`, Menu publication/content-command checks and
`menu-pricing.test.mjs` for catalogue presentation. Collection selection and
transactional Order pricing have separate owners and checks below.

## Catalogue and Order dependency direction

Item and Promotion definitions do not depend on Orders. Menu catalogue resolution
reads venue presentation, language and service eligibility/serving schedules; it
does not load Kitchen delivery zones or payment methods. The dedicated fulfilment
endpoint and Order adapters retain their own policy reads. Order selection, cart
lines and submission belong to those consumers, not the read-only item model.
`menu-public-slug.test.mjs` verifies catalogue resolution without a fulfilment read.

## Service catalogue

Collection, Delivery, Table and Room entrances compose the same read-only
service catalogue from published Menu data. Sections, items, prices and serving
times retain their Menu and Kitchen owners. The public customer checkout and
Kiosk entrance have been removed. [Staff Orders](order-processing-kitchen-fulfilment.md)
continues to operate through Kitchen's Workspace and trusted commands.

## Safe Item removal

Item's removal control reads its live Menu-section and Promotion usages. Saved
references count even in archived placements or paused Promotions. The trusted
Item delete command repeats the same scoped check inside its writing transaction
and refuses deletion until references are removed; it never cascades or reprices.
Section editing exposes an explicit confirmed placement removal action. It deletes one placement through the Menu command and
keeps the referenced Item or Promotion intact. Usage links can open archived
sections for this cleanup using the already acquired section rows; ordinary
section navigation still lists active sections.
The protected usage reader observes current membership and Kitchen access as well
as the referenced collections. Public Menu projection omits missing/archived
Items and hides an entire meal deal when any included choice is unavailable,
keeping other entries readable. Malformed prices and currency still fail validation.
See `kitchen/item-commands.test.mjs`, `kitchen/item-ui-scope.test.mjs` and
`menu-meal-deals.test.mjs`.

## Focused section editing

Menu section detail composes one item list and one Add items entrance. The add
modal selects catalogue food/drinks, new Item names or meal deals, mounting only
the selected workflow against the parent's existing scoped section state.
Item rows use simple dividers, show name and Item-owned price, and expose a
labelled Remove from section action in the vertical three-dot menu, with
confirmation. The same menu contains secondary editing actions. Adding a removed Item back uses the catalogue in Add items;
there is no availability toggle in this editor. Daily specials retain their own date
flow and do not expose meal-deal entry. Source checks live in
`menu-editor-composition.test.mjs` and `kitchen/menu-tool-completion.test.mjs`.

Menu editing rows show a single normal price directly. When a Item has variants,
the row says “Multiple prices”; names and prices are tucked into its vertical
three-dot menu. These editing surfaces omit repeated currency codes because the
linked Place owns the currency. The Menu/section editing header shows that
Place currency once; public currency formatting remains with its existing owner. Full editing stays with Item pricing; stored terms are unchanged.

## Display ordering

Manual Menu section and entry creation assigns the next position from the highest
saved position inside the writing transaction, including retained archived rows.
The parent audit update serializes concurrent appends. Catalogue/Item prices are
not part of the position write. Reviewed imports retain their own replacement
plan ordering.

Items and sections expose Move up / Move down in the same vertical three-dot
menu. `menu/server/display-order.ts` rereads current Kitchen authority, Menu,
section and scoped rows, swaps adjacent entries and normalizes their ranks in
one guarded transaction. Boundary moves do nothing. Daily section moves stay
within the selected date and retain Plus authority. Section rows use dividers.
The former multi-request reorder helpers are removed. Check
`menu-display-order.test.mjs`, `kitchen/menu-content-commands.test.mjs` and
`kitchen/item-ui-scope.test.mjs` for append gaps, tied ranks, atomic failure,
price preservation, exact scope and obsolete client completion.

Section rows expose Archive section and Restore section in the same vertical
action menu. The existing section status command preserves the section’s entries
and catalogue Items. Archived sections are available through a quiet collection
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
Item and meal-deal definitions. The trusted regular publication validator uses
that report to reject empty content and unavailable entries, with section/name
reasons. It reads only Menu content, Items and Promotions and writes no terms.
Document and per-date Daily validation remain separate.
`Menu/Menus/Publication/Readiness.vue` owns the live content warning and its
focused section diagnostic children. The record reuses its section list; section
editing passes its existing catalogue, promotion and current-item readers rather
than acquiring duplicates. Other active sections use the existing scoped item
reader. Loading/failure never imply an empty Menu; a genuinely empty published
Menu warns without automatically changing publication. Scheduled meal-deal
weekdays do not make structurally valid future content incomplete.
Verify `menu-publication.test.mjs` and `menu-publication-readiness.test.mjs`,
including archived Items, paused deals, grouped diagnostics, disappearing last
items and explicit read-state outcomes. Live checks remain read-only.

Menu item Add is idempotent for the same Item or meal-deal reference within one
section. `menu/server/items/write.ts` checks that reference in its existing
transaction after authority and reference validation. Active matches return their
saved ID without writes; archived matches restore in place, retaining position
and provenance. New additions still update the read parent section, so competing
transactions retry and converge on one placement. Other sections and Menus may
use the same reference independently. No Item, Promotion or Order data is written.
Verify repeat requests, optimistic transaction conflicts, archived matches and
scope separation in `menu-item-idempotency.test.mjs`; this simulated conflict
coverage is not a claim of a live concurrent Firestore test.

`useMenuSection` derives active placements from its already acquired rows.
The three Add workflows use that projection so a retained archived placement
can return through the same idempotent command. New-Item entry waits for the
catalogue's settled read, matches repeated names case-insensitively, and retains
a confirmed created Item ID until the catalogue acknowledges it. A placement
retry therefore reuses that Item. Kitchen, actor and section changes clear this
local recovery state. Verify these flows in `kitchen/menu-content-scope.test.mjs`.

Section item editing aligns a single currency label with the amount column and
the item count beside the section name; the action-menu column stays unlabelled.
Add items lives in the navigation toolbar above the divider list. Header and rows
share their column sizing so the layout remains aligned on narrow screens.

Item removal is a labelled Remove from section action inside the vertical menu,
reusing the existing confirmation and preserving catalogue Items.

Menu items, their column header and editable section rows reuse Core
`FireCollectionRow` for the plain content/value/actions layout. Their actions,
permissions and commands remain Menu-owned; the shared primitive adds no reads.
See the plain collection-row contract in `packages/core/fireux-core/src/runtime/components/README.md`.

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
Kitchen directory read owns this projection, not a reader per card. Browse availability remains derived from a public published Menu by the Menu-owned
`server/index/browse-availability.ts` reader, independently of service settings.
The card exposes View menus as its main action, not a Browse menus service badge.
Kitchen-owned `Public/Collection/Card/Index.vue` composes Identity, named label
groups and a dedicated Special child using native Nuxt UI. Keywords use neutral
filled tags; services use primary outlines. Group names remain accessible labels
without visible headings. The special links directly to its canonical published Menu. Its dish-led preview
reuses the public dated Section reader and canonical public Item normalizer for
up to three Items, including choices, with currency from the linked Place. This adds one selected
Menu content acquisition only for Kitchens with an eligible special. Food images
are optional: project them only when the Kitchen's existing item-image setting is
enabled and an Item image exists. Missing or failed images produce no placeholder;
the dish text remains complete. Keep the date secondary to the dish.
Private-link, protected-group, draft and archived Menus do not advertise a special.
The read scans past private published records in bounded pages; empty service
settings add no filler message. Labels do not claim current opening hours
or kiosk availability. Verify `kitchen-service-summary.test.mjs`.

Menu and service terms are defined in [the service glossary](../../packages/extensions/fireux-kitchens/docs/menu-service-glossary.md). Keep fulfilment, ordering channel and timing distinct; vocabulary alignment does not change stored interaction types.

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
public published Menus and joins their current non-archived Items. Case and
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

### Services Workspace boundary

Services is a Kitchen-owned capability alongside Menus, Orders and Prep &
Production. The Menu Entity owns what customers can choose. Services owns how
and when a Kitchen serves its Menus. Orders owns the placed-order
lifecycle and Prep & Production owns production. Menu may show service
availability and link to its configuration. Use the
[glossary](../../packages/extensions/fireux-kitchens/docs/menu-service-glossary.md#kitchen-services) for Services, service setup
and `Offering` terminology.

This is the accepted grouping target. Current navigation still places Services
under Menus, and the current service configuration route remains
`/workspace/kitchen/menu/services`.
`Workspace/Services/Index.vue` provides one scoped reader. `Service.vue`
groups setups by service type and `Record.vue` binds the existing setup controls
to each saved Offering ID. Type hashes remain valid. Summary links use
`#service-<type>/<encodedOfferingId>` for named saved records.
Historical mixed records expose their whole-setup availability and individual
interaction switches through the existing configure and interaction commands.
Menu and hours edits preserve concurrently changed availability. The creation
command retains its one-new-setup-per-type/channel policy.
Verify `services-workspace.test.mjs`, `offering-configuration.test.mjs` and
`service-section-navigation.test.mjs`.

Before the runtime grouping cutover, reconcile the Menu parent navigation and
Services page metadata, the Services component registration/imports and AI focus,
and links from operating hours, website ordering, Kitchen entry, Menu details and
service summaries. Decide the canonical Services URL in that bounded change;
this decision does not itself move routes or stored records. Preserve current
service hash destinations, exact Kitchen selection, one Services read/context
owner and active page publisher, existing commands, and public Menu/order
eligibility. Reuse the existing offering policy rather than creating a second
Menu-versus-Services authority. The current Menu service summary is a
cross-capability consumer; its placement does not relocate Services ownership.

The current consumer/route anchors are
[Services page](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/menu/services/index.vue),
[Menu navigation](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/menu/index.vue),
[Services context](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/services/useKitchenServicesContext.ts)
and [offering target](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/offerings/target.ts).
Recipes and Kitchen Preparations remain under Prep & Production; this grouping
decision does not change their domain contracts.

## Shared Menu preparation

Kitchen’s `Menu/Menus/Prepare.vue` composes existing upload/URL controls,
source collection and Menu/QR destinations. The `menus/prepare.vue` route supplies
ordinary Workspace context, without a Product or purchase prerequisite.

`Menus/Preparation.vue` and `useKitchenMenuPreparation` own one explicit source
read and reuse the existing processing/review controls. Native source detail and
Misebox’s service operator compose this same component. The source command is
`menu/server/source/save.ts`; upload and URL Nitro routes are adapters to it.
Exact retries preserve the source and applied Menu; changed input cannot silently
overwrite an existing source. Authority is checked before Storage and at commit.

The App-owned Menu Express adapter transfers supplied bytes or URL into that
command and binds its request to `menu-express-{requestId}`. The existing draft
command uses that source identity as its Menu identity. Customer contact,
approval and delivery remain App responsibilities. Native Menus has no service,
Product or payment dependency. No manual download/re-upload/linking is needed.

Source review uses the Workspace frame’s breadcrumbs. Applied drafts retain
`ai_draft.applied.slug` for navigation after reload. Relevant checks include
Kitchen’s `menu-source-upload.test.mjs`, `menu-source-qr-presentation.test.mjs`,
`menu-process-composition.test.mjs` and Misebox’s `menu-preparation.test.mjs`.

The shared processor lives in `kitchen/composables/menu/useMenuSourceProcess.ts`
and requires explicit source/Menu context. It imports no Workspace record owner
and starts no reader. The Workspace Menu source view supplies its existing
record context; shared preparation supplies its explicit source reader. Report,
comparison and run controls consume that single processor. Menu Express keeps
its intake, customer approval and delivery outside this lower boundary.

### Existing record editor

`Menus/Detail/Index.vue` provides the routed record context once and composes
the read overview plus Settings, content, publication and source surfaces.
Metadata controls consume
`useMenuRecordMetadata`; serving-hours controls consume `useMenuRecordHours`.
Both take narrow explicit inputs from the existing context and acquire no data.
The hours owner retains debounce, scope cancellation and failure restoration.
Record context owns the shared update/rename/publication/lifecycle command
instances and post-delete navigation. The removal panel owns confirmation and
readiness presentation, without creating a second command or navigation owner.
Core field predicates and local form lifetime reach the Menu command before
credentials complete. Parent record/collection owners can survive a closed child
while its obsolete intent is cancelled. A committed deletion retains its result
and the surviving record owner handles collection navigation.
Management authority governs archive/restore/delete; the existing content
entitlement separately governs editing daily content. Trusted commands remain
the final authority.

Public Item variants and extras share the Menu-owned `ChoiceBubbles.vue`
presentation: native radio/checkbox bubbles for local browse price previews
and service selection. Browse preview state stays with its Item and never
creates a basket or enables a service. That component owns layout and accessible input presentation,
not choice state, pricing, basket writes or Workspace configuration. Existing
selection and basket owners retain those responsibilities.

Item-owned `choice_groups` extends flat variants/extras with stable identifiers,
selection minimum/maximum and full-price versus additional-charge pricing.
`kitchen/utils/item-choices.ts` owns strict definitions and selection pricing;
old flat records project to groups on read without being rewritten. An explicit
Price & choices saves explicit groups and retains historical flat terms; explicit groups govern selection. Public previews and
ordering use the same rules; the submission transaction resolves canonical Item
terms and validates group selections. Choice groups remain distinct from
Promotion meal-deal groups and carry no Menu-placement ownership. Import
comparison and Menu Express delivery reject groups they cannot represent.

### Section and Item editing

The landing composes Menu discovery and creation over one Menu collection;
the group overview reuses that collection rather than opening a second reader.
The former collection entrance renders this same composition.
`Workspace/Menu/Index.vue` composes the entrance and operational summaries.
Its local `Workspace/Menu/index.ts` exports the existing child components for
one explicit namespace import, `import * as Menu from './index'`, consumed as
`Menu.Overview`, `Menu.Create`, `Menu.Ai` and the named child summaries. This
namespace changes no component registration, data owner or runtime authority.
Adopt this composition style during substantive work on a parent and its children;
do not bulk-migrate components or add namespace files for incidental touches.
The shared component convention is maintained in `../../packages/core/fireux-core/src/runtime/components/README.md`.
`Workspace/Menu/Overview/Index.vue` calls `useKitchenWorkspaceMenuOverview` once
and passes each child its presentation inputs. Controls composes Actions and
Filters and reuses
`WorkspaceKitchenCollectionToolbar`, native `USelect` status choices and the
existing creation action. Collection owns loading/error feedback through shared
`FireState`, stale-card masking, empty results and native `UPageGrid`. Card owns
one Menu's status, destination and presentation. The overview retains scoped
search/status choices and published/order/name sorting; All excludes archived
records, while Published, Drafts and Archived select their stored status. Real creation availability and blocked
copy retain their existing Menus capability owner.

`useKitchenWorkspaceMenu` owns the description and coordinates the existing
Menus workflow with `createKitchenMenuOverview`, sharing the exact collection
and one active page publisher. Child Overview, Ai, Items, Promotions and Services
composables consume that owner; service projections live with Services rather
than in an oversized group index. Strict lookup and keys are internal. The
preparation-source route separately mounts its standalone Menus workflow;
`useKitchenMenus` and its optional lookup never construct another owner.
One existing creation flow serves its group/collection modal and standalone
source page. Lower reads, permission checks, command targets and record editors
retain their existing owners. This follows the
[Workspace group overview convention](../../packages/extensions/fireux-workspace/README.md#workspace-group-overview-composition).
The record builder
mounts one inline section editor at a time through `Sections/Inline.vue`, reusing
its existing Menu record context and lower Section provider. Shared Item edits
retain return-to-section intent. Standalone section links remain supported.

Historical Item records may retain direct preparation Station IDs. These remain
stored independently of Menu placement; the Menu Item route no longer acquires
Station readers or exposes preparation editing. Prep & Production owns the
preparation surfaces. Trusted Station reference validation remains at
`kitchen/server/stations/item-references.ts`; removing UI does not migrate data
or remove server validation.

### Kitchen workspace page patterns

Group overviews such as Menu and Prep put common actions and child summaries
within reach. A catalogue entry composes the child page header, controls above
the collection, and optional AI below. Create starts from the header when that
screen supports it. The collection owns record loading, error, and empty
feedback. Preparations and Recipes have separate workspace screens and reuse
the Prep library collection. Each screen owns its record links and row
summaries. Record details use a clear identity header and put related
views or editing actions beside their content. Operational workbenches such as
Prep Plan and Batches prioritise the current task and its outcome. Shared
presentation follows the operator's task. Readers and commands stay with the
domain that owns them.

The plain Menu record URL at `/workspace/kitchen/menu/{menuSlug}` opens the
read overview. It shows Workspace identity and, for a public published Menu in
the directory-scoped Workspace, embeds the same Browse component as the guest
route. Unpublished Menus retain their Workspace identity and section names.
Content, publication, source and settings remain explicit navigation choices.
The content editor's rows share Menu display and choice controls with Browse.
Preview selections stay local. Workspace actions handle placement and
navigation to Item detail.

Menu section rows link directly to the shared Kitchen Item record. Shared Item
identity, image and description apply wherever that Item is used. The Menu
owns placement and publication. Removing a placement leaves the Item intact.
The trusted Item delete command checks for references before deleting it.
See [Item detail](../../packages/extensions/fireux-kitchens/README.md#item-detail)
for the Workspace read and guest presentation.

The standalone Section detail exposes rename and archive/restore through the
same Section command that the Menu's section list uses.

`useMenuSectionItemSelection` consumes the existing Section context and catalogue
for multi-selection. It owns search, selection and sequential placement intent,
not another reader or command. Successful placements are retained while awaiting
the listener, partial failure keeps unprocessed choices, and scope invalidation
stops subsequent commands and feedback. Verify `menu-item-selection.test.mjs`,
`menu-editor-composition.test.mjs` and `kitchen/menu-content-scope.test.mjs`.

The Section route provides one Menu record state and one `useMenuSection` state.
The lower Section capability accepts the explicit `MenuSectionSource` contract;
it imports no Workspace owner. It owns the Item/promotion/item readers and
guarded placement commands shared by every add/edit control.
`useMenuSectionItemsEditor` and `useMenuSectionsEditor` own their respective
editing lifecycle. `useMenuSectionItemCreation` composes existing Item creation
and Section placement, with captured target and stale-completion protection.
The visible add, row, create and schedule controls consume these owners.

Daily Section previews share the Sections editor’s single Item catalogue source;
each preview owns only its Section-item read. Catalogue pending/error state is
passed with the records rather than silently showing unresolved names.
The Items/Sections controls use native Nuxt UI inputs and semantic styles.
`menu/assets/styles/menu-editor.css`, consumed by the Items/Sections parent components,
owns their shared editing arrangements; the seven-day picker keeps only its
specialist calendar geometry locally. No alternate registration or legacy
implementation remains for these controls.

The Menus composition roots consume the shared editor stylesheet for collection,
creation, source preparation, record editing and QR presentation. State feedback
uses Core FireState; the QR coordinator owns its combined read outcome and error
facts without relabelling idle as pending. Menu Express does not own or duplicate
this lower presentation or data lifecycle.
