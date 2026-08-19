# Search visibility

Updated: 2026-08-19
Ref: 8287d99bb
Role: map, not canon

## Purpose

Map how FireUX Apps become accurately discoverable through conventional search,
local search, and AI/answer engines without creating a second product truth or
exposing private records.

Search visibility is a projection of released public facts. It does not own
product claims, entity authority, publication decisions, or tenant identity.

Every Console Entity has an explicit search policy. Protected Console routes
inherit Core's response-header `noindex, nofollow` rule and never require a
nominal Entity SEO composable. An Entity adds `useXSeo` only when it owns a
real public route and bounded publication policy; that composable lives in the
Entity's `composables` role, not inside its Firestore adapter.

## Links

- Parent: `spine.md`
- Route families: `pages.md`, `family-entity-directory.md`,
  `family-entity-detail.md`, `family-tenant-global.md`, `family-menu.md`
- Factual language: `product-language.md`
- Locale and reviewed copy: `translation.md`
- Privacy: `privacy-measurement.md`, `server-api.md`
- App identity and origin: `app-config.md`, `brand-assets.md`

## Authority and ownership

Use current source, guards, and tests above this map.

- FireUX Core owns reusable metadata, canonical-origin normalization,
  robots/index primitives, sitemap transport, route discovery, and shared
  verification.
- An extension owns its public eligibility, bounded DTO, route identity,
  entity-specific metadata, structured data, and sitemap contribution.
- An ecosystem owns shared organization identity and genuine cross-App
  relationships.
- An App owns its canonical hostname, public route composition, and the
  shortest factual summary of its proven products.
- A tenant owns local business facts, service area, contact doorways, locale
  policy, and its bounded target configuration.
- Models, operation catalogues, and reviewed literature own the facts. SEO code
  projects those facts; it does not rewrite or improve them independently.

Never read a broader root, copy protected fields, or weaken publication rules
to enrich metadata, structured data, or a sitemap.

## Shared search spine

Every visible route belongs to one explicit class:

| Route class                            | Index policy                                            | Sitemap policy                               | Examples                                                  |
| -------------------------------------- | ------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------- |
| Public canonical                       | `index, follow` when the bounded outcome is publishable | Include the canonical route                  | Landing, public indexes, published detail                 |
| Public utility                         | Deliberate per-route decision                           | Include only when it serves public discovery | Learn-more, pricing, tools                                |
| Public duplicate or contextual doorway | Canonicalize or redirect to the accepted route          | Exclude the duplicate                        | Legacy profile id, contextual Menu doorway                |
| Authenticated or personalized          | `noindex, nofollow` at the response-header layer        | Exclude                                      | Console, Dashboard, account, member, tenant personal home |
| Admin, developer, or authoring         | `noindex, nofollow`; disallow where useful              | Exclude                                      | Admin, dev, create, edit                                  |
| Redirect-only                          | Preserve the reviewed permanent or temporary status     | Exclude the source                           | Retired aliases, bounded tenant redirect                  |

Crawler exclusion is not an access-control mechanism. Authentication,
authorization, Rules, and bounded server projections remain the security
boundary.

## Metadata and canonical URLs

Core `useSeo` is the nearest reusable metadata seam. A normal indexable page
should produce one title, description, canonical URL, robots value, Open Graph
identity, Twitter presentation, and optional JSON-LD projection from the same
bounded page state.

Core `useAppLandingSeo` is the landing specialization. FireUX, Misebox, and
Interlaken Essen are the first rendered proofs: App-owned literature, locale,
and brand images feed the shared canonical, social metadata, and connected
Organization/WebSite/WebPage graph. Other Apps retain their facts while
converging on that transport.

FireUX is also the first public catalogue proof beyond the landing. Its
Operations and Solutions hubs project source-owned child catalogues as
canonical CollectionPage/ItemList graphs, while their detail routes project
canonical WebPages through the same Core transport. Unreleased Solution
statuses remain outside generated sitemap discovery. A Solution composed from
another ecosystem links to and permanently redirects through its declared
canonical destination; FireUX does not manufacture a competing local detail
or sitemap entry.

