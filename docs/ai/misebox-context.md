# Misebox GPT Context

Updated: 2026-08-04
Ref: d232cc731
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
   console, Firestore, public surfaces, layouts, or app configuration, read the
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
- Kitchen and Supplier packages own their reusable Console Operation catalogues
  under `src/runtime/content/operations.ts`. Misebox composes those catalogues
  into one app-wide `/operations` index grouped by Console.
- Reusable kitchen, menu, ordering, supplier, product, and other domain truth
  belongs in the owning extension package under `packages/extensions/*`.
- The `/kitchens` directory is published-only for guests and ordinary,
  Premium, or Free users. An explicit authenticated private projection may
  show all strict canonical Kitchen/App-support pairs to a current Misebox App
  admin or, in local development, the configured developer. Global Misebox is
  bounded to Apps with the current `ecosystem_id`; tenant runtimes remain
  bounded to their current App. The derived access badge grants no authority,
  Test preview rows never become public detail links, and legacy
  root-only, missing-support, cross-ecosystem, or malformed rows fail closed.
  Hidden is a directory-discovery state, not route access: hidden Live Kitchens
  retain exact public detail links, while Test Kitchens have no public route.
  Local development shows the strict all-Kitchen projection by default;
  deployed Apps require the authenticated admin/developer preview to discover
  hidden rows. That private preview is progressive enhancement: the bounded
  public Kitchen collection renders as soon as it is ready and is never hidden
  or failed by a delayed token refresh or unavailable private projection.
  Kitchen detail exact-loads the same server-owned projection and
  allowlist by slug during SSR; it does not read the Kitchen root or AppKitchen
  support record directly from the browser.
  The same public Kitchen detail remains read-only for ordinary visitors but
  exposes a compact Kitchen-identity editor to an exact current-App admin or
  the configured local developer. That editor mutates only Kitchen-owned name,
  tagline, logo, and card-image overrides through a trusted server endpoint.
  Place-owned facts/media and Menu operations remain in their owning Console
  surfaces; public detail never restores a raw browser Kitchen-root write.
