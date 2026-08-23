# Misebox GPT Context

Updated: 2026-08-23
Ref: 7f18d4e91
Role: living context
Scope: Misebox ecosystem and Apps

This is the single context entrypoint for an external GPT focused on Misebox
inside `fireuxlabs/fireux-mono`.

## Refresh instructions

Before each task:

1. Use the current default branch of `fireuxlabs/fireux-mono`, not a cached or
   previously uploaded snapshot.
2. Read the root `AGENTS.md` and `docs/ai/gpt-context.md` completely.
3. Inspect the current Misebox ecosystem package at
   `packages/ecosystem/fireux-misebox` and the relevant app under
   `projects/misebox/*`.
4. Use the context router in `AGENTS.md`. For kitchen, menu, ordering,
   workspace, Firestore, directory surfaces, layouts, or app configuration, read the
   smallest relevant `docs/concepts/*.md` map before inspecting code.
5. Find the nearest working sibling in the same FireUX family before proposing
   a Misebox-specific implementation.

## Misebox boundaries

- Shared Misebox identity, configuration, layouts, and ecosystem behavior
  belong in `packages/ecosystem/fireux-misebox`.
- The reusable Misebox solution catalogue belongs in
  `packages/ecosystem/fireux-misebox/src/runtime/content/solutions.ts`.
  Misebox renders that catalogue directly; the FireUX parent may compose the
  same entries into its cross-ecosystem discovery surfaces.
- Kitchen and Supplier packages own their reusable Workspace capability
  catalogues beneath their Entity `models` roles. Misebox
  composes those catalogues into one app-wide discovery index grouped by
  Workspace. A legacy `*Operations` filename does not reclassify Identity or Team
  as Operations.
- Reusable kitchen, menu, ordering, supplier, product, and other domain truth
  belongs in the owning extension package under `packages/extensions/*`.
- Misebox may own neutral physical product masters with named branding
  surfaces. An App- or Kitchen-owned treatment references that neutral product
  and owns only its approved identity application; commerce fields such as
  unit, minimum quantity, and order increment remain product concerns. Product
  pages may present the neutral master and its treatments, while Kitchens
  purchase a treatment rather than copying the neutral asset or another
  owner's identity.
- `/kitchens` is the server-resolved Kitchen collection. `/api/kitchens`
  returns `Kitchen[]`, excluding only roots whose boolean `visibility` is
  explicitly `false` for ordinary visitors; an authorized developer or App
  admin may include and label hidden rows. Every resolved Kitchen contains its
  canonical same-ID `place: Place`. The client searches, filters, and renders
  that array without reading Firestore for the public route.
- `/kitchens/**` is the Kitchen Entity route family, not the Kitchen Workspace.
  Its exact detail endpoint may return the canonical readable Kitchen and its
  same-id canonical Place plus a joined presentation view. That response never
  includes Team, Orders, prep, Sales, private configuration, or other protected
  operational children. Vue presentation is not a privacy boundary: protected
  material lives in separately authorized records and is absent from the
  public response. An exact permitted listener may keep an already-open Entity
  current without changing that response or ownership contract.
- Reusable Kitchen onboarding belongs to `fireux-kitchens`. Place-backed
  onboarding selects or creates a Place, then creates the same-ID Kitchen root
  and its Kitchen-owned Team authority. The root Workspace also permits a
  name-only shell: a trusted command creates a generated Kitchen id, minimal
  root, and owner Team record for the current Firebase identity, including an
  anonymous identity. Kitchen is a plain parent model, not a generic
  Entity/App/Workspace management classification.
- A Kitchen root owns exactly its id, name, slug, status, and visibility. A
  Place-backed public read may resolve its same-ID Place; a name-only shell is
  deliberately unenriched until Place identity is attached. Fulfilment and other operational
  configuration are capability data, not properties of the Kitchen entity.
  Place owns venue name and description, address/geo, photography and identity
  media, classification/tags, price level, currency/timezone, and business
  hours. Ratings require a separate authority; favourites are User-owned; Menu
  and Dish search remains Menu/Dish data. No Place presentation is copied into
  Kitchen.
  Place also owns the one identity colour used behind transparent identity
  media. Current Kitchen `assets.backdrop_color` data is migration input, not a
  second colour authority; bounded Kitchen reads receive the linked Place
  colour instead of copying or overriding it.
- Kitchen Team owns bounded membership, roles, permissions, and audit stamps.
  Kitchen capabilities own `theme`, `menus`, `orders`, `tables`,
  `fulfilment`, and `integrations` configuration outside the Kitchen root.
  Fulfilment is the singular `KitchenFulfilment` record at
  `kitchens/{kitchenId}/fulfilment/policy`; its model contains only
  `delivery_zones` and `payment_methods`. Trusted readers prefer that child and
  return the canonical empty policy when that child is missing and never read
  root `fulfilment`; root retirement requires a separate deletion gate. The guarded create-only
  audit and migration entrypoint is
  `scripts/migrate-misebox-kitchen-fulfilment.mjs`. Delivery-zone and
  payment-method editors use the trusted Kitchen fulfilment command, which
  transactionally replaces the complete child policy while preserving the
  editor-independent half from the child policy; no runtime writer updates or
  falls back to root `fulfilment`. Remaining root `theme`, `menus`, and
  `orders` maps are migration preimages,
  not permission to keep capability state on Kitchen. Their child destinations
  remain unproved until a named owner and every reader/writer are reconciled;
  do not invent a generic configuration document. In particular,
  `order-service/current` is the live Order sequence record and is not an
  operation-hours policy. The Kitchen Identity surface follows Place →
  Workspace → App: Place owns venue identity and its identity colour,
  Workspace may own a separately proved presentation capability, and a real
  App owns only App presentation. Current root palette/font readers and writers
  are transitional consumers, not Kitchen entity authority.
  Menu colour presentation resolves an optional KitchenMenu
  `theme.palette` over the Kitchen palette, deleting the Menu field
  to restore inheritance. The bounded DTO exposes the effective palette and
  its `menu | kitchen | place-default` source. The Workspace palette remains
  `canvas`, `text`, `accent`, and `accent_contrast`. The protected
  `scripts/migrate-misebox-menu-themes.mjs` migration moves only proved legacy
  Menu colours into that existing authority; it does not invent missing accent
  colours or make a root Menu another Kitchen-theme owner.
  Menu roles are explicit Kitchen configuration: one
  `primary_menu_id` and an optional enabled `specials_menu_id`. Never infer the
  primary Menu from collection order. Specials remains an ordinary KitchenMenu;
  its published content is projected into the primary Menu using the primary
  renderer's presentation.
  Authenticated Workspace target projection requires the exact root, Place,
  exact `team/{uid}` authority, and scoped App membership when management names
  an App. Team roles/permissions grant Kitchen capabilities. Current App admins
  remain the explicit administrative override for Kitchens managed by that App.
- Media editors accept files rather than arbitrary URL text. Trusted upload
  and mutation boundaries own exact Kitchen asset targets and reject another
  bucket, external host, or wrong entity path. Kitchen assets never use the
  linked Place image as a second logo source. See
  `docs/concepts/place-kitchen-media.md`.
