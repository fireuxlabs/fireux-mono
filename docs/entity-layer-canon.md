# Entity Layer Canon
Authority: Tier2 (Operational alignment)
Updated: 2026-03-05

Purpose: keep entity modeling aligned and prevent layer drift.

This guide is operational and must not conflict with Tier1 canon:
- `docs/fireux-canon.md`
- `docs/runtime-contract.md`

## Locked Naming
- `Core`: cross-app identity record (global truth)
- `Overlay`: app-local data layer (private-by-default, domain-specific)
- `PublicProjection`: explicit safe share/SEO surface (optional)

## Layer Rules
1. Core is minimal by default.
2. Overlay holds real domain shape.
3. PublicProjection is explicit and safe-only.
4. Never treat Core as public by default.
5. Do not force all entities into three layers.

## Allowed Strategies
1. `Core + Overlay`
Use when identity must be stable across apps/ecosystems.

2. `Overlay-only`
Use for app-local operational entities.

3. `Core-only`
Use for thin global markers with no app-local operational surface yet.

4. `+ PublicProjection` (optional)
Add only when SEO/share/public listing is required.

## Canonical Path Patterns
- Core: `/<entityPlural>/{id}`
- Overlay: `/apps/{appId}/<entityPlural>/{id}`
- PublicProjection: `/public/<entityPlural>/{id}` or `/apps/{appId}/public/<entityPlural>/{id}`

## Generic Entity Classes
- Identity records (users, apps, organizations, places): usually `Core + Overlay`
- Operational records (tasks, compliance events, incidents, orders, assignments): usually `Overlay-only`
- Thin markers (index/bridge records): often `Core-only` initially
- Public listing cards: `PublicProjection` only when explicitly needed

## Model Header Template
Add this to model files to make drift checks mechanical:

```ts
/**
 * Layer Strategy: Core+Overlay | Overlay-only | Core-only
 * Core Path: /<entityPlural>/{id}
 * Overlay Path: /apps/{appId}/<entityPlural>/{id}
 * PublicProjection Path: /public/<entityPlural>/{id} (optional)
 * Notes: <entity-specific constraints>
 */
```

## Drift Checklist
Before changing any model:
1. Confirm strategy from this guide.
2. Verify path shape matches strategy.
3. Keep sensitive fields out of PublicProjection.
4. Avoid introducing governance fields into generic bases.
5. If strategy changes, update this file and relevant extension contracts in the same PR.
