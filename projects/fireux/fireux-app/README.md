# FireUX App

Main FireUX application - Company website and primary application showcasing the full FireUX platform capabilities.

## Purpose

The FireUX app serves as:

- **Company website** for FireUX platform
- **Primary application** demonstrating all features
- **Reference implementation** for the complete feature set
- **Marketing site** for FireUX services

## Features

- 🔐 **Authentication**: Firebase Auth with Google, email/password
- 📝 **Blog System**: Content management with rich text editing
- 🛒 **Product Management**: E-commerce functionality with Stripe
- 💳 **Pro Subscriptions**: Paid tier upgrades
- 👨‍💼 **Admin Panel**: Full management interface
- 📊 **Analytics**: User engagement and metrics
- 🎨 **Complete Design System**: All FireUX UI components

## Development

### Start the Application

```bash
# From root directory
pnpm dev:fireux

# Or directly in app
cd projects/fireux/fireux-app
pnpm dev
```

**URL**: http://localhost:3005/

### Environment Setup

Required environment variables in `.env`:

```env
# Firebase Configuration
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App Configuration
APP_NAME="FireUX"
APP_SHORT_NAME="FireUX"
APP_PRIMARY_COLOR="#FACC15"
APP_NEUTRAL_COLOR="#71717A"
DOMAIN="fireux.app"
```

### Firebase Project Setup

1. **Create Firebase Project**: "fireux-app" or similar
2. **Enable Services**:
   - Firestore Database
   - Authentication (Google, Email/Password)
   - Storage
   - Functions (for server-side operations)
3. **Configure Security Rules**: Set up Firestore and Storage rules
4. **Add Service Account**: Place `service-account.json` in `/config`

### Stripe Configuration

1. **Create Stripe Account** for FireUX business
2. **Configure Products**: Set up subscription tiers
3. **Set up Webhooks**: Configure endpoint for subscription events
4. **Test Integration**: Use test keys for development

## Project Structure

```
fireux-app/
├── components/          # App-specific components
│   ├── effects/         # Visual effects and animations
│   └── landing/         # Landing page components
├── layouts/             # Layout wrappers
│   ├── default.vue      # <CoreDefault />
│   └── dashboard.vue    # <CoreDashboard />
├── pages/               # Application pages
│   ├── index.vue        # Landing/home page
│   └── dashboard.vue    # Main dashboard
├── config/              # Configuration files
│   └── service-account.json # Firebase service account
└── server/              # Server-side utilities
    └── utils/           # API utilities
```

## Layouts

The app uses FireUX Core layouts:

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

## Deployment

### Build for Production

```bash
pnpm build
pnpm preview
```

### Deploy to Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init

# Deploy
firebase deploy
```

## Brand Configuration

- **Primary Color**: Yellow (`#FACC15`)
- **Neutral Color**: Zinc (`#71717A`)
- **Icon**: `flame` (from Lucide)
- **Domain**: fireux.app

## Development Notes

- This app includes all FireUX features and serves as the reference implementation
- Any new features should be tested here before being added to other projects
- Maintains the highest feature completeness of all FireUX applications
  ```

  ```

2. Preview the production build:
   ```bash
   pnpm preview
   ```
3. Deploy to your hosting provider.
