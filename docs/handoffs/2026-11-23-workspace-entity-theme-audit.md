# Codex handoff — Workspace Entity Theme audit

Date: 2026-11-23
Status: Audit and proposal only. No migration or runtime changes authorised.

## User decision

A Workspace Entity can have its own visual identity, which should travel into its public page and appear subtly in directories, collection managers, cells and pills. This does **not** theme the Workspace management UI. The shared contract should be named simply `Theme` and live in the shared `fireux-workspace` package if the dependency/ownership audit supports that location. Do not create a parallel theme system.

Start with primary/accent colour and complementary background, while preserving room for typography. The renderer decides how much of the Entity's theme to express; an entity's theme must not override the entire collection manager containing other entities.

## Existing evidence to inspect

- `packages/core/fireux-core/src/types/theme.ts`: currently defines `Theme`, `ThemePalette`, `WorkspaceTheme`, `WorkspacePalette`, `AppTheme`, `AppTypography` and palette layers.
- `packages/core/fireux-core/src/runtime/utils/theme-palette.ts`: strict palette validation, palette projection, sparse App layers and resolution.
- `docs/concepts/theming.md`: progressive Place → Kitchen → App ownership and public presentation boundaries.
- `packages/extensions/fireux-kitchens/src/runtime/menu/server/payload/theme.ts` and `menu/composables/useMenuThemeSurface.ts`: menu theme consumers.
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/server/identity/theme.ts` and `app-theme.ts`: existing protected theme commands.
- `packages/extensions/fireux-places/src/runtime/place/models/place.model.ts`: `media_backdrop_color` and sparse `brand_palette` are existing Place inputs, not a new Workspace palette authority.
- `docs/handoffs/2026-11-23-walk-mode-workspace-identity-common-contract.md` and `docs/handoffs/2026-11-23-workspace-entity-alignment.md`: current identity/ownership work; coordinate with it.

## Audit scope

Inspect all six Workspace Entity families: Kitchen, Supplier, Business, Project, Portfolio and Property. For each, report (1) current theme/appearance fields, (2) persisted owner and inheritance from Place/Business/App, (3) existing editor and trusted mutation, (4) public and collection consumers, and (5) missing pieces. Distinguish type declaration from actual persistence and rendered functionality.

Search every import/use of `Theme`, `WorkspaceTheme`, `WorkspacePalette`, `AppTheme`, and related helpers. Check dependency direction before proposing relocation from Core to Workspace; Core must not accidentally depend on an extension. Assess whether the existing Core `Theme` can be reused as-is, moved, or should remain a primitive with a Workspace-owned interface. Do not rename types blindly or introduce duplicate authorities.

## Requested deliverable

Return a concise current-state matrix for six entities, a dependency-safe recommendation for the canonical `Theme` type and package path, exact impacted files/consumers, and a minimal phased implementation plan: shared contract → one entity proof (Kitchen) → subtle directory/card/cell/pill projection → other entities. Preserve contrast/accessibility and fallbacks. Keep App theme and Place identity ownership separate.

Audit only. Do not perform data migration, deploy, or rewrite the six families without review. Verify findings against latest local working tree and avoid overwriting concurrent work.
