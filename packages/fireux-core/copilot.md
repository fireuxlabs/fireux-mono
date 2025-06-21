# ⚡ Core Module Dev Relay - CORE

## File Locations

```
src/runtime/
├── pages/           # 25+ shared pages
├── components/      # 200+ auto-imported (Fire* prefix)
├── composables/     # Auto-imported utilities
├── layouts/         # App layouts
└── assets/         # Design system
```

## Quick Tasks

```bash
# New shared page
Add: src/runtime/pages/newpage.vue
Register: src/pages-config.ts → extendPages()

# New component
Add: src/runtime/components/organisms/NewFeature.vue
→ Auto-imports as <FireNewFeature>

# New composable
Add: src/runtime/composables/useNewThing.ts
→ Auto-available everywhere

# Config files
pages-config.ts     # Page routing
components-config.ts # Component auto-imports
module.ts           # Main orchestration
```

## Navigation Relay

**Back to packages level?** → `../copilot.md`
**Working on specific app?** → `../../projects/copilot.md`
**Need architecture overview?** → `README.md`

- `src/components-config.ts` - Component auto-import configuration
- `src/composables-config.ts` - Composable auto-import setup
- `src/layouts-config.ts` - Layout registration
- `src/assets-config.ts` - CSS/SCSS asset serving

## 🧭 Navigation & Routing System ✅ LOCKED IN

### Core Architecture

**useRoutes(publicRoutes, privateRoutes)** - Main navigation composable

**Location:** `src/runtime/composables/utils/useRoutes.ts`

```typescript
// ✅ Final Working Pattern
const { appUser } = useAppUser()
const jobPublicRoutes = getPublicJobRoutes() || []
const jobPrivateRoutes = appUser.value ? getPrivateJobRoutes() || [] : []
const routes = useRoutes(jobPublicRoutes, jobPrivateRoutes)
```

### Route Structure Output

- **menuBarLinks**: `[...system, ...publicRoutes]` - Desktop top navigation
- **mobileLinks**: `[...publicMenu, ...privateMenu, ...userGroup, ...adminGroup]` - Mobile menu
- **dashboardLinks**: `[...privateMenu, ...userGroup, ...adminGroup]` - Dashboard sidebar

### Authentication-Based Visibility

- **System Routes**: Always visible (App, Products, Blog)
- **Public Routes**: Always visible (Jobs, etc.)
- **Private Routes**: Only when `appUser.value` exists
- **User Group**: Nested dashboard routes when authenticated
- **Admin Group**: Admin features when user has admin role

### Layout Implementation

```vue
<!-- All Apps Use This Pattern -->
<template>
  <CoreDefault :routes="routes" />
</template>
<script setup>
const { appUser } = useAppUser()
const modulePublicRoutes = getPublicRoutes() || []
const modulePrivateRoutes = appUser.value ? getPrivateRoutes() || [] : []
const routes = useRoutes(modulePublicRoutes, modulePrivateRoutes)
</script>
```

## 📁 Runtime Structure

```
runtime/
├── pages/                   # 25+ shared Vue pages
│   ├── auth.vue            # Authentication
│   ├── dashboard/          # User dashboard pages
│   ├── admin/              # Admin panel pages
│   ├── blog/               # Blog system
│   ├── products/           # E-commerce pages
│   └── design/             # Design system documentation
├── components/             # 200+ auto-imported components
│   ├── atoms/              # Basic UI elements
│   ├── molecules/          # Composite components
│   └── organisms/          # Complex components
├── composables/            # Auto-imported utilities
│   ├── auth/               # Authentication utilities
│   ├── data/               # Firestore operations
│   ├── payments/           # Stripe integration
│   └── utils/              # General utilities
├── layouts/                # Application layouts
│   ├── default.vue         # Standard layout
│   └── dashboard.vue       # Dashboard layout
└── assets/                 # Design system
    ├── css/                # Compiled CSS
    └── design-system/      # SCSS source
```

## 🔧 Development Workflow

### Testing Module Registration