- `/places/<id>/edit`, `/kitchens/<locator>/edit`, and Kitchen Workspace Identity
  compose the same owner-level edit panels. The route framing may differ, but
  field ownership and mutation authority do not: Place media remains Place,
  Kitchen identity/assets, Team, and operations remain Kitchen-owned, while
  App settings remain App-owned.
- Supplier location follows a different owner contract:
  `Supplier.company_id -> Company`, with Company as a same-id role over Place.
  Supplier onboarding requires that complete relationship and validates both
  records inside the trusted creation transaction; an empty `company_id` is
  not a valid Supplier root.
  Supplier readers return the canonical Supplier and resolve its canonical
  Company/Place separately. Current Demo scenarios prove that chain and resolve
  Place imagery at read time; they never add `Supplier.place_id` or copy Place
  presentation onto the Supplier root. Live Supplier consumers must resolve the
  same Company/Place relationship before claiming equivalent location context.
- Product-neutral money and immutable FinancialFact primitives belong to
  `fireux-finance`. Kitchen retains Order and KitchenSale lifecycle ownership;
  a trusted `ready -> completed` transaction creates the same-id Sale and its
  deterministic App-level `gross_sale` fact atomically.
- Deanos Demo team members are Kitchen-shaped scenario records shared by the
  selected Kitchen's Team, Orders, and Finance projections. Operator audit
  stamps and transaction closers use stable team-member IDs; presentation
  resolves names from that same scenario. Demo access uses read-only root-owned
  Team fixtures composed into the target surface; it never creates Live
  membership.
- Creating a new Kitchen root atomically creates the authenticated creator at
  `kitchens/{kitchenId}/team/{uid}` with owner/operator capability. Connecting
  an existing Kitchen requires existing authority and does not manufacture a
  Team record.
- A named Kitchen member may exist without a User. An operator can create a
  named member and can correct that member's displayed name through a narrow
  trusted Server command. Name edits preserve the member document id, slug,
  User link, access, and invitation state; arbitrary client-side member patching
  is not a Workspace capability. An operator can create a
  seven-day, one-use member invitation whose stored record contains only a
  hash of the URL secret. Acceptance is a dedicated authenticated Server
  command: it atomically links the accepting UID to the existing member,
  consumes the invitation, and creates or links the exact Kitchen Team record
  with its reviewed role and permissions. Reissuing an invitation replaces
  older pending links.
- `gross_sale` records the current authoritative total without claiming a VAT
  split, net revenue, or cash settlement. Reporting is derived; P&L remains
  absent until its required producing domains and accounting contract exist.
- The first visible report is the Kitchen-owned `/workspace/kitchen/finance`
  sheet. Its authenticated, bounded server projection reads a
  7, 30, or 90 complete owner-local-day period of immutable Sales for the
  selected Kitchen. The server resolves a valid custom Kitchen timezone or the
  exact linked Place timezone, keeps currencies separate, and exposes
  reconciled period/daily gross sales, completed-Sale count, average Sale,
  item quantities, item sales, delivery fees, stable item rollups, and a
  bounded PII-free transaction summary with inspectable source identity. It
  does not expose actor ids, customers, raw Orders, document paths, or
  FinancialFacts in the browser or invent Live/Test and pre-producer history.
  Demo projects the same report contract from Kitchen-owned completed Orders;
  it never becomes Sale or FinancialFact history. Its
  `KitchenFinanceSummary` and `KitchenFinanceTrend` adapters supply Kitchen
  labels and values to dumb product-neutral Finance presentation used by
  Workspace and Product Demo. Kitchen-owned calendar, selected-day item, and
  roundup components retain daily sales semantics. Deanos derives
  current/prior 7, 30, and 90-day totals, grouped trend points, calendar days,
  best/quietest days, weekday averages, top items, daily averages, and
  transaction rows from one deterministic 180-day dated Service/Order history.
  Stable Menu, Team, service, item, pricing, and closer identities reconcile
  before composition; it does not add expense or accounting truth.
- Supplier catalogue offers are not deliveries, purchases, receipts, or
  invoices. Team membership is not rota/payroll. Property/Portfolio values are
  not dated rent events, and FireUX Project identity is not a finance
  lifecycle. Refunds, supplier invoice states, staff pay, recurring rent,
  expenses, wages, VAT, labour, cashflow, profit, and P&L stay absent until
  their owning domains expose authoritative dated producers.
- Misebox Jobs use the same Agent-owned, Company/Place-linked root and trusted
  author/read APIs as Werkbox. Hospitality is only a configured category and
  presentation delta; Kitchen is never Job identity and Job creation never
  materializes a Kitchen.
- Misebox tenant Apps may compose that shared Jobs family with a hospitality
  allowlist. Their public catalogue remains exact-source scoped, while the main
  Misebox catalogue can aggregate those Jobs and return applicants through the
  source tenant's canonical active App identity and stored HTTPS website.
  Interlaken Essen is the first such local doorway: its `/jobs` route,
  Companies, Places, Agents, and Professionals are shared capabilities, not
  tenant-owned entity forks.
- Misebox Blogs use the shared `fireux-blogs` root and bounded public
  projection. Every Misebox App `/blog` aggregates every public BlogPost whose
  source ecosystem is Misebox; source App is provenance, not Blog visibility.
  Tenant Futter feeds remain lightweight local/domain events and may reference
  a canonical BlogPost slug without copying its authored content. When a
  canonical post carries approved Blog-owned Sproochli fields, the shared
  projection resolves the tenant's configured language and Futter consumes
  that same localized DTO.
- Misebox may compose Kitchen materialization for a Professional Experience
  Place reference. That adapter is profile-specific, delegates creation to
  `fireux-kitchens`, and must not enter the Job model, authoring flow, or
  Directory view.
- `defineFireuxConfig` loads `fireux-misebox` automatically from
  `ecosystem: 'misebox'`. Misebox apps declare extension modules as explicit
  capabilities; the ecosystem package is not an umbrella dependency bundle.
- The Misebox Main App explicitly opts into Core's app-wide `sci-fire` design
  pack while retaining its own semantic primary palette. Tenant Misebox Apps
  remain on Nuxt UI unless their own App config deliberately selects a pack;
  ecosystem membership never applies app chrome implicitly.
- The Main App's steam remains project-owned atmosphere, composed through Core
  `EffectsAmbient`. Core owns fixed viewport layering and content isolation;
  Misebox owns the original client-initialized puff treatment and its
  reduced-motion state.
- The ecosystem package must not own tenant-id branches, Kitchen/Menu source
  defaults, or a competing Menu renderer. Menu routes, layout,
  resolution, and ordering projections belong to `fireux-kitchens`.
- `fireux-kitchens` owns the shared Bringli Supplier-directory endpoint used by
  its Supply surfaces. `fireux-places` owns Google provider resolution, browser
  loading, and runtime configuration; Kitchens composes that seam for Delivery
  overlays, and other Place consumers can reuse it without Kitchen coupling.
  Project Apps do not repeat those integration values.
- `projects/misebox/*` apps may compose and configure package-owned behavior;
  they should not recreate shared domain truth locally.
