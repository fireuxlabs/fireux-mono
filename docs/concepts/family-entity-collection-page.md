# Entity Collection Page family

Updated: 2026-11-23
Role: map, not canon

An Entity Collection Page presents an owned collection, such as Places, Jobs,
or Menus. [Lasagne](lasagne.md) guides composition,
[Entity ownership](entities.md) identifies the data owner, and
[Workspace](workspace.md) defines selection and access for operator surfaces.

## Required responsibilities

- **Route and page.** The App owns route policy, metadata, SEO and visible
  composition. Use the existing Entity reader for the primary collection.
  Acquire it once per page scope. A reusable Directory may own acquisition
  when several routes or Apps use the same workflow. Pass supplied records
  to presentation through named props where that boundary helps.
- **Reads and authority.** Entity readers own data scope, access, publication
  eligibility, errors and authoritative read outcomes. Root reads return the
  canonical Entity. A server reader can supply a bounded directory projection
  when joins, server credentials, cross-database authority or SSR status
  require it. A live client reader works where Rules expose the intended
  records and the screen needs reactivity. Scoped records keep their parent
  owner. Search, layout and selection grant no additional access.
- **Search and filtering.** Use domain-owned fields and distinguish local
  filters over acquired rows from server filters over the complete scope.
  App search, for example, uses name, short name, tagline, description and
  Ecosystem ID. Counts and empty results should reflect the filters and
  disclose when pages remain unloaded. Keep controls available when changing
  a filter can recover an empty result.
- **Pagination.** The reader owns cursors, loading more and the validity of
  retained rows after a failed next-page request. A page can show those rows
  and a retry when the reader still considers them valid. A later read failure
  or a scope change retains its own outcome. Show pagination only when the
  reader supplies it.
- **States and actions.** Make loading, empty, unavailable and error states
  meaningful for the screen. Preserve retry, refresh and HTTP status where
  the route already provides them. Keep the current-Entity or create action
  when it serves a real workflow. Trusted domain commands own mutations.
- **SEO.** The page or its coordinator supplies titles, descriptions and
  structured data through the existing SEO integration. Derive structured
  facts from the same authorized read where appropriate. Preserve each App's
  route scope and SEO policy. The existing `useSeo` builder precedence and
  ordinary JSON-LD inputs still apply.

## Presentation choices

Nuxt UI owns presentation. Render the records directly with the list, grid,
card, table or other native components that suit the task. Headings, media,
record-derived badges, named children and grid/list toggles are choices for
each surface. Keep layout responsive, controls accessible and content truthful
when a field is absent. App-branded experiences such as Yellow Velo Product
and Interlaken Marketplace own their framing and presentation.

FireUX owns data access, selection and domain behavior. A collection page has
no required component chain or component family. Existing Card, Cell, Pill,
Preview and Profile components may continue serving their consumers. Collection
Manager and the FireCollectionPage shell are retired patterns for this family.
A presented row can use its Entity record or a bounded projection it actually
needs. Extract shared presentation only when real consumers share a
responsibility.

Existing helpers such as `useCollectionPage`, `useCollectionSearch`,
`FireState`, `FireCollectionPagination` and `FireCollectionCell` remain
available to their consumers. Use a helper where it earns its place. Keep
dev-only diagnostics at the nearest owner of the facts they show.

## Source examples

- [Kitchens](../../packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/index.vue)
  shares its existing collection presentation with the Misebox landing. Its
  [server reader](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/index/read.ts)
  supplies bounded Kitchen directory entries with Place and discovery facts.
- [Menus](../../packages/extensions/fireux-kitchens/src/runtime/pages/menus/index.vue)
  uses its own scoped directory transport and contextual filters. See the
  [Menu family](family-menu.md) for those read contracts.
- [Ecosystem Apps](../../packages/extensions/fireux-ecosystem/src/runtime/pages/apps/index.vue)
  uses an Ecosystem scope. The [FireUX Apps page](../../projects/fireux/fireux-app/app/pages/apps/index.vue)
  owns platform scope, page copy and structured SEO.

## Naming and verification

Use Entity Collection Page for the route family. Name components for the work
they actually perform. Reserve `published` for publication eligibility and
`protected` for restricted access. Do not use `Public` to name ordinary
website routes, Entities, endpoints, DTOs or components. Protocol terms such
as `Cache-Control: public` retain their meaning. Existing registered names
change with their consumers. See the
[runtime convention](runtime-filesystem.md#domain-component-surfaces).

When a collection page changes, verify its actual consumers, including shared
landing surfaces where applicable. Check access, scope changes, meaningful
states, filters, counts, real pagination and SEO as relevant. Judge layout
and interaction in the rendered App.