- Reusable Kitchen onboarding belongs to `fireux-kitchens`. It composes the
  Place package's canonical onboarding, then atomically creates or connects the
  sparse Kitchen root and Misebox App-support authority. Misebox
  apps configure whether creation is available and tenant Apps remain bounded
  to persisted AppKitchen support. A current App admin creates or attaches
  the root; apps do not recreate the funnel or copy Place defaults into Kitchen.
  Place onboarding may establish sparse primary/secondary brand colours. New
  Kitchens inherit them and persist only differing colours on the canonical
  Kitchen root; Misebox app chrome and AppKitchen access records own neither.
  A Kitchen logo is owned only by
  `Kitchen.identity.logo_image_url`; Kitchen cards and logo editors do not use
  the linked Place image as a second logo source. Kitchen cards resolve the
  sparse `Kitchen.identity.card_image_url` override first, then the linked
  `Place.cover_image`, with `Place.image_url` only as the final fallback when
  no cover exists. This lets a restaurant inside a hotel provide its own square
  Kitchen crop while ordinary Kitchens reuse their Place cover at read time;
  no Place media is copied into the Kitchen root. Console target selection is
  an identity surface, not a public card: it uses only the Kitchen-owned logo
  and shows the neutral Kitchen fallback when that logo is absent. Demo
  Kitchens obey the same split and cannot reuse their Place photograph as
  their Kitchen logo.
  Place optionally owns the validated six-digit `media_backdrop_color` base
  inherited by Place-backed children. Kitchen persists the sparse
  `identity.media_backdrop_color` override only when its transparent logo,
  either wordmark (including `wordmark_no_logo_image_url`), or transparent
  Kitchen card override needs a different background. The colour never tints
  Place cover, image, or gallery photography. See
  `docs/concepts/place-kitchen-media.md`.
  Media editors accept image files, not arbitrary URL text. The upload writer
  owns the exact Firebase Storage target: Kitchen logo/card overrides live at
  `kitchens/{kitchenId}/identity/{logo|card}/current`, while Place avatar,
  cover, and gallery media live below `places/{placeId}/`. Firestore stores
  only the generated download URL for that exact target, and trusted mutation
  boundaries reject another bucket, external host, or wrong entity path.
  Place name, address, location media, gallery, contact details, currency,
  timezone, and business hours remain Place-owned. Kitchen owns only its
  operational override, logo, Menu, service, fulfilment, and other Kitchen
  configuration. AppKitchen is an access-only record and never supplies
  identity, media, style, fulfilment, or operating configuration.
  Every Live, Demo, or writable Test Kitchen must have a valid linked Place;
  Demo and Test sources provide their corresponding Demo/Test Place rather
  than fabricating Place-like fields on the Kitchen. Demo Kitchen roots also
  name their current parent App and pair with same-id access-only Demo support;
  Demo is read-only, not root-only.
  Supplier location follows a different owner contract:
  `Supplier.company_id -> Company`, with Company as a same-id role over Place.
  The shared Supplier surface projector keeps the Supplier-owned logo separate
  from the bounded Company/Place location projection. Current Demo scenarios
  prove that chain and resolve Place imagery at read time; they never add
  `Supplier.place_id` or copy Place presentation onto the Supplier root.
  Live Supplier consumers must provide the same bounded Company projection
  before claiming equivalent location enrichment.
  The Kitchen theme editor mutates the canonical Kitchen root through a
  target-bound trusted transaction.
  AppKitchen access records require bounded `operator_ids`, `team_ids`, and
  `join_requests` arrays. The authenticated Kitchen target endpoint validates
  that exact support shape and remains the sole live Console target outcome.
  Missing, malformed, or payload-bearing AppKitchen records fail closed;
  pre-release code does not carry legacy repair or fallback paths.
  `operator_ids` grants Kitchen mutation authority; `team_ids` grants Kitchen
  target/read membership only and must never authorize a write. Current App
  admins remain the explicit administrative override. Supplier and any other
  root/App-support console packages composed into Misebox keep their own domain
  payloads but follow the same authority and atomic onboarding spine.
- Product-neutral money and immutable FinancialFact primitives belong to
  `fireux-finance`. Kitchen retains Order and KitchenSale lifecycle ownership;
  a trusted `ready -> completed` transaction creates the same-id Sale and its
  deterministic App-level `gross_sale` fact atomically.
- Deanos Demo team members are Kitchen-shaped scenario records shared by the
  selected Kitchen's Team, Orders, and Finance projections. Operator audit
  stamps and transaction closers use stable team-member IDs; presentation
  resolves names from that same scenario. Demo access ids live on a separate
  read-only `AppKitchen`-shaped support fixture composed into the target
  surface; they do not alter the Kitchen root or create Live membership.
- `gross_sale` records the current authoritative total without claiming a VAT
  split, net revenue, or cash settlement. Reporting is derived; P&L remains
  absent until its required producing domains and accounting contract exist.
- The first visible report is the Kitchen-owned `/console/kitchen/finance`
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
  Console and Product Demo. Kitchen-owned calendar, selected-day item, and
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
  author/public APIs as Werkbox. Hospitality is only a configured category and
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
  `fireux-kitchens`, and must not enter the Job model, authoring flow, or public
  projection.
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
  defaults, or a competing public Menu renderer. Public Menu routes, layout,
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
  derive operation copy from those children, derive Kitchen Console copy from
  its operations, and derive the landing from its product sections. Use
  concrete hospitality nouns and actions in the present tense. Do not add a
  second vocabulary of slogans or vague benefits at the project edge.
