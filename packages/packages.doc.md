# 📦 FireUX Packages - Development Guide

## 🛠️ Module Architecture

### Correct Nuxt Module Structure

```
packages/fireux-*/
├── src/
│   ├── module.ts           # Main module definition (uses defineNuxtModule)
│   ├── runtime/            # Runtime components/composables
│   │   ├── components/     # Vue components
│   │   ├── composables/    # Auto-imported composables
│   │   ├── pages/          # Page templates
│   │   ├── layouts/        # Layout templates
│   │   └── server/         # Server API routes
│   └── types.ts            # Type definitions
├── package.json            # Module metadata & exports
└── tsconfig.json           # TypeScript configuration
```

## ⚙️ Module Optimization Best Practices

### 1. **Package Configuration**

#### ✅ Correct `package.json` for Nuxt modules:

```json
{
  "name": "fireux-core",
  "main": "./src/module.ts",
  "types": "./src/module.ts",
  "exports": {
    ".": {
      "import": "./src/module.ts",
      "types": "./src/module.ts"
    },
    "./composables/*": "./src/runtime/composables/*"
  },
  "scripts": {
    "build": "nuxt-module-build",
    "dev": "nuxt-module-build --stub"
  },
  "devDependencies": {
    "@nuxt/module-builder": "^1.0.1"
  }
}
```

#### ❌ What NOT to do:

- Don't use `nuxi build` for modules
- Don't create `nuxt.config.ts` in module packages
- Don't include full Nuxt app dependencies

### 2. **TypeScript Configuration**

#### ✅ Correct module `tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["./src/runtime/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

### 3. **Cross-Package Dependencies**

#### ✅ Correct workspace references:

```json
{
  "dependencies": {
    "fireux-core": "workspace:*"
  }
}
```

## 🚀 Building Modules

### Development Mode

```bash
# Build all packages in development mode (with stubs)
pnpm dev:packages

# Build specific package
cd packages/fireux-core
pnpm dev
```

### Production Build

```bash
# Build all packages for production
pnpm build:packages

# Build specific package
cd packages/fireux-core
pnpm build
```

## ✅ Module Resolution Status - RESOLVED

### The Solution

Our `fireux-core` module is now properly configured as a Nuxt module and building successfully:

- ✅ Uses `nuxt-module-build` for proper module building
- ✅ Correct module structure with `defineNuxtModule()`
- ✅ Proper TypeScript configuration
- ✅ Asset management is sovereign and automatic
- ✅ No TypeScript or build errors

### What We Fixed

- Removed unnecessary `nuxt.config.ts` from module package
- Updated build scripts to use `nuxt-module-build`
- Separated module configuration from app configuration
- Made asset management automatic via `assets-config.ts`
- Fixed server-side `useRuntimeConfig` imports

## 🐛 Common Issues & Solutions

### Issue: "Vue app aliases not allowed in server runtime"

**Cause:** Module has `nuxt.config.ts` or wrong build script  
**Solution:**

1. Remove `nuxt.config.ts` from module packages
2. Use `nuxt-module-build` in scripts
3. Ensure proper module structure

### Issue: Cross-package imports not working

**Cause:** Incorrect TypeScript path mapping or exports  
**Solution:**

1. Check `exports` in `package.json`
2. Verify TypeScript `paths` configuration
3. Use `workspace:*` for internal dependencies

### Issue: Firebase Server Runtime Errors

**Cause:** Client-side Firebase imports used in server context  
**Solution:**

1. Use server-specific Firebase Admin SDK
2. Check runtime context with `process.server`
3. Implement proper server/client separation

### Issue: Auto-imports not working

**Cause:** Missing configuration in module definition  
**Solution:**

1. Verify `*-config.ts` files are properly imported in `module.ts`
2. Check component/composable naming conventions
3. Rebuild module with `pnpm dev` or `pnpm build`

## 📋 Module Development Checklist

Before deploying a module, ensure:

- [ ] Uses `defineNuxtModule()` in `src/module.ts`
- [ ] Has proper `exports` in `package.json`
- [ ] Uses `nuxt-module-build` for building
- [ ] No `nuxt.config.ts` in module package
- [ ] TypeScript paths properly configured
- [ ] Cross-package dependencies use `workspace:*`
- [ ] Auto-import configurations are correct
- [ ] Server/client code separation is maintained
- [ ] All components follow naming conventions

## 🔄 Development Workflow

### Adding New Features

1. **Components**: Add to `src/runtime/components/` and update `components-config.ts`
2. **Composables**: Add to `src/runtime/composables/` and update `composables-config.ts`
3. **Pages**: Add to `src/runtime/pages/` and update `pages-config.ts`
4. **Server**: Add to `src/runtime/server/` for API endpoints

### Testing Changes

1. Use playground app for testing: `pnpm dev:playground`
2. Test in actual apps: `pnpm dev:fireux`, `pnpm dev:cleanbox`, etc.
3. Verify builds work: `pnpm build:packages`

### Publishing

1. Increment version in `package.json`
2. Build production version: `pnpm build`
3. Test in consuming apps
4. Commit and deploy

## 🏗️ Module Architecture Patterns

### Single Responsibility

Each module should have a clear, focused purpose:

- `fireux-core`: Shared infrastructure and base functionality
- `fireux-jobs`: Job marketplace specific features

### Composable Over Complex

Prefer composables over complex state management:

```typescript
// ✅ Good - Simple composable
export const useJobManagement = () => {
  return {
    createJob,
    updateJob,
    deleteJob,
  }
}

// ❌ Avoid - Complex state stores
const jobStore = reactive({
  /* complex state */
})
```

### Props Over Global State

Pass data through props rather than global state when possible:

```vue
<!-- ✅ Good - Explicit props -->
<CoreDashboard :extras="jobRoutes" />

<!-- ❌ Avoid - Implicit global state -->
<CoreDashboard />
<!-- assumes global job state -->
```

## 📚 Cross-References

- [`../architecture.doc.md`](../architecture.doc.md) - Overall system architecture
- [`fireux-core/core.doc.md`](./fireux-core/core.doc.md) - Core module details
- [`fireux-jobs/jobs.doc.md`](./fireux-jobs/jobs.doc.md) - Jobs module details
- [`../development-copilot.doc.md`](../development-copilot.doc.md) - AI development workflows