- Misebox product literature follows `docs/concepts/product-language.md`.
  Start with the owning package's fields, states, commands, and child pages;
  derive operation copy from those children, derive Kitchen Workspace copy from
  its operations, and derive the landing from its product sections. Use
  concrete hospitality nouns and actions in the present tense. Do not add a
  second vocabulary of slogans or vague benefits at the project edge.
- Misebox App's public `/demo` family is a project-owned showroom composition.
  It consumes package-owned deterministic Demo Worlds only through the named
  Product Demo adapter, reuses real domain components, and performs no live
  operational or Test reads or writes. A bounded public Ingredient projection
  may resolve the real canonical roots referenced by Demo operation links;
  those roots are not Demo records. Demo records remain owned by their domain
  package; the project owns only route selection, marketing copy, and local
  interaction.
  Demo-owned presentation images use fixed public HTTPS values for immutable
  objects in `misebox-78f9c.appspot.com` under the owner-relative
  `demo/misebox-app/` prefix. Storage is the binary authority: the repository
  retains only a guarded metadata manifest with 72 source descriptors and 78
  object-to-source mappings, and no Demo image mirror. Five Deanos payloads
  have both Kitchen-owned and Place-owned object identities because the model
  fields have different owners. Kitchen/Supplier logos and Place imagery never
  cross owner paths.
  Fixture and Product Demo modules import no Firebase or Storage SDK/API;
  browser image GETs do not turn the data envelope into a remote provider.
  Canonical Ingredient and App media stay outside Demo, and Live media stays
  in its owning Live path. Remote audit and any create-only upload from an
  explicit external source directory use
  `scripts/publish-misebox-demo-media.mjs`, never a Workspace or runtime
  mutation.
- Misebox `/cards` is a searchable project-owned PowerCards candidate gallery.
  Its main collection consumes package-owned `Cell`, `Pill`, and `Preview`
  components with local fixture props. Named specialist presentations may join
  only as explicitly labelled candidates, such as `Kiosk · Item`; they do not
  become members of the generic Card family.
