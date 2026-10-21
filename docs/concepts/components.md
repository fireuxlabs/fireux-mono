# Components spine map

Updated: 2026-10-21
Ref: 4e71810f0
Role: map, not canon

## Purpose

Map component folder and naming conventions.

## Vertical links

- Parent: nuxt-ui.md
- Child: family-workspace-entity.md
- Child: family-entity-collection-page.md
- Child: family-entity-detail.md
- Child: card-family.md

## Horizontal links

- pages.md
- composables.md
- lasagne.md
- runtime-filesystem.md
- debug.md

## Named capability entrypoints

When a named component already composes sections in a same-named folder, its
entry lives in that folder's `Index.vue`, preserving the Nuxt component name.
Current examples include User `Current`, `Profile`, `AppMembership` and Kitchen
and Place `Onboarding`. Their existing Summary, profile presentation, membership
Edit and onboarding stages retain their own responsibilities. This convention
adds neither required folders nor forwarding wrappers; a leaf with no sections
can remain a single file.

## Package components

- Main App `/packages` catalogues list the App manifest's direct FireUX
  dependencies, showing package names and available manifest descriptions.
  This is not a claim that every installed capability is enabled. FireUX
  and Misebox own their route adapters; Core's `app/components/Packages.vue`
  supplies shared catalogue presentation. Main Apps opt into Core’s
  `components:extend` catalogue, which publishes only registered names grouped
  by their owning package, without filesystem paths. Package details provide
  component search; only explicitly published specimens have preview links.
  Examples remain with their owning
  package and are explicitly composed by the consuming App. Misebox exposes
  Kitchen's Ordering specimens at `/packages/fireux-kitchens/ordering/ticket`.
- The public FireUX component library is cross-industry. Its catalogue may
  include only components whose owner and responsibility remain meaningful
  without Kitchen, Property, Cleaning, Hospitality, or another industry
  domain. Industry-designed compositions belong to the named `/templates/*`
  family and may assemble cross-industry library components with domain-owned
  capabilities. A domain component does not become library material merely
  because it is reusable inside one industry.
- Shared design-system admission depends on a coherent responsibility, explicit
  inputs, accessibility/lifecycle behaviour, correct ownership and real consumers.
  Prop counts are advisory review signals, never admission thresholds or proof of
  quality. Catalogue/demo entries do not count as production reuse. A package
  library may demonstrate domain components without claiming universal reuse.
- A visible domain component is composed beneath a Nuxt page (directly or
  through another named child). Page descendants may present fetched records,
  parent-passed records, and locally derived values, but each keeps that data
  responsibility explicit. Global layout chrome and purely visual primitives
  are not treated as page-domain components. See `pages.md` and `debug.md`.
- Cross-entity package UI belongs under `src/runtime/components`.
- Entity-owned package UI belongs under
  `src/runtime/<entity>/components`, following `runtime-filesystem.md`.
- App UI belongs under `app/components`; reusable entity implementation does
  not move into an App merely to preserve conventional Nuxt discovery.
- Main Apps named `*-app` use responsibility-first component families directly
  beneath `app/components`. Marketing presentation belongs beneath `Landing`,
  genuinely App-specific Workspace framing beneath `Workspace`, and other
  children must name real App-only capabilities. The App name is already
  supplied by its project boundary, so wrappers such as `Misebox/Landing` or
  `FireUX/Landing` are redundant. Lowercase `landing` and generic `effects`
  buckets are retired; a one-off visual effect stays beside the Landing or
  capability presentation that owns it. The `/` route may compose Landing or
  Workspace presentation and does not determine either component's owner.
- Entity-owned live Workspace composition remains beneath
  `runtime/<entity>/components/Workspace`. An App that deliberately uses a
  Workspace as its root product surface composes the lower-owned anatomy and
  owns only App-specific framing, literature, and doorways. Misebox therefore
  owns its public entry, Workspace route framing and its `Workspace/Kitchen/Home/*`
  presentation in `misebox-app`, while `fireux-kitchens` owns direct
  responsibility components such as `WorkspaceKitchen`, including target
  loading, selection, and creation. The App route supplies its Hero copy to
  the shared `WorkspaceHero` primitive and composes lower-owned components
  directly; Kitchen-enabled
  Apps also receive a thin authenticated `/workspace/kitchen` doorway into the
  direct Kitchen-owned Workspace without depending on the Main App.
  Read-only landing previews
  remain App-owned presentation and do not become live Workspace authority.
- Declared Entity components live beneath `runtime/<entity>/components` and
  are registered with prefixes that preserve established component names.
  Confirmed parent-owned record/operation components live beneath their parent
  Entity scope. Root component families for still-to-confirm concepts remain
  on the package spine; neither case is automatic evidence for a new Entity.

## Segmented selection

Core `components/molecules/SegmentedSelector.vue` owns a local single-value
selector with a rounded track and active segment. It accepts `v-model`, labelled
items, an accessible group label and disabled state. It retains Nuxt UI radio-group
keyboard behaviour without visible radio indicators. It has no persistence,
routing or domain policy. Kitchen’s Ordering library is its current consumer. Keep this as a local baseline
with a product-neutral API; a second materially different consumer is required
before claiming proved cross-domain reuse.

## Multiple selection

Core `components/molecules/MultiSelect.vue` (`MoleculesMultiSelect`) is the
preferred control for short multiple-choice lists whose options should all remain
visible. It composes Nuxt UI badges as native pill buttons with a local selection style,
separate from ordinary badges and action buttons. Selected choices use a soft
primary tint and checkmark; repeated clicks deselect, and multiple choices remain
selected.
It accepts a required accessible group label, string-valued labelled items,
optional descriptions and item/global disabled state, and an array `v-model`.
Native buttons retain Tab and Space/Enter interaction and expose `aria-pressed`.
The molecule owns no reads, persistence, filtering, or domain eligibility.

Kitchen Services menu selection is the first production consumer. This is an
accepted product-neutral baseline, not evidence of completed cross-domain
adoption. Long/searchable lists and single-value selection remain separate
responsibilities; do not replace those controls mechanically.

