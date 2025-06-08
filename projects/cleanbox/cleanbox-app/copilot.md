# CleanBox App - AI Assistant Guide

## App Overview

CleanBox is a reference implementation of the FireUX platform architecture, demonstrating the standardized approach for all FireUX-based applications. It uses the FireUX Core module for components, composables, and standard features.

## Key Files and Their Purpose

- `app.vue`: Entry point with onboarding component
- `nuxt.config.ts`: Configuration for Nuxt, FireUX Core, and Firebase
- `public/`: Static assets like favicon and robots.txt
- `server/`: Server-side API routes and utilities

## Component Usage Pattern

- FireUX Core components use the "Fire" prefix:

  ```vue
  <FireOrganismsAppOnboarding />
  <FireLogoType size="medium" />
  ```

- Nuxt UI components use the "U" prefix:
  ```vue
  <UApp>
    <UButton>Click Me</UButton>
    <UModal>Content</UModal>
  </UApp>
  ```

## Composable Usage Pattern

FireUX Core composables are auto-imported:

```javascript
// User management
const { coreUser } = await useCoreUser()
const { appUser } = await useAppUser()

// Authentication
const { signIn, signOut } = useAuth()

// App management
const { pin, isUnlocked, checkPin } = useApp()

// Content management
const { posts } = await useBlogPosts()
const { products } = await useProducts()
```

## Environment Variables

The app expects these environment variables:

```
# Firebase
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=

# App
DOMAIN=
PIN=
APP_NAME=
APP_SHORT_NAME=
APP_THEME_COLOR=
APP_BACKGROUND_COLOR=

# Stripe
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Firebase Integration

Firebase is integrated through VueFire in the nuxt.config.ts:

```typescript
vuefire: {
  auth: true,
  admin: {
    serviceAccount: './config/service-account.json',
  },
  config: {
    apiKey: process.env.FIREBASE_API_KEY,
    // other firebase config...
  },
},
```

## Standard Features

1. **Authentication**: User registration and login
2. **Blog System**: Content management
3. **Product Management**: E-commerce
4. **Pro Subscription**: Premium features
5. **Admin Dashboard**: Content administration

## App Initialization Flow

1. App starts and shows onboarding modal if not initialized
2. User authenticates or creates an account
3. Admin enters PIN to unlock configuration
4. Environment variables are verified
5. App is created and becomes available

## Common Issues and Solutions

1. **Component not rendering**: Check for "Fire" prefix
2. **Firebase errors**: Verify environment variables and service account
3. **Stripe issues**: Check Stripe API keys
4. **Build errors**: Ensure FireUX Core is properly built
