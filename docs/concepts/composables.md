Composables spine map
Updated: 2026-06-17
Ref: 37fb262f0
Role: map, not canon

Purpose:
Map where reusable runtime logic belongs.

Vertical links:
- Parent: nuxt4.md
- Child: firestore-entity.md
- Child: console.md
- Child: server-api.md

Horizontal links:
- pages.md
- components.md
- runtime-package.md

Core principle:
Composables should name a real seam. Do not create a composable just to hide a messy file.

Common buckets:
- `composables/fireux/firestore/<entity>` for stored entity stacks.
- `composables/fireux/console/<entity>` for console workspaces.
- `composables/fireux/public/<entity>` for public-route behavior.
- `composables/fireux/app/*` for app-level shared runtime concerns.

Naming notes:
- `useXFetch`: fetch one entity or route-selected entity.
- `useXCollection`: fetch a list/collection.
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
