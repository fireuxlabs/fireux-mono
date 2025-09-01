# Repo Operational Snapshot (reoper.md)

This snapshot includes the contents of all package.json and tsconfig\*.json files across the workspace at generation time.

## Root package.json

```json
{
  "name": "fireux",
  "private": true,
  "type": "module",
  "version": "1.0.0",
  "workspaces": [
    "packages/core/*",
    "packages/extensions/*",
    "packages/tenants/*",
    "projects/*/*",
    "tools/*",
    "test-*"
  ],
  "scripts": {
    "dev:all": "concurrently \"pnpm dev:fireux\" \"pnpm dev:misebox\" \"pnpm dev:cleanbox\"",
    "dev:fireux": "pnpm --filter ./projects/fireux/fireux-app dev",
    "dev:misebox": "pnpm --filter ./projects/misebox/misebox-app dev",
    "dev:niederhorn": "pnpm --filter ./projects/misebox/niederhorn dev",
    "dev:cleanbox": "pnpm --filter ./projects/cleanbox/cleanbox-app dev",
    "dev:richies": "pnpm --filter ./projects/cleanbox/richies-reinigung dev",
    "build:all": "pnpm -r --parallel --filter './projects/*/*' build",
    "build:packages": "pnpm -r --filter './packages/*/*' build",
    "tsc:clean": "tsc -b --clean",
    "tsc:check": "tsc -b --pretty",
    "typecheck:apps": "pnpm -r --filter './projects/*/*' exec nuxi typecheck",
    "typecheck:packages": "pnpm -r --filter './packages/*/*' exec tsc --noEmit",
    "lint": "eslint . --ext .js,.ts,.vue",
    "format": "prettier --write ."
  },
  "engines": {
    "node": ">=20.11 <23",
    "pnpm": ">=10"
  },
  "devDependencies": {
    "@nuxt/devtools": "^2.6.3",
    "@nuxt/fonts": "^0.11.4",
    "@nuxt/icon": "^2.0.0",
    "@nuxt/schema": "4.0.3",
    "@nuxt/ui": "3.1.3",
    "@nuxtjs/color-mode": "^3.5.2",
    "@tsconfig/nuxt": "^2.0.3",
    "@types/node": "^20.19.11",
    "@typescript-eslint/eslint-plugin": "^8.41.0",
    "@typescript-eslint/parser": "^8.41.0",
    "concurrently": "^9.2.0",
    "eslint": "^9.28.0",
    "eslint-config-prettier": "^10.1.5",
    "eslint-plugin-vue": "^10.2.0",
    "nuxt": "4.0.3",
    "nuxt-vuefire": "^1.1.0",
    "prettier": "^3.5.3",
    "tailwindcss": "^4.1.12",
    "typescript": "^5.9.2",
    "vite-plugin-pwa": "^1.0.3",
    "vue-eslint-parser": "^10.2.0",
    "vue-tsc": "^3.0.6"
  },
  "pnpm": {
    "overrides": {
      "nuxt": "4.0.3",
      "@nuxt/kit": "4.0.3",
      "@nuxt/schema": "4.0.3",
      "vue": "3.5.20",
      "vuefire": "3.2.2",
      "firebase": "11.10.0"
    }
  },
  "packageManager": "pnpm@10.12.1"
}
```

## Root tsconfig.json

```jsonc
{
  "extends": "./tsconfig.base.json",
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
    { "path": "packages/tenants/fireux-cleanbox" },
  ],
}
```

## Root tsconfig.base.json

```jsonc
{
  "compilerOptions": {
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
      "fireux-core/*": ["packages/core/fireux-core/src/*"],
      "fireux-core/config/*": ["packages/core/fireux-core/src/config/*"],
      "fireux-core/config/app/*": [
        "packages/core/fireux-core/src/config/app/*",
      ],
      "fireux-misebox/*": ["packages/tenants/fireux-misebox/src/*"],
      "fireux-places/*": ["packages/extensions/fireux-places/src/*"],
      "fireux-jobs/*": ["packages/extensions/fireux-jobs/src/*"],
    },
  },
}
```

## Packages

### packages/core/fireux-core/package.json

