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
