# Public index family

Updated: 2026-08-18
Ref: e23268507
Role: map, not canon

## Purpose

Map public browse routes such as `/kitchens`, `/jobs`, `/menus`, and sibling
entity directories. Separate shared page composition from data-authority and
product-presentation deltas.

## Links

- Parent: `pages.md`
- Children: `family-public-detail.md`, `family-menu.md`
- Horizontal: `collection-manager.md`, `components.md`, `composables.md`,
  `entities.md`

## Shared spine

Every public entity index should:

- Be a public/runtime browse surface, not a Console or dev probe.
- Keep the route page thin: metadata, route shell, major domain components.
- Delegate collection state, filtering, card mapping, and debug to the owning
  domain collection surface.
- Use an unqualified `XCollectionManager` only for the default collection
  doorway. The route consumes only fields its access policy or bounded
  projection exposes; the canonical root may also contain protected data.
  Scoped children use named scoped surfaces.
- Let the manager own its default source. Pages do not pass raw collections or
  source-mode toggles into root managers.
- Use bounded public projections when privacy, joins, publication, or
  server-only authority make raw client reads unsafe.
- Keep pending, error, empty, and ready outcomes distinct. Read failures do not
  become empty directories.
- Use named domain CTA components such as `XCTA` when an operator/onboarding
  doorway is real. Pages do not configure `EntityIndexCta` directly.
- Keep dev JSON inside the collection surface unless the route itself owns
  unique route-level derived state.
- Specialist-profile managers retain their named domain card adapters, while
  Agent, Chef, Driver, and Professional cells and pills render through the
  shared Core `PublicProfileDirectoryCard`. Semantic profile tones are a
  presentation delta only; they do not classify or authorize records.
- Image-led public entity directories use Core `PublicEntityDirectoryCard`
  through their named domain Cell adapters. Kitchen and Place are the proving
  siblings: they share whole-card interaction, media failure, hierarchy,
  focus, and responsive composition while retaining domain-owned data,
  badges, facts, and copy.

## Current presentation classes

| Class                            | Current members                                              | Reason and status                                                                                                                                            |
| -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Discovery index                  | User, Kitchen, Place, Job, Chef, Driver, Agent, Professional | `accepted`: these are primary public discovery surfaces and use `PublicIndexSurface` with browse content first and an optional secondary domain doorway      |
| Editorial index                  | Blog                                                         | `accepted`: an editorial masthead and story hierarchy serve media discovery while the Blogs extension retains one endpoint-first composition for every app   |
| Controller-owned authority index | App, Ecosystem                                               | `accepted`: the page chooses an explicit ecosystem/platform controller; the manager must not infer authority                                                 |
| Route-policy index               | Menu                                                         | `accepted`: `MenuIndex` owns root, kitchen-directory, and tenant outcomes including bounded redirect policy; the route page stays a thin controller consumer |
| Utility directory                | Ingredient                                                   | `accepted`: browse-only vocabulary surface with no proven public creation CTA                                                                                |
| Basic root directory             | Company, Product, Supplier, Portfolio and Property           | `to-confirm`: current pages use the smaller `UPage` shell; keep that shape until product intent says whether each is a primary discovery surface             |

`PublicIndexSurface` versus `UPage` is a product-presentation decision, not a
data-source decision. Do not switch shells merely to make files textually
identical.

## Data-authority classes

| Class          | Members                                                                                                   | Required behavior                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Root Simple    | Menu doorway rows, Place, Product, plus currently direct Supplier/Portfolio/Property browse               | Manager consumes self-contained bounded rows without client N+1 joins     |
| Root Projected | App, Ecosystem, Project, User, Kitchen, Ingredient, Blog, Company, Job, Chef, Driver, Agent, Professional | Server projection owns allowlists, publication, joins, and safe DTO shape |
| Scoped surface | Dish, Recipe, Station, Team, Kitchen Supplier, Supplier Item/Ingredient/Catalogue and operations          | Never masquerades as a root collection manager just to reuse UI           |

