# CleanBox App Documentation

## Setting Up a New App with FireUX Core

This guide explains how to set up a new Nuxt application that uses the FireUX Core module.

### Prerequisites

- Node.js 18 or later
- pnpm (recommended) or npm
- Access to the FireUX Core module

### Step 1: Create a New Nuxt App

First, create a new Nuxt application using the Nuxt CLI:

```bash
pnpm dlx nuxi init my-app
cd my-app
pnpm install
```

### Step 2: Configure Your App to Use FireUX Core

#### Update nuxt.config.ts

Modify your `nuxt.config.ts` file to include the FireUX Core module:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Add FireUX Core to your modules
  modules: ['fireux-core', 'nuxt-vuefire'],

  // Configure VueFire
  vuefire: {
    auth: true,
    admin: {
      serviceAccount: './config/service-account.json',
    },
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
  },

  // FireUX Core module options (optional)
  fireuxCore: {
    // The prefix used for components from the module
    prefix: 'Fire',
  },

  // Environment variables and other config
  runtimeConfig: {
    // Private config
    openaiApiKey: process.env.OPENAI_API_KEY,

    // Public config that is exposed to the client
    public: {
      domain: process.env.DOMAIN,
      pin: process.env.PIN,
      appName: process.env.APP_NAME,
    },
  },

  // Additional config
  devtools: { enabled: true },
})
```

#### Update app.vue

Modify your `app.vue` file to use the FireUX Core components:

```vue
<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <FireAppDebug />
    <UModal
      v-if="!appInitialized"
      :open="true"
      prevent-close
      title="🚫 Blocked"
      description="This app needs to be initialized."
    >
      <template #body>
        <FireOrganismsAppOnboarding />
      </template>
    </UModal>
  </UApp>
</template>

<script setup>
const appInitialized = ref(false)

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})
</script>

<style scoped>
/* No debug styles needed */
</style>
```

### Step 3: Environment Setup

Create a `.env` file in your project root with the necessary environment variables:

```
# Firebase Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id

# App Configuration
DOMAIN=https://your-domain.com
PIN=1234
APP_NAME=Your App Name
APP_SHORT_NAME=YourApp
APP_THEME_COLOR=#ffffff
APP_BACKGROUND_COLOR=#000000

# API Keys
OPENAI_API_KEY=your-openai-key
```

### Step 4: Create Firebase Service Account

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service accounts
4. Click "Generate new private key"
5. Save the file to `config/service-account.json` in your project

### Step 5: Install Dependencies

Make sure you have all required dependencies:

```bash
pnpm add fireux-core nuxt-vuefire firebase
```

### Step 6: Run Your App

Start the development server:

```bash
pnpm dev
```

Visit http://localhost:3000 to see your app in action. You should see the FireUX Core onboarding screen if the app is not yet initialized.

## Using FireUX Core Components

All components from the FireUX Core module are prefixed with `Fire`. For example:

- `<FireAppDebug />` - Debug component
- `<FireOrganismsAppOnboarding />` - Onboarding component
- `<FireLogoType />` - Logo component

Nuxt UI components are available with the `U` prefix:

- `<UApp />` - The main app container
- `<UButton />` - Button component
- `<UModal />` - Modal component

## Using FireUX Core Composables

The FireUX Core module provides several composables that are auto-imported in your app:

```javascript
// User management
const { coreUser } = await useCoreUser()
const { appUser } = await useAppUser()

// Authentication
const { signIn, signOut, currentUser } = useAuth()

// App management
const { pin, isUnlocked, checkPin, createAppHandler } = useApp()

// Firebase storage
const { uploadFile, getDownloadURL } = useFirebaseStorage()
```

## Deployment

To deploy your app:

1. Build the application:

```bash
pnpm build
```

2. Preview the production build:

```bash
pnpm preview
```

3. Deploy to your hosting provider of choice (Firebase, Vercel, Netlify, etc.)

## Troubleshooting

- **Components not found**: Make sure you're using the correct prefix (`Fire` for FireUX Core components, `U` for Nuxt UI components)
- **Composables not auto-imported**: Restart the development server to refresh the auto-imports
- **Firebase errors**: Check your environment variables and service account configuration

For more assistance, refer to the FireUX Core documentation or contact support.
