# FireUX Standardization: Publish & Config Layout Report

**Generated**: 2025-08-30  
**Phase**: A - REPORT (No Changes Applied)  
**Scope**: All packages in `packages/*/*/`

---

## 1. Inventory & Current Shape

### Package Analysis Summary

| Package             | Path                                | Publishes Dist Only | Build Tool        | Config Issues    |
| ------------------- | ----------------------------------- | :-----------------: | ----------------- | ---------------- |
| **fireux-core**     | `packages/core/fireux-core`         |         ❌          | nuxt-module-build | ⚠️ Split configs |
| **fireux-jobs**     | `packages/extensions/fireux-jobs`   |         ❌          | nuxt-module-build | ✅ Clean         |
| **fireux-places**   | `packages/extensions/fireux-places` |         ✅          | nuxt-module-build | ✅ Clean         |
| **fireux-misebox**  | `packages/tenants/fireux-misebox`   |         ✅          | nuxt-module-build | ✅ Clean         |
| **fireux-cleanbox** | `packages/tenants/fireux-cleanbox`  |         ✅          | nuxt-module-build | ✅ Clean         |

### Detailed Package Breakdown

#### 🔥 fireux-core (`packages/core/fireux-core`)

- **main**: `"./src/module.ts"` ❌ (should be dist)
- **types**: `"./src/module.ts"` ❌ (should be dist)
- **exports**:
  - `.`: Points to `src/module.ts` ❌
  - `./config/*`: Points to `src/config/*.ts` ❌
  - `./runtime/*`: Points to `src/runtime/*.ts` ❌
  - `./composables`: Points to `src/runtime/composables/*.ts` ❌
  - `./models/*`: Points to `src/runtime/models/*.ts` ❌
  - `./server/*`: Points to `src/runtime/server/*.ts` ❌
- **typesVersions**: All point to `src/*` ❌
- **files**: `["src/**/*"]` ❌ (should be dist + src/runtime)
- **scripts**:
  - `build`: "nuxt-module-build build" ✅
  - `dev`: "nuxt-module-build --stub" ✅
  - `postbuild`: "rimraf src/\*_/_.map" ❌ (should be dist)
- **Config files**:
  - `assets-config.ts`: ❌ Located at `src/runtime/config/` (should be `src/config/`)
  - `layouts-config.ts`: ❌ Located at `src/runtime/config/` (should be `src/config/`)
  - `errors-config.ts`: ❌ Located at `src/runtime/config/` (should be `src/config/`)

#### 🧑‍💼 fireux-jobs (`packages/extensions/fireux-jobs`)

- **main**: `"./src/module.ts"` ❌ (should be dist)
- **types**: `"./src/module.ts"` ❌ (should be dist)
- **exports**:
  - `.`: Points to `src/module.ts` ❌
  - `./runtime/*`: Points to `src/runtime/*.ts` ❌
  - `./composables`: Points to `src/runtime/composables/*.ts` ❌
- **typesVersions**: All point to `src/*` ❌
- **files**: `["src/**/*"]` ❌ (should be dist + src/runtime)
- **scripts**:
  - `build`: "nuxt-module-build build" ✅
  - `dev`: "nuxt-module-build --stub" ✅
  - `postbuild`: "rimraf src/\*_/_.map" ❌ (should be dist)
- **Config files**: ✅ None of the three target files present

#### 📍 fireux-places (`packages/extensions/fireux-places`)

- **main**: `"./dist/module.mjs"` ✅
- **types**: `"./dist/types.d.ts"` ✅
- **exports**:
  - `.`: Points to dist ✅
  - `./package.json`: Points to package.json ✅
- **typesVersions**: Points to `"./dist/*"` ✅
- **files**: `["dist", "src/runtime"]` ✅
- **scripts**:
  - `build`: "nuxt-module-build build" ✅
  - `dev`: "nuxt-module-build build --stub" ✅
  - `postbuild`: "rimraf dist/\*_/_.map" ✅
