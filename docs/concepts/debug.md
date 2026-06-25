Debug surface map
Updated: 2026-06-17
Ref: 37fb262f0
Role: map, not canon

Purpose:
Map how debug information should appear without becoming page noise.

Vertical links:
- Parent: components.md
- Child: pages.md

Horizontal links:
- console.md
- nuxt-ui.md

Current pattern:
- Use the shared FireUX debug component where available.
- Prefer one debug panel per page or surface.
- Debug should be dev-only unless explicitly intended otherwise.
- Debug data should separate raw objects from derived values when helpful.

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