## Workspace group pages

Core `Workspace/GroupPage.vue` (`WorkspaceGroupPage`) owns group-page panel
framing, heading, width, spacing and breadcrumbs. Callers supply the Workspace
family and navigation key. Home uses the existing Workspace entry resolver;
an Overview ancestor is included when that family publishes one in navigation.
The default slot lets each domain compose its AI and child surfaces; without
custom content, the shell lists declared navigation children. Child content,
status, styles, readers and commands remain domain-owned. Kitchen group indexes
are the current adopters; other Workspaces may use the same framing without
requiring identical child layouts or inventing group pages.

## Core shared component families

`fireux-core/src/runtime/components` is a finite shared boundary, not the
default destination for UI whose owner is unclear. The current families were
reviewed against authored consumers on 2026-08-27:

| Family       | Owner and admission reason                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------- |
| `Auth`       | Core-owned authentication composition used by Core routes and App initialization.                  |
| `Collection` | Cross-entity collection header and page presentation contracts.                                    |
| `Dashboard`  | Core-owned Dashboard composition, including cross-entity administration panels.                    |
| `Provider`   | Cross-App Tool-provider frames and transport presentation.                                         |
| `Workspace`  | Cross-entity Workspace mechanics and presentation primitives.                                      |
| `Diagnostics` | Cross-package runtime inspection and drift tooling.                                              |
| `landing`    | Cross-App landing composition whose truth remains App-owned.                                       |
| `layouts`    | Shared layout chrome consumed by Nuxt layouts; these are components, not route layout entrypoints. |
| `molecules`  | Small cross-entity interaction and form contracts not supplied by Nuxt UI.                         |

Core-only consumption does not by itself make `Auth` or `Dashboard`
misplaced: Core owns those framework surfaces and their components do not
claim Entity authority. Conversely, reuse inside one
Entity or one industry is insufficient for admission to this root. New root
families require a named owner and durable cross-entity or Core-surface reason;
the former component guard is removed, so inspect current registration and
consumers rather than claiming automatic enforcement. Access state is not an owner: the former `public` bucket was
removed. App pricing keeps its owned SEO and offer composition beneath
`runtime/app`, while ordinary pages and catalogues compose Nuxt UI's `UPage`,
`UPageHeader`, `UPageBody`, `UPageGrid`, and `UPageCard` directly. Dashboard
administration lives beneath `Dashboard/Admin`; FireUX-App-only selection UI
stays in that App. The unused `Design/PaletteStrip` family, three unconsumed
editable-form components, and unreferenced landing/layout components were
retired rather than preserved as speculative seams.

The former root `Entity/Collection/Page` contract is `Collection/Page`: its
job is cross-entity collection presentation, and a generic `Entity` directory
would compete with the declared owner-first Entity spines. Search Demand and
Operation literature consume App models and therefore live beneath
`runtime/app/components`; they are adjacent App capabilities, not a generic
capability bucket. Documentation navigation and the docs layout belong to
`fireux-docs`. Visual effects belong to the App whose presentation they serve;
Core supplies no generic effects family or decorative one-off wrappers.

## Design-system vocabulary and reuse

Nuxt UI is the basis. FireUX extends it in unison through semantic tokens,
repeated interaction contracts and named compositions; it does not build a
parallel Button/Input/Card framework. Atoms, molecules and organisms remain
useful design and Figma vocabulary:

- **Atoms:** Nuxt UI/Tailwind foundations and narrowly owned semantic tokens.
- **Molecules:** coherent interactions combining foundations, such as selection,
  disclosure, read-state presentation and editable-field lifecycles.
- **Organisms:** named regions composing those interactions for a real user job.

These categories describe responsibility and composition depth, not compulsory
Vue directories or package ownership. CSS may retain the atomic folders; Vue
organisms retain discoverable names such as Collection, Payments or Order.
Use Nuxt UI directly first. Add a FireUX piece only for missing semantics or a
repeated contract, inspect real sibling consumers before extraction, and keep
single-domain meaning with its owner. Small local composition is preferable to
wrappers or configuration engines that exist only to reduce repeated markup.

### Inspected molecule reuse

Current source/consumer scope is Core molecules and immediate authored consumers.
The following comparison is local evidence, not repository-wide certification:

| Contract | Evidence and decision |
| --- | --- |
| StateCard, CopyError | Used across multiple domain and Core surfaces. **Keep** shared outcome/error presentation. |
| DisclosurePanel, ActionSurface | Multiple real consumers share disclosure state and accessible link/button/static-card roots. **Keep**. |
| SimpleField, ImagePicker, ObjectArray, ArrayOfStrings | Real editing consumers span named domains. **Keep** focused editable contracts and their command-intent protections. |
| Select, Checkbox, ChoiceGroup | Current observed product consumers are Kitchen configuration. **Narrow** reuse claims to that proved scope; retain working consumers without introducing another layer. |
| SegmentedSelector | One Kitchen library consumer. **Unproved** cross-domain reuse; retain the explicit local baseline and accessible Nuxt UI behaviour. |
| ListActions | One App join-request consumer. **Narrow** to this focused Core-owned interaction; do not advertise broad domain reuse. |
| Forms Top | Internal shared editing chrome. **Keep** as an implementation helper, not a standalone public API. |

Editable molecules are stateful interaction contracts: several observe Auth,
App identity and membership to invalidate stale editing commands. Those guards
are accepted protection, not domain mutation authority. Do not remove them for
visual purity or extract a new lifecycle engine without behavioural comparison.
Use `editable-completion-scope`, `editable-option-lifetime`,
`editable-list-actions` and `editable-string-field` source tests for affected
behaviour. Domain validation and protected persistence commands stay outside.

Refresh consumer evidence when a new use changes the contract. Prefer improving
an existing owner over creating another primitive, and remove tokens/helpers only
after checking authored consumers and stylesheet registration.

## CSS-to-component mapping

