# Design Packs

Authority: Operational
Updated: 2026-05-21
Scope: cross-runtime design tokens for app, ecosystem, tenant, and extension surfaces.

## Rule

FireUX design packs are reusable visual tokens for runtime surfaces.

Core owns design pack resolution. Ecosystems and apps provide packs. Extensions consume resolved surface tokens.

## Shape

Use surface-specific packs when the style belongs to a particular public/runtime surface:

```txt
design_packs.public_menu
designPacks.publicMenu
```

Legacy surface fields such as `public_menu_design` may be read during migration, but new work should prefer `design_packs.<surface>`.

## Ownership

- Core: resolver, preset names, token normalization, CSS variable mapping.
- Ecosystem: inherited default packs for child apps.
- Tenant/app: local override packs when the app is the closest owner of the visual treatment.
- Extension: consume tokens and render the surface; do not hardcode tenant-specific style.

## Promotion

When a console-managed entity becomes a tenant app, local app packs are allowed as the first safe step. Once the entity/app relationship is proven, promote the pack into the ecosystem-owned source of truth rather than duplicating style in every app page.