FireUX owns one canonical parent overview at `/ecosystems/misebox`. It explains
the FireUX–Misebox relationship from Misebox-owned Ecosystem literature, links
to canonical Misebox Operations and Solution pages, and lists only active Apps
from the bounded public directory. The former `/misebox` doorway permanently
redirects to that overview and remains outside the sitemap. Missing App copy is
not filled with invented claims; richer descriptions appear only when the App
owner publishes them to the public projection.

The platform relationship graph follows one rule across all Apps. FireUX
publishes the `/apps` directory. A global or tenant App detail links to its
bounded Ecosystem parent; the Ecosystem page links back to its active Apps. A
standalone App has no canonical Ecosystem parent and links directly back to the
FireUX Apps directory. The App's `ecosystem` runtime package selector does not
manufacture a stored `ecosystem_id` relationship for standalone Apps.

FireUX owns `/sitemaps/directory.xml` for dynamic App and Ecosystem details.
The JSON directory endpoint and XML sitemap share one bounded reader, so search
discovery cannot bypass active-record projection rules. The App-owned sitemap
document is registered through Core's typed SEO configuration and appears in
the sitemap index. Retired Cleanbox Ecosystem identity redirects to Werkbox and
the FireUX Blank development harness remains `noindex` and outside the dynamic
sitemap.

- Canonicals use the configured production App origin, never an arbitrary
  request host when a reviewed origin exists.
- A canonical route key must match the route-family decision in
  `family-entity-detail.md`; storage identity and authored slugs are not
  interchangeable fallbacks.
- Social images are absolute public URLs owned by the entity, App, ecosystem,
  or canonical brand family.
- A non-public or unresolved entity fails closed to `noindex` and emits no
  public structured-data claim.
- App-level defaults may provide presentation fallbacks, but generic copy such
  as “on FireUX” is not a substitute for App-owned product literature.

Place and Kitchen are the strongest current entity siblings. Their shared
metadata mechanics should align; Place retains venue facts and Kitchen retains
restaurant/publication semantics.

## Robots and private routes

Core owns the runtime `robots.txt` response and shared header-level noindex
defaults. Project Apps must not add a competing static `public/robots.txt`.

Core defaults protect shared private families. Apps add genuine local private
families, such as Interlaken Essen `/mis/**`, through typed SEO config. App
additions extend rather than replace the Core policy.

Robots policy must allow crawlers to fetch an indexable public page and its
essential media. Do not broadly block AI crawlers as a proxy for privacy; keep
private data out of public responses instead.

## Sitemaps

Static public routes come from Nuxt route discovery plus explicit App and
extension contributions. Dynamic public routes come from an owning entity
provider.

- A provider declares whether its route identity is an exact Firestore
  document ID or a source-defined field such as a reviewed slug or User handle.
- Document IDs remain byte-for-byte route keys; slug normalization must not
  mutate them.
- Sitemap publication must match the same bounded public eligibility as the
  route. A convenient root query is not valid when public state depends on
  tenant scope, joins, or server-only validation.
- Jobs is the proving bounded sibling: its category, tenant, publication,
  Company, and Place contract uses one `readJobDirectoryPage` owner for the
  JSON Directory and its extension-owned sitemap document. It must never fall back
  to the generic visibility-only root provider.
- Kitchens follow the same transport rule with their own domain gates: JSON
  and XML share one reader that applies boolean root visibility, management,
  AppKitchen support, the same-id Place relationship, and the bounded Kitchen
  DTO. A raw root query is not sufficient sitemap authority.
- Empty sitemap results and storage failures require observable verification;
  production must not silently present missing public inventory as success.

## Structured data and entity consistency

Structured data is another public projection, not a second entity model.

