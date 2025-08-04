# 🔥 FireUX Core Documentation

> **Framework fundamentals, shared infrastructure, and base component library**

## 🏗️ Core Architecture

FireUX Core provides the foundational infrastructure for all FireUX applications and domain packages.

### **Key Responsibilities**

- **Authentication**: Firebase Auth integration with Vuefire
- **Database**: Firestore reactive composables and utilities
- **Base Components**: Generic UI components with `Fire` prefix
- **Shared Utilities**: Common functions and helpers
- **No Domain Logic**: Keeps strictly to infrastructure concerns

## 🧩 Component Library

### Auto-Import Prefix: `<Fire...>`

All core components are auto-imported with the `Fire` prefix:

```vue
<template>
  <FireButton variant="primary">Click me</FireButton>
  <FireCard class="p-4">
    <FireInput v-model="value" placeholder="Enter text" />
  </FireCard>
</template>
```

### Component Categories

#### **Atoms** - Basic building blocks

- `<FireButton>` - Button variations and states
- `<FireInput>` - Form input components
- `<FireIcon>` - Icon system integration

#### **Molecules** - Composite components

- `<FireCard>` - Card layouts and containers
- `<FireForm>` - Form handling and validation
- `<FireModal>` - Modal dialogs and overlays

#### **Organisms** - Complex components

- `<FireOrganismsProfilePage>` - Generic profile page layout
- `<FireOrganismsProfileCTA>` - Profile call-to-action components
- `<FireNavigation>` - Main navigation components

## 🔐 Authentication System

### Composables

- `useCurrentUser()` - Reactive current user from Vuefire
- `useAppUser()` - Extended user profile with app data
- `useAuth()` - Authentication actions and state

### Patterns

```vue
<script setup>
// Authentication-based routing (REQUIRED timing)
const { appUser } = await useAppUser() // Note: AWAIT required
const privateRoutes = appUser ? getPrivateRoutes() || [] : []
</script>
```

## 🗄️ Database Integration

### Firestore Composables

- Reactive collections and documents
- Automatic loading states and error handling
- Optimistic updates and caching

### Profile System

- Generic `Profile` interface for all profile types
- Validation functions for data integrity
- Collection management utilities

## 🛠️ Configuration System

### Module Configuration

```typescript
// All packages follow this pattern:
configureComponents(resolver, options) // Auto-imports with prefix
configurePages(resolver, nuxt) // Runtime pages discovery
configureComposables(resolver) // Auto-available everywhere
configureModels(resolver, nuxt) // Auto-import models
```

### Component Registration

- Automatic discovery of components in `runtime/components/`
- Prefix-based namespace separation
- Build-time optimization for tree shaking

## 🚀 Development Guidelines

### Adding Core Components

1. Place in appropriate category: `atoms/`, `molecules/`, `organisms/`
2. Use generic, reusable patterns only
3. NO domain-specific logic (Chef, Job, etc.)
4. Follow TypeScript interfaces and props validation

### Generic-First Philosophy

- Create reusable patterns before specific implementations
- Use configuration objects for customization
- Provide slot systems for domain-specific content

### Testing Strategy

- Test in playground environment first
- Validate auto-import functionality
- Ensure no domain dependencies

---

**📦 For package ecosystem**: See [`/packages/docs/`](../../../docs/)  
**🚀 For app implementations**: See [`/projects/docs/`](../../../../projects/docs/)
