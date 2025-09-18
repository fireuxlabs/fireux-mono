# TypeScript config report

This document lists all `tsconfig*.json` files in the repository with their full contents for quick auditing and alignment.

Note: Generated Nuxt configs under `.nuxt/` are intentionally excluded.

---

## Root

- `tsconfig.json`

```jsonc
{
  "files": ["types/shims.d.ts"],
  "references": [
    { "path": "packages/core/fireux-core" },
    { "path": "packages/extensions/fireux-jobs" },
    { "path": "packages/extensions/fireux-places" },
    { "path": "packages/tenants/fireux-misebox" },
    { "path": "packages/tenants/fireux-cleanbox" },
    { "path": "packages/tenants/fireux-fireux" }
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
      "fireux-jobs/*": ["packages/extensions/fireux-jobs/src/*"]
    }
  }
}
```

---

## Packages aggregators

- `packages/tsconfig.json`

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
    "skipLibCheck": true
  }
}
```

- `packages/extensions/tsconfig.json`

```jsonc
{
  "files": [],
  "references": [{ "path": "fireux-jobs" }, { "path": "fireux-places" }],
  "compilerOptions": { "skipLibCheck": true }
}
```

- `packages/tenants/tsconfig.json`

```jsonc
//packages/tenants/tsconfig.json
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

---

## Core module