```bash
# Test all module exports and registration
node test-reg.js

# Options:
# 1. pages - View all registered pages
# 2. components - View all auto-imported components
# 3. modules - View module configuration
# 4. composables - View auto-imported composables
# 5. layouts - View available layouts
```

### Adding New Shared Pages

1. **Create Page**: Add Vue file to `src/runtime/pages/`
2. **Register Route**: Add to `modulePages` array in `src/pages-config.ts`
3. **Test Registration**: Run `node test-reg.js` and select option 1
4. **Verify**: Check that page appears in test output
5. **Test in App**: Available immediately in all apps

### Adding New Components

1. **Create Component**: Add to `src/runtime/components/` with `Fire` prefix
2. **Auto-import**: Configured automatically via `components-config.ts`
3. **Test**: Use in playground or any app without imports
4. **Document**: Add to design system if needed

### Adding New Composables

1. **Create Function**: Add to appropriate `src/runtime/composables/` directory
2. **Export**: Add to index file in composables directory
3. **Auto-import**: Configured via `composables-config.ts`
4. **Test**: Use in components with `use` prefix

## 📋 Best Practices

### Page Development

- **Route Structure**: Use descriptive, RESTful routes
- **Page Meta**: Include `definePageMeta` for layout/auth requirements
- **Composables**: Leverage auto-imported utilities for Firebase/Stripe
- **Styling**: Use design system classes and theme colors

### Component Development

- **Naming**: Always use `Fire` prefix (e.g., `FireButton.vue`)
- **Props**: Define clear TypeScript interfaces
- **Styling**: Use theme-aware CSS variables
- **Composition**: Prefer atomic design principles

### Composable Development

- **Naming**: Use `use` prefix for composable functions
- **TypeScript**: Provide full type definitions
- **Error Handling**: Include proper error states
- **Reactivity**: Use Vue 3 composition API patterns

## 🚀 Advanced Features

### Theme Integration

Components automatically adapt to theme colors:

```vue
<template>
  <!-- Uses theme primary color -->
  <UButton color="primary">Themed Button</UButton>
</template>
```

### Auto-import Magic

Everything is available without imports:

```vue
<script setup>
// Auto-imported composables
const { currentUser } = useCurrentUser()
const { data } = useFirestore('collection')

// Auto-imported utilities
const router = useRouter()
const route = useRoute()
</script>

<template>
  <!-- Auto-imported components -->
  <FireButton @click="handleClick">
    <FireIcon name="star" />
    Click Me
  </FireButton>
</template>
```

### Page Registration System

Pages are registered using Nuxt's `extendPages`:

```typescript
// In pages-config.ts
const modulePages = [
  {
    name: 'auth',
    path: '/auth',
    file: resolvePath('./runtime/pages/auth.vue'),
  },
  {
    name: 'dashboard',
    path: '/dashboard',
    file: resolvePath('./runtime/pages/dashboard/index.vue'),
  },
  // ... 25+ more pages
]
```

## 💡 Development Tips

- **Hot Reload**: Changes to module trigger rebuilds in consuming apps
- **Playground Testing**: Always test new features in playground first
- **Type Safety**: Leverage TypeScript for better developer experience
- **Performance**: Use dynamic imports for heavy components
- **Documentation**: Keep README updated with new features

The FireUX Core module is designed to be the complete foundation for web applications, eliminating the need to rebuild common functionality!
watch: true,
})

````

This means:

- `components/Hello.vue` becomes `<FireHello>`
- `components/organisms/Blog/List.vue` becomes `<FireOrganismsBlogList>`

## Composable Registration Pattern

Composables are auto-imported from all subdirectories:

