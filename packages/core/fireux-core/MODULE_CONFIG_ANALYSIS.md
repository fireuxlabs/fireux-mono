# FireUX Core - Module Configuration Analysis

## Current module.ts Structure

The main module file `src/module.ts` imports and calls 7 configure functions:

```typescript
// Current imports in module.ts
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configurePlugins } from './config/plugins-config'
import { configureServer } from './config/server-config'
import { configureRuntime } from './config/runtime-config'

// Current function calls in setup()
configureComponents(resolver, options)
configureComposables(resolver)
configureModels(resolver, nuxt)
configurePages(resolver, nuxt)
configurePlugins(resolver)
configureServer(resolver)
configureRuntime(nuxt)
```

## Current src/config/ Directory Contents

### Core Configuration Files (Used by module.ts)

- ✅ `components-config.ts` - Component registration
- ✅ `composables-config.ts` - Auto-import composables
- ✅ `models-config.ts` - Model imports
- ✅ `pages-config.ts` - Page registration
- ✅ `plugins-config.ts` - Plugin registration
- ✅ `server-config.ts` - Server handler registration
- ✅ `runtime-config.ts` - Runtime configuration

### Additional Files (Not used by module.ts)

- `assets-config.ts` - Asset configuration
- `base-nuxt.config.ts` - Base Nuxt configuration
- `errors-config.ts` - Error handling configuration
- `fireux-config.ts` - FireUX specific configuration
- `layouts-config.ts` - Layout configuration

## Analysis & Recommendations

### ✅ Keep in src/config/ (Module-level)

The 7 files imported by module.ts should stay as they are core module functionality:

- components-config.ts
- composables-config.ts
- models-config.ts
- pages-config.ts
- plugins-config.ts
- server-config.ts
- runtime-config.ts

### 🔄 Consider Moving (App-level concerns)

These files might be better located elsewhere as they seem more app-specific:

**Move to `src/runtime/config/`** (Runtime utilities):

- `assets-config.ts` - Runtime asset handling
- `layouts-config.ts` - Layout utilities
- `errors-config.ts` - Runtime error handling

**Move to `src/config/app/`** (Application setup):

- `base-nuxt.config.ts` - App configuration template
- `fireux-config.ts` - App-specific FireUX setup

## Proposed Clean Structure

```
packages/core/fireux-core/src/
├── module.ts (clean, focused on 7 core configs)
├── config/ (module-level only)
│   ├── components-config.ts
│   ├── composables-config.ts
│   ├── models-config.ts
│   ├── pages-config.ts
│   ├── plugins-config.ts
│   ├── server-config.ts
│   └── runtime-config.ts
├── config/app/ (app-level utilities)
│   ├── base-nuxt.config.ts
│   └── fireux-config.ts
└── runtime/
    └── config/ (runtime utilities)
        ├── assets-config.ts
        ├── layouts-config.ts
        └── errors-config.ts
```

This separation makes it clear:

- **src/config/** = Module registration logic
- **src/config/app/** = Application setup utilities
- **src/runtime/config/** = Runtime configuration helpers
