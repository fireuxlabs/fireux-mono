# Layout Integration Solution

## Overview

This document summarizes the solution implemented to integrate layouts from the `fireux-core` module into the Nuxt applications.

## Key Components

### 1. Module Layout Registration

In `layouts-config.ts`, layouts are registered using the `addLayout` function:

```typescript
addLayout(
  {
    src: join(layoutsDir, 'default.vue'),
    filename: 'fireux-core-default.vue',
  },
  'CoreDefault'
)

addLayout(
  {
    src: join(layoutsDir, 'dashboard.vue'),
    filename: 'fireux-core-dashboard.vue',
  },
  'CoreDashboard'
)
```

This ensures that layouts are properly registered with Nuxt and can be referenced by name.

### 2. Package Exports

The `package.json` properly exports layouts and assets:

```json
"exports": {
  ".": {
    "import": "./src/module.ts",
    "types": "./src/module.ts"
  },
  "./layouts/*": "./src/runtime/layouts/*",
  "./assets/*": "./src/runtime/assets/*"
}
```

### 3. Asset Configuration

Assets are exposed through aliases and public assets config:

```typescript
// Expose assets directory for CSS imports
nuxt.options.alias['fireux-core/assets'] = resolvePath('./runtime/assets')

// Also expose assets as public assets
config.publicAssets.push({
  dir: resolvePath('./runtime/assets'),
  baseURL: '/fireux-core/assets',
})
```

### 4. App Integration

Each app includes wrapper layouts in their `/layouts` directory:

```vue
<!-- /layouts/default.vue -->
<template>
  <CoreDefault />
</template>

<!-- /layouts/dashboard.vue -->
<template>
  <CoreDashboard />
</template>
```

Pages can then use these layouts with:

```typescript
definePageMeta({
  layout: 'default', // or 'dashboard'
})
```

### 5. CSS Integration

CSS files are properly imported in each app's `nuxt.config.ts`:

```typescript
css: [
  'fireux-core/assets/css/main.css',
  'fireux-core/assets/design-system/main.scss',
],
```

## Testing

A test page has been created in each app to verify layout functionality:

- `/test-layouts` - Tests both default and dashboard layouts

## Conclusion

The layout system now works across all three apps:

- Cleanbox
- FireUX
- Misebox

The layouts are properly registered, styled, and can be referenced by name in the page metadata.
