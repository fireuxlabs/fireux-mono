# FireUX Console Canon
Authority: Tier2 (Operational)
Updated: 2026-03-05

## Scope
This file defines shared console behavior for `/console/**` surfaces.

## Hard Rules
1. Console is runtime-scoped and state-driven.
2. Console routes must not select runtime scope with `:id` URL selection.
3. No implicit or fallback runtime selection.
4. Missing runtime scope must be surfaced explicitly.
5. Legacy compatibility redirects are not part of canon.

## Runtime Contract Alignment
Console pages must follow `docs/runtime-contract.md`:
- Modes: `live`, `test`, `read-only`
- Read-only uses scenario registries
- Console selection is state-based, not query-based

## Ownership Pattern
- Core shell owns shared `/console` infrastructure.
- Domain runtimes own their domain console surfaces.
- App-level entry pages may orchestrate selection UX but must not violate runtime strictness.

## Route Pattern
- `/console` = shared console entry
- `/console/<domain>` = domain hub (runtime required)
- `/console/<domain>/<surface>` = operational surface bound to runtime scope
- `/console/<domain>/dev` = optional runtime snapshot/debug page

## Implementation Notes
- Keep nav labels aligned with domain language.
- Hide write actions when mode is `read-only`.
- Keep runtime selection cookies path-scoped to `/` for refresh continuity.

## Rule
Do not maintain app-specific route inventories in shared docs.
App-specific console descriptions belong in the app `/about` page.
