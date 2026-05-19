# FireUX Console Canon
Authority: Tier2 (Operational)
Updated: 2026-03-28

## Scope
This file defines shared console behavior for `/console/**` surfaces.

## Hard Rules
1. Console is runtime-scoped and state-driven.
2. Console routes must not select runtime scope with `:id` URL selection.
3. No implicit or fallback runtime selection.
4. Missing runtime scope must be surfaced explicitly.
5. Legacy compatibility redirects are not part of canon.
6. Visible console families are declared by app config, not inferred from raw route presence.

## Runtime Contract Alignment
Console pages must follow `docs/runtime-contract.md`:
- Modes: `live`, `test`, `demo`
- Demo uses scenario registries
- Console selection is state-based, not query-based

## Ownership Pattern
- Core shell owns shared `/console` infrastructure.
- Core owns system console main pages.
- Domain runtimes own their domain console surfaces.
- App config decides which console families are visible in that app.
- App-level entry pages may orchestrate selection UX but must not violate runtime strictness.

## Route Pattern
- `/console` = shared console entry
- `/console/<domain>` = domain hub (runtime required)
- `/console/<domain>/<surface>` = operational surface bound to runtime scope
- `/console/<domain>/dev` = optional runtime snapshot/debug page

Visibility rule:
- `/console` must only list families declared in the current app's `consoles`
- a family can exist in shared code without being visible in every app

## Implementation Notes
- Keep nav labels aligned with domain language.
- Hide write actions when mode is `demo`.
- Keep runtime selection cookies path-scoped to `/` for refresh continuity.

## Rule
Do not maintain app-specific route inventories in shared docs.
App-specific console descriptions belong in the app `/about` page.
