# package.json Report (full monorepo)

All discovered package.json files with their absolute paths and verbatim contents.

## Index (13)
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/package.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/scripts/package.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/package.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/package.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-places/package.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/package.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/package.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/fireux/fireux-app/package.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/misebox/misebox-app/package.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/misebox/niederhorn/package.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/cleanbox/cleanbox-app/package.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/cleanbox/richies-reinigung/package.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/tools/vscode-fireux-toolbar/package.json

---

## /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/package.json
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
    "@nuxt/schema": "4.0.3",
    "@tsconfig/nuxt": "^2.0.3",
    "@types/node": "^20.19.11",
    "@typescript-eslint/eslint-plugin": "^8.41.0",
    "@typescript-eslint/parser": "^8.41.0",
    "concurrently": "^9.2.0",
    "eslint": "^9.28.0",
    "eslint-config-prettier": "^10.1.5",
    "eslint-plugin-vue": "^10.2.0",
    "nuxt": "4.0.3",
    "prettier": "^3.5.3",
    "typescript": "^5.9.2",
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

## /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/scripts/package.json
```json
{
  "name": "fireux-package-scripts",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
  "scan": "node scan-exports.mjs",
  "list:layout-keys": "node list-layout-keys.mjs"
  },
  "dependencies": {
    "glob": "^11.0.0"
  }
}
```

## /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/package.json
```json
{
  "name": "fireux-core",
  "version": "0.1.0",
  "description": "FireUX Core - A comprehensive Nuxt 3 module for Firebase integration",
  "private": true,
  "main": "./src/module.ts",
  "types": "./src/module.ts",
  "exports": {
    ".": "./src/module.ts",
    "./runtime/*": "./src/runtime/*",
    "./package.json": "./package.json"
  },
  "files": [
    "src/**/*"
  ],
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

## /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/package.json
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
  "files": [
    "src/**/*"
  ],
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

## /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-places/package.json
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
  "files": [
    "src/**/*"
  ],
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

## /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/package.json
```json
{
  "name": "fireux-cleanbox",
  "version": "0.1.0",
  "description": "FireUX CleanBox - Cleaning Services Domain Package",
  "type": "module",
  "main": "./src/module.ts",
  "types": "./src/module.ts",
  "exports": {
    ".": "./src/module.ts",
    "./runtime/*": "./src/runtime/*",
    "./package.json": "./package.json"
  },
  "files": [
    "src/**/*"
  ],
  "scripts": {
    "build": "nuxt-module-build build",
    "dev": "nuxt-module-build --stub",
    "postbuild": "rimraf src/**/*.map",
    "clean": "rimraf dist"
  },
  "private": true,
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
  }
}
```

## /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/package.json
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
  "files": [
    "src/**/*"
  ],
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

## /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/fireux/fireux-app/package.json
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

## /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/misebox/misebox-app/package.json
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

## /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/misebox/niederhorn/package.json
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
  }
}
```

## /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/cleanbox/cleanbox-app/package.json
```json
{
  "name": "cleanbox-app",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxi build",
    "dev": "nuxi dev --port 3002",
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
    "fireux-jobs": "workspace:*",
    "fireux-cleanbox": "workspace:*",
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

## /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/cleanbox/richies-reinigung/package.json
```json
{
  "name": "richies-reinigung",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxi build",
    "dev": "nuxi dev --port 3004",
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
  "nuxt": "^4.0.0",
    "nuxt-vuefire": "^1.0.5",
    "stripe": "^18.3.0",
    "vue": "^3.5.17",
    "vue-router": "^4.5.1",
    "fireux-core": "workspace:*",
    "fireux-jobs": "workspace:*",
    "fireux-cleanbox": "workspace:*"
  },
  "devDependencies": {
    "@iconify-json/heroicons": "^1.2.2",
    "@iconify-json/lucide": "^1.2.62"
  }
}
```

## /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/tools/vscode-fireux-toolbar/package.json
```json
{
  "name": "fireux-toolbar",
  "displayName": "FireUX Toolbar",
  "publisher": "fire-uxxx",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": [
    "Other"
  ],
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": "./extension.js",
  "contributes": {
    "commands": [
      {
        "command": "fireuxToolbar.startFireux",
        "title": "Start FireUX dev (3000)",
        "icon": "$(flame)"
      },
      {
        "command": "fireuxToolbar.startMisebox",
        "title": "Start MiseBox dev (3001)",
        "icon": "$(book)"
      },
      {
        "command": "fireuxToolbar.startCleanbox",
        "title": "Start CleanBox dev (3002)",
        "icon": "$(beaker)"
      }
    ],
    "menus": {
      "commandCenter": [
        {
          "command": "fireuxToolbar.startFireux",
          "group": "navigation@1",
          "when": "true"
        },
        {
          "command": "fireuxToolbar.startMisebox",
          "group": "navigation@2",
          "when": "true"
        },
        {
          "command": "fireuxToolbar.startCleanbox",
          "group": "navigation@3",
          "when": "true"
        }
      ],
      "editor/title": [
        {
          "command": "fireuxToolbar.startFireux",
          "group": "navigation@1",
          "when": "true"
        },
        {
          "command": "fireuxToolbar.startMisebox",
          "group": "navigation@2",
          "when": "true"
        },
        {
          "command": "fireuxToolbar.startCleanbox",
          "group": "navigation@3",
          "when": "true"
        }
      ]
    },
    "keybindings": [
      {
        "command": "fireuxToolbar.startFireux",
        "key": "ctrl+alt+f",
        "mac": "cmd+alt+f",
        "when": "workspaceFolderCount > 0"
      },
      {
        "command": "fireuxToolbar.startMisebox",
        "key": "ctrl+alt+m",
        "mac": "cmd+alt+m",
        "when": "workspaceFolderCount > 0"
      },
      {
        "command": "fireuxToolbar.startCleanbox",
        "key": "ctrl+alt+c",
        "mac": "cmd+alt+c",
        "when": "workspaceFolderCount > 0"
      }
    ],
    "configurationDefaults": {
      "window.commandCenter": true
    }
  }
}
```