- Misebox App's public `/demo` family is a project-owned showroom composition.
  It consumes package-owned deterministic Demo Worlds only through the named
  Product Demo adapter, reuses real domain components, and performs no live
  operational or Test reads or writes. A bounded public Ingredient projection
  may hydrate the real canonical roots referenced by Demo operation links;
  those roots are not Demo records. Demo records remain owned by their domain
  package; the project owns only route selection, marketing copy, and local
  interaction.
  Demo-owned presentation images use fixed public HTTPS values for immutable
  objects in `misebox-78f9c.appspot.com` under the owner-relative
  `demo/misebox-app/` prefix. Storage is the binary authority: the repository
  retains only a guarded metadata manifest with 68 source descriptors and 73
  object-to-source mappings, and no Demo image mirror. Five Deanos payloads
  have both Kitchen-owned and Place-owned object identities because the model
  fields have different owners. Kitchen/Supplier logos and Place imagery never
  cross owner paths.
  Fixture and Product Demo modules import no Firebase or Storage SDK/API;
  browser image GETs do not turn the data envelope into a remote provider.
  Canonical Ingredient and App media stay outside Demo, and Live media stays
  in its owning Live path. Remote audit and any create-only upload from an
  explicit external source directory use
  `scripts/publish-misebox-demo-media.mjs`, never a Console or runtime
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
  adapter. Misebox fills `console` with the Kitchen Console, `specifics` with
  Menu surfaces and Kitchen Finance, `apps` with its bounded published-App
  projection, and `tools` with an Ordering entry that lists published Menus
  and routes only to their currently enabled guest order paths. It has no
  separate
  Ecosystems section and omits that unavailable slot. Its buyer-facing
  definition is “The Control Centre For Kitchen
  Operations”; the Kitchen Console is the concrete workspace that runs menus,
  preparation, service, supply, and finance. The Main App hero uses the shared
  typed hero text once and fills its named preview slot with one static
  Misebox-owned product image: a Deanos ordering kiosk, the Kitchen Console
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
  Section One in both Main Apps. Misebox projects only the current Kitchen
  operations from the existing typed operation catalogue and links to
  their canonical public routes. It omits the generic Operations doorway,
  Console group labels, and Supplier operations.
  The first Kitchen Console proof explicitly uses Core's copy-emphasis variant
  so its selected Operation explanation is wider and more prominent than the
  read-only Console preview; later proof sections retain the balanced default.
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
  action system keeps the Get started and Go to console buttons, Operations
  doorway, and concise capability notes directly beside that proof rather than
  adding a detached CTA section. The later landing sections retain the
  relevant product doorways. The Console proof is mobile-first: the read-only
  component comes first and projects the canonical Kitchen Operations
  catalogue without live counts or customer data. Core
  `LandingConsolePreviewFrame` owns the shared target rail, navigation,
  selected heading, responsive shell, and full-Console doorway. Misebox's thin
  root owns the single Product Demo load and local operation/page selection;
  named operation children receive typed read-only projections. Menus, Dishes,
  Ingredients, Recipes, Mise, Orders, Stations, Suppliers, and Tables own
  truthful projected bodies;
  future unsupported operations use one named empty canvas. Dishes separates
  Collection, Overview, and five named Finance/Spec/Prep/Recipes/Mise child
  pages beneath one persistent image-backed Dish context. Ingredients presents
  the Deanos Kitchen usage-link set through the adapter's canonical root
  projection; its names and images remain shared Ingredient truth. The real
  Console and landing child consume the same ordered food-group resolver, while
  the landing child keeps those groups compact and collapsible. Mise projects
  the Deanos `KitchenMiseTask` records through the Kitchen-owned summary
  projector, collection presentation, and task board shared by the real
  Console and landing child. The landing disables task navigation and supplies
  its own outer scroll boundary, but it does not own a compact Mise variant.
  That shared board is chef-process first: `workflow_stage` orders Wash &
  clean, Cut & portion, Make, Cook & chill, Set stations, and Final checks;
  status, priority, station, and checklist progress remain orthogonal task
  metadata, while unclassified legacy records remain visible under Unsorted.
  The Product Demo names that operation projection `console.miseTasks`;
  Dish-level `mise` remains the derived production-requirement graph. The
  operation-level preview does not substitute those requirements for tasks.
  Deanos Demo Menu publication remains separate from local operational
  availability. The package-owned summer default keeps Main in service, Party
  order-led, and Xmas off. One Kitchen-owned production projection carries
  those Menu relationships through Dishes, Prep items, Recipes, Ingredients,
  and Mise; shared dependencies stay active when any enabled Menu needs them.
  Console Demo and the landing Console preview share route-stable local Menu
  service state and filter inactive Mise tasks. Availability badges, switches,
  and inactive-card dimming belong only to the real Console; the landing Menu,
  Dish, Recipe, and Ingredient cards remain visually neutral. This state is
  Demo interaction only: it does not mutate fixtures, reuse publication
  status, or write Firestore.
  The landing Dishes entry is a food-dish showcase: it omits Drink records and
  suppresses Food/Drink type labels. The full Console retains the complete
  Kitchen catalogue and its operational vocabulary.
  The preview header keeps one `Open full Console` doorway visible across
  every operation. It selects Deanos as the read-only Demo Kitchen before
  entering `/console/kitchen`; the public preview does not acquire Console
  target authority. The Kitchen index continues to present the bounded Live
  and Demo target choosers together, so this doorway never hides the user's
  real Kitchens.
  Orders projects the Deanos `KitchenOrder` records as
  `console.orders`, derives Incoming/Queue/Pass from the canonical Order
  lifecycle, and reuses the shared Order rail and ticket components without
  mutation controls.
  Stations projects the same ordered `KitchenStation` records used by Console
  Demo. Suppliers resolves Kitchen-owned usage links through a Kitchen-owned
  pure adapter into Supplier-owned identity and coverage. It receives the
  Supplier-owned logo and the linked Company/Place image from the shared
  Supplier Demo projector; no Supplier or Place truth is copied into the
  Kitchen fixture or rebuilt by the project. Tables projects
  only the canonical Deanos `Kitchen.tables.count`, so the eight configured
  tables are available and no active Table Tab is invented. The separate
  Reports navigation exposes the Kitchen Finance sheet without adding Finance
  to `kitchenOperations` or `KitchenDemoOperation`; it receives the Deanos
  completed-Order projection through the same Kitchen-owned reconciled
  transaction/period projector as Console Demo.
  The root
  retains local Dish page
  state while the Dishes coordinator owns its clickable breadcrumb and
  persistent image-backed, icon-only page selector. The muted Dish image stays
  in place while child pages change, the circled information icon represents
  the selected Dish overview, and every icon retains an accessible name and
  hover title. Detail tiles emit navigation and never expand a second canvas
  in place. No child
  loads Demo data, reads or writes a selected Kitchen, or acquires live
  Console/Firebase authority. The Dish Finance child receives the additive
  presentation DTO from the Kitchen-owned Demo Dishes operation adapter, which
  composes the shared Dish estimate, completed-Order-derived quantities, and
  derived total sales once for both Console Demo and Product Demo. Neither the
  project adapter nor the child recalculates Supplier costs, Menu
  profitability, Dish relationships, or sales totals, creates a second sales
  fixture, or reads Live Orders or KitchenSales.
  The Console or
  preview source selection carries Demo/Live context; Finance field labels stay
  source-agnostic. Wider
  screens place that component left of the buyer-facing Console text. The
  source family begins at
  `app/components/Misebox/Landing/ConsolePreview/Index.vue`.
  The composition is mobile-first: phone flow, touch targets, and compact
  product proof are unconditioned defaults, while wider layouts enhance them
  only through `min-width` breakpoints. The executable contract lives in
  `scripts/guards/product-landing.mjs`.
