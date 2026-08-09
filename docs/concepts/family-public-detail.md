# Public detail family

Updated: 2026-08-08
Ref: d4506e91b
Role: map, not canon

## Purpose

Map public detail routes, their shared transport boundary, and the entity-level
reasons that route identity and page composition differ.

## Links

- Parent: `pages.md`
- Child: `family-menu.md`
- Horizontal: `entities.md`, `components.md`, `composables.md`, `debug.md`

## Shared spine

Every public detail route should:

- Resolve one public object or bounded public projection.
- Prefer an endpoint-first SSR projection for initial content, missing state,
  and failure state. Client Firestore may enrich an already-rendered object but
  must not become a second initial authority.
- Use the same publication and field allowlist as its sibling public index.
- Return truthful HTTP status for missing and failed reads. A client recovery
  branch must not turn a direct 404 or 5xx into HTTP 200.
- Keep raw private roots, support records, owner ids, and mutation authority out
  of public DTOs unless the public contract explicitly requires a safe field.
- Delegate domain display to named domain components.
- Keep operator/private actions separate from the public identity and content.
- Expose one useful dev debug surface only when needed, with fetched objects
  separated from derived route/render state.
- Keep pending/ready/missing/error state in the owning entity reader. Do not
  create a cross-entity detail engine solely to remove a small repeated state
  machine.
- Keep the page DTO shape as `objects`, `derived`, and `page`; presentation
  receives the complete bounded entity DTO instead of a page-maintained list of
  copied scalar props.
- Agent, Chef, Driver, and Professional details share Core
  `PublicProfileDetailSurface`, `PublicProfileHero`, and
  `PublicProfileSection` presentation. Their named `X/Cards/Profile` roots own
  domain content, icons, and section presence; profile tone is presentation
  only and never changes identity, transport, publication, or authority.
- Canonical User detail reuses the shared profile hero and Nuxt UI page cards.
  Specialist profile pages remain with their owning domains and are not
  inferred or registered through the User page.
- Public venue and operation details compose Core `PublicEntityHero` through
  their named domain detail surfaces. Place and Kitchen are the proving
  siblings: cover failure, identity media, title/action geometry, sparse
  composition, and responsive behavior match; Place retains venue facts,
  story, gallery, and hours while Kitchen retains brand identity, menus, and
  operational children.
- When the Kitchen capability is installed, Place detail composes the
  Kitchen-owned `KitchenPlacePublicOperations` extension. It exact-filters
  published Kitchens by canonical `Kitchen.place_id`, then resolves each
  Kitchen's published Menu doorways through the existing Kitchen-scoped public
  Menu endpoint. Place owns neither the relationship copy nor a denormalized
  Kitchen/Menu list, and Apps do not add venue-specific exceptions.

## Emerging page composition

The preferred order is:

1. Header.
2. Identity or profile.
3. Main public content.
4. Operator/actions surface when relevant.
5. Dev debug.

This order is a recommendation, not yet a guard-backed contract. Align detail
pages opportunistically when they are touched; do not perform a blind
repository-wide template rewrite.

## Current route identity

| Entity family                     | Current route key | State and reason                                                                                                                                                                       |
| --------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User                              | handle            | `accepted`: public human identity is the route contract                                                                                                                                |
| Blog                              | slug              | `accepted`: authored content owns a stable public slug                                                                                                                                 |
| Kitchen                           | authored slug     | `accepted`: one bounded Kitchen server resolver maps the unique public slug to the stable Place-linked Kitchen root ID                                                                |
| Supplier                          | slug              | `accepted`: supplier identity is company-style and public-facing                                                                                                                       |
| Product                           | slug              | `accepted`: catalogue identity is public and human-readable                                                                                                                            |
| Menu                              | menu route id     | `accepted`: the id participates in root, kitchen-directory, tenant, and contextual route grammar; see `family-menu.md`                                                                 |
| App                               | id                | `accepted`: canonical App identity is already a public platform key                                                                                                                    |
| Agent, Chef, Driver, Professional | User handle       | `accepted`: public identity uses the canonical User handle; the trusted projection resolves it to the uid-keyed profile and legacy uid requests redirect permanently to the handle URL |
| Place, Company, Job, Portfolio    | id today          | `to-confirm`: current route works, but no family-wide human slug decision has been proved                                                                                              |
| Property                          | slug today        | `to-confirm`: keep the route stable while public-detail and publication behavior are completed                                                                                         |
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
| Job detail exact-loads the same bounded DTO as Job index               | `accepted`  | Category, tenant, publication, Company, and Place joins are server-owned                                                                                                                                      |
| Kitchen detail can expose public KitchenMenus                          | `accepted`  | Kitchen is a public console entity with scoped published children; its public identity shares the Core entity hero without moving Kitchen content or authority into Core                                      |
| Place and Kitchen share one public entity-hero presentation            | `accepted`  | Core owns cover/identity/action composition while each domain keeps its bounded DTO, media ownership, public sections, operator controls, and route behavior                                                  |
| Menu detail can render a photo/PDF root Menu or structured KitchenMenu | `accepted`  | Root Menu and scoped KitchenMenu are distinct entities sharing public doorway behavior                                                                                                                        |
| Portfolio is public-light/private-heavy                                | `accepted`  | Financial and operational Portfolio data stays out of the public projection; the exact public DTO remains to-confirm                                                                                          |
| Tenant Menu detail omits Kitchen slug                                  | `accepted`  | Tenant App configuration supplies the one bounded Kitchen scope; route shape does not change data ownership                                                                                                   |

## Drift and decisions

| Difference                                                                   | State        | Recommendation                                                                                                                                                                            |
| ---------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operator/action panels do not yet share a settled responsibility boundary    | `drift`      | Keep each named `XPublicOperatorPanel` domain-owned; extract shared behavior only after repeated jobs are identical                                                                       |
| Identity/profile/main ordering varies across older pages                     | `drift`      | Align when touching the page, using the emerging order and existing domain components                                                                                                     |
| Several current id routes have no recorded long-term route-identity decision | `to-confirm` | Decide per entity from public identity and redirect requirements, not visual preference                                                                                                   |
| Supplier and Portfolio public DTO declarations are incomplete                | `to-confirm` | Confirm bounded projections before promising detail parity                                                                                                                                |
| Property public detail is partly app-specific today                          | `migration`  | Move reusable bounded detail behavior to the owning package while preserving tenant presentation deltas                                                                                   |
| Kitchen route slug and stable root ID have different jobs                    | `accepted`   | Resolve the authored route key only at the bounded server boundary; keep operational relationships on the stable root ID                                                                |

## Alignment roadmap

### Now

- Keep index and detail on one publication/DTO contract per entity.
- Preserve truthful SSR status and bounded public projections.
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