- **Config files**: ✅ None of the three target files present

#### 🍳 fireux-misebox (`packages/tenants/fireux-misebox`)

- **main**: `"./dist/module.mjs"` ✅
- **types**: `"./dist/types.d.ts"` ✅
- **exports**:
  - `.`: Points to dist ✅
  - `./package.json`: Points to package.json ✅
- **typesVersions**: Points to `"./dist/*"` ✅
- **files**: `["dist", "src/runtime"]` ✅
- **scripts**:
  - `build`: "nuxt-module-build build" ✅
  - `dev`: "nuxt-module-build build --stub" ✅
  - `postbuild`: "rimraf dist/\*_/_.map" ✅
- **Config files**:
  - `layouts-config.ts`: ✅ Located at `src/config/` (correct)
  - `assets-config.ts`: ✅ Not present
  - `errors-config.ts`: ✅ Not present

#### 🧽 fireux-cleanbox (`packages/tenants/fireux-cleanbox`)

- **main**: `"./dist/module.mjs"` ✅
- **types**: `"./dist/types.d.ts"` ✅
- **exports**:
  - `.`: Points to dist ✅
  - `./package.json`: Points to package.json ✅
- **typesVersions**: Points to `"./dist/*"` ✅
- **files**: `["dist", "src/runtime"]` ✅
- **scripts**:
  - `build`: "nuxt-module-build build" ✅
  - `dev`: "nuxt-module-build build --stub" ✅
  - `postbuild`: "rimraf dist/\*_/_.map" ✅
- **Config files**:
  - `layouts-config.ts`: ✅ Located at `src/config/` (correct)
  - `assets-config.ts`: ✅ Not present
  - `errors-config.ts`: ✅ Not present

---

## 2. Problems & Risks

### 🚨 Critical Issues

#### A. Source Export Violations

- **fireux-core**: Exports all paths from `src/` instead of `dist/`
- **fireux-jobs**: Exports all paths from `src/` instead of `dist/`

#### B. Config File Location Issues

- **fireux-core**: All three config files (`assets-config.ts`, `layouts-config.ts`, `errors-config.ts`) are in `src/runtime/config/` instead of `src/config/`

#### C. Package.json Files Array Issues

- **fireux-core**: Ships `"src/**/*"` instead of `["dist", "src/runtime"]`
- **fireux-jobs**: Ships `"src/**/*"` instead of `["dist", "src/runtime"]`

#### D. Build Script Inconsistencies

- **fireux-core**: `postbuild` cleans `src/**/*.map` instead of `dist/**/*.map`
- **fireux-jobs**: `postbuild` cleans `src/**/*.map` instead of `dist/**/*.map`

### ⚠️ Medium Priority Issues

#### A. Dev Script Variations

- **fireux-core** & **fireux-jobs**: Use `"nuxt-module-build --stub"`
- Others: Use `"nuxt-module-build build --stub"`

### ✅ Working Correctly

#### A. Build Tool Consistency

- All packages use `nuxt-module-build` ✅
- No stray mkdist, unbuild, tsup, or tsc emit scripts ✅

#### B. Packages Already Compliant

- **fireux-places**: Perfect state ✅
- **fireux-misebox**: Perfect state ✅
- **fireux-cleanbox**: Perfect state ✅

---

## 3. Proposed Changes (per package)

### 🔥 fireux-core - Major Updates Required

#### package.json diff:

```diff
{
  "name": "fireux-core",
  "version": "0.1.0",
  "description": "FireUX Core - A comprehensive Nuxt 3 module for Firebase integration",
  "private": true,
+ "type": "module",
- "main": "./src/module.ts",
- "types": "./src/module.ts",
+ "main": "./dist/module.mjs",
+ "types": "./dist/types.d.ts",
  "exports": {
    ".": {
-     "types": "./src/module.ts",
-     "import": "./src/module.ts"
+     "import": "./dist/module.mjs",
+     "require": "./dist/module.cjs",
+     "types": "./dist/types.d.ts"
    },
-   "./config/*": {
-     "types": "./src/config/*.ts",
-     "import": "./src/config/*.ts"
-   },
-   "./runtime/*": {
-     "types": "./src/runtime/*.ts",
-     "import": "./src/runtime/*.ts"
-   },
-   "./composables": {
-     "types": "./src/runtime/composables/*.ts",
-     "import": "./src/runtime/composables/*.ts"
-   },
-   "./models/*": {
-     "types": "./src/runtime/models/*.ts",
-     "import": "./src/runtime/models/*.ts"
-   },
-   "./server/*": {
-     "types": "./src/runtime/server/*.ts",
-     "import": "./src/runtime/server/*.ts"
-   }
+   "./package.json": "./package.json"
  },
  "typesVersions": {
    "*": {
-     "config/*": ["src/config/*"],
-     "runtime/*": ["src/runtime/*"],
-     "composables": ["src/runtime/composables/*"],
-     "models/*": ["src/runtime/models/*"],
-     "server/*": ["src/runtime/server/*"]
+     "*": ["./dist/*", "./dist/index.d.ts"]
    }
  },
  "sideEffects": false,
  "files": [
-   "src/**/*"
+   "dist",
+   "src/runtime"
  ],
  "scripts": {
    "build": "nuxt-module-build build",
-   "dev": "nuxt-module-build --stub",
-   "postbuild": "rimraf src/**/*.map",
+   "dev": "nuxt-module-build build --stub",
+   "postbuild": "rimraf dist/**/*.map",
    "clean": "rimraf dist"
  }
}
```

#### File moves required:

```bash
# Move config files from runtime/config to src/config
mv packages/core/fireux-core/src/runtime/config/assets-config.ts packages/core/fireux-core/src/config/
mv packages/core/fireux-core/src/runtime/config/layouts-config.ts packages/core/fireux-core/src/config/
mv packages/core/fireux-core/src/runtime/config/errors-config.ts packages/core/fireux-core/src/config/
rm -rf packages/core/fireux-core/src/runtime/config/
```

### 🧑‍💼 fireux-jobs - Major Updates Required

#### package.json diff:

```diff
{
  "name": "fireux-jobs",
  "version": "0.1.0",
  "description": "Job posting and application system for FireUX apps",
  "private": true,
+ "type": "module",
- "main": "./src/module.ts",
- "types": "./src/module.ts",
+ "main": "./dist/module.mjs",
+ "types": "./dist/types.d.ts",
  "exports": {
    ".": {
-     "types": "./src/module.ts",
-     "import": "./src/module.ts"
+     "import": "./dist/module.mjs",
+     "require": "./dist/module.cjs",
+     "types": "./dist/types.d.ts"
    },
-   "./runtime/*": {
-     "types": "./src/runtime/*.ts",
-     "import": "./src/runtime/*.ts"
-   },
-   "./composables": {
-     "types": "./src/runtime/composables/*.ts",
-     "import": "./src/runtime/composables/*.ts"
-   }
+   "./package.json": "./package.json"
  },
  "typesVersions": {
    "*": {
-     "runtime/*": ["src/runtime/*"],
-     "composables": ["src/runtime/composables/*"]
+     "*": ["./dist/*", "./dist/index.d.ts"]
    }
  },
  "sideEffects": false,
  "files": [
-   "src/**/*"
+   "dist",
+   "src/runtime"
  ],
  "scripts": {
    "build": "nuxt-module-build build",
-   "dev": "nuxt-module-build --stub",
-   "postbuild": "rimraf src/**/*.map",
+   "dev": "nuxt-module-build build --stub",
+   "postbuild": "rimraf dist/**/*.map",
    "clean": "rimraf dist"
  }
}
```

### 📍 fireux-places - Minor Updates

#### package.json diff:

```diff
{
+ "type": "module",
  "scripts": {
    "build": "nuxt-module-build build",
-   "dev": "nuxt-module-build build --stub",
+   "dev": "nuxt-module-build build --stub",
    "postbuild": "rimraf dist/**/*.map",
    "clean": "rimraf dist"
  }
}
```