- Misebox follows the shared ecosystem pricing literature. Free provides a
  functional Kitchen Console, Pro is CHF 20/month self-managed, Managed is CHF
  50/month with bounded FireUX assistance, and Your App is CHF 600 setup
  followed by Pro or Managed. Core owns these common amounts and service
  meanings; Misebox owns its Kitchen-specific capabilities and limits. Managed
  service does not make FireUX a recruiter, employer, payroll provider, or
  personnel lessor. A Misebox App configures existing product capabilities;
  new development is quoted separately.
- The main landing's Our Apps section consumes Core
  `LandingAppCollection` through the product landing's named App slot and the
  existing `useEcosystemAppCollection` controller. It shows only active Apps
  from the current Misebox ecosystem's bounded public DTO projection, links to
  canonical `/apps/:slug` details, and excludes the current global Misebox App
  from its own proof grid. It does not hard-code tenant Apps or read canonical
  App documents in the browser.
- The main Misebox public entrance leads with the current restaurant job:
  keeping a published menu, dishes, recipes, prep work, and Kitchen order
  handoff connected. It names the restaurant audience and live workflow before
  broader ecosystem or operating-system aspirations, uses Product Demo as the
  primary proof, and labels its fictional data so it cannot read as a customer
  result. Its inherited header promotes Kitchens, Operations, and Product Demo
  through app-level navigation overrides. Jobs and Professional directories
  remain secondary footer doorways rather than competing acquisition promises;
  project presentation must not fork the shared FireUX header or change those
  inherited routes for other apps.
