# TypeScript configuration (root → core)

This report lists the tsconfig files from the repository root though core-related packages. Each section shows the absolute path and the full file contents.

---

## /tsconfig.json (repo root)

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

## /packages/tsconfig.json

```jsonc
//packages/tsconfig.json
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
    "skipLibCheck": true,
    "types": ["nuxt"]
  }
}
```

---

## /packages/core/fireux-core/tsconfig.json

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

## Projects configs (for convenience)

### /projects/tsconfig.json

```jsonc
{
  "compilerOptions": {
    "skipLibCheck": true
  },
  "files": [],
  "references": [
    { "path": "./fireux/fireux-app" },
    { "path": "./misebox/misebox-app" },
    { "path": "./cleanbox/cleanbox-app" }
  ]
}
```

### /projects/tsconfig.projects.json

```jsonc
{
  "compilerOptions": {
    "skipLibCheck": true
  },
  "files": [],
  "references": [
    { "path": "./fireux/fireux-app" },
    { "path": "./misebox/misebox-app" },
    { "path": "./cleanbox/cleanbox-app" },
    { "path": "./misebox/niederhorn" },
    { "path": "./cleanbox/richies-reinigung" },
    { "path": "./fireux/tennant" }
  ]
}
```

```

```