```typescript
addImportsDir([resolvePath('./runtime/composables/**/*.ts')])
````

Common patterns:

- `useFirestoreCreate` - Create Firestore documents
- `useCoreUser` - Access the current user's core data
- `useAuth` - Authentication utilities

## Nested Composables

Nested composables follow a hierarchical structure:

- `firestore/CoreUser/useCoreUser.ts` - Core user data
- `firestore/AppUser/useAppUser.ts` - App-specific user data
- `firebase/useAuth.ts` - Firebase authentication

## Models

TypeScript interfaces define the data structures:

- `coreUser.model.ts` - Base user properties
- `appUser.model.ts` - App-specific user properties
- `blogPost.model.ts` - Blog post structure
- `product.model.ts` - Product structure

## Runtime Config Pattern

The module extends Nuxt's runtime config with:

- Firebase configuration
- Application settings
- API keys

## Common Issues and Solutions

1. **Component not found**: Ensure using the "Fire" prefix
2. **Composable not auto-imported**: Check for proper export format
3. **Firebase errors**: Verify environment variables
4. **Build errors**: Make sure FireUX Core is properly built

## Debugging Tips

- Use `test-component-registration.js` to verify component registration
- Use `test-composable-registration.js` to verify composable exports
- Check the module.ts for proper configuration

## Side Quest: Prefixing Components with `Fire`

### Background

To avoid component resolution issues, all components in the `fireux-core` module need to be prefixed with `Fire`. For example, `OrganismsAuthAuthenticated` should be renamed to `FireOrganismsAuthAuthenticated`.

### Why This is Necessary

This ensures that components from the `fireux-core` module do not conflict with similarly named components in other modules or applications.

### Action Plan

1. **Incremental Updates**: This task will be addressed incrementally as errors arise. Each time a component resolution error occurs, the affected component will be renamed with the `Fire` prefix.
2. **Documentation**: Ensure that this convention is followed for all new components added to the `fireux-core` module.

### Example

- Before: `OrganismsAuthAuthenticated`
- After: `FireOrganismsAuthAuthenticated`

### Notes

- This is a long-term task and does not need to be completed immediately.
- Keep this in mind when debugging component resolution issues.

## Side Quest: Prefix All Components with `Fire`

As part of the ongoing development and maintenance of the `fireux-core` module, we need to ensure that all components are prefixed with `Fire` to avoid naming conflicts and improve clarity. This task will be addressed incrementally as errors arise.

### Steps:

1. When encountering an error related to a missing or unresolved component (e.g., `Failed to resolve component: OrganismsAuthAuthenticated`), locate the component in the `fireux-core` module.
2. Rename the component to include the `Fire` prefix (e.g., `OrganismsAuthAuthenticated` → `FireOrganismsAuthAuthenticated`).
3. Update all references to the renamed component throughout the codebase.
4. Test the changes to ensure the component is resolved correctly and functions as expected.

### Notes:

- This task will be completed incrementally to minimize disruption to ongoing development.
- Ensure that the `Fire` prefix is consistently applied to all new components added to the `fireux-core` module.

### Authentication Timing Fix ⚡

**Issue Solved**: Layout rendering before user authentication completes

**Problem**: Navigation menus showing incomplete route lists, private routes missing from mobile navigation

**Root Cause**: `useAppUser()` is asynchronous - fetches user data from Firestore after Firebase auth completes

**Solution**: Use `await useAppUser()` in layout script setup

```vue
<!-- ❌ Problematic -->
<script setup>
const { appUser } = useAppUser()
const jobPrivateRoutes = appUser.value ? getPrivateJobRoutes() || [] : []
// Layout renders with appUser.value = null initially
</script>

<!-- ✅ Fixed -->
<script setup>
const { appUser } = await useAppUser()
const jobPrivateRoutes = appUser ? getPrivateJobRoutes() || [] : []
// Layout waits for user data before rendering
</script>
```

**Results**:
- Mobile navigation shows complete route list immediately
- No missing private routes for authenticated users
- Consistent behavior across all layouts

### Layout Implementation

```vue
<!-- All Apps Use This Pattern -->
<template>
  <CoreDefault :routes="routes" />
</template>
<script setup>
const { appUser } = await useAppUser()
const modulePublicRoutes = getPublicRoutes() || []
const modulePrivateRoutes = appUser ? getPrivateRoutes() || [] : []
const routes = useRoutes(modulePublicRoutes, modulePrivateRoutes)
</script>
```
