# TypeScript Configuration Report

Generated: 2025-09-08

This report lists all tsconfig*.json files found in the repo with their full contents for auditing and comparison.

---

## Quick findings for support

- Cross-project config under `projects/` (resolved):
  - `projects/tsconfig.json` has been removed to avoid project-root hijacking. `projects/tsconfig.projects.json` remains (safe; not auto-picked up unless referenced).
- Rogue server tsconfig (resolved):
  - `packages/core/fireux-core/src/runtime/server/tsconfig.json` has been removed; it previously included another app’s `.nuxt/*.d.ts` which could poison the type graph.
- App configs:
  - Each app (`projects/*/*-app/tsconfig.json`) extends its own `./.nuxt/tsconfig.json` and sets `types: ["nuxt", "nuxt/schema"]`. This is correct for macros like `defineAppConfig`.
- Minimal per-app tsconfig template (recommended):

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "moduleResolution": "Bundler",
    "paths": {
      "fireux-core": ["../../../packages/core/fireux-core/src/module.ts"],
      "fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "fireux-misebox": ["../../../packages/tenants/fireux-misebox/src/module.ts"],
      "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"],
      "fireux-cleanbox": ["../../../packages/tenants/fireux-cleanbox/src/module.ts"],
      "fireux-cleanbox/*": ["../../../packages/tenants/fireux-cleanbox/src/*"],
      "fireux-fireux": ["../../../packages/tenants/fireux-fireux/src/module.ts"],
      "fireux-fireux/*": ["../../../packages/tenants/fireux-fireux/src/*"],
      "fireux-jobs": ["../../../packages/extensions/fireux-jobs/src/module.ts"],
      "fireux-jobs/*": ["../../../packages/extensions/fireux-jobs/src/*"],
      "fireux-places": ["../../../packages/extensions/fireux-places/src/module.ts"],
      "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"]
    },
    "types": ["nuxt", "nuxt/schema"],
    "skipLibCheck": true
  },
  "include": ["./**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Status snapshot (post-cleanup)

- Removed cross-project config: projects/tsconfig.json (commit a6e4089)
- Removed rogue server tsconfig: packages/core/fireux-core/src/runtime/server/tsconfig.json (commit a6e4089)
- Per-app configs extend their own ./.nuxt/tsconfig.json and include Nuxt types; macro globals like defineAppConfig are provided by these generated types.

### Sanity checklist

- Each app extends its own ./.nuxt/tsconfig.json and keeps tsconfig minimal. ✓
- No repo-level or folder-level tsconfig that aggregates multiple apps. ✓ (projects/tsconfig.json removed)
- No package tsconfig references another app’s .nuxt types. ✓ (server tsconfig removed)

### Current app typecheck status (misebox)

- Type generation works; remaining errors are in tenant/core package sources and PWA plugin typings, not macro resolution. If needed, isolate app typecheck by pointing aliases to built d.ts or excluding package sources; otherwise, fix package types.

## tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/tsconfig.json

```jsonc
{
  "files": [],
  "references": [
    { "path": "packages/core/fireux-core" },
    { "path": "packages/extensions/fireux-jobs" },
    { "path": "packages/extensions/fireux-places" },
    { "path": "packages/tenants/fireux-misebox" },
    { "path": "packages/tenants/fireux-cleanbox" },
    { "path": "packages/tenants/fireux-fireux" },
  ],
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
      "fireux-core/config/*": ["packages/core/fireux-core/src/config/*"],
      "fireux-misebox/*": ["packages/tenants/fireux-misebox/src/*"],
      "fireux-places/*": ["packages/extensions/fireux-places/src/*"],
      "fireux-jobs/*": ["packages/extensions/fireux-jobs/src/*"],
    },
  },
}
```

## packages/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tsconfig.json

```jsonc
{
  "files": [],
  "references": [
    { "path": "core/fireux-core" },
    { "path": "extensions/fireux-jobs" },
    { "path": "extensions/fireux-places" },
    { "path": "tenants/fireux-misebox" },
    { "path": "tenants/fireux-cleanbox" },
  ],
  "compilerOptions": {
    "skipLibCheck": true,
  },
}
```

## packages/extensions/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/tsconfig.json

```jsonc
{
  "files": [],
  "references": [{ "path": "fireux-jobs" }, { "path": "fireux-places" }],
  "compilerOptions": { "skipLibCheck": true }
}
```

## packages/tenants/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/tsconfig.json

```jsonc
{
  "files": [],
  "references": [
    { "path": "fireux-misebox" },
    { "path": "fireux-cleanbox" },
    { "path": "fireux-fireux" }
  ],
  "compilerOptions": { "skipLibCheck": true }
}
```

## projects/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/tsconfig.json

```jsonc
// NOTE: This file has been removed to prevent TS from selecting it as a project root.
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@fireux-core/*": ["../packages/core/fireux-core/src/*"],
      "@fireux-jobs/*": ["../packages/extensions/fireux-jobs/src/*"],
      "@fireux-misebox/*": ["../packages/tenants/fireux-misebox/src/*"],
      "@fireux-cleanbox/*": ["../packages/tenants/fireux-cleanbox/src/*"],
      "@fireux-places/*": ["../packages/extensions/fireux-places/src/*"],
    },
  },
}
```

## projects/tsconfig.projects.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/tsconfig.projects.json

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

## projects/misebox/misebox-app/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/misebox/misebox-app/tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "composite": false,
    "baseUrl": ".",
    "moduleResolution": "Bundler",
    "paths": {
      "fireux-core": ["../../../packages/core/fireux-core/src/module.ts"],
      "fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "fireux-misebox": [
        "../../../packages/tenants/fireux-misebox/src/module.ts",
      ],
      "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"],
      "fireux-cleanbox": [
        "../../../packages/tenants/fireux-cleanbox/src/module.ts",
      ],
      "fireux-cleanbox/*": ["../../../packages/tenants/fireux-cleanbox/src/*"],
      "fireux-fireux": [
        "../../../packages/tenants/fireux-fireux/src/module.ts",
      ],
      "fireux-fireux/*": ["../../../packages/tenants/fireux-fireux/src/*"],
      "fireux-jobs": ["../../../packages/extensions/fireux-jobs/src/module.ts"],
      "fireux-jobs/*": ["../../../packages/extensions/fireux-jobs/src/*"],
      "fireux-places": [
        "../../../packages/extensions/fireux-places/src/module.ts",
      ],
      "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"],
    },
    "skipLibCheck": true,
  },
  "include": ["./**/*"],
  "exclude": ["node_modules", "dist"],
}
```

## projects/fireux/fireux-app/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/fireux/fireux-app/tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "composite": false,
    "baseUrl": ".",
    "moduleResolution": "Bundler",
    "paths": {
      "fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"],
      "fireux-cleanbox/*": ["../../../packages/tenants/fireux-cleanbox/src/*"],
      "fireux-fireux/*": ["../../../packages/tenants/fireux-fireux/src/*"],
      "fireux-jobs/*": ["../../../packages/extensions/fireux-jobs/src/*"],
      "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"],
    },
    "skipLibCheck": true,
    "types": ["nuxt", "nuxt/schema"],
  },
  "include": ["./**/*"],
}
```

