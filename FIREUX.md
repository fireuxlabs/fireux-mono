# 📚 FireUX Complete Documentation

## 🚀 Quick Start

```bash
# Development workflow
pnpm dev:fireux      # :3000 (yellow theme)
pnpm dev:cleanbox    # :3007 (blue theme)
pnpm dev:misebox     # :3009 (green theme)
pnpm dev:playground  # :3005 (test environment)

# Package development
pnpm build:packages  # Build all packages
pnpm dev:packages    # Develop all packages
pnpm clean:packages  # Clean all packages

# Deployment
./deploy-all.sh      # Deploy all apps
```

## 📖 Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Business Domains](#-business-domains)
3. [Development Guide](#-development-guide)
4. [Package System](#-package-system)
5. [AI Development](#-ai-development-guidelines)
6. [API Documentation](#-api-documentation)
7. [Troubleshooting](#-troubleshooting)

---

## 🏗️ Architecture Overview

### Monorepo Structure - Domain-Driven Packages

- **packages/**: Domain-specific Nuxt modules with clear separation
  - `fireux-core/`: Core framework (Firebase, auth, base components) - **NO DOMAIN CODE**
  - `fireux-jobs/`: Job marketplace functionality (Employer/Professional profiles)
  - `fireux-misebox/`: Chef/Supplier marketplace functionality
  - `fireux-places/`: Location and places management
- **projects/**: Production apps combining packages as needed
  - Each app customizes: landing page, theme, Firebase config, package selection

### Component Auto-Import Prefixes

- **fireux-core**: `<Fire...>` (e.g., `<FireButton>`, `<FireCard>`)
- **fireux-jobs**: `<Job...>` (e.g., `<JobCard>`, `<JobForm>`)
- **fireux-misebox**: `<Mise...>` (e.g., `<MiseChefCard>`, `<MiseSupplierForm>`)
- **fireux-places**: `<Place...>` (e.g., `<PlaceMap>`, `<PlaceSearch>`)

### Domain Separation (CRITICAL)

```typescript
// ✅ Correct: Domain-specific code in domain packages
packages/fireux-misebox/src/runtime/components/organisms/profiles/Chef/
packages/fireux-jobs/src/runtime/models/Employer.model.ts

// ❌ Wrong: Domain code in core package
packages/fireux-core/src/runtime/components/organisms/profiles/ // NO DOMAIN CODE!
```

---

## 🏢 Business Domains

### FireUX Jobs - Employment Marketplace

- **Employers**: Companies posting jobs
- **Professionals**: Job seekers and freelancers
- **Jobs**: Job postings and applications
- **Features**: Profile matching, application tracking, hiring workflows

### FireUX Misebox - Food Service Platform

- **Chefs**: Professional cooking services
- **Suppliers**: Food and ingredient suppliers
- **Kitchens**: Shared kitchen spaces and rentals
- **Features**: Ingredient sourcing, kitchen booking, chef networking

### FireUX CleanBox - Cleaning Services

- **Cleaners**: Professional cleaning services
- **Clients**: Businesses and individuals needing cleaning
- **Features**: Service booking, area matching, quality assurance

### FireUX Places - Location Services

- **Google Places Integration**: Address autocomplete and validation
- **Location Management**: Centralized location services for all domains

---

## 💻 Development Guide

### Getting Started

1. **Prerequisites**

   ```bash
   node >= 18
   pnpm >= 8
   ```

2. **Installation**

   ```bash
   git clone [repo]
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment templates
   cp .env.example .env
   # Configure Firebase, Stripe, Google Places API keys
   ```

### Development Workflow

#### Authentication-Based Routing (REQUIRED)

```vue
<!-- Required pattern in layouts -->
<script setup>
const { appUser } = await useAppUser() // Note: AWAIT required for timing
const jobPrivateRoutes = appUser ? getPrivateJobRoutes() || [] : []
</script>
```

#### Adding Shared Features

- **Core Components**: Add to `packages/fireux-core/src/runtime/components/` → Auto-imported as `<FireComponentName>`
- **Domain Components**: Add to domain packages → Auto-imported with domain prefix
- **Pages**: Add to appropriate package runtime/pages → Available in apps that use that module
- **Composables**: Add to appropriate package runtime/composables → No imports needed

#### Package Dependencies (Workspace Pattern)

```json
{
  "dependencies": {
    "fireux-core": "workspace:*", // ✅ Correct
    "fireux-jobs": "workspace:*" // ✅ Correct
  }
}
```

### Testing Strategy

Always test in playground environment first:

```bash
pnpm dev:playground  # Test new features here
```

Then validate across all apps before deployment.

---

## 📦 Package System

### Package Structure (All Follow Same Pattern)

```json
{
  "version": "0.1.0",
  "dependencies": {
    "@nuxt/kit": "^3.17.5",
    "fireux-core": "workspace:*",
    "glob": "^11.0.3"
  },
  "devDependencies": {
    "@nuxt/module-builder": "^0.5.5",
    "rimraf": "^6.0.1"
  }
}
```

### Module Configuration Pattern

All packages use config functions in their respective `src/config/` directories:

```typescript
// module.ts entry point calls:
configureComponents(resolver, options) // Auto-imports with package prefix
configurePages(resolver, nuxt) // Runtime pages discovery
configureComposables(resolver) // Auto-available everywhere
configureModels(resolver, nuxt) // Auto-import models with package aliases
```

### Profile & Object System

#### Unified Composables

- **`useProfile(profileConfig)`**: Handles all profile types (Chef, Employer, Professional, Supplier)
- **`useObject(objectConfig)`**: Handles all object types (Job, Kitchen, Blog, Product)

#### Example Usage

```typescript
// Profile example
const { currentChef, chefs, createChef } = await useProfile(chefConfig)

// Object example
const { kitchens, fetchKitchen, createKitchen } = await useObject(kitchenConfig)
```

---

## 🤖 AI Development Guidelines

### Coding Principles

1. **Domain Separation**: Keep domain code in appropriate packages
2. **Workspace References**: Always use `workspace:*` for internal dependencies
3. **Authentication Timing**: Use `await useAppUser()` in layouts
4. **Simple Extensions**: Prefer props-based over complex global registries

### Phantom File Prevention

#### What Causes Phantom Files

1. **Domain Separation Violations**: Domain code in `fireux-core`
2. **Auto-Import Conflicts**: Multiple packages using same prefixes
3. **Build System Issues**: TypeScript compilation errors

#### Prevention Rules

```typescript
// ✅ Unique prefixes per package
fireux-core: 'Fire'
fireux-jobs: 'Job'
fireux-misebox: 'Mise'
fireux-places: 'Place'

// ✅ Proper imports
import { useProfile } from 'fireux-core/src/runtime/composables/firestore/profiles/useProfile'

// ❌ Avoid cross-domain imports
import { ChefCard } from 'fireux-core' // Wrong! Should be from fireux-misebox
```

### Anti-Patterns to Avoid

- **Code duplication**: Add shared functionality to fireux-core instead
- **Complex state**: Prefer props over global registries
- **Breaking changes**: Use additive-only approach
- **Premature abstraction**: Start simple, refactor when proven needed
- **Missing await**: Authentication requires `await useAppUser()` in layouts

---

## 🔌 API Documentation

### Firestore API Endpoints

- `POST /api/firestore/create-document` - Create Firestore documents
- `POST /api/firestore/update-document` - Update Firestore documents
- `POST /api/firestore/delete-document` - Delete Firestore documents
- `GET /api/firestore/get-document` - Fetch single document
- `GET /api/firestore/get-collection` - Fetch document collections

### Stripe Integration

- `POST /api/stripe/create-product` - Create subscription products/plans
- `POST /api/stripe/create-customer` - Create Stripe customers
- `POST /api/stripe/create-subscription` - Create subscriptions
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### App Management

- `GET /api/app/config` - Get app configuration
- `POST /api/app/tenant` - Create new tenant applications

---

## 🛠️ Troubleshooting

### Common Issues

#### Phantom Files Appearing

1. Check for domain code in `fireux-core`
2. Verify unique component prefixes
3. Clear build artifacts: `pnpm clean:packages`
4. Restart dev servers

#### Authentication Not Working

1. Ensure `await useAppUser()` in layouts
2. Check Firebase configuration
3. Verify environment variables

#### Components Not Auto-Importing

1. Check component naming follows prefix conventions
2. Verify module configuration in `src/config/`
3. Restart Nuxt development server

#### Build Failures

1. Check workspace dependencies use `workspace:*`
2. Verify no circular dependencies
3. Run `pnpm build:packages` before app builds

### Debugging Commands

```bash
# Check package structure
pnpm list --depth=0

# Verify workspace links
pnpm list --depth=1 fireux-core

# Clean and rebuild
pnpm clean:packages && pnpm build:packages

# Check for phantom files
find . -name "*.tmp" -o -name "*.bak" -o -name ".DS_Store"
```

---

## 🚀 Deployment

### Production Deployment

```bash
./deploy-all.sh  # Deploys all apps simultaneously
```

### Live Applications

- **cleanbox.web.app** - CleanBox cleaning services
- **misebox.web.app** - Misebox food service platform
- **fireux.web.app** - FireUX job marketplace

### Environment Configuration

Each app has its own Firebase project and environment variables:

- Development: Local `.env` files
- Production: Firebase hosting environment variables
- Staging: Separate Firebase projects for testing

---

## 📋 Development Checklists

### Adding New Domain Package

1. ✅ Create package structure following existing pattern
2. ✅ Add unique component prefix
3. ✅ Configure auto-imports in `src/config/`
4. ✅ Add workspace dependency to consuming apps
5. ✅ Test in playground first
6. ✅ Update this documentation

### Adding New Feature

1. ✅ Identify correct domain package
2. ✅ Follow established patterns (useProfile/useObject)
3. ✅ Add appropriate tests
4. ✅ Test across all relevant apps
5. ✅ Update component documentation
6. ✅ Verify no phantom files generated

This comprehensive documentation replaces all individual manual files and provides a single source of truth for the entire FireUX ecosystem.
