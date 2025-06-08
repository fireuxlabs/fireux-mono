# Playground App

## Overview

The Playground app serves as a testing ground for FireUX Core features and components.

## Development

### Start the Development Server

```bash
pnpm dev
```

Visit http://localhost:3000 to see the app in action.

### Firebase Setup

Ensure the following Firebase services are configured:

- Cloud Firestore
- Authentication (Google, Email/Password, Anonymous)
- Storage

## Deployment

To deploy the app:

1. Build the application:
   ```bash
   pnpm build
   ```
2. Preview the production build:
   ```bash
   pnpm preview
   ```
3. Deploy to your hosting provider.