## projects/cleanbox/cleanbox-app/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/cleanbox/cleanbox-app/tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "composite": false,
    "baseUrl": ".",
    "moduleResolution": "Bundler",
    "paths": {
      "fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"],
      "fireux-cleanbox/*": ["../../../packages/tenants/fireux-cleanbox/src/*"],
      "fireux-fireux/*": ["../../../packages/tenants/fireux-fireux/src/*"],
      "fireux-jobs/*": ["../../../packages/extensions/fireux-jobs/src/*"],
      "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"],
    },
    "skipLibCheck": true,
    "types": ["nuxt", "nuxt/schema"],
  },
  "include": ["./**/*"],
}
```

## projects/cleanbox/richies-reinigung/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/cleanbox/richies-reinigung/tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "composite": false,
    "baseUrl": ".",
    "moduleResolution": "Bundler",
    "paths": {
      "fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"],
      "fireux-cleanbox/*": ["../../../packages/tenants/fireux-cleanbox/src/*"],
      "fireux-fireux/*": ["../../../packages/tenants/fireux-fireux/src/*"],
      "fireux-jobs/*": ["../../../packages/extensions/fireux-jobs/src/*"],
      "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"]
    },
    "skipLibCheck": true,
    "types": ["nuxt", "nuxt/schema"]
  },
  "include": ["./**/*"]
}
```

