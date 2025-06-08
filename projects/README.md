# Human Developer Setup Guide for FireUX Projects

## Overview

This document provides a step-by-step guide for human developers to set up and contribute to FireUX projects.

## Prerequisites

- **Node.js**: Version 18 or higher.
- **pnpm**: Install using `npm install -g pnpm`.
- **Firebase Account**: For authentication and database integration.
- **Stripe Account**: For payment processing.

## General Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd fireux
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env` and fill in the required values.

4. Start the development server for the desired project:
   - FireUX App:
     ```bash
     pnpm dev:fireux
     ```
   - Misebox App:
     ```bash
     pnpm dev:misebox
     ```
   - Cleanbox App:
     ```bash
     pnpm dev:cleanbox
     ```

## Firebase Setup for All Projects

1. **Create a Database**:

   - Navigate to the Firebase Console.
   - Select your project and click on **Cloud Firestore**.
   - Click **Create Database** and follow the prompts to set up Firestore.

2. **Upgrade to Blaze Plan**:

   - Go to the **Billing** section in the Firebase Console.
   - Upgrade your project to the **Blaze** plan.

3. **Enable Authentication**:

   - In the Firebase Console, go to **Authentication** > **Sign-in method**.
   - Enable **Google**, **Email/Password**, and **Anonymous** authentication methods.

4. **Enable Storage**:
   - Navigate to **Storage** in the Firebase Console.
   - Click **Get Started** and configure your storage bucket.

## Project Structure

- `packages/`: Shared modules and utilities.
- `projects/`: Individual client applications.
- `playground/`: Development environment for testing features.

## Coding Standards

- Follow the linting and formatting rules defined in `.eslintrc.js` and `.prettierrc`.
- Write clear and concise commit messages.
- Test all changes thoroughly before pushing.

## Troubleshooting

- If you encounter issues, check the `copilot.md` files in each project for additional guidance.
- For further assistance, contact the project maintainer.

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

All projects/apps follow a standardized structure and development process:

1. **Structure**:

   - Each project is located under `projects/projectname/projectname-app`.
   - The app serves as the ecosystem for the respective project.

2. **Core Features**:

   - Built on the `fireux-core` module.
   - Integrated with Firebase for authentication and database management.
   - Uses Stripe for payment processing.
   - Includes a Pro version upgrade feature, setting `pro: true` for app users.

3. **Development Goals**:
   - All apps will have identical initial functionality.
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

## Tailwind Color Selection Matrix

When setting up your app, you need to pick your Tailwind colors and their associated hex codes. Use the matrix below for reference:

| Tailwind Color Name | Primary Hex Code | Neutral Hex Code |
| ------------------- | ---------------- | ---------------- |
| **Blue**            | `#3B82F6`        | `#6B7280`        |
| **Yellow**          | `#FACC15`        | `#71717A`        |
| **Green**           | `#22C55E`        | `#64748B`        |
| **Red**             | `#EF4444`        | `#475569`        |
| **Slate**           | `#475569`        | `#6B7280`        |
| **Zinc**            | `#71717A`        | `#6B7280`        |
| **Stone**           | `#64748B`        | `#6B7280`        |

### Instructions

1. Choose a **Primary Color** and a **Neutral Color** from the matrix above.
2. Update your `.env` file with the selected colors:
   ```env
   APP_PRIMARY_COLOR=<Primary Hex Code>
   APP_NEUTRAL_COLOR=<Neutral Hex Code>
   ```
3. Ensure the colors align with your app's branding and design requirements.

# FireUX Projects Documentation

## Firebase Setup

1. **Create a Database**:

   - Navigate to the Firebase Console.
   - Select your project and click on **Cloud Firestore**.
   - Click **Create Database** and follow the prompts to set up Firestore.

2. **Upgrade to Blaze Plan**:

   - Go to the **Billing** section in the Firebase Console.
   - Upgrade your project to the **Blaze** plan.

3. **Enable Authentication**:

   - In the Firebase Console, go to **Authentication** > **Sign-in method**.
   - Enable **Google**, **Email/Password**, and **Anonymous** authentication methods.

4. **Enable Storage**:
   - Navigate to **Storage** in the Firebase Console.
   - Click **Get Started** and configure your storage bucket.

## App-Specific Notes

### CleanBox App

- Designed to manage and organize cleaning services efficiently.
- Includes features for adding pressure washers and car cleaning tenants.

### FireUX App

- Showcases the core features of the FireUX framework.
- Includes modular components and Firebase integration.

### MiseBox App

- A versatile tool for managing and organizing various tasks.
- Powered by FireUX Core.

### Playground App

- Serves as a testing ground for FireUX Core features and components.