- The CSS atomic taxonomy supports the Vue tree; it does not mirror it. Vue
  components remain entity-owned (`runtime/kitchen/components/Cards`,
  `runtime/supplier/components/Collection`, and an entity's direct
  `components/Workspace/<Capability>`) while pages remain route-first.
- `atoms` own foundations or one semantic visual role, such as system tokens
  and the `.fx-type-*` vocabulary. They do not own a form, card, or page
  composition.
- `molecules` own reusable local contracts assembled from atoms and Nuxt UI,
  such as browser-level form behavior, inset panels, pills, and entity/preview
  card anatomy that the installed component library does not provide.
- `organisms` own recurring multi-component or page-region composition, such
  as collection layouts, public-action panels, profile/workspace composition,
  and shared page rhythm that still has more than one real consumer.
- If a real external surface needs shared CSS, `integrations` isolates that
  contract; it is not a domain organism. Do not keep speculative integration
  CSS without an authored consumer.
- A global CSS family must have a real repeated consumer contract or a narrow
  browser behavior that cannot be expressed through Nuxt UI. A single shared
  Vue component is not enough evidence: use the installed Nuxt UI component,
  its props/slots, or a small component-local utility recipe first. Business
  copy, routes, data authority, actions, and one-off presentation remain in the
  named component or page that owns them.
