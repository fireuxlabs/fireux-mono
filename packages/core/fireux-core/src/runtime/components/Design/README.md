# Design Components

Authority: Operational
Updated: 2026-06-07
Scope: `packages/core/fireux-core/src/runtime/components/Design`.

Design components render reusable visual primitives.

Apps and ecosystems own the actual brand values. Core owns generic display components that can render those values without knowing the tenant, venue, or ecosystem.

## Current Components

- `PaletteStrip.vue`
  Renders a compact list of named colour swatches.

## Rule

Do not put app-specific colours, logos, or copy in this directory.

Use app or ecosystem assets/config for values, then pass those values into the core design component.