- Shared product-led landing presentation belongs to Core
  `LandingProductIndex`. Core owns the region vocabulary and default order;
  Misebox supplies the guarded ordered subset `surfaces`, `specifics`,
  `operations`, `solutions`, `tools`, then conditional `apps` through
  `regionOrder`. Core places the hero copy on the left and
  an app-owned product-card presentation on the right, owns the responsive/reveal behavior, and
  uses flat semantic surfaces without decorative gradients or flares.
  `LandingProductProofSection` owns the repeated proof-and-copy split and
  `LandingProductCatalogue` owns the Tools, Solutions, and Operations grid;
  Misebox keeps their truthful data, copy, routes, and proof in its project
  adapter. Misebox fills `workspace` with the Kitchen Workspace, `specifics` with
  Menu surfaces and Kitchen Finance, `apps` with its bounded published-App
  projection, and `tools` with an Ordering entry that lists published Menus
  and routes only to their currently enabled guest order paths. It has no
  separate
  Ecosystems section and omits that unavailable slot. Its buyer-facing
  definition is “The Control Centre For Kitchen
  Operations”; the Kitchen Workspace is the concrete workspace that runs menus,
  preparation, service, supply, and finance. The Main App hero uses the shared
  typed hero text once and fills its named preview slot with one static
  Misebox-owned product image: a Deanos ordering kiosk, the Kitchen Workspace
  Mise en place surface, and a customer delivery confirmation. The image is
  presentation only and performs no Demo, Live, Test, Firebase, Storage, or
  order mutation. Misebox owns its content while Core continues to own the
  shared hero layout and responsive behaviour.
  Misebox composes Core `LandingProductPricingStrip` immediately after the Hero rather
  than inside its pinned grid. Section One remains the shared two-part Hero:
  product title and actions on the left, project-owned image on the right.
  Its thin adapter presents the shared Free, Pro, Managed, and Your App tiers
  and links to the full pricing routes; it replaces secondary
  capability notes rather than duplicating a separate onboarding section. A
  Core `LandingOperationRail` provides the horizontally scrolling rail above
  Section One in both Main Apps. Misebox projects the current Kitchen
  Operations from the existing typed catalogue and links to their canonical
  public routes. Identity and Team remain baked-in Workspace peers and never
  enter that catalogue. The rail omits the generic Operations
  doorway, Workspace group labels, and Supplier capabilities.
  The first Kitchen Workspace proof explicitly uses Core's copy-emphasis variant
  so its selected Operation explanation is wider and more prominent than the
  read-only Workspace preview; later proof sections retain the balanced default.
  Misebox Kitchen and Supplier hero photography consumes Core
  `LandingProductHeroImage`; Misebox owns the reviewed assets, alternative
  text, and focal position but does not duplicate or decorate the shared sharp
  image frame. The Misebox Main App opts into Core's immersive landing composition and
  inherits its pinned hero handoff, scrubbed chapter transitions, responsive
  behavior, and reduced-motion fallback without importing GSAP. Its static
  Kitchen operations image, pricing strip, Kitchen-first region order, and
  proof remain Misebox-owned. Core animates only the named region shell;
  Misebox sections own their internal `data-landing-reveal` participants so
  their product presentation is independently targetable. The existing Core hero
  action system keeps the Get started and Go to workspace buttons, Operations
  doorway, and concise capability notes directly beside that proof rather than
  adding a detached CTA section. The later landing sections retain the
  relevant product doorways. Misebox owns KitchenAI at `/` as its main working
  doorway; there is no separate Workspace Agent route. KitchenAI uses authorized
  Kitchen identity, User context, Kitchen context, Menu
  context, and exact Menu counts. Bounded operation surfaces may delegate to
  an operation agent such as MenuAI. The Kitchen agent HTTP
  handler is transport only. Misebox's Kitchen entity
  coordinator owns authorization and fallback answering. TeamAI is the first
  shared entity capability beside the Kitchen coordinator and owns its bounded
  record projection, planning, confirmation, and tool dispatch; genuinely
  Kitchen-specific operation agents remain under `operations`. Kitchen context
  projection and general
  answer execution remain entity-owned siblings so future operation children
  do not accumulate inside an API route. Server agent support mirrors the
  entity hierarchy at `runtime/<entity>/server/agent`, with only
  entity-specific operation children below `operations`; the current
  `runtime/server/agent/<entity>` path is migration source. Agent support is
  owned behaviour and never belongs under a generic `utils` tree.
  Provider execution
  remains governed by the shared `fireux-ai` disabled, simulator, codex, and
  app modes. Local Codex testing receives the same bounded KitchenAI envelope
  as the provider and identifies its execution lane in the response. Named
  operation-agent scopes are logical bounded delegations inside that envelope,
  not automatic extra model calls: KitchenAI currently consults MenuAI's exact
  Menu manifest and confirmed Menu context for its Kitchen summary. An
  operation agent gains a separate inference only when independent reasoning
  or tool execution justifies the added latency and provider cost. The Workspace
  agent catalogue is composed at
  `fireux-misebox/runtime/ai/workspace-agents`: MiseboxAI is an explicit
  ecosystem node beneath CoreAI and parents only KitchenAI, while
  `fireux-kitchens` owns its exact operation-agent members. Bringli alone hosts
  SupplierAI and the Supplier Workspace; Misebox consumes bounded Supplier truth
  through the Kitchen-owned Suppliers operation and never acquires Supplier
  selection, mutation authority, onboarding, or agent coordination. Each
  Workspace coordinator declares its selected entity kind, id parameter,
  required selection, mutation authority, and owner-labelled context
  providers. Agent catalogue entries start with no tools and use only
  source-defined top-level Operations; speculative child capabilities such as
  Stockholding do not enter the agent spine. KitchenAI and MenuAI may attach
  one short structured capability tip to their existing private Kitchen usage
  record for later operator review; the visible answer excludes that marker.
  Workspace jobs and domain authority must prove each tool separately.
  TeamAI's proved tools are `kitchen.team.create-member`,
  `kitchen.team.read-members`, `kitchen.team.update-member`,
  `kitchen.team.delete-member`, and `kitchen.team.create-invitation`. It may
  propose the Kitchen-owned Create Member command from an explicit named-member
  request, or resolve one exact
  unclaimed member and propose the same invitation command as the manual Team
  action. Both require separate human confirmation. The agent never receives
  Firestore paths, constructs KitchenTeamMember storage records, or chooses
  between ambiguous member matches. The bounded name-update tool previews exact
  member-id/name changes and applies them atomically after confirmation; it
  cannot alter slugs, User links, invitations, or access. TeamAI inference
  receives the authorized current member identities and the generic update
  contract, then proposes the member/name calls; application code does not
  encode title-case or other phrase-specific update intent. Read returns a
  bounded Team projection. Delete requires confirmation, refuses linked
  members, and revokes pending invitations for the deleted named member. Manual
  and TeamAI updates use the same Kitchen-owned member update shape with named
  identity and `changes`; TeamAI's batch envelope only groups those same
  updates into one confirmed atomic command.
  Tool results declare their operator affordance rather than asking inference
  to invent one. Member creation returns navigation to the created object;
  invitation creation returns a copy action for the operator's share link and
  never presents the recipient's claim route as the operator's primary action.
  The Team surface is a stateless command runner, not a conversation. It shows
  one instruction, one structured approval, and one result before reset.
  Manual dossier onboarding is a named workflow rather than an atomic TeamAI
  tool: an authorized operator uploads one PDF or image, FireUX AI prepares a
  bounded Team-member draft, the transient source is deleted, and the operator
  reviews the draft before the existing Kitchen-owned Create Member command is
  called. Neither the source dossier nor the unconfirmed AI draft is persisted.
  Unmatched Team input terminates in TeamAI with available command examples and
  never falls through to KitchenAI or MenuAI summary generation.
  KitchenAI performs that operation-agent and tool selection on the main
  Kitchen conversation surface; a Team page may identify its operation for
  presentation, but client route context is never required to make TeamAI or
  its permitted tools available to the coordinator. A successful create tool
  returns a structured `createdObject` descriptor for the shared AI result
  pill; Add Member targets the stable member card on the Kitchen Team route
  through the member's persisted, Kitchen-scoped unique slug. The guarded
  create transaction owns slug allocation and adds a numeric suffix for a
  collision. The Firestore member id remains storage identity until a member
  detail page is a proved product surface.
  The Workspace
  proof is mobile-first: the read-only
  component comes first and projects the canonical Kitchen Operations
  catalogue without live counts or customer data. Core
  `LandingWorkspacePreviewFrame` owns the shared target rail, navigation,
  selected heading, responsive shell, and full-Workspace doorway. Misebox's thin
  root owns the single Product Demo load and local operation/page selection;
  named operation children receive typed read-only projections. The canonical
  catalogue groups Food & Drink, Operations, Kitchen Setup, and Reports.
  Existing operation children own truthful projected bodies; newly identified
  capability doorways use one named empty canvas until deeper demand work proves
  their tools. Dishes separates
  Collection, Overview, and five named Finance/Spec/Prep/Recipes/Mise child
  pages beneath one persistent image-backed Dish context. Ingredients presents
  the Deanos Kitchen usage-link set through the adapter's canonical root
  projection; its names and images remain shared Ingredient truth. The real
  Workspace and landing child consume the same ordered food-group resolver, while
  the landing child keeps those groups compact and collapsible. Mise projects
  the Deanos `KitchenMiseTask` records through the Kitchen-owned summary
  projector, collection presentation, and task board shared by the real
  Workspace and landing child. The landing disables task navigation and supplies
  its own outer scroll boundary, but it does not own a compact Mise variant.
  That shared board is chef-process first: `workflow_stage` orders Wash &
  clean, Cut & portion, Make, Cook & chill, Set stations, and Final checks;
  status, priority, station, and checklist progress remain orthogonal task
  metadata, while unclassified legacy records remain visible under Unsorted.
  Live task storage is the dedicated Kitchen-owned
  `kitchens/{kitchenId}/mise-tasks/{taskId}` collection. The older
  `mise` collections contain legacy Prep Item documents and must not be read,
  normalized, secured, or migrated as Mise tasks. Canonical Prep Items are
  Kitchen-scoped Entities at
  `kitchens/{kitchenId}/prep-items/{prepItemId}` and own inputs,
  yield, method, and presentation. A task links them explicitly through
  `prep_item_ids`; it never treats those ids as task dependencies. The
  protected legacy migration is complete. Do not restore `mise` documents or
  move Prep Items through browser code; use the read-only Prep Item audit to
  detect regression and retain the migration script as operational evidence.
  The Product Demo names that operation projection `workspace.miseTasks`;
  Dish-level `mise` remains the derived production-requirement graph. The
  operation-level preview does not substitute those requirements for tasks.
  Deanos Demo Menu publication remains separate from local operational
  availability. The package-owned summer default keeps Main in service, Party
  order-led, and Xmas off. One Kitchen-owned production projection carries
  those Menu relationships through Dishes, Prep items, Recipes, Ingredients,
  and Mise; shared dependencies stay active when any enabled Menu needs them.
  Workspace Demo and the landing Workspace preview share route-stable local Menu
  service state and filter inactive Mise tasks. Availability badges, switches,
  and inactive-card dimming belong only to the real Workspace; the landing Menu,
  Dish, Recipe, and Ingredient cards remain visually neutral. This state is
  Demo interaction only: it does not mutate fixtures, reuse publication
  status, or write Firestore.
  The landing Dishes entry is a food-dish showcase: it omits Drink records and
  suppresses Food/Drink type labels. The full Workspace retains the complete
  Kitchen catalogue and its operational vocabulary.
  The preview header keeps one `Open full Workspace` doorway visible across
  every operation. It selects Deanos as the read-only Demo Kitchen before
  entering `/`; the landing preview does not acquire Workspace
  target authority. The Kitchen index continues to present the bounded Live
  and Demo target choosers together, so this doorway never hides the user's
  real Kitchens.
  Orders projects the Deanos `KitchenOrder` records as
  `workspace.orders`, derives Incoming/Queue/Pass from the canonical Order
  lifecycle, and reuses the shared Order rail and ticket components without
  mutation controls.
  Stations projects the same ordered `KitchenStation` records used by Workspace
  Demo. Suppliers resolves Kitchen-owned usage links through a Kitchen-owned
  pure adapter into Supplier-owned identity and coverage. It receives the
  Supplier-owned logo and the linked Company/Place image from the shared
  Supplier Demo projector; no Supplier or Place truth is copied into the
  Kitchen fixture or rebuilt by the project. Tables remains a Front-of-House
  boundary and is not projected as a Kitchen capability. The Reports group
  exposes bounded Sales evidence plus truthful Cost, Waste, and Performance
  doorways; the Sales preview receives the Deanos
  completed-Order projection through the same Kitchen-owned reconciled
  transaction/period projector as Workspace Demo.
  The root
  retains local Dish page
  state while the Dishes coordinator owns its clickable breadcrumb and
  persistent image-backed, icon-only page selector. The muted Dish image stays
  in place while child pages change, the circled information icon represents
  the selected Dish overview, and every icon retains an accessible name and
  hover title. Detail tiles emit navigation and never expand a second canvas
  in place. No child
  loads Demo data, reads or writes a selected Kitchen, or acquires live
  Workspace/Firebase authority. The Dish Finance child receives the additive
  presentation DTO from the Kitchen-owned Demo Dishes operation adapter, which
  composes the shared Dish estimate, completed-Order-derived quantities, and
  derived total sales once for both Workspace Demo and Product Demo. Neither the
  project adapter nor the child recalculates Supplier costs, Menu
  profitability, Dish relationships, or sales totals, creates a second sales
  fixture, or reads Live Orders or KitchenSales.
  The Workspace or
  preview source selection carries Demo/Live context; Finance field labels stay
  source-agnostic. Wider
  screens place that component left of the buyer-facing Workspace text. The
  source family begins at
  `app/components/Misebox/Landing/WorkspacePreview/Index.vue`.
  The composition is mobile-first: phone flow, touch targets, and compact
  product proof are unconditioned defaults, while wider layouts enhance them
  only through `min-width` breakpoints. The executable contract lives in
  `scripts/guards/product-landing.mjs`.