- The intended cross-tree mappings are: entity and preview card molecules to
  the prop/view-model-driven `X/Cards/Cell`, `Pill`, and `Summary` family
  classified in `card-family.md`; collection organisms to `X/Collection/*` and
  workspace indexes; workspace header/summary molecules plus the workspace surface
  organism to an entity's `components/Workspace/*`; public-action organisms to
  claim/operator panels;
  full profile compositions live under their named `Profile` or `Detail` owner,
  outside Cards; the public specialist-profile
  family composes Core `PublicProfileHero`, `PublicProfileSection`, and
  `PublicProfileDirectoryCard` presentation while each named domain retains
  its content. Image-led entity directories use their domain-owned
  `Cards/Cell`; Kitchen and Place are reference siblings for
  whole-card directory interaction, photographic media, honest fallbacks,
  focus, and mobile-first composition. Public Kitchen detail composes the Place-owned `PlaceDetailHeader` for shared
  venue identity, actions and media; Kitchen retains its own menu navigation
  and operator controls. Shared lower-level primitives do not create
  a generic data-configured entity-card framework. Profile editors use Nuxt UI cards
  and named `Edit/*` form
  composition; and page organisms to genuinely shared layout and route
  regions. Core `LandingProductIndex` owns the product-led landing region
  vocabulary and default order: `hero-preview`, the `onboarding` entry slot,
  `surfaces`, `workspace`, `specifics`, `ecosystems`, `apps`, `tools`,
  `solutions`, then `operations`. An App may provide an ordered subset through
  the shared `regionOrder` prop so absent product layers disappear without
  copying the renderer or adding an unowned region. The hero
  places shared product copy on the left and the App-owned product presentation
  on the right. FireUX uses the live public App and Ecosystem Card orbit;
  Static Main App photography uses Core `LandingProductHeroImage`, which owns
  the sharp clipped frame while each App owns its reviewed image, alternative
  text, and focal position. Core measures the live heading/image intersection
  and uses it to size a long horizontal blur fade running the image's full
  height. A bounded desktop fallback and transparent end buffer prevent the
  fade detaching during motion; the copy remains untreated and stacked layouts
  resolve to no blur.
  Reviewed source files share the guarded 1600 x 1000
  pixel, 8-bit opaque RGB PNG contract. FireUX's live Card orbit is the accepted
  non-image hero delta. `LandingProductEntryPaths`
  owns the ordered `start` and `join`
  choice, optional subordinate Tool doorway, icons, card anatomy, responsive
  layout, and reveal behavior. The slot is a public entry decision rather than
  account onboarding, so App adapters contribute only copy and routes.
  The former product-landing guard is removed. Inspect each maintained
  `LandingProductIndex` adapter and its actual entry composition directly.
  `LandingProductProofSection` owns the recurring proof-and-copy
  split, and `LandingProductCatalogue` owns the shared Tools, Solutions, and
  Operations grid. Core keeps their responsive/reveal behavior and flat
  semantic presentation free of decorative gradients and flares. App projects
  supply truthful data, copy, routes, and proof through named slots and may
  omit a slot when no public capability exists. FireUX places Ecosystems before
  Apps and does not fabricate Tools; Misebox supplies Menu surfaces and Finance
  under `specifics`, its bounded Apps projection, and an Ordering entry that
  lists published Menus and exposes only their enabled guest order paths
  before Solutions and Operations. FireUX and Misebox are the current sibling
  consumers. Slotted content opts into Core's single IntersectionObserver
  reveal system with `data-landing-reveal`; projects do not create a second
  scroll-animation observer or stylesheet. Core `useLandingMotion` owns that
  observer lifecycle and uses its Core-owned GSAP dependency for a responsive
  hero timeline plus one-shot, interruptible in-page reveals. The timeline
  coordinates semantic hero copy and preview parts while the App retains the
  proof itself. Both Main Apps call this two-part composition Section One:
  Hero, with product title and actions on the left and App-owned visual proof
  on the right. Subscription pricing follows outside the pinned Hero. FireUX
  proves the opt-in `immersive` composition with a
  viewport-scale hero, a pinned copy-to-proof handoff driven by its live App
  and Ecosystem cards, and scrubbed chapter transitions. Misebox now shares
  that immersive Core composition while retaining its Kitchen-owned hero
  image and product order. Core `LandingPricingStrip` owns the shared Monthly
  subscriptions presentation; both Main Apps supply their source-backed Free,
  Premium, and Managed plans at the project edge. Core `LandingOperationRail`
  sits above Section One in both Main Apps. Despite its historical component
  name, each App projects its complete source-backed Workspace capability
  catalogue to matching `/operations/<slug>` literature routes; Identity
  remains a peer capability rather than becoming an Operation. As Section One hands off, Core moves the
  immersive landing header and Operations rail upward and out rather than
  hiding either surface beneath pricing; reverse scrolling restores both. This
  behavior is scoped to the immersive landing and does not affect ordinary App
  layouts. The pricing strip has no
  visible heading; its App-owned aria label retains the semantic name. Core
  compacts it promptly to plan names and prices, then moves the compact strip
  upward and out as the first content stage takes over the full viewport. Core
  animates only each named region's motion-stage shell; the slotted component
  owns its internal reveal markers so chapter motion does not reach across that
  boundary. Compact and reduced-motion modes remain free of that choreography.
  It preserves visible SSR output, falls back
  to the CSS reveal contract if GSAP cannot load, kills active tweens on
  unmount, and exposes no project-level GSAP seam. Reduced-motion users see
  the final layout without movement. Native Nuxt route transitions remain a
  separate Core integration and do not move into GSAP. Core
  `LandingWorkspacePreviewFrame` owns the shared Nuxt UI Workspace shell: target
  rail, primary and optional secondary navigation, selected heading,
  responsive composition, and persistent full-Workspace doorway. Misebox's
  Workspace proof pairs that shell with a read-only canonical Kitchen Operations
  launcher and project-owned Workspace copy. Its thin root owns local operation
  and page state plus one Product Demo load. Named Menus, Dishes, Ingredients,
  Recipes and empty-canvas children own their projected bodies; Dishes
  further separates Collection, Overview, and named
  Finance/Spec/Prep/Recipes child pages beneath one persistent
  image-backed Dish context. Ingredients
  receives the selected Demo Kitchen's usage links already resolved through
  canonical root Ingredients; it does not copy name or image truth. Its compact
  collapsible groups use the same ordered food-group resolver as the real
  Kitchen Workspace.
  Menu availability controls belong to the real Workspace; the landing Menu
  child stays presentation-only. The Workspace and landing roots consume the
  Kitchen-owned Demo service state. Inactive-card
  styling remains a real Workspace concern; landing Dish, Recipe, Ingredient,
  and Menu cards stay visually neutral. The persistent `Open full Workspace`
  header doorway enters `/workspace/kitchen` without changing Workspace
  selection; the root otherwise owns only local Dish page identity,
  filters Drink records from the entry-level Dishes showcase, and suppresses
  Food/Drink type labels there, while the
  Dishes
  coordinator owns its breadcrumb, persistent image-backed icon-only page
  selector, and page dispatch. The muted Dish image remains stable while child
  pages change; its circled information icon represents the selected Dish
  overview, and accessible names and hover titles preserve each icon's meaning.
  Detail tiles are navigation doorways rather than inline expanders.
  Children consume typed read-only props and do not acquire Workspace selection,
  Demo loading, live reads, Firebase, or write authority. The project source
  begins at
  `projects/misebox/misebox-app/app/components/Landing/WorkspacePreview/Index.vue`.
  FireUX consumes the same shell for its Project Operations and projects Apps
  and Ecosystems from the explicitly FireUX-owned Core Project Demo scenario.
  Ignition requests remain App intake with a separate private app-admin delivery
  workflow; it is not a Project Operation. User activity remains a truthful
  private state. The Workspace doorway enters `/workspace/project` without
  changing Workspace selection. Mobile keeps each component before the text and desktop places it
  to the left. Project proof truth never moves into Core. Core
  `LandingCardOrbit` owns deterministic sphere geometry, drag/keyboard
  interaction, a one-shot visibility-gated desktop launch with one stable
  per-mount vector, two closed turns through one long deceleration that settles
  exactly onto the main pitch, continuous visibility-aware autoplay in the same
  direction, desktop hover selection that elevates one card in place without
  snapping the pack or changing touch/root keyboard behavior, fully opaque and
  crisp orbital elements whose scale and stacking carry depth, gentle mobile
  autoplay that continues while the document is visible, and reduced-motion behavior
  for card showcases. It receives typed items and one dumb item slot; FireUX
  projects its bounded public
  App/Ecosystem directory into canonical Cards from the explicit `live` source.
  Misebox instead projects its network-free Demo PowerCards into a local,
  keyboard-focusable left-to-right scroll window with a responsive bento grid.
  The shared
  orbit source discriminant is closed to `demo | live`; an orbit cannot mix,
  join, or fall back across those sources. The Misebox window preserves its
  single `demo` envelope without adopting orbit geometry or motion. The orbit
  is a landing compositor, not a fourth Card variant. Each Main App owns the fixed viewport, isolation, content-stack,
  and print contract for its landing art. FireUX Stars and Misebox Steam are
  sibling App visuals with the same required reduced-motion behavior while
  retaining distinct app-owned character. FireUX Stars uses the
  deterministic Core field helper; Misebox Steam retains its project-owned
  client-initialized puff lifecycle. Core
  `LandingAppCollection` renders the bounded public App directory controller
  inside the product landing's named App slot; the project supplies only
  section copy and presentation-safe filtering, never a hard-coded tenant App
  list or direct App storage read. Solution grids,
  compact metrics, ordinary card roots, and dashboard body stacks use Nuxt UI
  directly rather than retaining parallel global CSS.
- `assets/styles/main.scss` is the explicit cascade authority. Its import order
  preserves behavior and the file remains import-only; a CSS folder name does
  not create component auto-import, route ownership, or business ownership.
- The `/packages/fireux-core/design/contracts` page exposes stable light/dark, desktop,
  and mobile specimens for these shared contracts.

## Domain component folders

Inside `runtime/<entity>/components`:

- `Cards`
- `Collection`
- `Create`
- `Onboarding.vue` with named stages under `Onboarding/*`
- `Detail.vue`
- `Detail/Index.vue` when detail owns child slices
- `Edit`
- `Overview`
- `Workspace/*`

## Detail rule

- Use `X/Detail.vue` when the detail component is simple and self-contained.
- Use `X/Detail/Index.vue` when the detail surface owns child components.
- Put those child components inside `X/Detail/*` so the filesystem reads like the UI surface.

