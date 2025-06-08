# FireUX Core Module - AI Assistant Guide

## Module Overview

The FireUX Core module is a Nuxt module that provides:

1. Auto-imported composables
2. Pre-registered components with the "Fire" prefix
3. Firebase integration
4. Styling and assets

## Key Files and Their Purpose

- `src/module.ts`: Entry point for the Nuxt module, registers components and composables
- `src/runtime/components/`: UI components following atomic design principles
- `src/runtime/composables/`: Auto-imported utilities organized by function
- `src/runtime/models/`: TypeScript interfaces for data structures
- `src/runtime/assets/`: SCSS and CSS for the design system
- `src/runtime/firebase.client.ts`: Firebase client initialization

## Component Registration Pattern

Components are registered with the "Fire" prefix and pathPrefix enabled:

```typescript
addComponentsDir({
  path: resolvePath('./runtime/components'),
  pattern: '**/*.vue',
  prefix: options.prefix, // 'Fire'
  global: true,
  pathPrefix: true,
  watch: true,
})
```

This means:

- `components/Hello.vue` becomes `<FireHello>`
- `components/organisms/Blog/List.vue` becomes `<FireOrganismsBlogList>`

## Composable Registration Pattern

Composables are auto-imported from all subdirectories:

```typescript
addImportsDir([resolvePath('./runtime/composables/**/*.ts')])
```

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