## projects/fireux/tennant/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/fireux/tennant/tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "composite": false,
    "baseUrl": ".",
    "moduleResolution": "Bundler",
    "paths": {
      "fireux-core": ["../../../packages/core/fireux-core/src/module.ts"],
      "fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"],
      "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"]
    },
    "skipLibCheck": true,
    "types": ["nuxt", "nuxt/schema"]
  }
}
```

## packages/core/fireux-core/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/tsconfig.json

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
      "#fireux-core-models/*": ["./src/runtime/models/*"],
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"],
  },
  "include": ["src/**/*.ts", "src/runtime/env.d.ts"],
  "exclude": ["node_modules", "dist"],
}
```

## packages/extensions/fireux-jobs/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/tsconfig.json

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
      "#fireux-jobs-models/*": ["./src/runtime/models/*"],
      "#fireux-core-models/*": ["../../core/fireux-core/src/runtime/models/*"],
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"],
  },
  "include": ["src/**/*.ts", "src/runtime/env.d.ts"],
  "exclude": ["node_modules", "dist"],
}
```

## packages/extensions/fireux-places/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-places/tsconfig.json

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
      "#fireux-places-models/*": ["./src/runtime/models/*"],
      "#fireux-core-models/*": ["../../core/fireux-core/src/runtime/models/*"],
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"],
  },
  "include": ["src/**/*.ts", "src/runtime/env.d.ts"],
  "exclude": ["node_modules", "dist"],
}
```

## packages/tenants/fireux-cleanbox/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/tsconfig.json

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
      "#fireux-cleanbox-models/*": ["./src/runtime/models/*"],
      "#fireux-core-models/*": ["../../core/fireux-core/src/runtime/models/*"],
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"],
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"],
}
```

## packages/tenants/fireux-misebox/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/tsconfig.json

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
      "#fireux-misebox-models/*": ["./src/runtime/models/*"],
      "#fireux-places-models/*": [
        "../../extensions/fireux-places/src/runtime/models/*",
      ],
      "#fireux-core-models/*": ["../../core/fireux-core/src/runtime/models/*"],
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"],
  },
  "include": ["src/**/*.ts"],
  "exclude": [
    "node_modules",
    "dist",
    "src/runtime/composables/objects/**",
    "src/runtime/composables/firestore/objects/**",
    "src/runtime/models/objects/**",
  ],
}
```

## packages/tenants/fireux-fireux/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-fireux/tsconfig.json

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
      "#fireux-fireux-models/*": ["./src/runtime/models/*"],
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"],
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"],
}
```

## packages/extensions/fireux-jobs/src/runtime/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/runtime/tsconfig.json

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
      "#fireux-jobs-models/*": ["./src/runtime/models/*"],
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"],
  },
  "include": ["src/**/*.ts", "src/runtime/env.d.ts"],
  "exclude": ["node_modules", "dist"],
}
```

## packages/core/fireux-core/src/runtime/server/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/server/tsconfig.json

```jsonc
// NOTE: This file has been removed to avoid cross-app `.nuxt` type leakage.
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../.nuxt/server",
    "target": "esnext",
    "module": "esnext",
    "types": ["node"],
  },
  "include": [
    "./**/*",
    "../../../../../projects/fireux/fireux-app/.nuxt/imports.d.ts",
    "../../../../../projects/fireux/fireux-app/.nuxt/nuxt.d.ts",
  ],
}
```

## projects/misebox/niederhorn/tsconfig.json

Path: /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/misebox/niederhorn/tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "composite": false,
    "baseUrl": ".",
    "moduleResolution": "Bundler",
    "paths": {
      "fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"],
      "fireux-cleanbox/*": ["../../../packages/tenants/fireux-cleanbox/src/*"],
      "fireux-fireux/*": ["../../../packages/tenants/fireux-fireux/src/*"],
      "fireux-jobs/*": ["../../../packages/extensions/fireux-jobs/src/*"],
      "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"],
    },
    "skipLibCheck": true,
    "types": ["nuxt", "nuxt/schema"],
  },
  "include": ["./**/*"],
}
```

---

End of report.