- Misebox follows the shared ecosystem pricing literature. Free provides a
  functional Kitchen Workspace, Pro is CHF 20/month self-managed, Managed is CHF
  50/month with bounded FireUX assistance, and Your App is CHF 600 setup
  followed by Pro or Managed. Core owns these common amounts and service
  meanings; Misebox owns its Kitchen-specific capabilities and limits. Managed
  service does not make FireUX a recruiter, employer, payroll provider, or
  personnel lessor. A Misebox App configures existing product capabilities;
  new development is quoted separately.
- The main landing's Our Apps section consumes Core
  `LandingAppCollection` through the product landing's named App slot and the
  shared `useApps()` collection. It shows only active Apps fetched by the
  current Misebox ecosystem's Server endpoint, links to
  canonical `/apps/:slug` details, and excludes the current global Misebox App
  from its own proof grid. It does not hard-code tenant Apps or read Firestore
  in the browser.
- Misebox `/` is itself the browse-only public Kitchen Workspace; there is no
  separate `/workspace/kitchen` index. The root page directly
  composes the real Core Workspace layout and page shell, while `fireux-kitchens`
  owns the inner `WorkspaceKitchenAI` domain surface. The Auth spine resolves a
  Firebase identity for the visitor and may use an anonymous identity. Kitchen
  selection establishes optional
  evidence scope rather than access to KitchenAI: zero targets leaves a valid
  blank context, one authoritative Live target is selected automatically, and
  multiple targets require an explicit choice from the User's active Kitchen
  Team memberships. Generic signed-in questions may begin in blank context,
  but KitchenAI must not claim live operational evidence until a Live Kitchen
  is selected. Its root orientation context is limited to authentication,
  authoritative available Kitchen names/count, current selection, and
  Live/Demo source. It may explain that the User has no Kitchen, ask them to
  choose among available Kitchens, or name the selected Kitchen; it must not
  infer onboarding progress from those facts. The root Create Kitchen Tool is
  available before authentication and searches the shared Place directory plus
  Google Places and also accepts a name-only Kitchen. Place-backed saving uses
  the trusted Place boundary and the authenticated onboarding contract. A
  name-only save accepts the current anonymous or authenticated Firebase
  identity and creates the generated Kitchen root plus its owner Team record. The
  new Kitchen is selected without sending the browser directly to Firestore.
  The one unscoped development handshake
  routes a WasteAI-directed prompt through KitchenAI, passes one explicitly
  temporary restaurant-Waste context paragraph into WasteAI, and echoes its
  typed response. It invokes no provider or Tool, reads no live evidence,
  produces no suggestions, and writes nothing; it exists only to prove the
  delegation and context pipeline while Waste tools remain unproved. Live reads,
  deductions, proposals, and commands still require an
  authorized selected Live Kitchen. Menu-file selection remains a
  browser-local prototype interaction with no upload or persistence, and
  account creation begins only at the explicit
  `Save my Kitchen` doorway. The previous product-led landing remains intact at
  `/product` as the comparison and explanatory surface. The welcome must never
  imply that a selected file was uploaded or analysed before the corresponding
  trusted boundary exists. The Workspace sidebar exposes one prominent
  singular `Kitchen` control that returns to `/`; Kitchen capability pages
  remain under `/workspace/kitchen/*`. Waste is the first capability page to
  follow the same public composition pattern as the Kitchen root: Tools,
  capability AI, authenticated live Index, then development evidence. It does
  not require authentication or a selected Kitchen to enter; only its live
  Index may mount authenticated data. This allows an operator to begin with a
  public Tool or AI doorway and acquire or select a Kitchen only when the chosen
  job genuinely requires one. Until Waste itself is built, its Tools and Index
  components remain empty. Current catalogue research is projected through
  `wasteAIContext.devContext` and rendered only by the development component;
  it is not production capability content.
- Every top-level Kitchen capability doorway uses the same public-entry
  boundary. Its Tools, specialist AI, View, and literature do not require a
  canonical User account or preselected Kitchen. Live readers wait for Firebase
  identity where required, and every reader and command still enforces Kitchen
  authority. Route access never grants operational-record access. Create,
  edit, detail, report-detail, and command routes retain their narrower access
  and selection requirements. Drinks is the first connected capability proving
  this boundary with live evidence.