The detailed manager matrix lives in `collection-manager.md`.

## Accepted deltas

| Delta                                                                | State      | Why it exists                                                                                                                                                                                                              |
| -------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public profile indexes join canonical User identity server-side      | `accepted` | Raw profile and User roots are not the public list transport                                                                                                                                                               |
| Kitchen directory joins Place and App scope through `/api/kitchens`  | `accepted` | Kitchen cards inherit bounded Place photography without copied identity in the order Kitchen card override, Place cover, then Place image; the projection declares whether the chosen asset is photographic or brand media |
| Kitchen supports an explicit authenticated admin/developer preview   | `accepted` | Operators need to inspect canonical unpublished targets without weakening the default public directory                                                                                                                     |
| Job directory applies category, publication, and tenant source scope | `accepted` | One Job entity serves multiple products while each App exposes only its configured public catalogue                                                                                                                        |
| Menu index may include upload/tool behavior                          | `accepted` | A root quick Menu can begin without a Kitchen; KitchenMenu remains a different scoped entity                                                                                                                               |
| Blog uses an editorial presentation over a bounded public projection | `accepted` | Media hierarchy is a product delta; publication filtering, a content-free index DTO, and pagination remain server-owned while article content stays detail-only                                                            |
| Some indexes are hidden from navigation                              | `accepted` | Route availability and navigation prominence are separate concerns                                                                                                                                                         |

Kitchen private preview remains fail-closed: it is non-cacheable, labels
hidden/test rows, and only returns strict Kitchen/App-support pairs in the
current ecosystem or tenant App. Hidden is a discovery state rather than route
access: hidden Live rows retain their exact detail links, while Test rows have
no public route. Local development consumes this all-Kitchen projection by
default; deployed Apps require the authenticated admin/developer preview. The
preview grants no mutation authority.

## Drift and decisions

| Difference                                                                                       | State        | Recommendation                                                                                                                             |
| ------------------------------------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Basic root directories do not share one intentional presentation classification                  | `to-confirm` | Decide per route whether it is primary discovery or a quiet utility directory; then record the reason instead of mass-converting templates |
| Supplier and Portfolio public-read declarations remain unresolved                                | `to-confirm` | Define bounded public DTOs before presenting their current root managers as a final public contract                                        |
| Property browse is public but public detail and app-visibility semantics remain partly unsettled | `drift`      | Confirm route access versus nav visibility and keep publication separate from operational access                                           |
| Menu quick-upload presentation is still evolving                                                 | `migration`  | Keep root Menu and KitchenMenu identities separate while converging the public browse/upload experience through `MenuIndex`                |
| Some older managers still differ visually outside shared directory header/state seams            | `drift`      | Converge only through `CollectionDirectoryHeader`, `CollectionDirectoryState`, and proven card contracts; do not copy whole managers       |

## Page composition

Preferred root discovery order:

1. Public heading or discovery hero.
2. Collection manager.
3. Secondary operator/onboarding doorway when useful.

A quieter directory may use:

1. `UPageHeader`.
2. Domain CTA when real.
3. Collection manager.

Both shapes must keep data cooking below the page. Shared primitives may live
inside domain components; pages should not accept generic config blobs.

## Alignment roadmap

### Now

- Preserve the manager-owned source contract and bounded projection rules.
- Keep Kitchen public and private-preview outcomes explicitly separate.
- Keep Menu route policy inside the named Menu index controller/component.

### Next

- Classify each basic root directory as discovery or utility and explain the
  choice.
- Confirm Supplier and Portfolio public DTOs.
- Resolve Property route-access versus nav-visibility semantics.
- Continue visual convergence through small core seams, not copied markup.

### Later

- Guard the page-level discovery contract only after at least two stable
  presentation classes are deliberate and named.
- Add server-side search only where bounded pagination makes local search
  misleading.
