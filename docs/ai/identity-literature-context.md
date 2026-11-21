# Identity and product literature context

Updated: 2026-11-20
Ref: 193e5adc3
Role: living context
Scope: cross-system Main App identity, landing, pricing, product literature and public metadata references

## Inheritance

This context inherits `AGENTS.md` and `docs/ai/gpt-context.md`. Product wording
also follows `docs/concepts/product-language.md`. App-specific work continues to
inherit the relevant App or ecosystem context.

## Purpose

Keep the Main App family understandable in normal English while preserving the
real identity and capability boundary of each product. Use this context for
recurring cross-system landing, pricing, public metadata reference, Workspace,
Capability, Tool, Solution, and ecosystem literature work.

## Scope

The primary comparison is the FireUX Main App and the current global ecosystem
Apps. Tenant Apps are evidence for what an ecosystem supports, but they do not
define the parent product or receive ecosystem-owner pricing literature.
Standalone utilities enter the comparison only when current source proves a
shared public-language or pricing seam applies to them.

## Ownership boundaries

- FireUX public `/` leads with its industry SaaS framework offering for industry
  founders and the teams building their software. The three offer paths—Build
  with FireUX, Create your industry SaaS and Create your branded App—are owned by
  `app/content/meta/source.ts`. App-owned `Framework` compositions present the
  offer, shared SaaS foundations, industry libraries and developer resources;
  the `framework` layout owns their public shell. Nuxt and Nuxt UI remain the
  technical and interface foundation. The homepage's Docs links open the public
  `/docs` overview, which links to `/getting-started` and the architecture
  explanation at `/context`. The architecture page uses the framework shell and
  links back to Docs. Showcase reuses the
  public `/apps` reader. The
  template overview describes the existing source starter without promoting
  paused domain previews or a package/download service. Project Workspace remains
  at `/workspace/project`, and only its Workspace host redirects root there.
  The `/projects` directory remains secondary. Misebox's
  [public Home](../../projects/misebox/misebox-app/app/pages/index.vue) is `/`;
  `/home` redirects there, and Kitchen Workspace remains at `/workspace/kitchen`.
  BuenoHost and Granite keep their Workspace-first entrances and public `/home`,
  with `/workspace/property` and `/workspace/portfolio` respectively.
  Where selected, Ecosystem `landing/DirectoryHome.vue` owns repeated
  discovery/Workspace framing. Misebox Main instead composes its
  [App-owned Home](../../projects/misebox/misebox-app/app/components/Landing/Public.vue)
  directly. Apps own audience and wording; domain components own their readers.
  BuenoHost and Granite consume only the existing published Property summary
  projection, never full operational Portfolio records. Product literature stays
  at the existing `/product` or `/about` routes. Tenant customer roots remain
  branded and scoped; Workspace access is a separate entrance, not a role toggle.
  See `docs/concepts/family-workspace-entity.md#public-and-workspace-entry-points`.

- The four inspected Workspace Home pages share compact Core Hero spacing and
  `Workspace/GuestWelcome.vue` for settled guests. The sign-in action keeps the
  current destination and leaves existing guest domain tools available. Selector
  toolbars remain for signed-in accounts, and unavailable AI composers are omitted
  until they have working actions. This does not change creation or access rules.

- `fireux-app` owns shared public landing anatomy and styles, commercial offer
  meanings and routes, `usePricing`, reusable prop-driven pricing presentation,
  legal documents and public Operations, Solutions and Tools pages.
  `fireux-ecosystem` owns Main App discovery and child-App composition. Core
  retains neutral controls and layouts, account consent, membership
  authority, subscription access and capacity checks. Each Main App
  owns one `useXPricing` wrapper for its Workspace name, capabilities, limits,
  contact, and explicit ecosystem-tier eligibility. Pricing literature is not
  App boot configuration and never enters App bundle configuration or public
  runtime config.
- Workspace capability pages render their domain content without repeated upgrade
  or plan-allowance prompts. Commercial plan presentation stays on App pricing
  and Product surfaces. Core membership and capacity checks and the owning domain
  commands remain authoritative.
- `fireux-app` owns the product-literature Main App Hero font family and display weight.
  FireUX's framework homepage is a separate App-owned surface composed with native
  Nuxt UI PageHero and theme defaults. Its `/product` explanation uses the same
  framework layout, shared foundation section and Core's public platform meaning;
  it does not wait for live App or Ecosystem directory reads.
- Product-literature surfaces for Misebox, Werkbox, BuenoHost, Bringli,
  and Granite use the App layer's shared immersive section dwell and landing
  motion. Slap shares the anatomy but is an accepted
  brand-commerce interaction delta and opts out through the same presentation seam.
- Main App product literature uses Hero, pricing, product surfaces, then App-owned deeper
  features. A single surface has no selector; multiple genuine usage surfaces
  may use one. Capabilities inside a Workspace are not separate surfaces.
