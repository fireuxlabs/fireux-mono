# FireUX Monorepo TypeScript Configuration

> **📚 Complete Documentation**: Comprehensive overview of all TypeScript configurations across the FireUX monorepo ecosystem.

## Overview

The FireUX monorepo uses a hierarchical TypeScript configuration strategy with project references to optimize type checking and build performance across all packages and applications.

## Configuration Hierarchy

```
├── tsconfig.json (Root - Project References)
├── packages/
│   ├── tsconfig.json (Package References)
│   ├── core/fireux-core/tsconfig.json (Core Module)
│   ├── extensions/
│   │   ├── fireux-jobs/tsconfig.json (Jobs Module)
│   │   └── fireux-places/tsconfig.json (Places Module)
│   └── tenants/
│       ├── fireux-misebox/tsconfig.json (Misebox Module)
│       └── fireux-cleanbox/tsconfig.json (Cleanbox Module)
└── projects/
    ├── tsconfig.json (Projects Base)
    ├── fireux/fireux-app/tsconfig.json (Main App)
    ├── misebox/
    │   ├── misebox-app/tsconfig.json (Misebox App)
    │   └── niederhorn/tsconfig.json (Niederhorn App)
    └── cleanbox/
        ├── cleanbox-app/tsconfig.json (CleanBox App)
        └── richies-reinigung/tsconfig.json (Richies App)
```

---

## Root Configuration

### `/tsconfig.json`
**Purpose**: Workspace orchestration with project references  
**Strategy**: References all packages and projects for unified type checking

```jsonc
{
  "files": [],
  "references": [
    { "path": "projects/fireux/fireux-app" },
    { "path": "projects/misebox/misebox-app" },
    { "path": "projects/misebox/niederhorn" },
    { "path": "projects/cleanbox/cleanbox-app" },
    { "path": "projects/cleanbox/richies-reinigung" },
    { "path": "packages/core/fireux-core" },
    { "path": "packages/extensions/fireux-jobs" },
    { "path": "packages/extensions/fireux-places" },
    { "path": "packages/tenants/fireux-misebox" },
    { "path": "packages/tenants/fireux-cleanbox" }
  ],
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

---

## Package Configurations

### `/packages/tsconfig.json`
**Purpose**: Package-level orchestration  
**Strategy**: References all package modules

```jsonc
{
  "files": [],
  "references": [
    { "path": "core/fireux-core" },
    { "path": "extensions/fireux-jobs" },
    { "path": "extensions/fireux-places" },
    { "path": "tenants/fireux-misebox" },
    { "path": "tenants/fireux-cleanbox" }
  ],
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

### `/packages/core/fireux-core/tsconfig.json`
**Purpose**: Core framework module configuration  
**Features**: Base model path mappings, Nuxt module support

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "#fireux-core-models/*": ["./src/runtime/models/*"]
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"]
  },
  "include": [
    "src/**/*.ts",
    "src/runtime/env.d.ts"
  ],
  "exclude": ["node_modules", "dist"]
}
```

### `/packages/extensions/fireux-jobs/tsconfig.json`
**Purpose**: Jobs marketplace module configuration  
**Features**: Domain-specific model paths, core model inheritance

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "#fireux-jobs-models/*": ["./src/runtime/models/*"],
      "#fireux-core-models/*": ["../../../packages/core/fireux-core/src/runtime/models/*"]
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"]
  },
  "include": [
    "src/**/*.ts",
    "src/runtime/env.d.ts"
  ],
  "exclude": ["node_modules", "dist"]
}
```