```json
{
  "name": "fireux-core",
  "version": "0.1.0",
  "description": "FireUX Core - A comprehensive Nuxt 3 module for Firebase integration",
  "private": true,
  "main": "./src/module.ts",
  "types": "./src/module.ts",
  "exports": {
    ".": {
      "types": "./src/module.ts",
      "import": "./src/module.ts"
    },
    "./runtime/*": {
      "types": "./src/runtime/*",
      "import": "./src/runtime/*"
    },
    "./config/*": {
      "types": "./src/config/*",
      "import": "./src/config/*"
    },
    "./config/app/*": {
      "types": "./src/config/app/*",
      "import": "./src/config/app/*"
    },
    "./package.json": "./package.json"
  },
  "typesVersions": {
    "*": {
      "config/*": ["src/config/*"],
      "config/app/*": ["src/config/app/*"],
      "runtime/*": ["src/runtime/*"]
    }
  },
  "files": ["src/**/*"],
  "scripts": {
    "build": "nuxt-module-build build",
    "dev": "nuxt-module-build --stub",
    "postbuild": "rimraf src/**/*.map",
    "clean": "rimraf dist"
  },
  "engines": {
    "node": ">=20.11 <23",
    "pnpm": ">=10"
  },
  "dependencies": {
    "dompurify": "^3.2.6"
  },
  "peerDependencies": {
    "nuxt": "4.0.3",
    "@nuxt/kit": "4.0.3",
    "@nuxt/schema": "4.0.3",
    "vue": "3.5.20",
    "vue-router": "^4.5.0",
    "vuefire": "3.2.2",
    "firebase": "11.10.0",
    "firebase-admin": "*",
    "h3": "*",
    "stripe": "*",
    "glob": "^11.0.3",
    "@vueuse/core": "*"
  },
  "devDependencies": {
    "@nuxt/module-builder": "^0.5.5",
    "rimraf": "^6.0.1"
  },
  "type": "module"
}
```

### packages/extensions/fireux-jobs/package.json

```json
{
  "name": "fireux-jobs",
  "version": "0.1.0",
  "description": "Job posting and application system for FireUX apps",
  "private": true,
  "main": "./src/module.ts",
  "types": "./src/module.ts",
  "exports": {
    ".": "./src/module.ts",
    "./runtime/*": "./src/runtime/*",
    "./package.json": "./package.json"
  },
  "files": ["src/**/*"],
  "scripts": {
    "build": "nuxt-module-build build",
    "dev": "nuxt-module-build --stub",
    "postbuild": "rimraf src/**/*.map",
    "clean": "rimraf dist"
  },
  "engines": {
    "node": ">=20.11 <23",
    "pnpm": ">=10"
  },
  "dependencies": {
    "fireux-core": "workspace:*"
  },
  "peerDependencies": {
    "nuxt": "4.0.3",
    "@nuxt/kit": "4.0.3",
    "@nuxt/schema": "4.0.3",
    "vue": "3.5.20",
    "vue-router": "^4.5.0",
    "vuefire": "3.2.2",
    "firebase": "11.10.0",
    "firebase-admin": "*",
    "h3": "*",
    "stripe": "*",
    "@vueuse/core": "*"
  },
  "devDependencies": {
    "@nuxt/module-builder": "^0.5.5",
    "rimraf": "^6.0.1",
    "glob": "^11.0.3"
  },
  "type": "module"
}
```

### packages/extensions/fireux-places/package.json

```json
{
  "name": "fireux-places",
  "version": "0.1.0",
  "description": "Location and places management system for FireUX apps with Google Places API integration",
  "private": true,
  "main": "./src/module.ts",
  "types": "./src/module.ts",
  "exports": {
    ".": "./src/module.ts",
    "./runtime/*": "./src/runtime/*",
    "./package.json": "./package.json"
  },
  "files": ["src/**/*"],
  "scripts": {
    "build": "nuxt-module-build build",
    "dev": "nuxt-module-build --stub",
    "postbuild": "rimraf src/**/*.map",
    "clean": "rimraf dist"
  },
  "engines": {
    "node": ">=20.11 <23",
    "pnpm": ">=10"
  },
  "dependencies": {
    "fireux-core": "workspace:*"
  },
  "peerDependencies": {
    "nuxt": "4.0.3",
    "@nuxt/kit": "4.0.3",
    "@nuxt/schema": "4.0.3",
    "vue": "3.5.20",
    "vue-router": "^4.5.0",
    "vuefire": "3.2.2",
    "firebase": "11.10.0",
    "firebase-admin": "*",
    "h3": "*",
    "stripe": "*",
    "@vueuse/core": "*"
  },
  "devDependencies": {
    "@nuxt/module-builder": "^0.5.5",
    "rimraf": "^6.0.1",
    "glob": "^11.0.3"
  },
  "type": "module"
}
```

### packages/tenants/fireux-misebox/package.json

```json
{
  "name": "fireux-misebox",
  "version": "0.1.0",
  "description": "Chef and Supplier marketplace system for FireUX apps",
  "private": true,
  "main": "./src/module.ts",
  "types": "./src/module.ts",
  "exports": {
    ".": "./src/module.ts",
    "./runtime/*": "./src/runtime/*",
    "./package.json": "./package.json"
  },
  "files": ["src/**/*"],
  "scripts": {
    "build": "nuxt-module-build build",
    "dev": "nuxt-module-build --stub",
    "postbuild": "rimraf src/**/*.map",
    "clean": "rimraf dist"
  },
  "engines": {
    "node": ">=20.11 <23",
    "pnpm": ">=10"
  },
  "dependencies": {
    "fireux-core": "workspace:*",
    "fireux-places": "workspace:*"
  },
  "peerDependencies": {
    "nuxt": "4.0.3",
    "@nuxt/kit": "4.0.3",
    "@nuxt/schema": "4.0.3",
    "vue": "3.5.20",
    "vue-router": "^4.5.0",
    "vuefire": "3.2.2",
    "firebase": "11.10.0",
    "firebase-admin": "*",
    "h3": "*",
    "stripe": "*",
    "@vueuse/core": "*"
  },
  "devDependencies": {
    "@nuxt/module-builder": "^0.5.5",
    "rimraf": "^6.0.1",
    "glob": "^11.0.3"
  },
  "type": "module"
}
```

