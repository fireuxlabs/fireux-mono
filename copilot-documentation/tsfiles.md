# TypeScript config files (root + core)

Purpose: Quick reference of the exact tsconfig contents used at the repository root and in the core package.

Updated: 2025-09-29

---

## Root tsconfig.json

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "fireux-core": ["packages/core/fireux-core/src/module.ts"],
      "fireux-core/*": ["packages/core/fireux-core/src/*"],
      "fireux-core/runtime/*": ["packages/core/fireux-core/src/runtime/*"],
      "fireux-core/runtime/composables/*": [
        "packages/core/fireux-core/src/runtime/composables/*"
      ],
      "fireux-core/config/*": ["packages/core/fireux-core/src/config/*"],
      "#fireux-core-runtime/*": ["packages/core/fireux-core/src/runtime/*"],
      "fireux-misebox/*": ["packages/tenants/fireux-misebox/src/*"],
      "fireux-places/*": ["packages/extensions/fireux-places/src/*"],
      "fireux-jobs/*": ["packages/extensions/fireux-jobs/src/*"]
    }
  },
  "files": [],
  "include": [],
  "exclude": [
    "node_modules",
    "**/dist/**",
    "**/.nuxt/**",
    "**/.output/**",
    "**/.turbo/**",
    "**/.next/**"
  ]
}
```

---

## Core package tsconfig.json (packages/core/fireux-core)

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "composite": false,
    "baseUrl": ".",
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
    "types": ["nuxt", "nuxt/schema", "vite/client", "node"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "exclude": ["node_modules", "dist", ".nuxt", ".output"]
}
```

---

Notes:
- Packages rely on explicit Vue imports inside .vue/.ts files; app-level auto-imports (e.g., `#imports`) aren’t used in package scope.
- Packages include Nuxt ambient types via `types` but do not reference any app’s `.nuxt` output.
- Root paths expose package source for cross-package development.
