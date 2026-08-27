# Entity Detail family

Updated: 2026-08-19
Ref: a4729c0f2
Role: map, not canon

## Purpose

Map Entity Detail routes, their shared transport boundary, and the entity-level
reasons that route identity and page composition differ.

## Links

- Parent: `pages.md`
- Child: `family-menu.md`
- Horizontal: `entities.md`, `components.md`, `composables.md`, `debug.md`

## Shared spine

Every Entity Detail route should:

- Return the canonical Entity under its real name, plus explicitly named
  related Entities or Records required by the page.
- Prefer an endpoint-first SSR read for initial content, missing state,
  and failure state. Client Firestore may enrich an already-rendered object but
  must not become a second initial authority.
- Use the same canonical root type as its sibling Entity Collection Page. Do not
  create `PublicX`, `PublicXDetail`, or `projectPublicX` copies of root Entities.
- Return truthful HTTP status for missing and failed reads. A client recovery
  branch must not turn a direct 404 or 5xx into HTTP 200.
- Keep secrets, private account material, App access, Finance, Team internals,
  and operational children physically under their honest owners instead of
  nesting them on an Entity root and filtering them later.
- Delegate domain display to named domain components.
- Keep operator/private actions separate from entity identity and content.
- Expose useful dev debug at each responsible page or component surface, with
  fetched objects separated from derived route/render state. Multiple panels
  are valid when the page composes independently owned domains; do not hoist
  child internals solely to manufacture one route-wide debug object.
- Keep pending/ready/missing/error state in the owning entity reader. Do not
  create a cross-entity detail engine solely to remove a small repeated state
  machine.
- Keep debug payloads shaped as `objects`, `derived`, and `page`; presentation
  receives the canonical Entity rather than a page-maintained list of copied
  scalar props.
- Agent, Chef, Driver, and Professional details share Core
  `PublicProfileDetailSurface`, `PublicProfileHero`, and
  `PublicProfileSection` presentation. Their named `X/Cards/Profile` roots own
  domain content, icons, and section presence; profile tone is presentation
  only and never changes identity, transport, publication, or authority.
- Canonical User detail reuses the shared profile hero and Nuxt UI page cards.
  Specialist profile pages remain with their owning domains and are not
  inferred or registered through the User page.
- Place owns the reference venue identity presentation. Kitchen and Supplier
  may compose that named Place presentation after their server reader has
  resolved the canonical Place relationship; they do not copy Place fields or
  introduce a generic cross-entity header. Place retains venue facts, story,
  gallery, and hours while Kitchen retains menus and operational children and
  Supplier retains catalogue and supply capabilities. Place detail stays
  ignorant of Kitchen and Supplier capabilities.
- Place, Kitchen, and Supplier now prove the live detail contract. Their server
  endpoint owns the initial read and truthful route status; the browser then
  exact-subscribes to the already-resolved canonical root records and retains
  the last good values through transient listener failures. Kitchen returns
  canonical `kitchen` and `place` objects plus a named joined `presentation`;
  Supplier returns canonical `supplier` and `place` objects.

## Emerging page composition

The preferred order is:

1. Header.
2. Identity or profile.
3. Main entity content.
4. Operator/actions surface when relevant.
5. Route-owned dev debug. Component-owned debug remains beside the component
   surface it diagnoses.

This order is a recommendation, not yet a guard-backed contract. Align detail
pages opportunistically when they are touched; do not perform a blind
repository-wide template rewrite.

## Current route identity

