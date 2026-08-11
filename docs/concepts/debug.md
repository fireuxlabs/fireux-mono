# Debug surface map
Updated: 2026-08-11
Ref: a4729c0f2
Role: map, not canon

## Purpose
Map how debug information should appear without becoming page noise.

## Vertical links

- Parent: components.md
- Child: pages.md

## Horizontal links

- console.md
- demo-data.md
- nuxt-ui.md

## Current pattern

- Use the shared FireUX debug component where available.
- Give each responsible page or component surface its own bounded debug panel
  when the diagnostics are useful. A page may therefore contain multiple
  panels when it composes multiple independently owned domains.
- Debug should be dev-only unless explicitly intended otherwise.
- Dev pages and raw dev-data APIs require the configured developer identity;
  build-time exclusion is not an authentication boundary. Dev pages render
  client-only so unauthenticated SSR cannot disclose diagnostic state.
- Dev preview/sample data belongs to authenticated dev tooling. It must not
  import console Demo Data, whose lazy read-only contract is separate.
- Debug data should separate raw objects from derived values when helpful.
- Debug state stays with the source, reader, controller, or component that owns
  the diagnosed domain. Do not pass child internals up and back down merely to
  assemble one page-wide debug object.
- A derived value belongs at the nearest responsible composition parent when it
  genuinely combines child domains. The parent may expose that value in its
  own debug panel; it does not absorb the children's source diagnostics.
- Expensive collection snapshots are active only while their panel is visible;
  closing the panel aborts the request and clears its snapshot. Parent,
  subcollection, document, and concurrency work must remain bounded.

## Good debug data

- route inputs
- fetched object(s)
- selected target/runtime
- derived flags
- collection paths or endpoint paths when debugging data flow

## Object vs derived

- `objects`: fetched records, API surfaces, hydrated rows, and direct source payloads.
- `derived`: interface cards, UI filters, counts, selected modes, computed labels, and route/action targets.
- Prefer `DevJson` `objects` and `derived` props over a single flat `data` blob when both kinds exist.

## Avoid

- Duplicate panels for the same responsibility or panels placed far from the
  surface they diagnose.
- Page-wide debug aggregates that make the route shell know every child's
  internal state.
- Child components calculating cross-domain truth that belongs to their
  responsible parent.
- Debug UI that stays visible in production.
- Debug values that invent fallback truth.

## Delta register

| Surface | State | Reason |
| --- | --- | --- |
| `DevJson` | `accepted` | Route-aware, structured `objects`/`derived` diagnostics with open/close events for lazy expensive snapshots |
| `DevFireuxDebugPanel` | `accepted` | Compact always-mounted dev card for already prepared console/runtime data |
| A third generic debug panel | `drift` | Extend one of the two proven surfaces instead of creating another competing system |

## Alignment roadmap

- Now: use `DevJson` for route/collection inspection and
  `DevFireuxDebugPanel` for concise prepared runtime state. Keep each panel
  beside its owning page or component surface.
- Next: align naming only if both components converge on the same lifecycle and
  data contract; visual similarity alone is not enough.
- Later: guard against production rendering and unbounded closed-panel work if
  those failures recur outside Collection Managers.
