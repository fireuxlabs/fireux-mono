# Apps That Slap context

Updated: 2026-11-13
Ref: 864d6c09b
Role: living context
Scope: Apps That Slap ecosystem identity, admission, routing, and reusable presentation boundary

## Inheritance

This context inherits `AGENTS.md` and `docs/ai/gpt-context.md`. Product wording
also follows `docs/concepts/product-language.md`; shared landing and transition
work follows `docs/ai/identity-literature-context.md` and its current App
presentation sources.

## Purpose

Keep Apps That Slap a first-class ecosystem for independent, experience-led
Apps without making FireUX Core the miscellaneous App owner or taking Apps
away from genuine operational domains.

## Scope and ownership boundaries

The [Slap Main App landing](../../../../../projects/slap/slap-app/app/components/Landing/Index.vue)
uses the shared Ecosystem landing and disables section dwell for its
brand-commerce presentation. Preserve that choice when changing the shared
landing. Slap tenant Apps retain their own scene and motion choices.

- `slap` remains the stable package, project-routing, Firebase, and database
  binding key. The product name is Apps That Slap; do not create a competing
  package or ecosystem identifier merely to expand the name.
- Admit an App when the independent branded or digital experience is primarily
  the product and no genuine operational-domain ecosystem owns it.
- Lack of another owner is insufficient evidence. Establish the App's current
  nouns, operations, routes, and data authority before classification.
- Apps with a genuine operational domain stay there. Kitchen Apps remain
  Misebox, property Apps remain Werkbox or their current property ecosystem,
  and Friiites remains a Misebox tenant App.
- FireUX Core owns only generic infrastructure and primitives. Apps That Slap
  owns its ecosystem identity and configuration.
- Landing scene composition and visual quality remain App-owned. Shared
  landing transitions and GSAP/ScrollTrigger behavior remain coordinated through
  `fireux-app` presentation; this ecosystem package does not add motion
  infrastructure.

## Runtime composition

Slap Main App uses `defineFireuxEcosystem` from `fireux-ecosystem/config`.
Yellow Velo uses `defineFireuxApp` from `fireux-app/config`. Both receive Core,
Blogs, Products and AI through the App bundle and select Slap's conventional runtime
layer. The named Slap package owns its binding and product runtime, not the
shared Main App bundle. Verify both Apps when changing discovery because their
App-owned pages and components differ.

Interlaken Bike Tours (`projects/slap/interlaken-bike-tours`) uses
`defineFireuxApp` and selects its Slap and Business layers. The App bundle
supplies Core, Blogs, Products and AI. Public cycling routes use Core's stock
`default` layout, header, container and footer. Core retains shared account,
management, initialization, SEO and PWA manifest responsibilities. The dedicated
prototype Hosting site uses the App's Firebase SSR function. Landing/detail
metadata consumes Core SEO helpers, with preview indexing policy configured
explicitly. App identity, selected capabilities and the explicit preview indexing policy
live in `nuxt.config.ts`. `app/content/seo.ts` supplies route titles and descriptions;
Core retains canonical, robots, sitemap and social metadata transport. There is
no runtime Ignition planning/assembly dependency.
Tour and destination content (`app/content/tours.ts` and `app/content/destinations.ts`) and external
enquiry drafts remain App-owned. Interlaken Bike Tours consumes
`fireux-bookings` through its App-owned Calendar and tour adapters. Shared booking
contracts and Business Workspace management follow the
[Bookings context](../../../../extensions/fireux-bookings/docs/ai/bookings-context.md);
App tour policy and catalogue facts stay local. Its thin tour route composes
`ToursDetail`, reusing Core SEO and native Nuxt UI page, header, section, grid, feature and
card composition. Landing sections follow the existing FireUX landing and page
composition references. The App does not maintain a separate site-wide CSS
system. `Booking` (`components/Booking/Index.vue`) owns the visitor form and consumes the existing App
booking API; shared domain authority stays in Bookings.

Bike Tours owns its noindex preview release commands in its
[App manifest](../../../../../projects/slap/interlaken-bike-tours/package.json).
They use the shared artifact tooling with the existing Slap development Rules
readback and the App's explicit preview target.

Swiss Alpine Guides (`projects/slap/swiss-alpine-guides`) composes the ordinary
`FireuxApp` root with an App-local branded layout and landing scenes. Its
server-validated enquiry prepares a visitor-sent email draft, without reservation,
Calendar allocation, automatic delivery or customer persistence. See the
[App context](../../../../../projects/slap/swiss-alpine-guides/docs/ai/swiss-alpine-guides-context.md).

## Operator catalogue preview

`SlapOperatorActivities`, registered in `src/module.ts`, owns the shared public
catalogue review UI at `src/runtime/components/Operator/Activities.vue`.
Swiss Alpine Guides and Interlaken Bike Tours each compose it through their
App-owned `Operator/Index.vue` and `/operator` route, mapping their existing
catalogues to `src/runtime/types/operator-activity.ts`. The surface owns only
search, filters and selection. Apps own activity facts, sources, prices and
customer navigation. It has no account, customer reader, persistence command,
availability or booking authority. Business management remains with the existing
Business and Bookings owners; this preview does not replace their Workspace.
Verify both App typechecks and responsive catalogue/detail interactions when
changing this shared contract.

## Minimal responsibility boundary