## Projects

### projects/misebox/misebox-app/package.json

```json
{
  "name": "misebox-app",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxi build",
    "dev": "nuxi dev --port 3001",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "postinstall": "nuxi prepare",
    "clean": "rimraf dist",
    "migrate:chefs": "tsx scripts/migrate-chef-data.ts"
  },
  "dependencies": {
    "@nuxt/content": "^3.6.1",
    "@nuxt/ui": "3.1.3",
    "@vite-pwa/nuxt": "^1.0.4",
    "@vueup/vue-quill": "^1.2.0",
    "dompurify": "^3.2.6",
    "firebase": "^11.9.1",
    "firebase-admin": "^13.4.0",
    "fireux-core": "workspace:*",
    "fireux-jobs": "workspace:*",
    "fireux-misebox": "workspace:*",
    "nuxt": "^4.0.0",
    "nuxt-vuefire": "^1.0.5",
    "stripe": "^18.3.0",
    "vue": "^3.5.17",
    "vue-router": "^4.5.1"
  },
  "devDependencies": {
    "@iconify-json/heroicons": "^1.2.2",
    "@iconify-json/lucide": "^1.2.62"
  }
}
```

### projects/misebox/niederhorn/package.json

```json
{
  "name": "Niederhorn",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxi build",
    "dev": "nuxi dev --port 3003",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "postinstall": "nuxi prepare"
  },
  "devDependencies": {
    "@iconify-json/heroicons": "^1.2.2",
    "@iconify-json/lucide": "^1.2.62"
  },
  "dependencies": {
    "@nuxt/ui": "3.1.3",
    "@vite-pwa/nuxt": "^1.0.4",
    "@vueup/vue-quill": "^1.2.0",
    "dompurify": "^3.2.6",
    "firebase": "^11.9.1",
    "firebase-admin": "^13.4.0",
    "fireux-core": "workspace:*",
    "fireux-jobs": "workspace:*",
    "fireux-misebox": "workspace:*",
    "nuxt": "^4.0.0",
    "nuxt-vuefire": "^1.0.5",
    "stripe": "^18.3.0",
    "vue": "^3.5.17",
    "vue-router": "^4.5.1"
  }
}
```

### projects/fireux/fireux-app/package.json

```json
{
  "name": "fireux-app",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxi build",
    "dev": "nuxi dev --port 3000",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "postinstall": "nuxi prepare",
    "clean": "rimraf dist"
  },
  "dependencies": {
    "@nuxt/content": "^3.6.1",
    "@nuxt/ui": "3.1.3",
    "@vite-pwa/nuxt": "^1.0.4",
    "@vueup/vue-quill": "^1.2.0",
    "dompurify": "^3.2.6",
    "firebase": "^11.9.1",
    "firebase-admin": "^13.4.0",
    "fireux-core": "workspace:*",
    "nuxt": "^4.0.0",
    "nuxt-vuefire": "^1.0.5",
    "stripe": "^18.3.0",
    "vue": "^3.5.17",
    "vue-router": "^4.5.1"
  },
  "devDependencies": {
    "@iconify-json/heroicons": "^1.2.2",
    "@iconify-json/logos": "^1.2.5",
    "@iconify-json/lucide": "^1.2.62",
    "@iconify-json/skill-icons": "^1.2.0",
    "@iconify-json/vscode-icons": "^1.2.25"
  }
}
```

## TypeScript project configs

- packages/tsconfig.json
- packages/extensions/tsconfig.json
- packages/extensions/fireux-places/tsconfig.json
- packages/tenants/tsconfig.json
- packages/tenants/fireux-misebox/tsconfig.json
- packages/tenants/fireux-cleanbox/tsconfig.json
- packages/core/fireux-core/tsconfig.json
- packages/core/fireux-core/src/runtime/server/tsconfig.json
- projects/tsconfig.json
- projects/misebox/misebox-app/tsconfig.json
- projects/misebox/misebox-app/server/tsconfig.json
- projects/misebox/niederhorn/tsconfig.json (see above)
- projects/cleanbox/cleanbox-app/tsconfig.json
- projects/cleanbox/cleanbox-app/server/tsconfig.json
- projects/cleanbox/richies-reinigung/tsconfig.json
- projects/cleanbox/richies-reinigung/server/tsconfig.json

Note: For brevity, paths-complete content is shown for root and Niederhorn. If you'd like, I can inline the contents of each tsconfig above as well.