## Root entity naming

- Entity component roots such as `runtime/kitchen/components`,
  `runtime/menu/components`, and `runtime/supplier/components` already declare
  their owner.
- Do not prefix components in those folders with `Public` unless it names a
  real publication or privacy boundary.
- A surface such as Workspace, Detail, Directory, or Kiosk may qualify the path
  inside the entity's component role; it does not replace the entity owner.

## Workspace component folders

Workspace components describe an operator surface; they do not own the records
or commands exposed there. Components may be grouped by stable domain
responsibility, independently of navigation labels. Kitchen is the current
capability-first adopter; Project, Supplier, Property, Portfolio and Blank
retain their existing named Workspace folders.

- `Workspace/Index.vue` composes the entity's entry surface and `Home/*` children.
- `Workspace/Navigation.vue`, `Selector.vue` and `Dashboard.vue` may remain at
  the root when they have real, distinct cross-page consumers.
- `Workspace/Home` contains entry collection/single presentation and entry-owned
  creation/edit dialogs. Blank uses `Home/Collection.vue` and `Home/Single.vue`
  like the other collection-based entries.
- Kitchen groups food management under `FoodAndDrink` (Items, Menus, Promotions,
  Services), and production under `PrepAndProduction` (Recipes, Ingredients,
  Stations, PrepItems). Group Index composes its AI and child overview surfaces;
  each child owns its Overview beside its working components. Finance, Identity,
  Team and other implemented capabilities live directly beneath Kitchen components.
  Kitchen `Workspace` retains entry, selection, navigation, overview, diagnostics
  and cross-page AI/research/tool helpers. Menu and Ingredient runtime owners
  retain their existing independent components; Kitchen groups compose them.
- Other inspected families retain named capabilities under `Workspace`: `Orders`,
  `Catalogue`, `Items`, `Properties`, `Reservations`, `Apps`, `Ecosystem`,
  `Overview`, `Identity`, `Team`, and others only where implemented.
- Stable domain groups may organise components; sidebar-only groups do not add
  filesystem owners. Do not introduce `Operations`,
  `Capabilities`, `Supporting` or `Sundries` containers around capability folders.
- Shared entity-specific controls use an explicit responsibility: Kitchen has
  `Navigation/Food.vue`, `AI/*`, `Research/*` and the cross-capability `Tools.vue`.
  These stay domain-owned; their reuse does not make them Core primitives.
- Each capability owns its own subroute compositions and local children. Use
  `Collection` and `Single` for that interaction; use specific workflow names
  for imports, publication, receiving or editing. There is no mandatory
  Index/Read/Write/Detail scaffold.
- Reusable editors and workflows belong with their domain and can be composed
  in Workspace and other surfaces. Moving files must not move data authority.
- App entry-only literature stays in `app/components/Workspace/<Entity>/Home`.
  Names such as Header, Info, CapabilityLinks and DiscoveryLinks distinguish
  App framing from lower domain Home components; do not shadow those components.
- Shared Core mechanics stay in Core's `components/Workspace`. Its Overview
  presentation lives together under `Overview`; `DedicatedApp.vue` describes
  the associated App, not generic management or access policy.

Names follow their registered paths. Move all direct imports, template tags,
explicit registrations and tests together; remove old paths and empty folders.
No aliases, forwarding wrappers or duplicate registrations preserve retired
names. A hidden placeholder route may compose a Nuxt UI notice directly;
that does not justify a miscellaneous component family. Remove unconsumed
components after checking explicit, auto-imported and dynamic consumers.

## Workspace navigation contract

Keep navigation easy to evolve while Workspace capabilities are being developed:

- Groups describe operator jobs and correspond to URL parents. Their visible
  labels may evolve while their route segments stay stable. Moving a capability
  between groups updates its route tree and every consumer together; its domain
  component, command and data owners do not move merely because navigation does.
  Explicit product route contracts can differ: Kitchen Menus stays at
  `/workspace/kitchen/food-and-drink/menus` inside the Menus sidebar group. This
  exception does not move the group's other capabilities out of `/food`.
- A capability has one primary sidebar destination. Contextual shortcuts can
  link to it elsewhere; avoid duplicate primary entries.
- The owning route's `nav` metadata declares its destination, label and current
  grouping. Explicit `children` can compose existing routes or views into one
  operator group; those destinations must not also register as standalone entries.
  Separate pages can instead share `group` and `groupDisplay: 'nested'`.
  Use one grouping mechanism per group, not both at once. An explicit-children
  group with a working index also declares `groupIndex: true`; omit duplicate
  child links to the same index. Redirect-only routes are not working indexes.
- A nested group may declare one existing route as `nav.groupIndex: true`.
  Core uses that route as the group label's destination and omits it from the
  children. The label navigates and opens the group; Nuxt UI's separate chevron
  retains collapse control. Groups without an index retain their trigger-only
  behavior. Kitchen Identity, Menus, Orders, Prep & Production,
  Food Safety, Team, Settings, Stock & Purchasing, Reports and Developer consume it; no group data or
  command ownership is introduced. A group index is a compact summary, existing
  basic controls where useful, and route-owned child links. Large working boards
  and editors stay child pages. Do not invent configurable fields merely to fill
  an index, or start a working controller just to render its navigation summary.
- Route files mirror group → capability → record/detail nesting. Workspace
  component folders retain the capability's domain name rather than copying the
  navigation group. User-facing labels may differ (Finance is shown as Sales).
  Distinct pages use child routes; in-page sections can retain anchors, and query
  parameters remain appropriate for filters rather than separate page destinations.
  Ordinary section labels (for example a Workspace section already rooted at
  `/workspace/project`) do not require another artificial route level.
- Overview capability navigation consumes the same route metadata as the sidebar.
  Real summaries and contextual shortcuts may enrich it; do not maintain a second
  group/destination catalogue or patch labels only in the Overview.
- Group names and membership are current product decisions, not permanent framework
  rules. Refine one operator flow at a time and verify its route, selection/access,
  sidebar and Overview together. Do not move storage or commands for a navigation edit.