- Kitchen capability development follows one evidence-preserving sequence.
  Level-one domain search demand establishes the capability map. Every proven
  capability then receives the same thin Workspace handshake—registered
  specialist AI, invisible-until-real Tools sheet, focused View, and guiding
  literature projected from the Kitchen operation catalogue. Registration
  means KitchenAI can discover and route to the specialist; it does not mean
  the specialist has live evidence or executable tools. The development panel
  derives maturity from the operation-agent definitions, never from a second
  status registry. `handshake` proves only zero-data routing, `connected`
  requires a real runtime path and approved tools where actions exist, and
  `complete` additionally requires authoritative evidence, UI, approvals, and
  verification. Next, `X/search-demand` deepens one
  capability as a greenfield domain, and its observed jobs justify records,
  human tools, AI-assisted tools, compound tools, and approvals. Production
  landing copy may summarise only capabilities already proved by those child
  sources; the research corpus remains distinct from live operational evidence.
  Waste is the first complete capability-level language baseline. Its explicit
  route sequence is `/workspace/kitchen/waste/search-demand` for observed
  evidence, `/analysis` for operator jobs and required record questions, then
  `/tools` for named Tool specifications and the WasteAI/KitchenAI delegation
  contract. The Kitchen-owned source keeps Google Autocomplete observations,
  independent validation literature, interpretation, and proposed responses
  visibly separate. Its four current Tool specifications remain `requested`:
  record a Waste event, review Waste patterns, calculate only supported Waste
  cost, and propose an evidenced reduction action. None is registered as an
  available Tool or product promise until its canonical records, trusted
  reader or command, authority, approval, UI, audit behaviour, and verification
  exist. Later capability passes may follow this three-stage page shape without
  creating a second App-domain search-demand registry.
  Inventory is the second differentiated member and follows the same three
  stages. Its language boundary treats physical counts as observations and
  levels, variance, supported value, and replenishment needs as deductions.
  Inventory may propose replenishment, but Purchasing retains supplier, price,
  order, and approval authority; stock value remains unknown without compatible
  authoritative cost evidence. Its four Tool specifications also remain
  `requested` until their activation gates are satisfied.
  Purchasing is the third differentiated member. It owns the explicit Kitchen
  commitment to buy: requirement, requisition, offer comparison, draft order,
  approval, transmission, and outstanding-order state. Inventory may supply a
  replenishment need and Supplier supplies identity and offer facts; Receiving
  alone records what arrived. PurchasingAI may prepare and compare, but no AI
  or compound Tool may commit the Kitchen without approval of the exact order
  immediately before a truthful transmission attempt.
  Receiving is the fourth differentiated member and the evidence gate between
  a purchase commitment and stock on hand. It preserves ordered, delivered,
  inspected, and accepted quantities separately; records applicable condition,
  temperature, and traceability evidence; and requires an explicit accept,
  reject, or hold decision. Only finalized accepted quantities may cross a
  trusted command boundary into Inventory. Receiving guidance identifies its
  jurisdiction or Kitchen policy source rather than presenting one limit as a
  universal legal rule.
  Mise is the fifth differentiated member and the first research pass with a
  mixed real Tool state. Add, update, status-change, and delete Prep Task Tools
  remain `available` because current trusted commands implement them. Prep-list
  generation, quantity calculation, and Station assignment remain `requested`.
  Mise owns planned preparation and readiness; Recipes define method, Orders
  own live service routing, and forecasts or AI outputs remain reviewable
  proposals rather than silently created work.
  Orders & Service is the sixth differentiated member. It owns the live Kitchen
  execution queue from accepted demand to Kitchen readiness, including
  explainable priority and Station routing. Tables, payment, external delivery,
  and customer handoff remain outside this capability. Canonical Order records
  and lifecycle rules exist, but the four Workspace Tools remain `requested`
  until their readers, commands, registration, authority, and UI are verified
  end to end; research must not infer Tool availability from model presence.
  Stations is the seventh differentiated member. A Station is a stable
  Kitchen-owned production destination, distinct from its display device,
  assigned person, and current work. Stations own routing and readiness
  configuration; Mise and Orders own each live work projection, while Team owns
  membership and competency evidence. Station records and partial UI do not by
  themselves make the four catalogue Tools available; they remain `requested`
  until their end-to-end contracts and registration are verified.
  Suppliers is the eighth differentiated member and is explicitly the
  Kitchen-side relationship capability, not ownership of the Supplier Entity.
  Supplier owns identity and offers; the Kitchen owns its connection and local
  preferences; Purchasing owns commitments; Receiving owns delivery evidence.
  The legacy-named prepare-order and receive-delivery catalogue hypotheses are
  interpreted only as bounded handoffs to those owning capabilities, never as
  Supplier-owned purchase or receipt mutations.
  Food Safety is the ninth differentiated member. HACCP is a deeper method
  within Food Safety rather than another top-level capability. The source must
  distinguish external guidance, the approved versioned Kitchen plan,
  operational checks, corrective actions, and AI deductions. Rules and limits
  always identify their jurisdiction or approved Kitchen source; neither the
  UI nor FoodSafetyAI claims legal compliance, invents readings, or chooses
  product disposition. All five current specifications remain `requested`.
  Menus is the tenth differentiated member. It owns the reviewed composition,
  versioning and publication of a Kitchen offer while Dish and Drink own the
  referenced items. Imports remain source-linked proposals until reviewed;
  publication is an explicit projection; QR is only a doorway. Menu engineering
  uses bounded authoritative sales and cost evidence and leaves missing values
  unknown. All four catalogue specifications remain `requested`.
  Dishes is the eleventh differentiated member. Dish owns the sellable food-item
  specification; Recipe owns production method and yield, Ingredient owns food
  facts and purchasing identity, Menu owns placement and displayed offer, and
  Finance supplies bounded KitchenSale measures. Dish cost, popularity and
  contribution remain derived evidence with explicit sources, scope and
  unknowns. All four catalogue specifications remain `requested`.
  Drinks is the twelfth differentiated member. Drink owns the sellable beverage
  specification, while Inventory owns beverage stock, Recipe owns mixed-drink
  method and yield, Menu owns placement and displayed price, and Finance owns
  bounded sales measures. Drink-facing stock, Recipe and Menu Tools are compound
  handoffs to those authorities, never duplicate storage. All four catalogue
  specifications remain `requested` even though the AI handshake is connected.
  Recipes is the thirteenth differentiated member. Recipe owns its versioned
  Ingredients, quantities, method, expected yield and portion conversion.
  Ingredient owns identity and effective price evidence; Dish and Drink
  reference approved Recipes; Mise consumes scaled projections for work. Scaling
  never overwrites the base Recipe, observed and expected yield stay distinct,
  and missing conversions or prices remain unknown. All four specifications
  remain `requested`.
  Ingredients is the fourteenth differentiated member. Ingredient owns stable
  Kitchen identity, working units and reviewed food facts. Supplier offers,
  prices and receipts remain commercial evidence; Inventory owns quantities and
  replenishment policy; Waste owns loss events; Recipes, Dishes and Drinks own
  their explicit references. Ingredient-facing count, reorder and Waste Tools
  are compound handoffs, not duplicate storage. All four specifications remain
  `requested`.
  Sales is the fifteenth differentiated member and remains bounded by immutable
  completed KitchenSales and the existing authorized gross-Sales projection.
  It owns daily reporting, item rollups, reconciliation and equivalent-period
  comparison. Food-cost and contribution specifications now belong to the
  separate Costs capability. Sales never implies net revenue, refunds, tax,
  tips, payment settlement, costs, profit or accounting. Its two AI-callable
  Tool specifications remain `requested` despite the working Workspace report.
  Costs is the sixteenth differentiated member. It distinguishes theoretical
  direct food cost, actual period usage, variance, contribution and accounting
  rather than presenting them as one measure. The first proposed scope is
  theoretical direct food cost and contribution with explicit source coverage
  and exclusions. Supplier offers remain labelled planning estimates; actual
  period cost, expenses and profit stay unavailable until their operational
  producers exist. Both specifications remain `requested`.
  Waste Report is the seventeenth differentiated member and is a read-only
  projection over Waste-owned events. It defines scope before aggregation,
  keeps incompatible units and currencies separate, reports supported-cost
  coverage, and treats missing records as missing evidence rather than zero.
  It may expose patterns for investigation but never invents causes, avoided
  cost, savings or compliance. Its three report specifications remain
  `requested` and consume Waste-owned evidence rather than duplicating it.
  Performance is the eighteenth and final specialist capability pass. It is a
  read-only comparison layer over timestamped operational events and never a
  source of generic KPIs. Current Orders lack complete transition history,
  Stations lack historical work completion, and readiness lacks time-bound
  results, so authoritative ticket-time, Station and readiness reports remain
  unavailable. Mise completion may later contribute only through a bounded
  projection. All four specifications remain `requested`; none infer labour
  productivity, individual ranking, quality, cause, staffing need or profit.
  Today is the first Workspace-foundation pass and is deliberately not a
  nineteenth specialist capability. It orders and routes time-bound evidence
  from Mise, Receiving, Inventory, Food Safety, Orders, Stations, Menus, Waste,
  Sales and Team. It owns presentation order, time scope, source labels and
  child doorways only; it owns no operational records, mutations, Tools,
  generic task store or TodayAI. KitchenAI may summarise authorized child
  evidence and propose actions through the capability that owns each record.
  Overview is the second Workspace-foundation pass. It is the stable map of the
  selected Kitchen: Kitchen and Place orientation, conventional capability
  groups, doorway questions, source labels and routes. It differs from Today,
  which is time-bound coordination. Overview owns no child records, mutations,
  Tools, OverviewAI, generic operational state or unsupported Kitchen health
  score. It may compose only proven, source-labelled child evidence.
  Identity is the third Workspace-foundation pass and composes two explicit
  authorities. Kitchen owns id, name, slug, lifecycle status, visibility and
  the `place_id` link; Place owns real-world venue name, address, coordinates,
  contact, opening hours and Place media. Joined public presentation and debug
  must keep Kitchen, Place and derived fields visibly separate. Relinking Place
  is a consequential compound action. The current Identity progression's
  Workspace-theme stage is known scope drift: Workspace does not own a theme,
  and the research contract does not legitimize it. Existing forms are not
  automatically AI-callable Tools; all three specifications remain requested.
  Team is the fourth and final Workspace-foundation pass. It is a genuine
  Kitchen-owned capability for named members, Kitchen roles, Station
  responsibility, reviewed competence/training evidence, invitations and
  operational handover. Canonical User identity, AppUser access, payroll,
  scheduling and generic HR remain separate. Five membership Tools are already
  registered and AI-callable: read, add, update name, create invitation and
  delete an unlinked member. Station competence, training evidence and handover
  remain requested. Current `KitchenTeamMember.hourly_rate`, `currency` and
  `shift_label` fields are known scope drift requiring a separate coordinated
  model-consumer-data migration; research does not legitimize them.
  Every registered Kitchen capability AI now receives a status-bearing Tool
  catalogue projected from that capability's completed search-demand model.
  `requested` and `building` entries are planning language only; `available`
  entries exist for human use; only `agent-ready` entries may also appear in
  executable `toolIds`. KitchenAI discovers these catalogues through its child
  agent registrations and does not maintain another Tool list. The old
  Waste-only handshake exception and unsupported Finance labour-cost and Drink
  image Tool claims are removed. Today and Overview remain coordinators with no
  child Tool catalogue of their own.
  Every item in the Kitchen Workspace development list has an explicit static
  `/workspace/kitchen/X/search-demand` doorway. The shared presentation reads
  its starting seeds and maturity from the Kitchen-owned catalogues, while each
  route remains independently addressable and may later gain its own evidence.
  Waste is the first differentiated member. Today and Overview also have
  research doorways, but are explicitly treated as aggregation-boundary tests,
  not silently promoted into specialist agents or operational data owners.