- Use canonical public URLs as stable `@id` values.
- Prefer one connected page `@graph` joining WebSite, Organization, WebPage,
  BreadcrumbList, and the page's real entity where current source proves each
  relationship.
- Domain owners select the narrowest truthful Schema.org type and fields.
- Place, address, opening hours, price, availability, employment, ratings, and
  offers appear only when the bounded public source owns those facts.
- Names, images, URLs, and relationships must agree with visible page content.
- Never fabricate reviews, ratings, customer outcomes, inventory, service
  areas, or business relationships for search presentation.

## Multilingual discovery

Changing document `lang` is not a complete multilingual search contract.

An indexable language variant needs a stable crawlable URL, approved complete
page copy, a self-canonical, reciprocal `hreflang` links, the exact locale, and
matching sitemap entries. Use `x-default` only when a genuine default doorway
exists.

Interlaken Essen is the first intended proof. Its default rendered graph states
`gsw-CH`, but that fact is not an alternate-language routing contract. Its
`gsw`, `de`, and `en` policy remains App-owned, while reviewed-copy semantics
remain with Sproochli. Do not advertise a language variant while inherited Core
or package surfaces would produce a materially mixed or unapproved page.

## Local and business search

A tenant business surface derives its search identity from the same bounded
Place, Kitchen, Property, Company, Store, or App projection used by the page.

Local fields may differ per tenant: business category, precise address or
service area, hours, contact doorway, menus, services, properties, and imagery.
The shared rule does not differ: each field needs one current public owner and
must agree across visible content, canonical URL, structured data, and linked
entity pages.

Place/Kitchen are the first reusable business-identity siblings. Richies
Reinigung, Bangin Coffee, Interlaken Essen, and BuenoHost property tenants are
candidate proofs, not authority for a generic invented LocalBusiness payload.

## AI and answer-engine visibility

Answer engines benefit from the same qualities as search engines: crawlable
SSR HTML, stable canonical identity, explicit relationships, concise factual
language, and source-backed evidence.

Build explanations bottom-up through `product-language.md`: atom, part,
entity, operation, Console, App or ecosystem, then landing. Public Operations,
Solutions, Modules, Blog posts, business entities, and clearly labelled Demo
proofs may reinforce one another, but none may become an alternate capability
source.

An optional machine-readable discovery file may summarize already published
routes later. It must never be treated as a substitute for visible content,
canonicals, sitemaps, structured data, or reviewed literature.

## Performance and rendering

Primary public facts and metadata must be present in the SSR response. Client
interaction may enhance discovery but must not be required to reveal the page's
identity or main explanation.

Public templates should preserve explicit media dimensions, deliberate LCP
priority, lazy below-fold media, stable layout, bounded client JavaScript, and
accessible semantic headings and links. Add performance budgets only after
representative landing, index, detail, article, local-business, and multilingual
templates have measurable baselines.

## Delta register

