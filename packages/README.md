# FireUX Packages

This directory contains the core Nuxt modules that power the FireUX ecosystem.

## ✅ Current Status - RESOLVED

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

## 📦 Package Structure

### `fireux-core/`

Core functionality and shared utilities:

- Firebase/Firestore management
- Authentication composables
- Admin utilities
- Base components and layouts

### `fireux-jobs/`

Job board specific functionality:

- Employer management
- Professional profiles
- Job posting utilities
- Job-specific routing

## 🛠️ Proper Module Architecture

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

## 📋 Module Checklist

Before deploying a module, ensure:

- [ ] Uses `defineNuxtModule()` in `src/module.ts`
- [ ] Has proper `exports` in `package.json`
- [ ] Uses `nuxt-module-build` for building
- [ ] No `nuxt.config.ts` in module package
- [ ] TypeScript paths properly configured
- [ ] Cross-package dependencies use `workspace:*`

**Import Guidelines**: See `/copilot.md` for import strategy (cross-package vs within-package patterns).