- `jobs.misebox.app` is a focused product doorway over the existing
  `misebox-app` authority, not a second canonical App. It may give public Job,
  Professional, and Agent routes a Jobs-only project layout while retaining
  the same Firebase Auth, database, App membership, App Agent support, and
  `source_app_id` author boundary. Creating an independent Jobs App requires a
  separately verified membership, Rules, and existing-Job migration.
- Bringli is the canonical Supplier product and supply-network host. Misebox
  loads `fireux-suppliers` in consumer mode only: it receives shared Supplier
  presentation and bounded projection contracts, but no Supplier public routes,
  Supplier Console, onboarding, sitemap, or direct Supplier storage authority.
  Kitchen `Suppliers` remains the seamless Kitchen-side sourcing and procurement
  Operation; it owns Kitchen selections, preferences, delivery receipt and cost
  context while resolving Supplier identity, Catalogue and Items from Bringli.
  The retired `suppliers.misebox.app` doorway redirects permanently to Bringli
  during DNS and bookmark migration and must not regain a local landing.
  New Suppliers enter through Bringli's trusted Supplier Console onboarding
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
- Kitchen Sproochli participation is configured only on the canonical root
  Kitchen through the trusted Kitchen Console endpoint. Shared Menu projections
  and the bounded public Kitchen detail show its Default/language trigger;
  a language selected on the Kitchen route follows the visitor into its
  published Menu doorways. AppKitchen remains access-only. Structured Menus
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
  popular canonical name used across Kitchen and Supplier Consoles, including
  names such as Cecina and Porcini; Ingredient stores no source-language or
  translated-name map. Synonym-only aliases, taxonomy, parent relationships,
  and lifecycle belong to the root. Active canonical names and aliases cannot
  collide. Every active root carries its canonical presentation image; blank
  images are not valid active Ingredient state. Kitchen and Supplier operations
  store stable `ingredient_id` links and hydrate bounded `/api/ingredients`
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
  app-private `apps/interlaken-essen/marketplace-profiles/{uid}` record; the
  trusted project endpoint owns strict validation and writes that profile with
  the AppUser `onboarding_status` transition in one transaction. The live
  contract is in the project's `app/content/marketplace-profile.ts` and
  `server/api/onboarding/profile.post.ts`.
- Interlaken Essen's `/mis` route is a project-owned personal marketplace home,
  not a Core Dashboard or Console. It reuses Core authentication, avatar, User,
  and AppUser state. Its buyer surface may store sparse private settings such
  as `delivery_address` on the existing app-private marketplace profile through
  the fixed-runtime authenticated `/api/marketplace/account` projection.
  The current `fireux-marketplace` App-scoped Store and Store-owned Offer
  records are an unshipped prototype being replaced outright by
  Supplier-backed marketplace listings; they are not a compatibility contract.
  Do not extend them with Supplier identity, media, catalogue, or item
  management. Marketplace remains the owner of App-local publication,
  customer baskets, and private offline Order Records. Seller
  visibility and writes derive from bounded Store owner/editor authority, not
  the obsolete prototype profile `offers_enabled` presentation flag. App Admin creates
  Stores and assigns existing App members; an unassigned draft cannot enter
  review. Public Store/Offer reads and every private mutation use the package's
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
