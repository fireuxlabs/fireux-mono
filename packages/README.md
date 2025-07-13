# 📦 FireUX Packages

This directory contains the core Nuxt modules that power the FireUX ecosystem.

## � Package Structure

### `fireux-core/`

Core functionality and shared utilities:

- **Authentication & Database**: Firebase/Firestore management
- **Components**: 200+ shared Vue components including unified profile system
- **Composables**: Auth, database, and business logic composables
- **Server APIs**: Backend endpoints and utilities
- **Profile System**: Config-driven architecture for Chef, Supplier, and future profile types
- **Admin Tools**: Administrative interfaces and utilities

**Recent Updates**: Unified profile card system with config-driven architecture ready for MiseBox integration.

### `fireux-jobs/`

Job board specific functionality:

- Employer management
- Professional profiles
- Job posting utilities
- Job-specific routing

## � Quick Development

```bash
# Build all packages in development mode
pnpm dev:packages

# Build for production
pnpm build:packages

# Start development with stubs
cd packages/fireux-core && pnpm dev
cd packages/fireux-jobs && pnpm dev
```

## 📚 Documentation

- [`packages.doc.md`](./packages.doc.md) - Detailed module architecture and development guide
- [`fireux-core/core.doc.md`](./fireux-core/core.doc.md) - Core module documentation
- [`fireux-jobs/jobs.doc.md`](./fireux-jobs/jobs.doc.md) - Jobs module documentation

## 🚀 Current Development Focus

**Profile System Refactor**: Implementing config-driven, unified profile architecture

- **Status**: Phase 1 Complete (unified components and configs)
- **Next**: Phase 2 - Integration into MiseBox Chef/Supplier pages
- **Location**: `fireux-core/src/runtime/components/organisms/profiles/`

## 🛠️ Module Architecture

Each module follows Nuxt 3 module standards:

- Uses `defineNuxtModule()` for configuration
- Runtime code in `src/runtime/`
- Auto-imports for components and composables
- TypeScript support throughout

See the detailed documentation files for complete development guides.
