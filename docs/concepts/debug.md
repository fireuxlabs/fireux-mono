# Debug surface map

Updated: 2026-08-26
Ref: 1813a2f9e
Role: map, not canon

## Purpose

Map how debug information should appear without becoming page noise.

## Vertical links

- Parent: components.md
- Child: pages.md

## Horizontal links

- workspace.md
- demo-data.md
- nuxt-ui.md

## Current pattern

- Use the shared FireUX debug component where available.
- Scope component diagnostics to the rendered tree beneath a Nuxt page. Every
  page-descendant component that owns a data or domain responsibility may show
  its own bounded `objects` and `derived` values. Layout chrome, globally
  mounted UI, and purely visual leaves do not gain debug panels merely because
  they are Vue components.
- Give each responsible page or component surface its own bounded debug panel
  when the diagnostics are useful. A page may therefore contain multiple
  panels when it composes multiple independently owned domains.
- Debug should be dev-only unless explicitly intended otherwise.
- Dev pages and raw dev-data APIs require the configured developer identity;
  build-time exclusion is not an authentication boundary. Dev pages render
  client-only so unauthenticated SSR cannot disclose diagnostic state.
- Dev preview/sample data belongs to authenticated dev tooling. It must not
  import workspace Demo Data, whose lazy read-only contract is separate.
- Every component-level debug payload separates source objects from derived
  values. The shared panel presents those concerns in that order and retains
  raw JSON as a secondary view.
- Every payload declares whether its objects were `fetched` by the owning
  surface or `passed` into it. The inspect view names that provenance rather
  than presenting an ambiguous object bucket.
- A page-descendant component that reads its own bounded source reports
  `object-origin="fetched"`. A child that receives records from its parent
  reports `object-origin="passed"`. In either case, its `derived` payload
  contains only values computed for that component's own presentation or
  behavior.
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

- `objects`: records and payloads fetched by the owning page/component or
  passed into the owning component by its parent.
- `derived`: interface cards, UI filters, counts, selected modes, computed labels, and route/action targets.
- Build reusable or non-trivial payloads through the typed
  `DevDebugPayload`/`defineDevDebugPayload` Core contract. Keep payload
  construction with its owning script rather than hiding data-flow decisions
  in the renderer.
- Use the `objects` and `derived` props on `DevDebugPanel`. Every caller also
  declares `object-origin="fetched"` or `object-origin="passed"`; flat
  `data` payloads are rejected.
- The inspect renderer presents record fields, colors, booleans, URLs, empty
  values, arrays, and nested objects semantically. It does not mutate or
  replace the raw JSON representation.
- When an executable runtime shape exists, pass it through `contract` for the
  whole objects payload or `contracts` keyed to named object entries. The panel
  reuses Core model-drift comparison to annotate unexpected properties,
  type mismatches, and missing or empty required paths; it never guesses a
  contract from field names and never changes the inspected payload.
- Contracts describe allowed shape separately from required data. Model keys
  may remain optional, while `requiredPaths` identifies values that must be
  present and non-empty for that surface. Arrays are inspected item by item.

## Avoid

- Adding debug panels to components outside a page's rendered ownership tree,
  or requiring purely visual leaves to invent empty data responsibilities.
- Duplicate panels for the same responsibility or panels placed far from the
  surface they diagnose.
- Page-wide debug aggregates that make the route shell know every child's
  internal state.
- Child components calculating cross-domain truth that belongs to their
  responsible parent.
- Debug UI that stays visible in production.
- Debug values that invent fallback truth.

## Delta register

| Surface                     | State      | Reason                                                                                                                                    |
| --------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `DevDebugPanel`             | `accepted` | One structured `objects`/`derived` diagnostic surface; inline by default, with launcher/open-close lifecycle for lazy expensive snapshots |
| Another generic debug panel | `drift`    | Extend the one proven surface instead of creating a competing system                                                                      |

## Alignment roadmap

- Now: use `DevDebugPanel` beside its owning page or component surface. Enable
  `launcher` and open/close events when the diagnostic payload is expensive;
  enable `include-route` when route identity is material.
- Later: guard against production rendering and unbounded closed-panel work if
  those failures recur outside Collection Managers.