- `jobs.misebox.app` is a focused product doorway over the existing
  `misebox-app` authority, not a second canonical App. It may give public Job,
  Professional, and Agent routes a Jobs-only project layout while retaining
  the same Firebase Auth, database, App membership, App Agent support, and
  `source_app_id` author boundary. Creating an independent Jobs App requires a
  separately verified membership, Rules, and existing-Job migration.
- Bringli is the canonical Supplier product and supply-network host. Misebox
  loads `fireux-suppliers` in consumer mode only: it receives shared Supplier
  presentation and canonical read contracts, but no Supplier routes,
  Supplier Workspace, onboarding, sitemap, or direct Supplier storage authority.
  Kitchen `Suppliers` remains the seamless Kitchen-side sourcing and procurement
  Operation; it owns Kitchen selections, preferences, delivery receipt and cost
  context while resolving Supplier identity, Catalogue and Items from Bringli.
  The retired `suppliers.misebox.app` doorway redirects permanently to Bringli
  during DNS and bookmark migration and must not regain a local landing.
  New Suppliers enter through Bringli's trusted Supplier Workspace onboarding
  transaction; the normalized organization slug is both canonical document id
  and public route identity. Detached browser-created Supplier roots are not a
  supported acquisition path. Bringli Supplier owns identity, Items, Ingredients, and
  Catalogues. A marketplace may publish a Supplier through an App-local
  listing and own customer baskets and Orders, but it must not recreate Store
  identity or Offer product authority. See `docs/concepts/suppliers.md`.
- Misebox owns its complete main Firestore Rules manifest at
  `packages/ecosystem/fireux-misebox/src/config/firebase/firestore.template.rules`
  and its named policy fragments in the adjacent `rules/` directory. Core
  composition expands those ecosystem-owned concerns before inserting and
  validating shared security fragments.
  Shared byte-identical policy primitives come from FireUX Core; the tracked
  `scripts/firebase/misebox/firestore.rules` file is the verified complete
  release artifact, not a second policy source.
- Tenant branding, content, routes, and genuine app-specific presentation may
  remain in the relevant project app.
- Interlaken Essen's durable visual canon is the project-owned
  `projects/misebox/interlaken-essen/docs/artistic-direction.md`. Its
  **Alpine–Mœbius** direction governs that tenant's UI, editorial artwork,
  social assets, maps, and icons; shared Misebox packages must not generalize
  that project-specific presentation into the ecosystem spine.
- Interlaken Essen is the first reviewed Sproochli copy consumer. Its
  Berner-Oberland `gsw` profile, Swiss Standard German `de-CH` profile,
  glossaries, and approved phrase pack remain project-owned; Sproochli owns
  per-language workflow semantics and trusted drafting. Public brand copy
  never depends on live runtime generation.
- Interlaken Essen also owns its site-shell language policy. The fixed order is
  `gsw`, `de`, `en`, with `gsw` as the default; French and Italian remain
  deferred. The shared Sproochli trigger renders only approved site-copy
  languages and the project persists the visitor's valid choice across its
  own routes. German is available on the project-owned marketplace route
  family; inherited package routes fall back to their currently approved
  language rather than presenting mixed copy. Interlaken's resolver uses the
  reviewed entry's English source and exact approved target variant; it does
  not generate public copy during a visit.
