# FireUX Core Module

[![Nuxt][nuxt-src]][nuxt-href]

The foundational Nuxt module that powers all FireUX applications. Provides 25+ shared pages, 200+ components, and complete application functionality out of the box.

## ✨ What It Provides

### 📄 25+ Shared Pages

- **Authentication**: `/auth` - Complete login/signup flow
- **Dashboard**: `/dashboard/*` - User account management, profile, orders
- **Admin**: `/admin/*` - User management, blog, products, settings
- **Blog**: `/blog/*` - Content management and display
- **Products**: `/products/*` - E-commerce catalog and details
- **Design System**: `/design/*` - Typography, colors, tokens, components
- **Developer**: `/developer/*` - Skills and technology showcase

### 🧩 200+ Components

All components are **auto-imported** with `Fire` prefix:

```vue
<template>
  <!-- No imports needed! -->
  <FireButton color="primary">Click Me</FireButton>
  <FireModal v-model="isOpen">Content</FireModal>
  <FireDataTable :data="users" />
</template>
```

### 🎨 Complete Design System

- **Consistent Styling**: SCSS variables and utilities
- **Theme Support**: Works with any color scheme
- **Responsive Layouts**: Dashboard and default layouts
- **Asset Serving**: CSS/SCSS served at `/fireux-core/assets/*`

### 🔥 Firebase Integration

- **Authentication**: Login, signup, password reset
- **Firestore Database**: Real-time data synchronization
- **Auto-imported Composables**: `useCurrentUser()`, `useFirestore()`, etc.

### 💳 Stripe Integration

- **Payment Processing**: Products and subscriptions
- **Pro Upgrades**: Built-in subscription management
- **Auto-imported Utilities**: `useStripe()`, `useSubscription()`

## 🚀 Quick Setup

```bash
# Install the module
pnpm add fireux-core
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['fireux-core', 'nuxt-vuefire', '@nuxt/ui'],

  css: [
    'fireux-core/assets/css/main.css',
    'fireux-core/assets/design-system/main.scss',
  ],
})
```

```typescript
// app.config.ts - Define your theme
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue', // Your brand color
      neutral: 'gray',
    },
  },
})
```

That's it! All 25+ pages, 200+ components, and functionality are now available.

## 📁 Module Structure

```
fireux-core/
├── src/
│   ├── module.ts              # Module registration
│   ├── pages-config.ts        # Shared pages setup
│   ├── components-config.ts   # Auto-import config
│   └── runtime/
│       ├── pages/             # 25+ Vue pages
│       │   ├── auth.vue
│       │   ├── dashboard/
│       │   ├── admin/
│       │   ├── blog/
│       │   └── products/
│       ├── components/        # 200+ components
│       ├── composables/       # Firebase/Stripe utilities
│       ├── layouts/          # Responsive layouts
│       └── assets/           # Design system
└── README.md
```

## 🛠️ Development

```bash
# Test module registration
node test-reg.js

# View all available components and pages
node test-reg.js
# Choose option 1 for pages, 2 for components
```

## 📋 Key Features

- **Zero Configuration**: Works out of the box with sensible defaults
- **Theme Agnostic**: Adapts to any color scheme you define
- **TypeScript Ready**: Full type safety across all components
- **Hot Reload**: Changes reflect immediately in development
- **Production Ready**: Optimized builds for deployment

## 🎯 Perfect For

- **Rapid Prototyping**: Get a full app running in minutes
- **Consistent Design**: All apps share the same high-quality components
- **Multi-app Projects**: Share functionality across multiple applications
- **Enterprise Development**: Standardized architecture and patterns

The FireUX Core module eliminates the need to build basic application functionality from scratch, letting you focus on what makes your app unique.

---

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com

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
  <FireLogoBrand size="medium" />
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