- Core owns navigation mechanics; domains own their capability organisation and
  Apps own deliberate presentation overrides. Prove shared needs in real Workspace
  siblings before extracting more Core machinery. Kitchen's current groups are not
  mandatory groups for Project, Supplier or other Workspaces.

## Working rules

- Prefer named domain components over vague generic shells.
- Keep Entity index CTA copy, actions, permissions, and meaning with the
  owning domain. Compose ordinary `UPageCTA` structure locally until materially
  differentiated siblings prove a smaller shared structural contract.
- Register each shared component source through one canonical auto-import tree.
  Nested Core families such as `molecules` keep their path-derived
  `Molecules*` names; do not flatten or alias the same files through a second
  component-directory registration.
- In development, Core can label visible authored Vue component roots through
  its fixed hotpink inspection overlay. Labels default off and toggle from the
  existing floating developer controls without a reload. Keep those labels out
  of component markup; production does not run the overlay.
- Share functions/composables where behavior is common.
- Let child components own local presentation when it reduces parent script weight.
- Keep Nuxt UI as the default chrome layer.
- Staged entity onboarding uses the small shared
  `OnboardingShell` shell for structure, stage progress, error
  placement, and slots. Each domain retains its own `XOnboarding` root and one
  `XOnboarding<Stage>` component per visible decision; domain copy, drafts,
  validation, actions, navigation, and creation never move into the shared
  shell. See `lasagne.md` for the dependency rule.
- Nuxt UI owns the ordinary global visual baseline, including `--ui-radius`.
  FireUX consumes that value but does not redeclare the installed default.
- Purely aesthetic global behavior is not part of the current system baseline:
  do not hide scrollbars globally or animate every page-body child on entry.
  Core's single Nuxt-generated route-transition integration is the narrow
  shared navigation contract, not permission for broad page-motion recipes.
- Shared visual primitives such as radius, borders, elevation, standard
  spacing, surface backgrounds, and control geometry belong to Nuxt UI theme
  configuration or a real reusable component/molecule. Domain components
  compose those primitives; they do not redeclare them in every file.
- Tailwind's installed font families, type sizes, weights, line heights, and
  tracking values are the numeric typography authority. Templates may compose
  named Tailwind utilities for local presentation; authored CSS derives
  ordinary values from the corresponding Tailwind theme variables.
- Repeated semantic typography uses the core `.fx-type-*` roles in
  `assets/styles/scss/atoms/typography.scss`. Those roles mirror Nuxt UI's page
  vocabulary rather than creating a second scale: headline, page title,
  display title, section title/display, card title/heading, description, body,
  caption, label, and code. Headline is page/section eyebrow copy; label is
  compact metadata or field/status copy. Display title owns the recurring
  FireUX landing H1 recipe; section-display and card-heading are the larger
  marketing/card variants rather than repeated utility overlays.
- Domain-owned display type, print/output geometry, debug microtype, artwork,
  and responsive optical type may stay exact when they are a real local delta.
  They must not become a parallel general-purpose type scale.
- Before adding CSS or another wrapper, use the complete Nuxt UI component
  contract: variants, colors, sizes, slots, loading, disabled, and state
  semantics. Wrapping a Nuxt UI component in a second local design layer is
  duplication, not abstraction.
- Shared molecules exist for repeated multi-element contracts that Nuxt UI
  does not own by itself. `MoleculesDisclosurePanel` owns the standard
  collapsible trigger and open-state chevron, and `MoleculesActionSurface`
  owns the linked, action-button, or static root of an entity card. Ordinary
  create cards use `UCard` directly. Editable field molecules own their
  display, edit, save, cancel, and error lifecycle; their `value` and `update`
  props are transport-neutral and therefore use the `FormsEditable` vocabulary rather
  than naming Firestore. These components do not own domain copy or domain
  card content.
- A shared form molecule needs repeated cross-domain use. A one-consumer field
  belongs to that domain, and a docs-catalogue entry is not a consumer. Thin
  display wrappers such as a labelled `UBadge` stay inline unless a durable
  interaction or accessibility contract survives multiple consumers.
- Repeated create and onboarding composition are named shared product
  contracts, not atomic-design molecules. Their Core entrypoints are
  `Create/Shell` and `Onboarding/Shell`; each consumer retains its domain data,
  copy, validation, and writes.
- Disabled interactive cards must use the action-surface contract. Styling a
  `NuxtLink` or clickable `div` with reduced opacity does not disable
  navigation, provide button semantics, or remove it from keyboard operation.
- `MoleculesStateCard` represents an explicit `loading`, `empty`, `missing`, or
  `error` outcome and can render as a standalone card, a bare state inside an
  existing card, or the established dashed `collection` surface. That surface
  replaces the retired parallel `CollectionState` component. Missing data and
  failed reads are different outcomes. Use
  `UAlert` for compact notices and actionable errors, and use `USkeleton` when
  the loading state needs to preserve the shape of real content.
- Component-scoped CSS is for genuine domain layout and state deltas. Do not
  replace long inline Tailwind strings with the same repeated design system in
  local CSS. When a touched surface has grown either way, move the shared
  primitive to its owning layer and keep the leaf component semantic.
- The former `scripts/guards/css-system.mjs` guard is retired. Verify touched
  styling against current Nuxt UI contracts, focused source-owned checks and
  representative browser layouts; do not restore the removed guard suite.
- Package and project templates use Nuxt UI semantic color utilities rather
  than raw Tailwind palette utilities for ordinary UI. Intentional brand,
  artwork, overlay, print, and output colors remain owned deltas and should use
  a named local seam or a narrow reviewed guard exception when they need to
  differ from ordinary UI semantics.
- Ordinary rectangular UI uses the installed Nuxt UI `xs` through `3xl`
  radius scale. Do not add a parallel radius step or an arbitrary numeric
  radius. True circles and pills, explicitly approved percentage artwork, and
  owned domain seams are exceptions; Menu's owned radius seams derive from
  `--ui-radius` by default.