- Interlaken-owned marketplace routes, onboarding, account UI, SEO,
  accessibility copy, picker chrome, and language-bearing feed artwork resolve
  through that same pack. The app root owns the reactive document locale for
  every route. Canonical Blog story fields use the Blog-owned approved
  Sproochli projection when that story language is approved; Futter stores
  only Blog slug references and does not show a story in an unavailable
  selected language. Inherited Core Auth/default-shell/legal copy and generic
  Blog chrome remain with their owning packages; do not duplicate those routes
  or strings locally. Future vendor or customer messages use versioned
  approved `de-CH` templates and an explicit recipient preference on their
  eventual canonical contact authority, never the browser cookie or live AI
  generation.
- Kitchen Sproochli participation is configured at the fixed trusted child
  `kitchens/{kitchenId}/integrations/sproochli` through the Kitchen Workspace
  endpoint. The trusted reader temporarily falls back to the retained root
  `integrations.sproochli` preimage; ordinary clients cannot read or write the
  child, and the command never writes the Kitchen root. Shared Menu projections
  and the bounded Kitchen detail show its Default/language trigger;
  a language selected on the Kitchen route follows the visitor into its
  published Menu doorways. Structured Menus
  use the query selection as their sole input and the Menu server returns one
  final `default`, `translated`, or `unavailable` projection. Default never
  translates or contacts the provider. Misebox SSR reads readiness, complete
  caches, and translation memory from `misebox-78f9c/sproochli`; only a missing
  field calls the FireUX-hosted Sproochli generator, and Misebox persists the
  complete result locally. The provider never receives database authority and
  has no Firestore access in Misebox. Production provider calls use
  fixed-audience Google OIDC from an exact allowlisted Misebox SSR service
  account; the browser cannot invoke the billable translation operation. The
  Misebox server's `SPROOCHLI_MENU_PROVIDER_ENDPOINT` and
  `SPROOCHLI_MENU_PROVIDER_OIDC_AUDIENCE` must be the same exact HTTPS URL.
  Sproochli's matching audience and `SPROOCHLI_MENU_PROVIDER_SOURCE_SCOPES`
  grant must name the source-controlled dedicated function identity
  `misebox-ssr@misebox-78f9c.iam.gserviceaccount.com`, `misebox-78f9c`,
  database `sproochli`, and the permitted Misebox App ids. The Firebase Nitro
  function option binds that identity during every guarded deployment; no key,
  impersonation seam, default compute account, or Firebase CLI alias
  participates in runtime resolution or authorization. The two Apps'
  source-controlled `firebase.runtime-env.json` manifests carry only the
  non-secret exact endpoint, audience, and source allowlist into their
  generated function environments; credentials never enter those manifests.
  `misebox-78f9c/sproochli` is the shared storage authority for Misebox Apps,
  while each stored host App id remains provenance. The nullable readiness list groups the
  picker into Cached and On demand; it never treats an unreachable database as
  zero cached languages. Partial output falls back to the canonical Menu with
  an unavailable state. The named database is server-only and client Rules
  deny every read and write. Saved provider output remains explicitly
  unreviewed and does not become published copy. Luna Piccante is the first
  Menu attachment and host-storage proof.
- Ingredient is one shared culinary world rooted at `/ingredients/{id}` and
  currently owned by `fireux-kitchens`. `Ingredient.name` is simply the
  popular canonical name used across Kitchen and Supplier Workspaces, including
  names such as Cecina and Porcini; Ingredient stores no source-language or
  translated-name map. Synonym-only aliases, taxonomy, parent relationships,
  and lifecycle belong to the root. Active canonical names and aliases cannot
  collide. Every active root carries its canonical presentation image; blank
  images are not valid active Ingredient state. Kitchen and Supplier operations
  store stable `ingredient_id` links and resolve bounded `/api/ingredients`
  projections. Only a global Misebox App
  admin may curate the all-status library through trusted server commands, and
  roots retire or merge instead of hard-delete. Ingredient has no language or
  Sproochli fields today. A future localization projection may attach by stable
  Ingredient ID without changing Ingredient identity or this root schema.
  Ingredient identity is never fixture or Demo data: Kitchen and Supplier Demo
  worlds may contain usage, offer, and production links, but they must not copy
  root names, taxonomy, lifecycle, parents, or images.
- Interlaken Essen onboarding keeps AppUser limited to App governance,
  capability, and lifecycle. Locality and offer presentation belong to the
  User-owned
  `users/{uid}/profiles/marketplace/app-state/interlaken-essen` record; the
  trusted project endpoint owns strict validation and writes that profile with
  the AppUser `onboarding_status` transition in one transaction. The live
  contract is in the project's `app/content/marketplace-profile.ts` and
  `server/api/onboarding/profile.post.ts`.
- Interlaken Essen's `/mis` route is a project-owned personal marketplace home,
  not a Core Dashboard or Workspace. It reuses Core authentication, avatar, User,
  and AppUser state. Its buyer surface may store sparse private settings such
  as `delivery_address` on the existing User-owned marketplace App state through
  the fixed-runtime authenticated `/api/marketplace/account` projection.
  Marketplace Store is a root Workspace Entity at
  `marketplace-stores/{storeId}` with root-owned Team, Offers, and Orders. The
  App-nested prototype is migration input only and receives no compatibility
  adapter. Do not copy Supplier identity, media, catalogue, or Item truth into
  Store. Seller visibility and writes derive from bounded Store Team authority, not
  the obsolete prototype profile `offers_enabled` presentation flag. App Admin creates
  Stores and assigns existing App members; an unassigned draft cannot enter
  review. Store/Offer directory reads and every protected mutation use the package's
  bounded trusted endpoints; raw browser Firestore access is closed.
  Marketplace Orders must not reuse
  KitchenOrder outside Menu fulfilment or create payment/FinancialFact truth.
  See `docs/concepts/marketplace.md` and `docs/concepts/suppliers.md`.

Current code, executable guards, and tests are implementation truth. Concept
maps provide navigation and working context. Deleted docs, previous chat
context, cached repository snapshots, and remembered implementations are not
authority. If current files cannot be read, say the Misebox context could not
be refreshed.

## Privacy-first measurement

- Misebox Apps show no cookie-consent popup because they install no analytics
  or advertising tracking storage. They may use strictly necessary
  authentication/security state, language selection, and anonymous-order
  recovery only for those named features.
- Interlaken Essen is the first intended proof of the shared Core aggregate
  measurement family. It must not add local trackers or an app-specific event
  store. No measurement is active until the shared server aggregation and
  private App-admin projection described in
  `docs/concepts/privacy-measurement.md` exist.

## Living context

Treat this file as the living entrypoint for the dedicated Misebox chat.

- Re-check it whenever Misebox package ownership, app boundaries, domain
  families, or required concept maps change.
- Update this file in the same repository change when a stable Misebox change
  makes its scope, boundaries, or refresh instructions incomplete or wrong.
- Update `docs/ai/gpt-context.md` instead when the change applies to all FireUX
  chats; update both only when both layers genuinely change.
- Keep temporary task status, chat summaries, migration progress, and product
  ideas out of this file. It should contain durable routing and authority.
- If an update is needed but the current task cannot edit the repository, state
  exactly what has become stale and which current source proves it.

When discussing canon, spine, alignment, family, or drift, state what must
match, what may differ, the nearest working sibling, and the affected files.
