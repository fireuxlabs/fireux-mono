# FireUX Core Module

[![Nuxt][nuxt-src]][nuxt-href]

A comprehensive Nuxt module that provides a standardized foundation for rapidly building web applications with consistent architecture, styling, and features. It serves as the backbone for all FireUX platform applications.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)

## Features

- 🧩 &nbsp;**Component Library**: Prefixed UI components with consistent styling
- 🪝 &nbsp;**Auto-imported Composables**: Authentication, data management, and more
- 🔥 &nbsp;**Firebase Integration**: Built-in authentication and Firestore database
- 💳 &nbsp;**Stripe Integration**: Payment processing for products and subscriptions
- 📝 &nbsp;**Blog System**: Content management for blog posts
- 🛒 &nbsp;**Product Management**: E-commerce capabilities
- 🎨 &nbsp;**Design System**: Consistent styling and layout utilities

## Quick Setup

Add the module to your Nuxt application:

```bash
# Install the module
pnpm add fireux-core

# Configure in nuxt.config.ts
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['fireux-core', 'nuxt-vuefire'],

  // FireUX Core module options
  fireuxCore: {
    prefix: 'Fire', // Component prefix
  },
})
```

## Usage

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
