# CleanBox App

CleanBox is a standardized web application built on the FireUX Core module, demonstrating the reference implementation of the FireUX platform architecture.

## Features

- 🔐 **Authentication**: User signup, login, and profile management
- 📝 **Blog System**: Create, edit, and publish blog posts
- 🛒 **Product Management**: List, create, and manage products
- 💳 **Payment Processing**: Stripe integration for subscriptions and one-time purchases
- 👑 **Pro Subscription**: Standard upgrade path for premium features
- 🔥 **Firebase Backend**: Real-time database and authentication
- 📱 **Responsive Design**: Works on all devices

## Architecture

CleanBox follows the standardized FireUX application architecture:

```
cleanbox-app/
├── app.vue                # Main application entry point
├── nuxt.config.ts         # Nuxt and FireUX Core configuration
├── public/                # Static assets
├── server/                # Server-side code
└── layouts/               # Page layouts (optional)
```

## Setup Instructions

### Prerequisites

- Node.js 18.x or later
- pnpm (recommended) or npm
- Firebase account
- Stripe account (for payment processing)

### Installation

```bash
# Install dependencies
pnpm install
```

### Environment Configuration

Create a `.env` file in your project root with the following variables:

```bash
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
PIN=1234  # Development PIN for admin access
APP_NAME=CleanBox
APP_SHORT_NAME=CleanBox
APP_THEME_COLOR=#ffffff
APP_BACKGROUND_COLOR=#000000

# API Keys
OPENAI_API_KEY=your-openai-key  # Optional for AI features

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

### Firebase Setup

1. Create a service account key:
   - Go to Firebase Console > Project Settings > Service accounts
   - Generate a new private key
   - Save it to `config/service-account.json`

### Development

Start the development server:

```bash
pnpm dev
```

Visit `http://localhost:3000` to see your app.

## Deployment

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

### Deployment Options

- **Firebase Hosting**: Recommended for seamless integration with Firebase services
- **Vercel/Netlify**: Excellent for static site hosting with serverless functions
- **Custom Server**: For specialized hosting requirements

## Working with FireUX Core

### Components

FireUX Core components are prefixed with `Fire`:

```vue
<template>
  <FireOrganismsAppOnboarding />
  <FireLogoType size="medium" />
  <FireAppDebug />
  <!-- Useful during development -->
</template>
```

### Composables

FireUX Core composables are auto-imported:

```javascript
// User management
const { coreUser } = await useCoreUser()

// Authentication
const { signIn, signOut } = useAuth()

// Blog functionality
const { posts } = await useBlogPosts()
const { createPost } = useBlogPostCreate()

// Product management
const { products } = await useProducts()
```

## Further Documentation

For more detailed information, see:

- [FireUX Core README](../../packages/fireux-core/README.md) - Core module documentation

## License

Proprietary. All rights reserved.
