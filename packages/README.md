# 📦 FireUX Packages

This directory contains the core Nuxt modules that power the FireUX ecosystem.

## � Package Structure

### `fireux-core/`

Core functionality and shared utilities:

- Firebase/Firestore management
- Authentication composables
- Admin utilities
- Base components and layouts
- Server API endpoints

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

## 🛠️ Module Architecture

Each module follows Nuxt 3 module standards:

- Uses `defineNuxtModule()` for configuration
- Runtime code in `src/runtime/`
- Auto-imports for components and composables
- TypeScript support throughout

See the detailed documentation files for complete development guides.
