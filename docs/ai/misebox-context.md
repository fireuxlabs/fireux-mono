# Misebox GPT Context

<!-- Concurrent edit — 2026-07-23 02:43 CEST — Record the Core-owned product landing and Misebox-owned proof boundary. -->
<!-- Concurrent edit — 2026-07-23 — Record the shared preview-frame chrome and project-owned proof body. -->
<!-- Concurrent edit — 2026-07-25 — Keep Main App hero copy in Core while Misebox proves it with the real Orders board. -->

Updated: 2026-07-25
Ref: e98ffb195
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
  unpublished/test preview rows never become public detail links, and legacy
  root-only, missing-support, cross-ecosystem, or malformed rows fail closed.
  Kitchen detail exact-loads the same server-owned public projection and
  allowlist by slug during SSR; it does not read the Kitchen root or AppKitchen
  support record directly from the browser.
- Reusable Kitchen onboarding belongs to `fireux-kitchens`. It composes the
  Place package's canonical onboarding, then atomically creates or connects the
  sparse Kitchen root, Misebox App access, and UserApp console target. Misebox
  apps configure whether creation is available and tenant Apps remain bounded
  to their configured Kitchen targets. A current App admin creates or attaches
  the root; apps do not recreate the funnel or copy Place defaults into Kitchen.
  Place onboarding may establish sparse primary/secondary brand colours. New
  Kitchens inherit them and persist only differing colours on the canonical
  Kitchen root; Misebox app chrome and AppKitchen access records own neither.
  The Kitchen theme editor mutates that root through a target-bound trusted
  transaction and removes legacy AppKitchen style input after a successful save.
  AppKitchen access records require bounded `operator_ids`, `team_ids`, and
  `join_requests` arrays. The authenticated Kitchen target endpoint validates
  that exact support shape and remains the sole live Console target outcome.
  Trusted onboarding may repair absent authority arrays for an App admin while
  malformed stored values remain errors; ordinary target reads never repair.
  `operator_ids` grants Kitchen mutation authority; `team_ids` grants Kitchen
  target/read membership only and must never authorize a write. Current App
  admins remain the explicit administrative override. Supplier and any other
  root/App-support console packages composed into Misebox keep their own domain
  payloads but follow the same authority and atomic onboarding spine.
- Product-neutral money and immutable FinancialFact primitives belong to
  `fireux-finance`. Kitchen retains Order and KitchenSale lifecycle ownership;
  a trusted `ready -> completed` transaction creates the same-id Sale and its
  deterministic App-level `gross_sale` fact atomically.
- `gross_sale` records the current authoritative total without claiming a VAT
  split, net revenue, or cash settlement. Reporting and P&L are derived views,
  not Misebox Console Operations or separately editable truth.
- The first visible report is the Kitchen-owned `/console/kitchen/finance`
  sheet. Its authenticated, aggregate-only server projection reads a bounded
  period of immutable Sales for the selected Kitchen, keeps currencies
  separate, and exposes gross sales, completed-Sale count, and average Sale.
  It does not read raw FinancialFacts in the browser or invent Demo/Test and
  pre-producer history.
- Supplier catalogue costs, parked purchase orders, Property/Portfolio values,
  and FireUX Project identity are not Finance producers until their own dated
  operational lifecycles exist.
- Misebox Jobs use the same Agent-owned, Company/Place-linked root and trusted
  author/public APIs as Werkbox. Hospitality is only a configured category and
  presentation delta; Kitchen is never Job identity and Job creation never
  materializes a Kitchen.
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
- The ecosystem package must not own tenant-id branches, Kitchen/Menu source
  defaults, or a competing public Menu renderer. Public Menu routes, layout,
  resolution, and ordering projections belong to `fireux-kitchens`.
- `projects/misebox/*` apps may compose and configure package-owned behavior;
  they should not recreate shared domain truth locally.
- Misebox App's public `/demo` family is a project-owned showroom composition.
  It consumes package-owned deterministic Demo Worlds only through the named
  Product Demo adapter, reuses real domain components, and performs no live or
  Test reads or writes. Demo records remain owned by their domain package; the
  project owns only route selection, marketing copy, and local interaction.
