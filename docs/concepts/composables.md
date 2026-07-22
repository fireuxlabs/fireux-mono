Composables spine map
<!-- Concurrent edit — 2026-07-21 16:00 CEST — Place onboarding reconciliation: map shared and domain onboarding composables. -->
<!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: require domain adapters to compose their named create seams. -->
Updated: 2026-07-21
Ref: b020f805e
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
- `useOnboarding`: domain-free staged-flow mechanics only. It must not own an
  entity draft, provider call, persistence, copy, or completion route.
- `useXOnboarding`: named domain adapter over `useOnboarding`; owns its draft,
  hydration, validation, and completion result. It calls `useXCreate` for
  preview and completion transport instead of owning a second mutation client.
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

Reactive ownership:
- A composable that exposes a live collection or document read constructs that
  binding once during setup and passes reactive source inputs into it.
- Static fetch factories are setup-time conveniences only. Do not invoke them
  from `computed`, templates, or render-time helpers; that creates subscriptions
  without a stable owner.
- A reconciliation watcher may own a dynamic keyed cache only when it reuses
  surviving bindings, stops removed bindings, disposes the complete cache with
  its scope, and keeps derived/computed mapping constructor-free.

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
