Composables spine map
Updated: 2026-07-18
Ref: dd0401906
Role: map, not canon

Purpose:
Map where reusable runtime logic belongs.

Vertical links:
- Parent: nuxt4.md
- Child: firestore-entity.md
- Child: console.md
- Child: server-api.md
- Child: create.md

Horizontal links:
- pages.md
- components.md
- runtime-package.md

Core principle:
Composables should name a real seam. Do not create a composable just to hide a messy file.

Common buckets:
- `composables/fireux/firestore/<entity>` for stored entity stacks.
- `composables/fireux/console/<entity>` for console workspaces.
- `composables/fireux/<entity>` for normal entity runtime helpers used by
  root routes, tenant routes, and app surfaces when they are not specifically
  Firestore or console seams.
- `composables/fireux/app/*` for app-level shared runtime concerns.

Naming note:
- Avoid adding new `composables/fireux/public/<entity>` buckets by default.
  Root/public-facing routes are usually the normal entity doorway; use explicit
  `console` or `firestore` buckets only when the seam really is scoped to that
  system. Existing `public/menu` files are transitional menu doorway helpers
  and should collapse into the menu/kitchen spine as those seams are cleaned.

Naming notes:
- `useXCreate`: create an entity/record through a client runtime seam when the
  work is mostly Firestore data. See create.md before using it for upload or
  provider transactions.
- `useXFetch`: fetch one entity or route-selected entity.
- `useXCollection`: fetch a list/collection and expose normalized items,
  `count`, `pending`, `error`, and `outcome`. Keep raw read state separate from
  UI search/filter emptiness.
- `useXInterface`: map entity data into UI-ready surfaces.
- `useXConsole`: selected console runtime for a domain.
- `useXConsoleIndex`: index page adapter over shared `useConsoleIndex`.

Avoid:
- `facade`
- `stack`
- `manager`
- `processor`
- `handler`
- `resolver`
- `runtime-*`

Open questions:
- Some older domain composables may still need simplification into clearer input/process/output seams.