Slap owns its Firebase ecosystem binding, native package registration and proved
shared presentation. It injects no unused commerce vocabulary or mandatory
activity, booking or operator model. Apps select optional domain capabilities
explicitly and may contain no Entity models at all.

Apps keep identity/configuration in `nuxt.config.ts`, native framework entrypoints,
authored content, branded presentation and genuine App policy/adapters. Build
briefs, delivery checklists and historical evidence are documentation, not runtime
application categories. A new folder name alone neither proves nor disproves
ownership; trace its source, consumers and independent responsibility.

The shared operator catalogue is an opt-in public read-only review surface used
by two Apps, not a management Workspace or canonical tourism domain. Its
projection and filters do not own records, availability or transactions.

## Presentation boundary

App source owns its scene structure and presentation types. Extract a reusable
presentation contract only when maintained App consumers prove the shared shape.
Shared landing transitions remain `fireux-app`-owned; presentation does not change domain or
infrastructure ownership.

Each Slap App's root home route delegates its branded page to that App's
`LandingHome` component. The route owns Nuxt route metadata and page SEO;
`LandingHome` composes App-owned page sections, and each section owns its bounded
presentation and any App-specific reads it needs. This is a common entrypoint
convention, not a shared landing shell: each component may choose whether to use
`UPage` and may compose its scenes and controls differently.
Do not extract a Slap-wide landing renderer from the matching component name.
Current examples: [Yellow Velo](../../../../../projects/slap/yellow-velo/app/components/Landing/Home.vue),
[Interlaken Bike Tours](../../../../../projects/slap/interlaken-bike-tours/app/components/Landing/Home.vue),
and [Swiss Alpine Guides](../../../../../projects/slap/swiss-alpine-guides/app/components/Landing/Home.vue).

`LandingHome` arranges named App sections. A section owns its content and
presentation even when it is small, static and used only once. These components
separate page concerns and do not need to wrap a reusable capability.
Yellow Velo's Hero, Introduction, Featured Products, Shop and Visit are App-owned sections;
Products retains acquisition authority. Layouts own site chrome, while landing
sections own their media geometry and motion.

Yellow Velo and Bike Tours' `Landing/Hero.vue` use the same native `UPageHero`
composition with headline, title, description, typed button links and a static
image with intrinsic dimensions. Alpine's Hero instead coordinates an App-owned
scene through focused Media, Introduction, Closing and Scroll children; see its
App context for motion and style ownership. Similar content responsibilities do
not require a common renderer for static and cinematic presentations.

Style inheritance starts with Core's registered `main.css` and `main.scss` and
native Nuxt UI component themes. Apps select native UI colors in `app.config.ts`.
The separate eight-role `theme.palette` supplies App head/manifest colors; it
does not automatically emit page CSS. Yellow Velo's `landing` and Swiss Alpine
Guides' `alpine` layouts consume their App palettes directly through scoped Vue
CSS bindings for shell colors. App semantic classes own brand-specific geometry,
while shared tokens and native controls retain their lower owners. Scoped classes
do not inherit one another; CSS properties and custom properties follow the DOM
cascade. Inspect that chain before adding a new App styling mechanism.

Yellow Velo keeps its shop presentation and filtering App-owned. Catalogue
and optional price acquisition use Products' `useProductCollection`; detail
lifecycle uses `useProductDetail`. Routes do not independently join price reads
or reproduce Product acquisition state.
Its `LandingTours` section at `/#tours` presents guided tours, social rides and
rental categories documented by the operator's
[profile](https://www.instagram.com/yellow.velo.interlaken/) and
[pinned riding post](https://www.instagram.com/yellow.velo.interlaken/reel/DKrUtMqMOcx/).
It links to the operator for enquiries and owns no booking, availability or
reservation lifecycle. Dates, routes, meeting points and prices require direct
arrangement with the shop. Product UI preserves the reader's pending/error/empty
outcomes and does not turn an absent price into a zero-price offer.

## Authority and current source

Use this order:

1. App source, package manifests, selected App bundle, and source-owned tests.
2. `packages/ecosystem/fireux-slap/src/module.ts` and `src/config/**`.
3. App-owned dev commands and deployment configuration, ecosystem Firebase
   templates, and current brand assets.
4. This context and `docs/concepts/apps-that-slap.md`.

## Refresh process

When an App is proposed for admission or removal, inspect its current product
source, nearest domain sibling, App config and manifest, Firebase/database
binding, public asset family, routes, and deployment configuration. Record a
durable classification only after that evidence is exact. Update this context when the
admission rule, ownership boundary, stable binding, or presentation contract
changes; keep candidate lists and migration plans out of living context.

## Verification expectations

- Run the `fireux-slap` package build or type check after contract changes.
- Inspect affected module/layer registration and run relevant source-owned tests.
- Run `git diff --check` before handoff; the former guard suite is removed.
- If an App changes ecosystem, separately verify its manifest, Nuxt config,
  Firebase/database authority, dependencies, brand assets, and affected routes.
  Check that its deployment command still has an implementation before use;
  Nuxt/Firebase artifact mechanics now live in `tools/firebase-release`;
  App targets, reviewed runtime environment and release policy remain explicit.
  Backend provisioning and Rules deployment remain separate.
  Presentation consumption alone requires none of those ownership changes.

## Living-context maintenance

Keep this file source-directed and free of chat history, temporary task state,
candidate inventories, visual drafts, and speculative migrations. Update the
repo-wide context only when a rule also becomes repo-wide; point to current
source and available tests instead of copying implementation details here.
