# 🔥 FireUX Core Module

[![Nuxt][nuxt-src]][nuxt-href]

_The foundational Nuxt 3 module powering the entire FireUX ecosystem_

## 🏗️ Module Architecture

Complete Nuxt module providing everything needed for service business platforms:

- **25+ Shared Pages** - Authentication, dashboard, admin, blog, products
- **200+ Auto-imported Components** - Full UI library with `Fire*` prefix
- **Firebase Integration** - Auth, Firestore, real-time composables
- **Stripe Integration** - Payments, subscriptions, pro features
- **Design System** - SCSS variables, layouts, responsive utilities
- **TypeScript First** - Full type safety across all features

## 🚀 Installation & Setup

### In a Nuxt App

```bash
# Install the module
pnpm add fireux-core

# Add to nuxt.config.ts
export default defineNuxtConfig({
  modules: ['fireux-core']
})
```

### Auto-Import System

All components and composables are automatically available:

```vue
<template>
  <!-- Components auto-imported with Fire prefix -->
  <FireButton @click="handleClick">Action</FireButton>
  <FireModal v-model="showModal">Content</FireModal>
  <FireDataTable :data="tableData" />
</template>

<script setup>
// Composables auto-imported
const user = useCurrentUser()
const { data } = useFirestore('users')
const { isSubscribed } = useSubscription()
</script>
```

```bash
## 📁 Module Structure

```

fireux-core/src/
├── module.ts # Main module definition
├── pages-config.ts # Shared page registration  
├── components-config.ts # Auto-import configuration
├── composables-config.ts # Utility auto-imports
└── runtime/
├── pages/ # 25+ shared Vue pages
│ ├── auth.vue # Authentication flow
│ ├── dashboard/ # User account pages
│ ├── admin/ # Management interface
│ ├── blog/ # Content system
│ └── products/ # E-commerce pages
├── components/ # 200+ auto-imported components
│ ├── atoms/ # Basic UI elements
│ ├── molecules/ # Composed components  
 │ ├── organisms/ # Complex UI sections
│ └── templates/ # Page-level layouts
├── composables/ # Auto-imported utilities
│ ├── firebase/ # Auth & database
│ ├── stripe/ # Payment processing
│ └── app/ # Application state
├── layouts/ # Page layout system
│ ├── default.vue # Standard layout
│ └── dashboard.vue # Admin/user layout
└── assets/ # Design system & styles
├── css/ # Base styles
└── design-system/ # SCSS variables

````

## 🎯 Core Features

### Authentication System
Complete Firebase Auth integration:

```vue
<script setup>
const user = useCurrentUser()
const { signIn, signOut, signUp } = useFirebaseAuth()

// Reactive user state across entire app
watch(user, (newUser) => {
  if (newUser) {
    navigateTo('/dashboard')
  }
})
</script>
````

### Database Integration

Real-time Firestore composables:

```vue
<script setup>
// Auto-synced reactive data
const { data: posts } = useFirestore('posts')
const { data: products } = useFirestore('products')

// CRUD operations
const { add, update, remove } = useFirestoreCollection('posts')
</script>
```

### Payment Processing

Stripe integration for subscriptions:

```vue
<script setup>
const { isSubscribed, subscribe, cancelSubscription } = useSubscription()
const { createPaymentIntent } = useStripe()

// Handle subscription upgrades
async function upgradeToPro() {
  await subscribe('pro-plan')
}
</script>
```

## 🎨 Design System

### Component Library

All components follow atomic design principles:

```vue
<template>
  <!-- Atoms -->
  <FireButton variant="primary">Click Me</FireButton>
  <FireInput v-model="email" type="email" />

  <!-- Molecules -->
  <FireLoginForm @submit="handleLogin" />
  <FireProductCard :product="product" />

  <!-- Organisms -->
  <FireProductGrid :products="products" />
  <FireDashboardSidebar />
</template>
```

### Theme System

Easy customization via app.config.ts:

```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald', // Your brand color
      neutral: 'slate',
    },
    theme: 'dark', // Light/dark mode support
  },
})
```

## 📄 Page System

### Automatic Page Registration

All pages are automatically available in consuming apps:

```
/auth              # Login/signup flow
/dashboard         # User account hub
/dashboard/profile # Profile management
/dashboard/orders  # Order history
/admin             # Admin dashboard
/admin/users       # User management
/admin/products    # Product management
/blog              # Blog listing
/blog/[slug]       # Individual posts
/products          # Product catalog
/products/[id]     # Product details
```

### Custom Page Integration

Add your own pages alongside shared ones:

```vue
<!-- app/pages/index.vue - Your custom landing page -->
<template>
  <div>
    <h1>Welcome to MyApp</h1>
    <!-- Use shared components -->
    <FireProductGrid :products="featuredProducts" />
  </div>
</template>
```

## 🛠️ Development

## 🧪 Development & Testing

### Module Development

```bash
# Test module registration
node test-reg.js

# View all available components and pages
node test-reg.js
# Choose option 1 for pages, 2 for components

# Test in playground environment
cd ../../playground
pnpm dev:playground
```

### Integration Testing

```bash
# Verify module works across all apps
pnpm dev:fireux     # Test in FireUX app
pnpm dev:cleanbox   # Test in CleanBox app
pnpm dev:misebox    # Test in Misebox app
```

## 📚 Documentation

### Three-Document System

- **[README.md](README.md)** - Technical API and feature documentation
- **[copilot.md](copilot.md)** - Development workflows and internal architecture
- **[BUSINESS.md](BUSINESS.md)** - Business value and revenue impact analysis

### Related Documentation

- **[Packages Overview](../README.md)** - Package development guide
- **[Root Ecosystem](../../README.md)** - Monorepo overview
- **[Projects Guide](../../projects/README.md)** - App development

## 🎯 Key Features

- **Zero Configuration**: Works out of the box with sensible defaults
- **Theme Agnostic**: Adapts to any color scheme you define
- **TypeScript Ready**: Full type safety across all components
- **Hot Reload**: Changes reflect immediately in development
- **Production Ready**: Optimized builds for deployment

## 💡 Perfect For

- **Rapid Prototyping**: Get a full app running in minutes
- **Consistent Design**: All apps share the same high-quality components
- **Multi-app Projects**: Share functionality across multiple applications
- **Enterprise Development**: Standardized architecture and patterns

The FireUX Core module eliminates the need to build basic application functionality from scratch, letting you focus on what makes your app unique.

---

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com

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
