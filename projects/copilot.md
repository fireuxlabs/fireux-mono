# AI Developer Setup Guide for FireUX Projects

## Overview

This document provides specific rules and guidelines for AI developers to set up and contribute to FireUX projects efficiently.

## General Rules

1. **Follow the Monorepo Structure**:

   - All shared modules go under `packages/`.
   - Individual projects are located under `projects/`.

2. **Use pnpm for Dependency Management**:

   - Always use `pnpm` commands for installing and managing dependencies.
   - Run `pnpm install` at the root to ensure all dependencies are installed.

3. **Respect .gitignore Rules**:

   - Do not include files or directories listed in `.gitignore`.
   - Sensitive files like `.env` and `service-account.json` must not be committed.

4. **Linting and Formatting**:

   - Use the root `.eslintrc.js` and `.prettierrc` configurations.
   - Run `pnpm lint` before committing code.

5. **Testing**:
   - Write unit tests for all new features.
   - Use the testing framework specified in the project (e.g., Jest).

## Project-Specific Setup

### FireUX App

- Navigate to `projects/fireux/fireux-app/`.
- Run `pnpm dev:fireux` to start the development server.

### Misebox App

- Navigate to `projects/misebox/misebox-app/`.
- Run `pnpm dev:misebox` to start the development server.

### Cleanbox App

- Navigate to `projects/cleanbox/cleanbox-app/`.
- Run `pnpm dev:cleanbox` to start the development server.

## AI-Specific Notes

- Use the `copilot.md` files in each project for additional context.
- Ensure all generated code adheres to the project's coding standards.
- Validate changes by running the appropriate dev server and tests.

## Mission, Vision, and Values

### FireUX

- **Mission**: To empower developers with a standardized platform for building web applications efficiently.
- **Vision**: To become the go-to developer platform for rapid and consistent application deployment.
- **Values**: Innovation, collaboration, and developer-centric design.

### Misebox

- **Mission**: To revolutionize the cooking experience with a comprehensive app for chefs and home cooks.
- **Vision**: To be the ultimate digital companion for culinary enthusiasts.
- **Values**: Passion, creativity, and user-first design.

### Cleanbox

- **Mission**: To dominate the cleaning market with a no-nonsense, efficient application.
- **Vision**: To be the leading app for cleaning services and solutions.
- **Values**: Precision, efficiency, and market focus.

## Modus Operandi

1. **Project Structure**:

   - All projects are located under `projects/projectname/projectname-app`.
   - Each app serves as the ecosystem for its respective project.

2. **Core Features**:

   - Built on the `fireux-core` module.
   - Integrated with Firebase for authentication and database management.
   - Uses Stripe for payment processing.
   - Includes a Pro version upgrade feature, setting `pro: true` for app users.

3. **Development Goals**:
   - Ensure all apps have identical initial functionality.
   - Focus on achieving a consistent stage of development across all apps.
   - Deploy all apps to Firebase for production use.

### Nuxt Configuration Example

```typescript
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-06-07',
  modules: [
    'fireux-core',
    [
      'nuxt-vuefire',
      {
        config: {
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN,
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.FIREBASE_APP_ID,
        },
        auth: { enabled: true },
      },
    ],
    '@nuxt/ui',
  ],
})
```