- Tailwind's `--spacing` is the single numeric spacing authority. Templates
  use named Tailwind spacing utilities for genuinely local composition;
  authored CSS derives ordinary margin, padding, and gap values from
  `--spacing` instead of declaring a second `--space-*` scale.
- Repeated page, list, form, or layout rhythm belongs in a named shared class
  or component. Core rhythm and composition live in the specifically named
  modules under `assets/styles/scss/molecules` and
  `assets/styles/scss/organisms`; `organisms/page-layouts.scss` owns the shared
  page/list rhythm family, while `organisms/public-profile-surfaces.scss` owns
  only the cross-domain specialist detail grid, sidebar rhythm, and semantic
  tone inheritance. Profile editor headers and field rhythm remain with Nuxt
  UI page cards and their named form components rather than a global editor
  organism. Domain-owned semantic seams, such as Menu spacing, may remain when
  their defaults derive from `--spacing`.
- Off-grid spacing is an explicit local delta for branded optical layout,
  responsive/viewport geometry, safe areas, print, artwork, or accessibility;
  it is not another general-purpose scale.
- One-off Tailwind for local layout, pixel-specific non-system deltas and
  intentional branded color remain valid owned choices.

## Guard warnings

- No component `organisms` folders or `Organisms*` component names.
- `assets/styles/scss/organisms` is a CSS composition layer, not a component
  bucket; keep it semantic and shared rather than using it as catch-all CSS.
- Relative imports in component source must resolve.

## Core App account context and HTML preview

`app/components/Membership/Index.vue` composes the signed-in dashboard’s current
App, membership access and available profile entrances through named
`CurrentApp`, `Access` and `Profiles` children. CurrentApp owns the one exact
App read; Access and Profiles consume the shared User session. It does not
replace User’s record-driven AppMembership presentation or editor.
`app/components/Preview/Html.vue` owns the sandboxed generated HTML preview
and download used by FireUX Project App Create/Read surfaces. It is not a
package-library specimen. The unconsumed App Profile card and floating Debug
link are retired; shared Diagnostics and App Detail remain their real owners.

## Place editing, discovery and hours

Place’s routed edit reader/access shell is `Edit/Page.vue`; `Edit/Index.vue`
remains the passed-record editor composition and `Edit/Delete.vue` the guarded
destructive control. This keeps route acquisition distinct from editing and
preserves the existing trusted deletion command. The unused ClaimPanel is
retired; no claiming authority is moved into display code.
`Search/Index.vue` composes Bar, Dropdown and selection/confirmation behavior
for Company creation, Job/Professional location selection and Place onboarding.
`OpeningHours` groups the Schedule editor, Week presentation, Status and the
optional read-only Google source view. Google hours do not replace or write
the canonical authored venue schedule. These capability groups require no
extra forwarding entry components.

## Kitchen outer capability and Workspace boundaries

Kitchen’s reusable `Orders/Ticket.vue` presents one Order and emits editing
intent; Board, customer response and Library reuse it. Operational Board,
Editor and Channels remain under `Workspace/Orders`. Neither placement changes
order models, protected submission or operator commands.

`Tools/Index.vue` is the public domain tool catalogue; the standalone labour
cost calculator remains a consumed tool leaf. `Workspace/Tools/Toolbar.vue`
provides capability-specific actions and delegates Stations’ actual tools.
These are distinct catalogue and action responsibilities.
`Onboarding/Provision.vue` is the administrator-authorized entrance for creating
a Kitchen for another User, composing ordinary onboarding without changing
authority. The old Admin folder is retired.

Workspace retains its real Index coordination. Dashboard composition lives
with Home; Navigation Index and Group own sidebar/navigation framing; Selector
Index owns selected-Kitchen controls. Their existing App adapters and registration
are updated together. AI presentation logic lives under
`composables/workspace/ai`, with its UI contracts in
`models/kitchen-ai-presentation.model.ts`; consumed styles remain beside the UI.
This is an outer-boundary alignment, not a claim that every inner Workspace
capability has completed a composition audit.

## Kitchen inner Workspace capability anatomy

The inspected Dishes, Ingredients, Recipes, Stations and Tables entries keep
their existing Kitchen readiness/lifecycle gates in Index and compose named
Collection sections. These are selected-Kitchen operational compositions using
the existing scoped readers/contexts, not new canonical Entity collection APIs.
Record Details enter through Detail Index; the former Ingredient, Recipe and
Supplier record-only forwarding shells are retired, with surface framing
retained on their actual Detail compositions. Supplier collection reading is
composed directly by its Index because its former Index only forwarded to Read.

Dishes and Stations expose Create; Kitchen Ingredient Add selects and associates
a canonical Ingredient, rather than creating another root; Tables Edit updates
the venue table count. Menus Create owns blank/URL/upload entrances, while
Uploads Detail owns the separate uploaded-source record. Shared Kitchen
collection Header, Toolbar and Row presentation live together under Collection.
Consumed Waste, Menu and Overview development inspectors live beneath their
named capability inspection components and retain existing development restrictions.
Menu process display helpers and QR view contracts live in Kitchen utils/models.
No command, storage authority, route key or API contract changes with these moves.

### Domain action entrances

Blog `Create/Link.vue` owns its permission-aware authoring entrance. Product
`Directory/Actions.vue` owns the public directory’s related and management links.
Specialist profile `Current/Index.vue` compositions (Agent, Professional, Chef and
Driver) show the current account’s profile and creation or management actions;
`Identity` remains the full profile management surface. These are domain-owned
compositions, not a universal CTA family. Unconsumed Supplier and Customer CTA
components are retired; their active creation and identity surfaces remain owners.

Entity JSON views live in the main component spine when they own fetching or a
domain projection; Menu `Json.vue` and Kitchen Workspace Menus `Json.vue` are
such consumers of Core’s shared viewer. Do not add an entity `Diagnostics`
folder for JSON. Use Core’s viewer directly for passed objects when no domain
behavior is added. Real model-drift tools are named `ModelInspection.vue`;
Workspace architecture and Waste inspection retain their specific names and
existing development restrictions. Shared Core Diagnostics mechanics and protected
`/diagnostics` routes remain distinct from entity component organisation.

