# FireUX Core Module

[![Nuxt][nuxt-src]][nuxt-href]

A comprehensive Nuxt module that provides a standardized foundation for rapidly building web applications with consistent architecture, styling, and features. It serves as the backbone for all FireUX platform applications.

## Features

- 🧩 &nbsp;**Component Library**: 200+ prefixed UI components with consistent styling
- 🪝 &nbsp;**Auto-imported Composables**: Authentication, data management, and more
- 🔥 &nbsp;**Firebase Integration**: Built-in authentication and Firestore database
- 💳 &nbsp;**Stripe Integration**: Payment processing for products and subscriptions
- 📝 &nbsp;**Blog System**: Content management for blog posts
- 🛒 &nbsp;**Product Management**: E-commerce capabilities
- 🎨 &nbsp;**Design System**: Consistent styling and layout utilities
- 🖼️ &nbsp;**Layout System**: Reusable layouts across applications
- 📦 &nbsp;**Asset Serving**: Centralized CSS/SCSS serving at `/fireux-core/assets/*`

## Quick Setup

Add the module to your Nuxt application:

```bash
# Install the module
pnpm add fireux-core
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['fireux-core', 'nuxt-vuefire'],

  // CSS imports
  css: [
    'fireux-core/assets/css/main.css',
    'fireux-core/assets/design-system/main.scss',
  ],

  // FireUX Core module options
  fireuxCore: {
    prefix: 'Fire', // Component prefix
  },
})
```

## Layout Integration

FireUX Core provides reusable layouts that are automatically registered when the module is loaded.

### Available Layouts

- **CoreDefault**: Basic layout with header and navigation
- **CoreDashboard**: Full dashboard layout with sidebar and navigation

### Using Layouts in Your App

Create wrapper layouts in your app's `/layouts` directory:

```vue
<!-- layouts/default.vue -->
<template>
  <CoreDefault />
</template>
```

```vue
<!-- layouts/dashboard.vue -->
<template>
  <CoreDashboard />
</template>
```

Then use them in your pages:

```typescript
// pages/index.vue
definePageMeta({
  layout: 'default',
})
```

### Layout Registration

Layouts are registered automatically using the `addLayout` function:

```typescript
addLayout(
  {
    src: join(layoutsDir, 'default.vue'),
    filename: 'fireux-core-default.vue',
  },
  'CoreDefault'
)
```

This ensures layouts are properly accessible across all consuming applications.

### Components

```vue
<template>
  <!-- FireUX Core components use the 'Fire' prefix -->
  <FireOrganismsAppOnboarding />
  <FireLogoType size="medium" />
  <!-- Nuxt UI components use the 'U' prefix -->
  <UButton>Click Me</UButton>
  <UModal>Content</UModal>
</template>
```

### Layouts

FireUX Core provides standardized layouts that can be used across all apps:

1. First, create wrapper layouts in your app:

```vue
<!-- layouts/default.vue -->
<template>
  <CoreDefault />
</template>
```

```vue
<!-- layouts/dashboard.vue -->
<template>
  <CoreDashboard />
</template>
```

2. Then use them in your pages:

```vue
<script setup>
definePageMeta({
  layout: 'default', // or 'dashboard'
})
</script>
```

This approach allows you to:

- Maintain consistent layout structure across all apps
- Centralize layout updates in the core package
- Customize layouts at the app level when needed

### Composables

```javascript
// Composables are auto-imported
const { coreUser } = await useCoreUser()
const { signIn, signOut } = useAuth()
const { uploadFile } = useFirebaseStorage()
const { posts } = await useBlogPosts()
const { products } = await useProducts()
```

## Component Hierarchy

FireUX Core follows a structured component hierarchy:

- **Atoms**: Basic UI elements (buttons, inputs, icons)
- **Molecules**: Combinations of atoms (form fields, cards)
- **Organisms**: Complex UI sections (authentication, product listings)
- **Layouts**: Page structure (headers, footers)

## Module Architecture

```
fireux-core/
├── src/
│   ├── module.ts             # Nuxt module definition
│   └── runtime/
│       ├── assets/           # Design system & styles
│       ├── components/       # UI components
│       ├── composables/      # Auto-imported utilities
│       ├── models/           # TypeScript interfaces
│       └── firebase.client.ts # Firebase integration
```

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  pnpm install
  
  # Build the module
  pnpm build
  
  # Test component registration
  node test-component-registration.js
  
  # Test composable registration
  node test-composable-registration.js
  
  # Develop with the playground
  cd ../../
  pnpm dev:playground
  ```

</details>

<!-- Badges -->

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