### `/packages/extensions/fireux-places/tsconfig.json`
**Purpose**: Places/location services module configuration  
**Features**: Places-specific model paths, core model inheritance

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "#fireux-places-models/*": ["./src/runtime/models/*"],
      "#fireux-core-models/*": [
        "../../../packages/core/fireux-core/src/runtime/models/*"
      ]
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"]
  },
  "include": ["src/**/*.ts", "src/runtime/env.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### `/packages/tenants/fireux-misebox/tsconfig.json`
**Purpose**: Chef/Supplier marketplace module configuration  
**Features**: Multi-dependency model paths (core + places), domain-specific models

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "#fireux-misebox-models/*": ["./src/runtime/models/*"],
      "#fireux-core-models/*": [
        "../../../packages/core/fireux-core/src/runtime/models/*"
      ],
      "#fireux-places-models/*": [
        "../../../packages/extensions/fireux-places/src/runtime/models/*"
      ]
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"]
  },
  "include": ["src/**/*.ts", "src/runtime/env.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### `/packages/tenants/fireux-cleanbox/tsconfig.json`
**Purpose**: Cleaning services module configuration  
**Features**: CleanBox-specific model paths, core model inheritance

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "#fireux-cleanbox-models/*": ["./src/runtime/models/*"],
      "#fireux-core-models/*": [
        "../../../packages/core/fireux-core/src/runtime/models/*"
      ]
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"]
  },
  "include": ["src/**/*.ts", "src/runtime/env.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Project Configurations

### `/projects/tsconfig.json`
**Purpose**: Base configuration for all Nuxt applications  
**Features**: Cross-package imports via `@fireux-*` aliases

```jsonc
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@fireux-core/*": ["../packages/core/fireux-core/src/*"],
      "@fireux-jobs/*": ["../packages/extensions/fireux-jobs/src/*"],
      "@fireux-misebox/*": ["../packages/tenants/fireux-misebox/src/*"],
      "@fireux-cleanbox/*": ["../packages/tenants/fireux-cleanbox/src/*"],
      "@fireux-places/*": ["../packages/extensions/fireux-places/src/*"]
    }
  }
}
```

### `/projects/fireux/fireux-app/tsconfig.json`
**Purpose**: Main FireUX application configuration  
**Features**: Nuxt-generated types, core package integration

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@fireux-core/*": ["../../packages/core/fireux-core/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"]
    }
  }
}
```

### `/projects/misebox/misebox-app/tsconfig.json`
**Purpose**: Misebox application configuration  
**Features**: Nuxt base configuration with optimized settings

```jsonc
{
  "extends": "../../../node_modules/@nuxt/tsconfig/tsconfig.json",
  "compilerOptions": {
    "types": ["nuxt", "nuxt/schema", "vue-router", "@types/node"],
    "skipLibCheck": true
  }
}
```

### `/projects/cleanbox/cleanbox-app/tsconfig.json`
**Purpose**: CleanBox application configuration  
**Features**: Multi-package imports, custom path mappings

```jsonc
{
  // https://nuxt.com/docs/guide/concepts/typescript
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": "./",
    "paths": {
      "@fireux-core/*": ["../../packages/core/fireux-core/src/*"],
      "@fireux-jobs/*": ["../../packages/extensions/fireux-jobs/src/*"],
      "@fireux-cleanbox/*": ["../../packages/tenants/fireux-cleanbox/src/*"],
      "@fireux-places/*": ["../../packages/extensions/fireux-places/src/*"],
      "~~/*": ["./*"],
      "@/*": ["./*"]
    }
  },
  "extends": "./.nuxt/tsconfig.json"
}
```

---

## Configuration Patterns

### 🎯 **Model Path Mapping Strategy**

Each package exposes its models through a consistent pattern:

```typescript
// Package-specific models
"#fireux-core-models/*": ["./src/runtime/models/*"]
"#fireux-jobs-models/*": ["./src/runtime/models/*"]  
"#fireux-places-models/*": ["./src/runtime/models/*"]
"#fireux-misebox-models/*": ["./src/runtime/models/*"]
"#fireux-cleanbox-models/*": ["./src/runtime/models/*"]

// Cross-package model access
"#fireux-core-models/*": ["../../../packages/core/fireux-core/src/runtime/models/*"]
```

### 🏗️ **Application Integration Pattern**

Applications access packages via `@fireux-*` aliases:

```typescript
"@fireux-core/*": ["../packages/core/fireux-core/src/*"]
"@fireux-jobs/*": ["../packages/extensions/fireux-jobs/src/*"]
"@fireux-places/*": ["../packages/extensions/fireux-places/src/*"]
"@fireux-misebox/*": ["../packages/tenants/fireux-misebox/src/*"]
"@fireux-cleanbox/*": ["../packages/tenants/fireux-cleanbox/src/*"]
```

### ⚡ **Performance Optimizations**

All configurations include these performance settings:

```typescript
{
  "target": "ES2022",
  "module": "ESNext", 
  "moduleResolution": "Bundler",
  "skipLibCheck": true,
  "noEmit": true,
  "isolatedModules": true,
  "verbatimModuleSyntax": true
}
```

---

## Key Features

### ✅ **Project References**
- Hierarchical type checking for optimal build performance
- Incremental compilation support
- Clear dependency relationships

### ✅ **Path Mapping**  
- Consistent model access patterns across packages
- Clean import statements without relative paths
- Domain-specific namespacing (`#fireux-*-models/*`)

### ✅ **Nuxt 4 Integration**
- Modern ESNext module system
- Bundler-based module resolution  
- Auto-generated types through `.nuxt/tsconfig.json`

### ✅ **Strict Type Safety**
- `strict: true` across all configurations
- `noUnusedLocals` and `noUnusedParameters` enforcement
- `verbatimModuleSyntax` for explicit imports

---

## Usage Examples

### Package Development
```typescript
// In fireux-jobs package
import type { Profile } from '#fireux-core-models/profiles/profile.model'
import type { Employer } from '#fireux-jobs-models/profiles/Employer.model'
```

### Application Development  
```typescript
// In any Nuxt app
import { useAppUser } from '@fireux-core/composables/firestore/AppUser/useAppUser'
import type { JobType } from '@fireux-jobs/runtime/models/objects/Job.model'
```

---

## Maintenance Guidelines

### 🔧 **Adding New Packages**
1. Create `tsconfig.json` with consistent compiler options
2. Add package-specific model path (`#fireux-newpackage-models/*`)
3. Add core model access (`#fireux-core-models/*`)
4. Update root project references
5. Update `/packages/tsconfig.json` references

### 🔧 **Adding New Applications**
1. Extend `./.nuxt/tsconfig.json` or `@nuxt/tsconfig/tsconfig.json`
2. Add required `@fireux-*` path mappings
3. Update root project references
4. Test cross-package imports

### 🔧 **Model Dependencies**
- **Core models**: Available to all packages via `#fireux-core-models/*`
- **Extension models**: Available to dependent packages only
- **Tenant models**: Isolated to specific applications

---

## Troubleshooting

### Common Issues

**Path Resolution Errors:**
- Ensure path mappings use forward slashes (`/`)
- Verify relative paths from package root
- Check `baseUrl` configuration

**Module Import Errors:**
- Verify `verbatimModuleSyntax: true` for explicit imports
- Use `import type` for type-only imports
- Ensure `allowImportingTsExtensions: true`

**Build Performance:**
- Use project references for large codebases
- Enable `skipLibCheck: true` for faster builds
- Utilize `noEmit: true` for type checking only

---

*Last Updated: August 28, 2025*  
*Nuxt Version: 4.0.3*  
*TypeScript Version: 5.x*
