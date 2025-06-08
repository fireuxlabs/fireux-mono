# FireUX Monorepo

## Overview

FireUX is a platform for rapidly deploying standardized web applications with consistent architecture and features. This monorepo contains:

- **packages/fireux-core**: The core module shared across all applications
- **projects/**: Individual client applications built on the FireUX Core
- **playground/**: Development environment for testing FireUX Core features

## Architecture

```
fireux/
├── packages/
│   └── fireux-core/        # Core module with shared components, composables, and utilities
├── projects/
│   ├── fireux/             # FireUX company website and application
│   │   └── fireux-app/     # Main FireUX application
│   ├── misebox/            # MiseBox project
│   │   └── misebox-app/    # MiseBox application
│   ├── cleanbox/           # CleanBox project (reference implementation)
│   │   └── cleanbox-app/   # CleanBox application
│   └── [future-projects]/  # Future client projects
└── playground/             # Development and testing environment
```

## Key Features

- **Standardized Architecture**: All applications follow the same architecture and patterns
- **Shared Components**: UI components with consistent styling and behavior
- **Auto-imported Composables**: Utilities for authentication, data management, and more
- **Firebase Integration**: Built-in Firebase authentication and Firestore database
- **Stripe Integration**: Payment processing for products and subscriptions
- **Blog System**: Content management for blog posts
- **Product Management**: E-commerce capabilities for digital and physical products
- **Pro Subscription**: Every app includes a standard subscription upgrade feature

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- Firebase account
- Stripe account (for payment processing)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build the core module:
   ```bash
   cd packages/fireux-core
   pnpm build
   ```
4. Run a project:

   ```bash
   # Run the FireUX app
   pnpm dev:fireux

   # Run the MiseBox app
   pnpm dev:misebox

   # Run the CleanBox app
   pnpm dev:cleanbox

   # Run the playground
   pnpm dev:playground
   ```

## Adding a New Project

To create a new project:

1. Create a new directory in the `projects/` folder:

   ```bash
   mkdir -p projects/new-project/new-project-app
   ```

2. Initialize a new Nuxt app:

   ```bash
   cd projects/new-project/new-project-app
   pnpm dlx nuxi init .
   ```

3. Configure to use FireUX Core (see project-level README for details)

## Documentation

This monorepo contains README files at different levels to help you understand the structure and functionality:

### Core Documentation

- **[Root README](/README.md)** - Overview of the monorepo structure and setup
- **[FireUX Core README](/packages/fireux-core/README.md)** - Documentation for the core module
- **[Playground README](/playground/README.md)** - Instructions for the development playground

### Project Documentation

- **FireUX App**
  - **[FireUX App README](/projects/fireux/fireux-app/README.md)** - FireUX company website and application
- **MiseBox App**
  - **[MiseBox App README](/projects/misebox/misebox-app/README.md)** - MiseBox application
- **CleanBox App (Reference Implementation)**
  - **[CleanBox App README](/projects/cleanbox/cleanbox-app/README.md)** - Reference implementation and template

### AI Assistant Guides

For AI assistants like GitHub Copilot, we provide specialized documentation:

- **[Root Copilot Guide](/copilot.md)** - System-wide patterns and conventions
- **[FireUX Core Copilot Guide](/packages/fireux-core/copilot.md)** - Core module implementation details
- **[CleanBox Copilot Guide](/projects/cleanbox/cleanbox-app/copilot.md)** - App implementation guidance
# fireux-mono
