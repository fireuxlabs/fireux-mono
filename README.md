# FireUX Monorepo

A comprehensive monorepo for building scalable web applications with Firebase integration, authentication, and modern UI components.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev:playground    # Test environment (http://localhost:3004)
pnpm dev:fireux       # FireUX app (http://localhost:3005)
pnpm dev:misebox      # Misebox app (http://localhost:3006)
pnpm dev:cleanbox     # Cleanbox app (http://localhost:3007)
```

## Architecture

```
fireux/
├── packages/          # Shared modules and libraries
│   └── fireux-core/   # Core module with components, layouts, assets
├── playground/        # Development testing environment
└── projects/          # Production applications
    ├── fireux/        # Main FireUX application
    ├── misebox/       # Data management application
    └── cleanbox/      # Organization application
```

## Technology Stack

- **Framework**: Nuxt 3 with Vue 3
- **Styling**: SCSS with design system
- **Backend**: Firebase (Firestore, Auth, Functions)
- **UI Components**: @nuxt/ui + custom FireUX components
- **Package Manager**: pnpm with workspace support
- **Development**: TypeScript, Vite, Hot Module Replacement

## Package Structure

### `packages/fireux-core`

The core module providing:

- **Components**: 200+ Vue components for UI, forms, authentication
- **Layouts**: Dashboard and default layouts with navigation
- **Composables**: Firebase integration, user management, app state
- **Assets**: Design system, CSS variables, SCSS utilities
- **Runtime**: Client/server configurations and plugins

### `playground`

Development environment for testing fireux-core features in isolation.

### `projects/*`

Production applications that consume fireux-core:

- Each project has its own Firebase configuration
- Shared core functionality with project-specific customizations
- Individual deployment pipelines

## Key Features

- **Standardized Architecture**: All applications follow the same patterns
- **Shared Components**: UI components with consistent styling
- **Auto-imported Composables**: Authentication, data management utilities
- **Firebase Integration**: Built-in auth and Firestore database
- **Stripe Integration**: Payment processing for subscriptions
- **Blog System**: Content management capabilities
- **Product Management**: E-commerce functionality
- **Pro Subscription**: Standard upgrade feature across all apps

## Asset & Layout System

All CSS/SCSS assets are served from `fireux-core` using:

- **Asset Alias**: `fireux-core/assets` points to runtime assets
- **Public Assets**: Served at `/fireux-core/assets/*` URLs
- **Layout Integration**: Core layouts available as `CoreDefault`, `CoreDashboard`
- **Design System**: Centralized SCSS variables and utilities

Apps include CSS in their `nuxt.config.ts`:

```typescript
css: [
  'fireux-core/assets/css/main.css',
  'fireux-core/assets/design-system/main.scss',
]
```

## Documentation Structure

- [`packages/`](packages/README.md) - Package development guide
- [`playground/`](playground/README.md) - Testing environment setup
- [`projects/`](projects/README.md) - Application development guide
- [`copilot.md`](copilot.md) - AI assistant workspace guide

## Development Workflow

1. **Core Development**: Work in `packages/fireux-core` and test in `playground`
2. **Feature Testing**: Use `playground` to validate new components/features
3. **Application Development**: Build in `projects/*` using core functionality
4. **Asset Management**: All CSS/SCSS served from fireux-core assets

## Adding a New Project

1. Create project directory: `projects/new-project/new-project-app`
2. Initialize Nuxt app: `pnpm dlx nuxi init .`
3. Configure to use fireux-core (see project documentation)
4. Add development script to root `package.json`

## Contributing

Each directory contains its own README with specific contribution guidelines. Start with the relevant section based on your development focus.

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
