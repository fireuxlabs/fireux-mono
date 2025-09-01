# Packages Health Report (src-first standard)

Date: 2025-08-31

This report verifies the five packages under `packages/*/*` adhere to the src-first standard and engines/peer/deps policies.

## Summary

| name | main | types | exports["."] | exports["./runtime/*"] | exports["./package.json"] | files | scripts (build/dev/postbuild/clean) | engines | deps ok | peers ok | devDeps ok |
|---|---|---|---|---|---|---|---|---|---|---|---|
| fireux-core | ./src/module.ts | ./src/module.ts | ./src/module.ts | ./src/runtime/* | ./package.json | ["src/**/*"] | yes | yes | dompurify only | peers pinned (Nuxt 4.0.3 etc.) | builder/rimraf OK |
| fireux-jobs | ./src/module.ts | ./src/module.ts | ./src/module.ts | ./src/runtime/* | ./package.json | ["src/**/*"] | yes | yes | workspace deps only | peers pinned; no frameworks in deps | builder/rimraf + glob OK |
| fireux-places | ./src/module.ts | ./src/module.ts | ./src/module.ts | ./src/runtime/* | ./package.json | ["src/**/*"] | yes | yes | workspace deps only | peers pinned; no frameworks in deps | builder/rimraf + glob OK |
| fireux-cleanbox | ./src/module.ts | ./src/module.ts | ./src/module.ts | ./src/runtime/* | ./package.json | ["src/**/*"] | yes | yes | workspace deps only | peers pinned; no frameworks in deps | builder/rimraf + glob OK |
| fireux-misebox | ./src/module.ts | ./src/module.ts | ./src/module.ts | ./src/runtime/* | ./package.json | ["src/**/*"] | yes | yes | workspace deps only | peers pinned; no frameworks in deps | builder/rimraf + glob OK |

All checks: PASS

- JSON lint: OK for root and all five packages
- @nuxt/kit and @nuxt/schema: 4.0.3 in peerDependencies (when present)
- No frameworks (nuxt/vue/vuefire/firebase) in dependencies (only dompurify in core)
- All five packages use src-first entries and export runtime and package.json
- files is ["src/**/*"] in all five
- engines present for all five

## Per-package manifests

### fireux-core (packages/core/fireux-core/package.json)

Decisions: kept dompurify in dependencies; moved framework/tooling to peerDependencies; scripts updated to src-first.

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

### fireux-jobs (packages/extensions/fireux-jobs/package.json)

Decisions: dependencies only workspace links; glob moved to devDependencies; frameworks in peerDependencies.

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

### fireux-places (packages/extensions/fireux-places/package.json)

Decisions: dependencies only workspace links; glob moved to devDependencies; frameworks in peerDependencies.

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

### fireux-cleanbox (packages/tenants/fireux-cleanbox/package.json)

Decisions: dependencies only workspace links; glob moved to devDependencies; frameworks in peerDependencies.

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

### fireux-misebox (packages/tenants/fireux-misebox/package.json)

Decisions: dependencies only workspace links; glob moved to devDependencies; frameworks in peerDependencies.

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

## Diffstat

- packages/core/fireux-core/package.json | src-first, peers/engines updated
- packages/extensions/fireux-jobs/package.json | src-first, peers updated, glob -> devDeps
- packages/extensions/fireux-places/package.json | src-first, peers updated, glob -> devDeps
- packages/tenants/fireux-cleanbox/package.json | src-first, peers updated, glob -> devDeps
- packages/tenants/fireux-misebox/package.json | src-first, peers updated, glob -> devDeps
- package.json (root) | dev:all quoting fixed

## Switch back to dist-first (optional)

- Change main/types to ./dist/* entries and restore typesVersions
- Set files to ["dist", "src/runtime"]
- Revert scripts to postbuild removing dist maps
- Ensure nuxt-module-build outputs dist and update exports accordingly