- Shared product-led landing presentation belongs to Core
  `LandingProductIndex`: page rhythm, hero/action hierarchy, operating loop,
  capability, operation and audience grids, proof-panel placement, closing CTA,
  reveal behavior, and responsive breakpoints. Misebox keeps its product copy,
  routes, Kitchen Operations catalogue, and product proof in its project
  adapter. Its buyer-facing definition is “The Control Centre For Kitchen
  Operations”; the Kitchen Console is the concrete workspace that runs menus,
  preparation, service, supply, and finance. The Main App hero uses the shared
  typed hero text once and fills its
  named proof slot with the real read-only Kitchen Orders board, projected from
  the named Product Demo adapter as a compact three-ticket Pass snapshot
  without an additional project-owned preview frame; it does not add a second
  explanatory hero or expose live state and controls. The existing Core hero
  action system keeps the Get started and Go to console buttons, Operations
  doorway, and concise capability notes directly beside that proof rather than
  adding a detached CTA section. Its `proof-wide` layout breaks the Main hero
  out of the landing container to the full viewport with mobile-first gutters
  and breakpoint-only column enhancement. The later landing sections retain
  the relevant product doorways. Section 2 uses Core's post-hero slot for a
  mobile-first Kitchen Console introduction: the read-only component comes
  first and projects the canonical Kitchen Operations catalogue without live
  counts or customer data. Its navigation switches local, presentation-only
  operation pages while their bodies remain intentionally empty; it never
  invents page content, reads or writes a selected Kitchen, or approximates
  live Console data. Wider screens place that component left of the buyer-facing
  Console text. Core
  `LandingProductPreviewFrame` remains the shared
  narrated-preview frame when identity/status chrome, mode controls, panel
  transition, footer action, and reduced-motion behavior are genuinely needed.
  The composition is mobile-first: phone flow, touch targets, and compact
  product proof are unconditioned defaults, while wider layouts enhance them
  only through `min-width` breakpoints. The executable contract lives in
  `scripts/guards/product-landing.mjs`.
- Misebox sells one Kitchen Console through three independent commercial axes:
  capability (`Free` or `Premium`), service (self-managed or `Managed`), and
  presentation (Misebox-branded or a `Dedicated App`). The project-owned
  `/pricing` projection is the public authority for current CHF amounts and
  inclusions. Managed service adds bounded human setup and support rather than
  hidden software capability; a Dedicated App is a configured Misebox
  deployment, not bespoke software.
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
- Misebox owns its complete main Firestore Rules template and target manifest
  at `packages/ecosystem/fireux-misebox/src/config/firebase/firestore.template.rules`.
  Shared byte-identical policy primitives come from FireUX Core; the tracked
  `scripts/firebase/misebox/firestore.rules` file is the verified complete
  release artifact, not a second policy source.
- Tenant branding, content, routes, and genuine app-specific presentation may
  remain in the relevant project app.
- Interlaken Essen's durable visual canon is the project-owned
  `projects/misebox/interlaken-essen/artistic-direction.md`. Its
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
  show its Default/language trigger without requiring a public Kitchen route;
  AppKitchen remains access-only. Structured Menu choices use Sproochli's
  server-side provider path and source-aware translation memory. The selected
  view remains client-session state; saved provider output stays explicitly
  unreviewed and does not become published copy. Luna Piccante is the first
  Menu attachment proof.
- Interlaken Essen onboarding keeps UserApp limited to App governance,
  capability, and lifecycle. Locality and offer presentation belong to the
  app-private `apps/interlaken-essen/marketplace-profiles/{uid}` record; the
  trusted project endpoint owns strict validation and writes that profile with
  the UserApp `onboarding_status` transition in one transaction. The live
  contract is in the project's `app/content/marketplace-profile.ts` and
  `server/api/onboarding/profile.post.ts`.
- Interlaken Essen's `/mis` route is a project-owned personal marketplace home,
  not a Core Dashboard or Console. It reuses Core authentication, avatar, User,
  and UserApp state. Its buyer surface may store sparse private settings such
  as `delivery_address` on the existing app-private marketplace profile through
  the fixed-runtime authenticated `/api/marketplace/account` projection.
  `fireux-marketplace` owns the canonical App-scoped Store Entity, Store-owned
  Offer Records, and private offline marketplace Order Records. Seller
  visibility and writes derive from bounded Store owner/editor authority, not
  the legacy profile `offers_enabled` presentation flag. App Admin creates
  Stores and assigns existing App members; an unassigned draft cannot enter
  review. Public Store/Offer reads and every private mutation use the package's
  bounded trusted endpoints; raw browser Firestore access is closed.
  Marketplace Orders must not reuse
  KitchenOrder outside Menu fulfilment or create payment/FinancialFact truth.
  See `docs/concepts/marketplace.md`.

Current code, executable guards, and tests are implementation truth. Concept
maps provide navigation and working context. Deleted docs, previous chat
context, cached repository snapshots, and remembered implementations are not
authority. If current files cannot be read, say the Misebox context could not
be refreshed.

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
