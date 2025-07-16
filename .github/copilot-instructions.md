# FireUX Ecosystem - AI Coding Agent Instructions

> **📚 Complete Documentation**: See [FIREUX.md](../FIREUX.md) for comprehensive architecture, development, and troubleshooting guide.

## Quick Start & Development Workflow

### Starting Development

```bash
# Multiple apps in parallel
pnpm dev:fireux      # :3000 (yellow theme)
pnpm dev:cleanbox    # :3007 (blue theme)
pnpm dev:misebox     # :3009 (green theme)
pnpm dev:playground  # :3005 (test environment)

# Package development
pnpm build:packages  # Build all packages
pnpm dev:packages    # Develop all packages
pnpm clean:packages  # Clean all packages
```

### Adding Shared Features

- **Core Components**: Add to `packages/fireux-core/src/runtime/components/` → Auto-imported as `<FireComponentName>`
- **Domain Components**: Add to domain packages (`fireux-jobs/`, `fireux-misebox/`, `fireux-places/`) → Auto-imported with domain prefix
- **Pages**: Add to appropriate package runtime/pages → Available in apps that use that module
- **Composables**: Add to appropriate package runtime/composables → No imports needed

### Deployment

```bash
./deploy-all.sh  # Deploys all apps simultaneously
# Live: cleanbox.web.app, misebox.web.app, fireux.web.app
```

## Architecture Overview

### Monorepo Structure - Domain-Driven Packages

- **packages/**: Domain-specific Nuxt modules with clear separation
  - `fireux-core/`: Core framework (Firebase, auth, base components) - **NO DOMAIN CODE**
  - `fireux-jobs/`: Job marketplace functionality (Employer/Professional profiles)
  - `fireux-misebox/`: Chef/Supplier marketplace functionality
  - `fireux-places/`: Location and places management
- **projects/**: Production apps combining packages as needed
  - Each app customizes: landing page, theme, Firebase config, package selection

### Package Consistency (All Follow Same Pattern)

**Every package has identical structure:**

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

### Component Auto-Import Prefixes

- **fireux-core**: `<Fire...>` (e.g., `<FireButton>`, `<FireCard>`)
- **fireux-jobs**: `<Job...>` (e.g., `<JobCard>`, `<JobForm>`)
- **fireux-misebox**: `<Mise...>` (e.g., `<MiseChefCard>`, `<MiseSupplierForm>`)
- **fireux-places**: `<Place...>` (e.g., `<PlaceMap>`, `<PlaceSearch>`)

## Critical Patterns & Requirements

### Domain Separation (CRITICAL)

```typescript
// ✅ Correct: Domain-specific code in domain packages
packages/fireux-misebox/src/runtime/components/organisms/profiles/Chef/
packages/fireux-jobs/src/runtime/models/Employer.model.ts

// ❌ Wrong: Domain code in core package
packages/fireux-core/src/runtime/components/organisms/profiles/ // NO DOMAIN CODE!
```

### Package Dependencies (Workspace Pattern)

**All workspace references must use `workspace:*`:**

```json
{
  "dependencies": {
    "fireux-core": "workspace:*", // ✅ Correct
    "fireux-jobs": "workspace:*" // ✅ Correct
  }
}
```

**Never use relative paths:**

```json
{
  "dependencies": {
    "fireux-core": "workspace:../packages/fireux-core" // ❌ Wrong
  }
}
```

### Authentication-Based Routing (REQUIRED TIMING)

```vue
<!-- Required pattern in layouts -->
<script setup>
const { appUser } = await useAppUser() // Note: AWAIT required for timing
const jobPrivateRoutes = appUser ? getPrivateJobRoutes() || [] : []
</script>
```

### Module Extension Pattern (Learned from jobs module)

```typescript
// ✅ Simple: Props-based extension (preferred)
<CoreDefault :extras="jobRoutes" />

// ❌ Avoid: Complex global registries
routeRegistry.registerRoutes(jobsRoutes)  // Over-engineered
```

### Documentation Convention

- `.doc.md` files excluded from builds via `nuxt.options.nitro.ignore.push('**/*.doc.*')`
- Hierarchical: `README.md` → `package.doc.md` → `feature.doc.md`

## Current Focus: Multi-Domain Marketplace System

### Completed: Package Architecture Optimization

✅ **Domain-Driven Package Structure**: Proper separation of concerns

- `fireux-core`: Framework fundamentals only
- `fireux-jobs`: Job marketplace (Employer/Professional)
- `fireux-misebox`: Chef/Supplier marketplace
- `fireux-places`: Location services

✅ **Workspace Configuration**: Optimized monorepo setup

- Consistent package.json across all modules
- Proper `workspace:*` dependency references
- Clean root package.json with only shared dependencies

✅ **Package Recognition**: All modules properly linked

- Build/dev/clean scripts for package management
- Auto-import prefixes working correctly
- No dependency conflicts

### Next: Chef/Supplier Code Organization

🔄 **Critical Issue**: Chef/Supplier code duplication needs cleanup

- Remove any remaining domain code from `fireux-core`
- Ensure all Chef/Supplier functionality is in `fireux-misebox`
- Fix auto-import conflicts causing phantom file generation

### Architecture Validation Pattern

When adding new domain functionality:

```typescript
// ✅ Domain-specific models, components, composables
packages/fireux-[domain]/src/runtime/
├── models/[DomainType].model.ts
├── components/organisms/profiles/[Type]/
└── composables/firestore/profiles/[Type]/

// ✅ Generic, reusable functionality only
packages/fireux-core/src/runtime/
├── components/atoms/ (buttons, inputs)
├── components/molecules/ (forms, cards)
└── composables/auth/ (generic auth)
```

## Technology Integration

### Firebase/Firestore

- **Collections**: Profile types use app-scoped collections (`chefs`, `suppliers`)
- **Auth pattern**: `useCurrentUser()` from vuefire, UID as document ID
- **Validation**: Comprehensive validation functions before Firestore operations

### TypeScript

- **Module exports**: Use `nuxt-module-build` for proper packaging
- **Cross-package types**: Import from `fireux-core` to avoid duplication
- **Profile models**: Extend base `Profile` interface in app-specific models

## Anti-Patterns to Avoid

- **Code duplication**: Add shared functionality to fireux-core instead
- **Complex state**: Prefer props over global registries
- **Breaking changes**: Use additive-only approach
- **Premature abstraction**: Start simple, refactor when proven needed
- **Missing await**: Authentication requires `await useAppUser()` in layouts

## Development Best Practices

When working on shared features, always test in the playground environment first, then validate across all apps before deployment.
