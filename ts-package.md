# TypeScript + package.json Inventory

This report lists all tsconfig*.json and package.json files across the monorepo, with focus excerpts for shared configs.

## Key shared configs

- projects/tsconfig.projects.json

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

## Alignment status (quick checks)

Apps tsconfig separation (projects/*/*-app/tsconfig.json):

- cleanbox/cleanbox-app — extends .nuxt, Bundler, includes .nuxt types, exclude pwa-icons-plugin.ts ✓
- cleanbox/richies-reinigung — same ✓
- fireux/fireux-app — same ✓
- misebox/misebox-app — same ✓
- misebox/niederhorn — same ✓

Packages separation:

- packages/tsconfig.packages.json present ✓
- packages/tsconfig.json umbrella present ✓
- packages/**/tsconfig.json: no .nuxt types (policy) ✓

Root scripts (package.json):

```jsonc
{
  "scripts": {
    "prepare:apps": "pnpm -r --filter './projects/*/*' exec nuxi prepare",
    "typecheck:apps": "pnpm -r --filter './projects/*/*' exec nuxi typecheck",
    "typecheck:packages": "tsc -p packages/tsconfig.packages.json --noEmit"
  }
}
```

Pinned versions (pnpm.overrides):

```jsonc
{
  "nuxt": "4.0.3",
  "@nuxt/kit": "4.0.3",
  "@nuxt/schema": "4.0.3",
  "vue": "3.5.20",
  "vuefire": "3.2.2",
  "firebase": "11.10.0",
  "@nuxt/ui": "3.3.3",
  "@nuxt/icon": "2.0.0",
  "@vite-pwa/nuxt": "1.0.4",
  "nuxt-vuefire": "^1.1.0",
  "tailwindcss": "^4.0.0",
  "postcss": "^8.4.38",
  "autoprefixer": "^10.4.20"
}
```

Public API imports from apps:

- Current: apps still map to package src/* (short-term). Next: rely on package exports only. ◻︎

PWA alignment (no shims):

- <NuxtPwaAssets /> in each app ✓
- Exclude .nuxt/pwa-icons-plugin.ts in each app tsconfig ✓
- Consider upgrading @vite-pwa/nuxt if upstream fix lands ◻︎

@nuxt/ui color tokens:

- Codemod pending ◻︎

Missing deps/types:

- vuefire/firebase pinned ✓; @vueup/vue-quill pending decision ◻︎

Async composables and TS hygiene:

- Targeted fixes pending (destructuring, Firestore guards, price guards, breadcrumbs) ◻︎

Shared project configs:

- projects/tsconfig.projects.json contains only aliases/baseUrl ✓

- packages/tsconfig.json (packages umbrella)

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

- packages/tsconfig.packages.json (packages-only entrypoint)

```jsonc
{
  "files": [],
  "references": [
    { "path": "core/fireux-core" },
    { "path": "extensions/fireux-jobs" },
    { "path": "extensions/fireux-places" },
    { "path": "tenants/fireux-misebox" },
    { "path": "tenants/fireux-cleanbox" },
    { "path": "tenants/fireux-fireux" }
  ],
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "target": "ESNext",
    "module": "ESNext",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true
  }
}
```

## All tsconfig files

- tsconfig.json
- packages/tsconfig.json
- packages/tsconfig.packages.json
- packages/extensions/fireux-places/tsconfig.json
- packages/extensions/tsconfig.json
- packages/extensions/fireux-jobs/src/runtime/tsconfig.json
- packages/extensions/fireux-jobs/tsconfig.json
- projects/tsconfig.projects.json
- packages/tenants/tsconfig.json
- projects/cleanbox/richies-reinigung/tsconfig.json
- packages/tenants/fireux-fireux/tsconfig.json
- packages/tenants/fireux-cleanbox/tsconfig.json
- projects/misebox/niederhorn/tsconfig.json
- packages/core/fireux-core/tsconfig.json
- projects/fireux/tennant/tsconfig.json
- projects/cleanbox/cleanbox-app/tsconfig.json
- projects/fireux/fireux-app/tsconfig.json
- projects/misebox/misebox-app/tsconfig.json
- packages/tenants/fireux-misebox/tsconfig.json

## All package.json files

- packages/scripts/package.json
- packages/extensions/fireux-places/package.json
- packages/extensions/fireux-jobs/package.json
- packages/tenants/fireux-fireux/package.json
- packages/core/fireux-core/package.json
- packages/tenants/fireux-misebox/package.json
- packages/tenants/fireux-cleanbox/package.json
- package.json (root)
- tools/vscode-fireux-toolbar/package.json
- projects/misebox/niederhorn/package.json
- projects/fireux/tennant/package.json
- projects/cleanbox/richies-reinigung/package.json
- projects/misebox/misebox-app/package.json
- projects/fireux/fireux-app/package.json
- projects/cleanbox/cleanbox-app/package.json

Notes:
- packages/tsconfig.packages.json exists and is used for packages-only typecheck.
- Tell me if you want the full JSON of each file embedded here or a diff against the repo root tsconfig.
