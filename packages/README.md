# 📦 FireUX Packages

This directory contains the domain-specific Nuxt modules that power the FireUX ecosystem.

## 🏗 Package Structure

### `fireux-core/`

Core framework functionality (NO DOMAIN CODE):

- **Authentication & Database**: Firebase/Firestore management
- **Base Components**: Generic UI components (buttons, forms, cards)
- **Core Composables**: Auth, database, and framework utilities
- **Server APIs**: Backend endpoints and utilities
- **Admin Tools**: Administrative interfaces

**Auto-Import Prefix**: `<Fire...>` (e.g., `<FireButton>`, `<FireCard>`)

### `fireux-jobs/`

Job marketplace functionality:

- **Employer Profiles**: Employer management and profiles
- **Professional Profiles**: Professional profiles and job applications
- **Job Management**: Job posting and application utilities
- **Job Routing**: Job-specific page routing

**Auto-Import Prefix**: `<Job...>` (e.g., `<JobCard>`, `<JobForm>`)

### `fireux-misebox/`

Chef/Supplier marketplace functionality:

- **Chef Profiles**: Chef management and profiles
- **Supplier Profiles**: Supplier management and profiles
- **Mise Management**: Kitchen and supply chain utilities
- **Mise Routing**: Chef/Supplier-specific page routing

**Auto-Import Prefix**: `<Mise...>` (e.g., `<MiseChefCard>`, `<MiseSupplierForm>`)

### `fireux-places/`

Location and places management:

- **Places API**: Google Places integration
- **Location Services**: Geolocation and mapping utilities
- **Address Management**: Address validation and formatting

**Auto-Import Prefix**: `<Place...>` (e.g., `<PlaceMap>`, `<PlaceSearch>`)

## 🛠 Package Development

```bash
# Build all packages in development mode
pnpm dev:packages

# Build for production
pnpm build:packages

# Clean all packages
pnpm clean:packages

# Individual package development
cd packages/fireux-core && pnpm dev
cd packages/fireux-jobs && pnpm dev
cd packages/fireux-misebox && pnpm dev
cd packages/fireux-places && pnpm dev
```

## 📚 Documentation

- [`packages.doc.md`](./packages.doc.md) - Detailed module architecture and development guide
- [`fireux-core/core.doc.md`](./fireux-core/core.doc.md) - Core module documentation
- [`fireux-jobs/jobs.doc.md`](./fireux-jobs/jobs.doc.md) - Jobs module documentation

## 🚀 Current Development Focus

**Domain-driven architecture optimization:**

✅ **Package Separation**: Domain-specific code moved to appropriate packages

- Chef/Supplier functionality → `fireux-misebox`
- Job marketplace functionality → `fireux-jobs`
- Core framework only → `fireux-core`

✅ **Workspace Configuration**: Optimized monorepo setup

- Consistent package.json across all modules
- Proper `workspace:*` dependency references
- Build/dev/clean scripts for package management

🔄 **Next**: Clean up any remaining domain code duplication

## 🏛 Architecture Principles

### Domain Separation

```typescript
// ✅ Correct: Domain-specific code in domain packages
packages/fireux-misebox/src/runtime/components/organisms/profiles/Chef/
packages/fireux-jobs/src/runtime/models/Employer.model.ts

// ❌ Wrong: Domain code in core package
packages/fireux-core/src/runtime/components/organisms/profiles/ // NO DOMAIN CODE!
```

### Package Dependencies

**All workspace references use `workspace:*`:**

```json
{
  "dependencies": {
    "fireux-core": "workspace:*",
    "fireux-jobs": "workspace:*",
    "fireux-misebox": "workspace:*"
  }
}
```

### Consistent Package Structure

All packages follow the same pattern:

- `version: "0.1.0"`
- `@nuxt/kit: "^3.17.5"`
- `@nuxt/module-builder: "^0.5.5"`
- Same build scripts and exports structure

## 🛠️ Module Architecture

Each module follows Nuxt 3 module standards:

- Uses `defineNuxtModule()` for configuration
- Runtime code in `src/runtime/`
- Auto-imports for components and composables
- TypeScript support throughout

See the detailed documentation files for complete development guides.
