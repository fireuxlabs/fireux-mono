# Entity Detail family

Updated: 2026-09-13
Ref: 641060601
Role: map, not canon

## Purpose

Map Entity Detail routes, their shared route-to-component boundary, and the
entity-level reasons that route identity and page composition differ.

## Links

- Parent: `pages.md`
- Child: `family-menu.md`
- Horizontal: `entities.md`, `components.md`, `composables.md`, `debug.md`

## Reader ownership and evidence

Use the [Entity file contract](composables.md#entity-file-contract). A route
uses its Entity reader directly; `Platform` or another consumer name requires
an actual scope, policy or projection delta. Project and Ecosystem use their
entity-owned detail readers. Project retains its FireUX server scope. Ecosystem uses its exact endpoint
rather than loading the platform directory; FireUX supplies the approved owning
database through its server adapter. Core retains canonical validation.

Read outcomes remain separate from visual composition but are required behavior:
Core owns precedence; the route renders loading, failure and missing states.
Core `src/test/read-outcome.test.mjs` and `app-detail.test.mjs` cover the focused
adapters. Historical guard claims below describe former construction checks;
`scripts/` and `pnpm guard` are retired and do not enforce this family today.
Do not treat this map as proof that every listed route is currently verified.

## Shared spine

Every Entity Detail route should:

- Acquire the canonical Entity once and pass that whole record into one
  Entity-owned detail component.
- Use the minimal page metadata contract: `layout`, the singular Entity
  `title`, and `description: 'View Entity details.'`. Use Nuxt's generated route
  name; retain additional metadata only when middleware or visibility consumes
  it.
- Let Detail acquire and compose its bounded related capabilities when they
  are not part of resolving the canonical route Entity.
- Never reacquire the canonical root Entity inside Detail after the route has
  passed it in. Named children may acquire bounded related Entities or
  capabilities from the root object's stored relationship keys.
- Use the same canonical root type as its sibling Entity Collection Page. Do not
  create `PublicX`, `PublicXDetail`, or `projectPublicX` copies of root Entities.
- Keep secrets, private account material, App access, Finance, Team internals,
  and operational children physically under their honest owners instead of
  nesting them on an Entity root and filtering them later.
- Delegate domain display to named domain components.
- Name relationship children after the related Entity (`AppDetailProject`,
  `JobDetailPlace`, `SupplierDetailCompany`) rather than hiding distinct jobs
  behind a generic `Relations` component.
- Name content and action children after their actual capability
  (`ProjectDetailApps`, `JobDetailFacts`, `JobDetailApply`) rather than generic
  `Content` or misleading `Admin` buckets.
- Keep operator/private actions separate from entity identity and content.
- Do not introduce a generic Entity detail shell or configuration object. The
  route should remain a readable ordered composition, and named components own
  domain presentation.
- Outcome and HTTP-status presentation remain outside the basic relationship.
  Dev diagnostics reuse Core's shared launcher: the route shows the canonical
  fetched object and route locator; a Detail owner that performs a bounded
  related read or material projection shows that object and its own derived
  surface data.
- Agent, Chef, Driver, and Professional details share Core
  `PublicProfileDetailSurface`, `PublicProfileHero`, and
  `PublicProfileSection` presentation. Their named `X/Cards/Profile` roots own
  domain content, icons, and section presence; profile tone is presentation
  only and never changes identity, transport, publication, or authority.
- Canonical User detail proves the one-object boundary: the route acquires the
  canonical User and renders `<UserDetail v-if="user" :user="user" />`.
  `UserDetail` owns the separately authorized AppUser membership read and
  composes `UserProfile` and `UserAppMembership`. Profile, membership, and
  App-owned capability components derive their own
  viewer decisions, labels, links, pending state, and commands from the object
  plus runtime context; the route does not spray those decisions through scalar
  props. Missing membership is not a Free subscription. The inline admin panel
  and `/users/:handle/edit` reuse `UserAppMembershipEdit`; both retain the same
  trusted AppUser mutation authority. Specialist profile pages remain with
  their owning domains and are not inferred or registered through the User page.
  Misebox's App-owned `UserDetail` composition appends the Kitchen-owned
  `KitchenUserMemberships` capability. That child resolves the authorized
  AppUser-to-Kitchen relationship, canonical same-id Places, and matching
  Kitchen Team access from the passed User; Core User remains unaware of
  Kitchen and public visitors receive no operational membership projection.
- Place owns the reference venue identity presentation. Kitchen and Supplier
  may compose that named Place presentation after their server reader has
  resolved the canonical Place relationship; they do not copy Place fields or
  introduce a generic cross-entity header. Place retains venue facts, story,
  gallery, and hours while Kitchen retains menus and operational children and
  Supplier retains catalogue and supply capabilities. Place detail stays
  ignorant of Kitchen and Supplier capabilities.
- Place and Supplier retain their established live detail behavior. Kitchen's
  public Detail uses its authorized server endpoint only: the response returns
  canonical `kitchen` and `place` objects plus a named joined `presentation`,
  and the public browser does not open a second direct listener against the
  protected Kitchen root.

## Emerging page composition

The proving FL Detail boundary is one object-driven component:

```text
route acquires canonical Entity
└── UPage
    └── UPageBody
        ├── EntityDetail v-if="entity" :entity="entity"
        └── DevDebugPanel # dev-only canonical fetch and route locator
```

The route owns identity resolution, the canonical Entity read, and the single
Detail composition. Detail owns SEO, section order, presentation, navigation,
viewer-context decisions, related capability reads, and bounded capability
behavior. Derived labels, URLs, relationship records, visibility flags, pending
flags, callbacks, and presentation configuration are not page-to-child props
when Detail can derive or acquire them from the canonical Entity and runtime
context. An upper App may own a same-purpose Detail
component that composes the lower Detail and appends its genuine capability;
the App route still renders one Detail component and Core remains unaware of
the upper capability.

The preferred order is:

1. Header.
2. Identity or profile.
3. Main entity content.
4. Operator/actions surface when relevant.
5. Further named Entity sections when the domain requires them.

The one-object route boundary is guarded for the maintained App, User,
Ecosystem, Project, Place, Kitchen, Job, Menu, Supplier, and Portfolio detail
routes. Their internal section order remains Entity-owned.

The same guard requires each maintained route to expose launcher-backed
`objects` and `derived` payloads with `object-origin="fetched"`. Related reads
stay with the Detail component that owns them: for example User membership,
Kitchen Place presentation, Menu projection payloads, Ecosystem/Project App
relations, Supplier Company Place, and Portfolio profile projection. Pure
display leaves do not invent empty debug panels.

## Current route identity

| Entity family                     | Current route key | State and reason                                                                                                                                                                       |
| --------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User                              | handle            | `accepted`: public human identity is the route contract                                                                                                                                |
| Blog                              | slug              | `accepted`: authored content owns a stable public slug                                                                                                                                 |
| Kitchen                           | authored slug     | `accepted`: one Kitchen server reader maps the unique authored slug to the stable Place-linked Kitchen root ID                                                                         |
| Supplier                          | document id/slug  | `accepted`: the normalized organization slug is the canonical Supplier document id, and the detail reader returns canonical Supplier and Place records                                 |
| Product                           | slug              | `accepted`: catalogue identity is public and human-readable                                                                                                                            |
| Menu                              | menu route id     | `accepted`: the id participates in root, kitchen-collection, tenant, and contextual route grammar; see `family-menu.md`                                                                |
| App                               | id                | `accepted`: canonical App identity is already a public platform key                                                                                                                    |
| Agent, Chef, Driver, Professional | User handle       | `accepted`: public identity uses the canonical User handle; the trusted projection resolves it to the uid-keyed profile and legacy uid requests redirect permanently to the handle URL |
| Place                             | document id       | `accepted`: exact reads return `{ place: Place }`; the stable document id remains the route key                                                                                        |
| Company, Job                      | id today          | `to-confirm`: current route works, but no family-wide human slug decision has been proved                                                                                              |
| Portfolio                         | document id       | `accepted`: endpoint-first exact reads use the stable root id; authored slug remains canonical content and currently matches that id                                                   |
| Property                          | none              | `parked`: no detail route exists until a product decision defines a privacy-safe contract for the governance/valuation-bearing canonical root                                          |
| Project                           | id                | `accepted`: the FireUX route resolves the canonical Project; the Project detail component owns its connected-App read                                                                  |

Do not mechanically rename `[id]` to `[slug]` or the reverse. A route-key
change requires canonical redirect, 404, sitemap, stored-link, and QR impact
review.

## Accepted deltas

| Delta                                                                  | State       | Why it exists                                                                                                                                                                                                 |
| ---------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Profile details join canonical User presentation by uid                | `accepted`  | Domain profile roots remain owner/private authority and do not duplicate public User identity; public Agent, Chef, Driver, and Professional routes resolve the User handle at the trusted projection boundary |
| FireUX App detail uses its platform directory                          | `accepted`  | FireUX owns the platform relationship, Ignition action, search policy, and directory reader; the Core App detail remains the aligned Ecosystem-local sibling rather than a generic runtime-composed page      |
| Legacy profile uid URLs redirect permanently to the User-handle URL    | `migration` | Stored links remain usable during the route cutover while every new card, canonical tag, and share path uses the handle                                                                                       |
| Job detail returns the canonical Job plus named Company/Place records  | `accepted`  | Category and tenant eligibility remain server-owned; the paginated Directory alone uses a bounded joined `JobDirectoryEntry`                                                                                  |
| Kitchen detail can expose published KitchenMenus                       | `accepted`  | Kitchen is a Workspace Entity with scoped published children; its reader returns canonical Kitchen and Place records plus a named joined presentation while menus remain Kitchen-owned                        |
| Place is the reference identity surface for Place-backed entities      | `accepted`  | Kitchen and Supplier keep named detail entrypoints and domain-owned sections while composing the resolved Place identity presentation instead of copying its visual atoms or stored fields                    |
| Place exact and index reads return canonical Place                     | `accepted`  | Detail returns `{ place }`; the bounded index adds pagination metadata around `Place[]`; mutation responses publish the same Place into local detail state                                                    |
| Place detail stays current after its server render                     | `accepted`  | The server API supplies the initial canonical Place; every browser visitor then exact-subscribes to that same record, while transient listener failures retain the last good Place                            |
| Menu detail can render a photo/PDF root Menu or structured KitchenMenu | `accepted`  | Root Menu and scoped KitchenMenu are distinct entities sharing public doorway behavior                                                                                                                        |
| Portfolio keeps Finance and operations outside its root                | `accepted`  | Portfolio remains the readable Entity; Finance and operational children stay in their own scoped owners                                                                                                       |
| Misebox User detail appends Kitchen membership                         | `accepted`  | The App composes a Kitchen-owned, self/admin-authorized relationship section over canonical User identity; Core does not absorb AppUser, Kitchen, Place, or Team meaning                                     |
| Portfolio exact and index reads return canonical Portfolio             | `accepted`  | Public SSR readers inject document ids, omit incomplete onboarding roots, and return the same normalized Portfolio used by client/workspace readers                                                           |
| Supplier detail joins its Company/Place at the server boundary         | `accepted`  | The server reader returns canonical `supplier` and `place` objects; the browser exact-subscribes to those already-resolved roots without manufacturing a replacement Supplier DTO                             |
| Tenant Menu detail omits Kitchen slug                                  | `accepted`  | Tenant App configuration supplies the one bounded Kitchen scope; route shape does not change data ownership                                                                                                   |
| Menu detail reader resolves route projection                           | `accepted`  | A Menu URL selects browse, ordering, or diagnostic projection plus root or tenant scope; `useMenuDetail` resolves that grammar while the route keeps the same one-object Detail boundary                      |

## Drift and decisions

| Difference                                                                   | State        | Recommendation                                                                                                                                 |
| ---------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Operator/action panels do not yet share a settled responsibility boundary    | `drift`      | Keep each named entity operator panel domain-owned; extract shared behavior only after repeated jobs are identical                             |
| Identity/profile/main ordering varies across older pages                     | `drift`      | Align when touching the page, using the emerging order and existing domain components                                                          |
| Several current id routes have no recorded long-term route-identity decision | `to-confirm` | Decide per entity from public identity and redirect requirements, not visual preference                                                        |
| Some root Entity readers still expose duplicate prefixed types               | `migration`  | Place, Supplier, and Job are reconciled; replace the remaining duplicates incrementally with canonical Entity types                            |
| Property has no detail route                                                 | `parked`     | Do not expose the governance/valuation-bearing canonical root or invent a replacement entry model without an explicit product/privacy decision |
| Kitchen route slug and stable root ID have different jobs                    | `accepted`   | Resolve the authored route key only at the bounded server boundary; keep operational relationships on the stable root ID                       |

## Alignment roadmap

### Now

- Keep Entity Collection Page and Entity Detail on the same canonical Entity type.
- Keep explicit server-owned joins and pass their separately named records to
  the Entity component.
- Keep Menu route identity on the guarded route grammar.

### Next

- Settle named operator-panel responsibilities using Kitchen and Menu as the
  proving siblings.
- Record route identity decisions for Place, Company, Job, Portfolio, and
  Property.
- Move reusable Property detail behavior out of project-app forks.

### Later

- Add a light detail-page guard only after page order, not-found treatment, and
  operator boundaries are proven across several families.
- Retire legacy profile uid redirects only after stored-link evidence shows
  the compatibility window is no longer needed.