- `packages/core/fireux-core/tsconfig.json`

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
    "types": ["nuxt", "nuxt/schema", "@types/node"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Extensions

- `packages/extensions/fireux-jobs/tsconfig.json`

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
      "fireux-core": ["../../core/fireux-core/src/module.ts"],
      "fireux-core/*": ["../../core/fireux-core/src/*"]
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
```

- `packages/extensions/fireux-places/tsconfig.json`

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
      "#fireux-core-models/*": ["../../core/fireux-core/src/runtime/models/*"]
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"]
  },
  "include": ["src/**/*.ts", "src/runtime/env.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Tenants (packages)

- `packages/tenants/fireux-misebox/tsconfig.json`

```jsonc
//packages/tenants/fireux-misebox/tsconfig.json
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
        "../../extensions/fireux-places/src/runtime/models/*"
      ],
      "#fireux-core-models/*": ["../../core/fireux-core/src/runtime/models/*"],
      "fireux-core": ["../../core/fireux-core/src/module.ts"],
      "fireux-core/*": ["../../core/fireux-core/src/*"]
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"],
  "exclude": [
    "node_modules",
    "dist",
    // Defer objects domain from package-level tsc per scope agreement
    "src/runtime/composables/objects/**",
    "src/runtime/composables/firestore/objects/**",
    "src/runtime/models/objects/**"
  ]
}
```

- `packages/tenants/fireux-cleanbox/tsconfig.json`

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
      "#fireux-core-models/*": ["../../core/fireux-core/src/runtime/models/*"]
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- `packages/tenants/fireux-fireux/tsconfig.json`

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
      "#fireux-fireux-models/*": ["./src/runtime/models/*"]
    },
    "types": ["nuxt", "nuxt/schema", "@types/node"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Apps (projects)

- `projects/tsconfig.json` (empty file)

- `projects/tsconfig.projects.json`

```jsonc
{
  "files": [],
  "references": [
    { "path": "./cleanbox/cleanbox-app" },
    { "path": "./cleanbox/richies-reinigung" },
    { "path": "./misebox/misebox-app" },
    { "path": "./misebox/niederhorn" },
    { "path": "./fireux/fireux-app" },
    { "path": "./fireux/tennant" }
  ]
}
```

- `projects/cleanbox/cleanbox-app/tsconfig.json`

```jsonc
{
  // tsconfig for Cleanbox app — do not override Nuxt aliases (~, @, ~~)
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
      "#pwa": ["@vite-pwa/nuxt/dist/runtime/composables/index.d.ts"],
      "#imports": [".nuxt/imports.d.ts"],
      "#build/*": [".nuxt/*"]
      // Do NOT override ~/*, @/*, ~~/* here; Nuxt sets them to srcDir (app/)
    },
    "skipLibCheck": true,
    "types": ["nuxt", "vite/client"]
  },
  "include": ["./.nuxt/nuxt.d.ts", "./**/*"],
  "exclude": [
    "node_modules",
    "**/node_modules/**/@vite-pwa/nuxt/dist/runtime/components/*.vue"
  ]
}
```

- `projects/cleanbox/richies-reinigung/tsconfig.json`

```jsonc
{
  // tsconfig for Richies Reinigung app — do not override Nuxt aliases (~, @, ~~)
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
      "#pwa": ["@vite-pwa/nuxt/dist/runtime/composables/index.d.ts"],
      "#build/*": [".nuxt/*"]
      // Do NOT override ~/*, @/*, ~~/* here; Nuxt sets them to srcDir (app/)
    },
    "skipLibCheck": true,
    "types": ["nuxt", "vite/client"]
  },
  "include": ["./.nuxt/nuxt.d.ts", "./**/*"],
  "exclude": [
    "node_modules",
    "**/node_modules/**/@vite-pwa/nuxt/dist/runtime/components/*.vue"
  ]
}
```

- `projects/misebox/misebox-app/tsconfig.json`

```jsonc
{
  // tsconfig for Misebox app — do not override Nuxt aliases (~, @, ~~)
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
      "#pwa": ["@vite-pwa/nuxt/dist/runtime/composables/index.d.ts"],
      "#imports": [".nuxt/imports.d.ts"],
      "#build/*": [".nuxt/*"]
      // Do NOT override ~/*, @/*, ~~/* here; Nuxt sets them to srcDir (app/)
    },
    "skipLibCheck": true,
    "types": ["nuxt", "vite/client"]
  },
  "include": ["./.nuxt/nuxt.d.ts", "./**/*"],
  "exclude": [
    "node_modules",
    "**/node_modules/**/@vite-pwa/nuxt/dist/runtime/components/*.vue"
  ]
}
```

- `projects/misebox/niederhorn/tsconfig.json`

```jsonc
{
  // tsconfig for Niederhorn app — do not override Nuxt aliases (~, @, ~~)
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
      "#pwa": ["@vite-pwa/nuxt/dist/runtime/composables/index.d.ts"],
      "#build/*": [".nuxt/*"]
      // Do NOT override ~/*, @/*, ~~/* here; Nuxt sets them to srcDir (app/)
    },
    "skipLibCheck": true,
    "types": ["nuxt", "vite/client"]
  },
  "include": ["./.nuxt/nuxt.d.ts", "./**/*"],
  "exclude": [
    "node_modules",
    "**/node_modules/**/@vite-pwa/nuxt/dist/runtime/components/*.vue"
  ]
}
```

- `projects/fireux/fireux-app/tsconfig.json`

```jsonc
{
  // tsconfig for FireUX app — do not override Nuxt aliases (~, @, ~~)
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
      "#pwa": ["@vite-pwa/nuxt/dist/runtime/composables/index.d.ts"],
      "#imports": [".nuxt/imports.d.ts"],
      "#build/*": [".nuxt/*"]
      // Do NOT override ~/*, @/*, ~~/* here; Nuxt sets them to srcDir (app/)
    },
    "skipLibCheck": true,
    "types": ["nuxt", "vite/client"]
  },
  "include": ["./.nuxt/nuxt.d.ts", "./**/*"],
  "exclude": [
    "node_modules",
    "**/node_modules/**/@vite-pwa/nuxt/dist/runtime/components/*.vue"
  ]
}
```

- `projects/fireux/tennant/tsconfig.json`

```jsonc
{
  // tsconfig for Tennant app — do not override Nuxt aliases (~, @, ~~)
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
      "#pwa": ["@vite-pwa/nuxt/dist/runtime/composables/index.d.ts"],
      "#imports": [".nuxt/imports.d.ts"],
      "#build/*": [".nuxt/*"]
      // Do NOT override ~/*, @/*, ~~/* here; Nuxt sets them to srcDir (app/)
    },
    "skipLibCheck": true,
    "types": ["nuxt", "vite/client"]
  },
  "include": ["./.nuxt/nuxt.d.ts", "./**/*"],
  "exclude": [
    "node_modules",
    "**/node_modules/**/@vite-pwa/nuxt/dist/runtime/components/*.vue"
  ]
}
```

---

If you want this report split by domain (core vs tenants vs apps) or annotated with deltas from a desired baseline, I can add that next.