### 🍳 fireux-misebox - Minor Updates

#### package.json diff:

```diff
{
+ "type": "module",
  "scripts": {
    "build": "nuxt-module-build build",
-   "dev": "nuxt-module-build build --stub",
+   "dev": "nuxt-module-build build --stub",
    "postbuild": "rimraf dist/**/*.map",
    "clean": "rimraf dist"
  }
}
```

### 🧽 fireux-cleanbox - Already Compliant ✅

No changes required - package is already in perfect state.

---

## 4. Validation Plan

### Build Validation Commands

```bash
# Clean and build all packages
pnpm -r --filter './packages/*/*' run clean
pnpm -r --filter './packages/*/*' run build

# Type checking
pnpm -r --filter './packages/*/*' exec tsc --noEmit

# Optional: Test stub mode
pnpm -r --filter './packages/*/*' run dev
```

### Export Validation Greps

```bash
# Verify no src paths in exports
git grep -n '"exports"' packages/*/*/package.json
git grep -n 'src/' packages/*/*/package.json | grep -E '(exports|typesVersions)'

# Verify config files in correct locations
find packages -name "assets-config.ts" -o -name "layouts-config.ts" -o -name "errors-config.ts"

# Verify all are in src/config/ (not elsewhere)
find packages -path "*/src/config/*" -name "*-config.ts" | grep -E "(assets|layouts|errors)"
```

### Success Criteria

- ✅ All packages build without errors
- ✅ All packages export from `dist/` only
- ✅ All packages have `files: ["dist", "src/runtime"]`
- ✅ Config files (`assets-config.ts`, `layouts-config.ts`, `errors-config.ts`) are in `src/config/` where present
- ✅ No broken imports after config file moves
- ✅ All packages use consistent script patterns
- ✅ TypeScript compilation passes for all packages

---

## 5. Implementation Plan

### Ordered Steps

#### Step 1: Move Config Files (fireux-core only)

```bash
cd packages/core/fireux-core
mkdir -p src/config
mv src/runtime/config/assets-config.ts src/config/
mv src/runtime/config/layouts-config.ts src/config/
mv src/runtime/config/errors-config.ts src/config/
rmdir src/runtime/config
```

#### Step 2: Update Package.json Files (by priority)

**A. fireux-core (most changes)**

- Update main, types, exports, typesVersions, files, scripts

**B. fireux-jobs (moderate changes)**

- Update main, types, exports, typesVersions, files, scripts

**C. fireux-places, fireux-misebox (minor changes)**

- Add `"type": "module"` if missing
- Standardize dev script format

#### Step 3: Fix Import Statements

```bash
# Search for any imports referencing the moved config files
grep -r "runtime/config" packages/core/fireux-core/src/ --include="*.ts"
# Replace with ./config/ imports if any found
```

#### Step 4: Validation Build

```bash
pnpm -r --filter './packages/*/*' run clean
pnpm -r --filter './packages/*/*' run build
pnpm -r --filter './packages/*/*' exec tsc --noEmit
```

#### Step 5: Commit Changes

```bash
git add packages/*/*/package.json
git add packages/core/fireux-core/src/config/
git rm packages/core/fireux-core/src/runtime/config/
git commit -m "chore: standardize publish (dist-only), unify build tool, normalize config file layout

- Move all package exports from src/ to dist/
- Consolidate assets-config.ts, layouts-config.ts, errors-config.ts to src/config/
- Standardize files array to [\"dist\", \"src/runtime\"]
- Unify dev script to 'nuxt-module-build build --stub'
- Fix postbuild to clean dist/**/*.map not src/**/*.map"
```

---

**END OF PHASE A REPORT**

🔥 **Status**: Report generated - ready for implementation approval  
📁 **Location**: `archive/reports/standardization-publish-and-config.md`  
⏳ **Next**: Awaiting confirmation to proceed with PHASE B implementation