- `fireux-app` owns the landing region vocabulary and default order. Each Main App may
  provide an ordered subset through the shared `regionOrder` seam so its real
  product layers remain truthful without copying the renderer or inventing
  another landing framework.
- FireUX alone owns the platform Ecosystems section. Its generic directory and
  detail routes read published Ecosystem and App records. Do not import an
  individual child Ecosystem package or use its authored package content as
  FireUX catalogue data. Any FireUX-authored offer about a specific Ecosystem
  remains owned by FireUX. Ecosystem Main Apps show
  an Apps section only when their public collection contains more than one
  active child App after excluding the Main App; the heading is only
  `<App name>'s Apps`.
- Customer-facing Products use the existing `/products` catalogue and supported
  `/products/<slug>` offers. FireUX App supplies its framework framing over
  Products' existing reader and collection. Each App publishes its own offers
  and reads its own Products.
  Audience, outcome and Workspace-use copy belong on the owning offer surface.
  Future Product concepts stay in the roadmap until a real offer is established;
  do not add a parallel literature directory or static catalogue of working
  Products. Catalogue presentation does not execute tools or grant entitlement.
- Each Main App owns its product nouns, Workspace name, capability limits,
  imagery, actions, and working routes.
- Identity and Team are Workspace capabilities where the source-backed family
  map declares them. Domain capabilities use the same hierarchy. A capability
  catalogue may keep Workspace routes and landing discovery aligned; a selected
  literature subset does not create a separate Operation layer. Derive that
  subset from its actual consumers and preserve their release boundaries.
- Static ecosystem hero photography shows people doing the product's current
  work through the App layer's sharp image frame. FireUX's framework presentation and
  Misebox Kitchen's product-surface composition are the explicit non-people
  hero exceptions. Reviewed static hero sources use the 1600 x 1000
  pixel, 8-bit opaque RGB PNG contract; subject, alternative text, and focal
  position remain App-owned.
- FireUX owns standalone App creation and the separate product for creating an
  ecosystem. Other Main Apps may offer a branded App inside their existing
  ecosystem; they do not offer ecosystem creation.
- FireUX's Project Apps capability owns the supported App-record creation and
  preview journey at `/workspace/project/apps`. It does not provision hosting.
  The Ecosystem bundle's `/apps/create` is an explicit unavailable state; the former draft-only
  form and generic pricing Create CTA are retired. A Main App must supply a real
  supported workflow before advertising App creation. Runtime App initialization
  remains an internal shell operation and must not be presented as new-App creation.
- Use Workspace → Capability → Tool → authorized command. A public directory
  or navigation link does not become a Workspace capability merely because it
  appears in a landing rail. Legacy `/operations` routes and transport names
  remain exact source references, not a second Workspace product hierarchy;
  follow `docs/concepts/product-language.md#legacy-terminology-boundary`.
- Tools remain bounded utilities or provider doorways. Solutions remain
  source-backed explanations of supported situations.
- Pricing literature separates access, product capacity, human service,
  branded deployment, new development, and external costs.
- Framework resources lead to the source guide. Industry SaaS work leads to the
  existing Your Ecosystem offer and scoping enquiry; branded App requests use
  their existing App-specific intake and terms. Do not present the App request
  form's price as an industry ecosystem price or imply automatic delivery.

## Authority

Use this order:

1. Current models, routes, catalogues, configuration, and source-owned tests.
2. App/Ecosystem public presentation and commercial sources; Core access and capacity contracts.
3. This scoped router and the relevant App context.
4. Concept maps.

Start with the smallest current source atoms and work upward. A landing
summarises its children; it does not create a second product promise.

## FireUX Patterns

The public homepage leads with an App-owned industry prompt in
`Framework/IgnitionPrompt.vue`. It carries an in-memory idea into `/ignite`,
where the visitor prepares a brief and opens an email enquiry. This is a
separate industry-platform scoping entrance, not the priced branded-App request
form, automatic generation or persisted intake. No industry idea goes in the URL.
The three existing offer paths remain below the hero.

FireUX App owns the public `/capabilities` library explanation. Its
`app/components/Framework/Capabilities.vue` is curated source-backed literature,
not runtime registration, entitlements or a published-package catalogue. Preserve
the distinctions between connected reference behavior, read-only surfaces,
presentation, shared primitives and industry-specific implementations. Blank is
the neutral reference; its catalogue presence does not prove a complete business
journey or cross-industry reuse. Native Nuxt UI remains the presentation owner.

FireUX App owns the explanatory `/patterns` catalogue and its articles under
`projects/fireux/fireux-app/app/pages/patterns`. The product page links to it.
Articles explain source-backed examples, boundaries and implementation limits;
they do not replace repository guidance or make release claims. Attribute
external patterns to the actual author and link the specific source. Use
original prose and diagrams, distinguishing FireUX adaptations from the source.
Review implementation claims when their referenced owners change.

## Public metadata reference

