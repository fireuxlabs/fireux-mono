# app.vue alignment report (updated 2025-09-09)

All apps now delegate their `app.vue` to a single canonical shell component in core. This removes duplication and keeps behavior consistent.

## Canonical shell

- Component: `packages/core/fireux-core/src/runtime/components/app/FireuxAppShell.vue`
- Features:
  - ClientOnly + Teleport debug overlay with `<AppDebug />` (pinned via `.debug-overlay`).
  - `<NuxtLayout><NuxtPage /></NuxtLayout>` for layout/content.
  - `<UModal :open="!isInitialized.value" prevent-close>` gating until `useApp()` reports initialized; body renders `<OrganismsAppOnboarding />`.
  - `useHead` adds the Web App Manifest link.

## Per-app `app.vue` wrappers (current contents)

Each app is a thin wrapper that renders the core shell via path-prefixed auto-import:

### projects/fireux/fireux-app/app/app.vue

```vue
<template>
  <AppFireuxAppShell />
  <!-- Path-prefixed auto-import: components/app/FireuxAppShell.vue -->
</template>

<script setup lang="ts">
// No local logic; all behavior lives in core shell
</script>
```

### projects/misebox/misebox-app/app/app.vue

```vue
<template>
  <AppFireuxAppShell />
  <!-- Path-prefixed auto-import: components/app/FireuxAppShell.vue -->
</template>

<script setup lang="ts">
// No local logic; all behavior lives in core shell
</script>
```

### projects/misebox/niederhorn/app/app.vue

```vue
<template>
  <AppFireuxAppShell />
  <!-- Path-prefixed auto-import: components/app/FireuxAppShell.vue -->
</template>

<script setup lang="ts">
// No local logic; all behavior lives in core shell
</script>
```

### projects/cleanbox/cleanbox-app/app/app.vue

```vue
<template>
  <AppFireuxAppShell />
  <!-- Path-prefixed auto-import: components/app/FireuxAppShell.vue -->
</template>

<script setup lang="ts">
// No local logic; all behavior lives in core shell
</script>
```

### projects/cleanbox/richies-reinigung/app/app.vue

```vue
<template>
  <AppFireuxAppShell />
  <!-- Path-prefixed auto-import: components/app/FireuxAppShell.vue -->
</template>

<script setup lang="ts">
// No local logic; all behavior lives in core shell
</script>
```

### projects/fireux/tennant/app/app.vue

```vue
<template>
  <AppFireuxAppShell />
  <!-- Path-prefixed auto-import: components/app/FireuxAppShell.vue -->
</template>

<script setup lang="ts">
// No local logic; all behavior lives in core shell
</script>
```

## Notes

- The debug overlay uses `<AppDebug />` from core shell. If a project needs a different dev surface, override in core or add a conditional.
- Manifest link and app init gating now live in one place (the shell), ensuring identical behavior across apps.