| Entity family                     | Current route key | State and reason                                                                                                                                                                       |
| --------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User                              | handle            | `accepted`: public human identity is the route contract                                                                                                                                |
| Blog                              | slug              | `accepted`: authored content owns a stable public slug                                                                                                                                 |
| Kitchen                           | authored slug     | `accepted`: one Kitchen server reader maps the unique authored slug to the stable Place-linked Kitchen root ID                                                                         |
| Supplier                          | document id/slug  | `accepted`: the normalized organization slug is the canonical Supplier document id, and the detail reader returns canonical Supplier and Place records                                 |
| Product                           | slug              | `accepted`: catalogue identity is public and human-readable                                                                                                                            |
| Menu                              | menu route id     | `accepted`: the id participates in root, kitchen-collection, tenant, and contextual route grammar; see `family-menu.md`                                                                 |
| App                               | id                | `accepted`: canonical App identity is already a public platform key                                                                                                                    |
| Agent, Chef, Driver, Professional | User handle       | `accepted`: public identity uses the canonical User handle; the trusted projection resolves it to the uid-keyed profile and legacy uid requests redirect permanently to the handle URL |
| Place                             | document id       | `accepted`: exact reads return `{ place: Place }`; the stable document id remains the route key                                                                                        |
| Company, Job                      | id today          | `to-confirm`: current route works, but no family-wide human slug decision has been proved                                                                                              |
| Portfolio                         | document id       | `accepted`: endpoint-first exact reads use the stable root id; authored slug remains canonical content and currently matches that id                                                    |
| Property                          | slug today        | `parked`: public detail remains deliberately unavailable until a product decision defines a privacy-safe contract for the governance/valuation-bearing canonical root                  |
| Project                           | no public detail  | `accepted`: private FireUX control-plane entity                                                                                                                                        |

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
| Kitchen detail can expose published KitchenMenus                       | `accepted`  | Kitchen is a Workspace Entity with scoped published children; its reader returns canonical Kitchen and Place records plus a named joined presentation while menus remain Kitchen-owned                          |
| Place is the reference identity surface for Place-backed entities      | `accepted`  | Kitchen and Supplier keep named detail entrypoints and domain-owned sections while composing the resolved Place identity presentation instead of copying its visual atoms or stored fields                    |
| Place exact and index reads return canonical Place                     | `accepted`  | Detail returns `{ place }`; the bounded index adds pagination metadata around `Place[]`; mutation responses publish the same Place into local detail state                                                    |
| Place detail stays current after its server render                     | `accepted`  | The server API supplies the initial canonical Place; every browser visitor then exact-subscribes to that same record, while transient listener failures retain the last good Place                            |
| Menu detail can render a photo/PDF root Menu or structured KitchenMenu | `accepted`  | Root Menu and scoped KitchenMenu are distinct entities sharing public doorway behavior                                                                                                                        |
| Portfolio keeps Finance and operations outside its root                | `accepted`  | Portfolio remains the readable Entity; Finance and operational children stay in their own scoped owners                                                                                                       |
| Portfolio exact and index reads return canonical Portfolio             | `accepted`  | Public SSR readers inject document ids, omit incomplete onboarding roots, and return the same normalized Portfolio used by client/workspace readers                                                            |
| Supplier detail joins its Company/Place at the server boundary         | `accepted`  | The server reader returns canonical `supplier` and `place` objects; the browser exact-subscribes to those already-resolved roots without manufacturing a replacement Supplier DTO                             |
| Tenant Menu detail omits Kitchen slug                                  | `accepted`  | Tenant App configuration supplies the one bounded Kitchen scope; route shape does not change data ownership                                                                                                   |

## Drift and decisions

| Difference                                                                   | State        | Recommendation                                                                                                           |
| ---------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Operator/action panels do not yet share a settled responsibility boundary    | `drift`      | Keep each named entity operator panel domain-owned; extract shared behavior only after repeated jobs are identical       |
| Identity/profile/main ordering varies across older pages                     | `drift`      | Align when touching the page, using the emerging order and existing domain components                                    |
| Several current id routes have no recorded long-term route-identity decision | `to-confirm` | Decide per entity from public identity and redirect requirements, not visual preference                                  |
| Some root Entity readers still expose duplicate prefixed types               | `migration`  | Place, Supplier, and Job are reconciled; replace the remaining duplicates incrementally with canonical Entity types      |
| Property public detail is deliberately unavailable                           | `parked`     | Do not expose the governance/valuation-bearing canonical root or invent a replacement public-entry model without an explicit product/privacy decision |
| Kitchen route slug and stable root ID have different jobs                    | `accepted`   | Resolve the authored route key only at the bounded server boundary; keep operational relationships on the stable root ID |

## Alignment roadmap

### Now

- Keep Entity Collection Page and Entity Detail on the same canonical Entity type.
- Preserve truthful SSR status and explicit server-owned joins.
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
