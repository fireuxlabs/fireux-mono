Debug surface map
<!-- Concurrent edit — 2026-07-20 16:18 CEST — Repo Efficiency Pass 1 of 6: record the authenticated client-only dev-data boundary. -->
<!-- Concurrent edit — 2026-07-20 17:05 CEST — Demo Data Spine pass: separate dev previews from console Demo Data. -->
Updated: 2026-07-20
Ref: 8d83d3fa7
Role: map, not canon

Purpose:
Map how debug information should appear without becoming page noise.

Vertical links:

- Parent: components.md
- Child: pages.md

Horizontal links:

- console.md
- demo-data.md
- nuxt-ui.md

Current pattern:

- Use the shared FireUX debug component where available.
- Prefer one debug panel per page or surface.
- Debug should be dev-only unless explicitly intended otherwise.
- Dev pages and raw dev-data APIs require the configured developer identity;
  build-time exclusion is not an authentication boundary. Dev pages render
  client-only so unauthenticated SSR cannot disclose diagnostic state.
- Dev preview/sample data belongs to authenticated dev tooling. It must not
  import console Demo Data, whose lazy read-only contract is separate.
- Debug data should separate raw objects from derived values when helpful.
- Expensive collection snapshots are active only while their panel is visible;
  closing the panel aborts the request and clears its snapshot. Parent,
  subcollection, document, and concurrency work must remain bounded.

Good debug data:

- route inputs
- fetched object(s)
- selected target/runtime
- derived flags
- collection paths or endpoint paths when debugging data flow

Object vs derived:

- `objects`: fetched records, API surfaces, hydrated rows, and direct source payloads.
- `derived`: interface cards, UI filters, counts, selected modes, computed labels, and route/action targets.
- Prefer `DevJson` `objects` and `derived` props over a single flat `data` blob when both kinds exist.

Avoid:

- Multiple scattered debug panels on one page.
- Debug UI that stays visible in production.
- Debug values that invent fallback truth.

Open questions:

- DevJson vs DevFireuxDebugPanel naming and usage can be unified further.