Kitchen Workspace Menus `Detail/Index.vue` owns record context, read outcomes and
local perspective composition. `Detail/Settings.vue` contains its settings
sections. `Publication/Index.vue` owns the daily-menu availability boundary and
composes `Publication/Actions.vue` for publish and unpublish commands. Create
and collection dialogs live with their named sections; no aggregate CRUD shell
is needed. Legacy perspective URL handoffs are route-owned and reuse the
existing record-navigation intent rather than a compatibility component.

Kitchen Workspace Menu collection entry and list live in `Collection/Index.vue`
and `Collection/List.vue`. Record header, identity and perspective navigation
belong under `Detail`; the Detail entry directly composes section content with
its surface framing rather than using a forwarding Content component.

Menu section management uses `Sections/Collection/Index.vue` for the list/calendar
and `Sections/Detail/Index.vue` for one section’s composed surface. Menu item
editing lives in `Items/Edit/Index.vue`; `Items/Add/Repertoire.vue` associates
an existing dish, while `Items/Add/ByName.vue` reuses or creates dish identities
through the existing command. These are distinct operations, not generic Read
and Write surfaces. Collection, Detail and their children are optional
responsibility names, not compulsory folders or files for every entity.

Menu source processing composes `Process/Review/Index.vue` for media review and
destructive-option-loss blocking. Its `Apply.vue` control owns applying the
reviewed draft through the existing protected confirmation endpoint, including
eligibility, pending, error and applied-result feedback. Review composition
and the apply action are distinct responsibilities, not two confirmation
entrypoints.

Kitchen Menu Detail settings compose their local `Summary.vue` and `Offerings.vue`
sections. Section collection scheduling lives in `Sections/Collection/Schedule.vue`;
its placement does not create a separate scheduling owner or command.

Job and Product `Detail/Summary.vue` sections both present compact key record
information. Job owns employment terms and status; Product owns its description,
price and composed checkout control, also reused by its creation preview. The
shared name expresses their responsibility, not a shared field schema or a
requirement for every entity to add a Summary component.

`Cards/Summary.vue` names a reusable compact record presentation, including
specialist profile summaries. It can display saved or draft input; using it in
a review screen does not make the card itself a preview workflow. Reserve
`Preview` for a surface that demonstrates an intended output before saving or
publishing. Existing card visual variants may remain implementation details;
this naming change does not merge Summary, Cell or full Profile contracts.

Menu item editing composes `Items/Edit/Row.vue` over one
`useMenuSectionItemsEditor` coordinator. The coordinator owns the existing section
read, scoped commands and feedback; rows reuse Options, SharedTerms,
AdoptSharedTerms and the existing editable-field molecule. Section collection
composition uses `useMenuSectionsEditor` for date filtering and commands,
`Sections/Create/Index.vue` for its form, and `Sections/Collection/Row.vue` for
section editing and navigation. Children receive the coordinator explicitly and
do not instantiate another record reader.

Kitchen Menu `Detail/Source.vue` owns source replacement and processing within
the selected Menu record. `Uploads/Detail/Index.vue` owns saved-upload read
outcomes and composes passed-record Summary and File sections; it does not
implicitly apply a processing draft. Workspace QR composes Menu and Target
controls over `useMenuQrTargets`, which retains the existing menu/service reads
and public-link eligibility rules. Target controls reuse Menu’s existing
`useMenuQrRenderer` with display dimensions; the public printable QR page retains
its own presentation and the same renderer defaults.

Menu Process composes Run, Report, Comparison and the existing Review controls.
`useMenuSourceProcess` owns the one record context, credentials, processing request,
persisted/live draft projections and scoped UI completion. Controls receive that
coordinator and reuse Cost, Sections, Review and Core disclosure/debug components;
they do not repeat reads or processing requests. The unconsumed Menu deletion
control is retired while the trusted command remains unchanged.

Public Menu QR composes a Core StateCard-based State control, Printable view and
ready-gated PrintAction. `useMenuQrPage` owns the single Menu read, context
eligibility, paths, SEO and response-status coordination. The parent awaits its
existing ready promise before applying HTTP status, preserving Nuxt setup context.
Printable owns its canvas and the existing QR renderer lifecycle; controls add
no Menu reads. The dedicated `QR/qr.css` remains the single, namespaced style
owner across these component boundaries, including print rules.

## Secondary action menus

Use the vertical three-dot icon (`i-lucide-ellipsis-vertical`) with Nuxt UI's
`UDropdownMenu` for secondary record/item actions. Keep this meaning consistent
across surfaces so users learn that the dots open a menu. Give each trigger a
specific accessible label, such as “Actions for Soup”. Keep the primary action
visible; do not hide every action in overflow. Dense editable item lists use
simple dividing lines rather than a separate bordered card for every row.
The Kitchen Menu section editor is the current example. Its labelled Remove
from section action sits inside the vertical menu and retains confirmation; it
does not delete the underlying Dish.

## Plain collection rows

Core `components/Collection/Row.vue` is the small divider-list layout primitive:
content in the default slot, an optional trailing `value`, and optional `actions`.
It owns alignment and wrapping only, with article/div/li semantics selected by
`as`. A list owns its dividing lines and may align value/action widths through
`--collection-row-value-width` and `--collection-row-actions-width`. It owns no
record schema, links, menus, permissions or mutations.

Kitchen Menu item rows use value for their price presentation and actions for
an accessible vertical menu. Editable Menu section rows use no value slot and
compose editable labels, navigation and section actions. The item-list header
uses the same row layout to align its currency label. These real consumers keep
their domain coordinators and controls. `CollectionCell` remains the existing
card-style presentation; Row does not add variants to that card contract.
Verify the Core collection-row rendering test and Kitchen Menu composition/
reader tests, plus the consuming App's desktop and narrow layouts.