Core's [public metadata reader](../../packages/core/fireux-core/src/runtime/app/server/index/meta.ts)
owns the allowlisted copy, SEO/social, legal and public-image response. Authored
App metadata and page-specific content keep their existing owners; a metadata
reference is an inspection surface, not a complete account of page overrides.

`fireux-app` owns the [shared reading surface](../../packages/extensions/fireux-app/src/runtime/components/Meta/Index.vue)
and named Copy, Search and sharing, and Legal presentation. It acquires the
existing public response once through native Nuxt data, uses Core read outcomes
and error retry, displays copy as escaped plain text and reuses the shared Legal
notice presenter. It owns no publication policy, configuration registry or editor.

The [Misebox](../../projects/misebox/misebox-app/app/pages/meta.vue) and
[FireUX](../../projects/fireux/fireux-app/app/pages/meta.vue) routes opt in
explicitly. Each App owns its shell, route, header, JSON link, navigation and
`noindex,follow` policy. The App bundle adds no automatic `/meta` route. The
[consumer checks](../../packages/extensions/fireux-app/src/test/components/Meta.test.mjs)
cover both adapters; verify actual public API, head, desktop/mobile reading and
links when changing this surface. Page-specific head repairs use the existing
Core SEO owner and retain deliberate audience and indexing differences.

## Current source

- `packages/extensions/fireux-ecosystem/src/runtime/components/landing/DirectoryHome.vue`
- `packages/core/fireux-core/src/runtime/workspace/components/Hero.vue`
- `packages/core/fireux-core/src/runtime/workspace/components/GuestWelcome.vue`
- `packages/core/fireux-core/src/runtime/workspace/components/EntityCollection.vue`

- `packages/extensions/fireux-app/src/runtime/models/landing/product.ts`
- `packages/extensions/fireux-app/src/runtime/components/landing/ProductIndex.vue`
- `packages/extensions/fireux-ecosystem/src/runtime/components/landing/EcosystemHome.vue`
- `packages/extensions/fireux-app/src/runtime/components/landing/ProductSurfaceShowcase.vue`
- `packages/extensions/fireux-app/src/runtime/components/landing/ProductPricingStrip.vue`
- `packages/extensions/fireux-app/src/runtime/app/components/Pricing/Catalogue.vue`
- `packages/extensions/fireux-app/src/runtime/app/components/Pricing/Page.vue`
- `packages/extensions/fireux-app/src/runtime/app/components/Pricing/Tier.vue`
- `packages/extensions/fireux-app/src/runtime/app/composables/pricing/usePricing.ts`
- `packages/extensions/fireux-app/src/runtime/app/utils/pricing/page.ts`
- `packages/extensions/fireux-app/src/runtime/composables/landing/useLandingMotion.ts`
- `packages/extensions/fireux-app/src/runtime/composables/landing/landing-sticky-motion.ts`
- `packages/extensions/fireux-app/src/runtime/nuxt.config.ts`
- `packages/extensions/fireux-app/src/test/public-runtime.test.mjs`
- `packages/extensions/fireux-app/src/test/app/composables/pricing/usePricing.test.mjs`
- `packages/core/fireux-core/src/runtime/app/utils/membership/access.ts`
- `packages/core/fireux-core/src/runtime/app/utils/app-subscription-capacity.ts`
- `projects/*/*-app/app/composables/use*Pricing.ts`
- `projects/fireux/fireux-app/app/content/meta/source.ts`
- `projects/fireux/fireux-app/app/components/Framework/*`
- `projects/*/*-app/app/components/*/Landing`
- `docs/concepts/product-language.md`

## Refresh process

When a Main App adds or removes a Workspace, Capability, Tool, Solution, pricing
tier, branded-App path, or ecosystem role:

1. inspect the owning source and nearest working sibling;
2. update the smallest owned literature atom;
3. review the parent Workspace, pricing, and landing summaries;
4. update the App or Ecosystem layer for shared public presentation; change Core
   only for shared mechanics or authority;
5. update this context only when the durable scope or ownership rule changes.

Do not record campaign drafts, temporary copy options, incomplete audits, or
chat decisions here.

## Verification

- Compare changed literature with its owning source and nearest Main App sibling;
  the former product-landing guard is removed.
- Run focused lint and App type checks for touched consumers.
- Visually verify the changed product-literature regions and their actions at
  phone and desktop widths; include pricing index/tier routes when pricing changes.
- For FireUX's framework frontend, verify the offering's three destinations,
  persistent resource navigation including Capabilities, native light/dark controls, local
  component examples, source guide and separate Workspace destination. Verify
  Showcase read outcomes through its existing owner.
- Run relevant source-owned tests and `git diff --check` before handoff.
- Search for superseded prices and tier names after changing the shared source.

## Living-context maintenance

Keep this file short and source-directed. If a rule applies repository-wide,
update `docs/ai/gpt-context.md` as well. If it applies only to one ecosystem,
update that ecosystem context instead. Remove stale pointers when source moves;
do not copy current catalogues or pricing tables into this file.