| Difference                                                         | State        | Reason and treatment                                                                                          |
| ------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------- |
| Core owns runtime robots while Apps add bounded route policy       | `accepted`   | Transport is shared; genuine private route families remain App-owned config                                   |
| Entity sitemap route identity may be document ID or authored field | `accepted`   | Route-family identity decisions differ; every provider must declare the choice explicitly                     |
| Jobs requires a custom Directory-backed sitemap                    | `accepted`   | JSON and XML share `readJobDirectoryPage`; generic visibility-only discovery stays prohibited                 |
| Kitchens require a custom projection-backed sitemap                | `accepted`   | JSON and XML share App, support, Place, publication, and Test gates before emitting a Kitchen route           |
| Many project landings call `useSeoMeta` directly                   | `drift`      | FireUX, Misebox, and Interlaken are proofs; migrate remaining Apps without copying their facts                |
| Entity JSON-LD builders emit isolated sparse objects               | `drift`      | Add stable canonical IDs and a connected graph only through proven shared primitives                          |
| Three landings have rendered shared SEO contracts                  | `accepted`   | FireUX, Misebox, and Interlaken smoke verifies canonical, robots, social metadata, and graph facts            |
| FireUX Operations and Solutions prove hub/detail search transport  | `accepted`   | Source catalogues feed canonical collection/detail pages, connected lists, sitemap policy, and rendered smoke |
| FireUX describes Misebox at one parent Ecosystem route             | `accepted`   | Source-owned relationship copy, released Solutions, and bounded active App records feed the rendered page     |
| Dynamic App/Ecosystem details use one directory sitemap            | `accepted`   | JSON and XML share the bounded reader; App details expose their canonical parent relationship                 |
| Standalone Apps have no canonical Ecosystem parent                 | `accepted`   | Runtime package selection does not create a stored public relationship                                        |
| FireUX Blank remains visible but non-indexable                     | `migration`  | Current source defines a harness; archive its public record or approve a product role before indexing         |
| Interlaken changes page language without crawlable alternate URLs  | `to-confirm` | Approve a stable language-route policy before emitting `hreflang` or multilingual sitemap entries             |
| Public-template performance has no shared budget                   | `to-confirm` | Measure representative siblings before guarding thresholds                                                    |
| Search-result and indexation measurement is not integrated         | `migration`  | Add only aggregate, privacy-safe operational evidence; do not introduce behavioral tracking                   |

## Verification

Start with:

- `packages/core/fireux-core/src/config/app/seo.ts`
- `packages/core/fireux-core/src/config/app/seo-paths.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/seo/useSeo.ts`
- `scripts/_lib/smoke.mjs` and `scripts/_lib/app-smoke-contracts.mjs`
- `packages/core/fireux-core/src/runtime/server/robots.txt.get.ts`
- `packages/core/fireux-core/src/runtime/server/utils/seo-sitemaps.ts`
- `scripts/guards/seo-spine.mjs`
- the owning extension `src/module.ts`, bounded DTO, route page, and SEO
  composable
- the concrete App `nuxt.config.ts` and public page composition

For a change, verify the canonical origin, route/redirect outcome, headers,
rendered metadata, sitemap membership, structured-data payload, public DTO,
locale, and visible content together. Run the focused SEO guard while
iterating and `pnpm guard` before repository handoff.

## Alignment roadmap

### Now

- Keep exact sitemap route identity and shared private-route protection guarded.
- Keep Core as the only runtime robots owner.
- Keep Jobs JSON and sitemap discovery on the same bounded Directory reader.
- Keep Kitchen JSON and sitemap discovery on its relationship-aware public
  reader.
- Keep FireUX, Misebox, and Interlaken landing metadata and connected graphs
  under rendered smoke.
- Keep FireUX Operations and Solutions hub/detail canonicals, graphs, and
  released-status sitemap eligibility under rendered smoke and the SEO guard.
- Keep `/ecosystems/misebox` as the FireUX parent overview, `/misebox` as a
  permanent redirect, and all product-depth links canonical to Misebox.
- Keep the FireUX App/Ecosystem JSON directory and directory sitemap on one
  bounded reader, and keep every indexable App detail linked to its real parent.

### Next

- Move the next clean Main App and source-complete tenant landing onto the
  shared metadata seam without copying another App's facts.
- Extend rendered verification from the FireUX landing to robots, sitemaps,
  and representative public detail routes.
- Prove one connected WebSite/Organization/WebPage/entity graph through Place
  and Kitchen.

### Later

- Approve and prove stable multilingual route identity with Interlaken Essen.
- Establish local-business projections through real tenant siblings.
- Baseline representative template performance before adding budgets.
- Add aggregate search/indexation evidence without behavioral identities.

## Living-map maintenance

Refresh this map when Core search ownership, route classes, sitemap provider
contracts, multilingual URL policy, structured-data ownership, or verification
changes. Keep task status, deployment history, ranking claims, speculative
keywords, and dated delivery promises out of this file.
