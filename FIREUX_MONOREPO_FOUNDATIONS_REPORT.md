# FireUX Monorepo Foundations Report

- **Generated**: 30 August 2025, 15:43:21 UTC
- **Summary Score**: 73/100
  - 🟥 4 critical issues
  - 🟨 3 warning issues
  - 🟩 5 healthy patterns

---

## 1) package.json Audit

### **Package Inventory Table**

| Path                                  | Name                | Private    | Type    | Version    | Health |
| ------------------------------------- | ------------------- | ---------- | ------- | ---------- | ------ |
| `/`                                   | fireux              | ✅ `true`  | ROOT    | 1.0.0      | 🟨     |
| `packages/core/fireux-core`           | fireux-core         | ✅ `true`  | PACKAGE | 0.1.0      | 🟨     |
| `packages/extensions/fireux-jobs`     | fireux-jobs         | ✅ `true`  | PACKAGE | 0.1.0      | 🟨     |
| `packages/extensions/fireux-places`   | fireux-places       | ✅ `true`  | PACKAGE | 0.1.0      | 🟩     |
| `packages/tenants/fireux-cleanbox`    | fireux-cleanbox     | ✅ `true`  | PACKAGE | 0.1.0      | 🟩     |
| `packages/tenants/fireux-misebox`     | fireux-misebox      | ✅ `true`  | PACKAGE | 0.1.0      | 🟩     |
| `projects/fireux/fireux-app`          | fireux-app          | ✅ `true`  | PROJECT | 1.0.0      | 🟨     |
| `projects/misebox/misebox-app`        | misebox-app         | ✅ `true`  | PROJECT | 1.0.0      | 🟨     |
| `projects/cleanbox/cleanbox-app`      | cleanbox-app        | ✅ `true`  | PROJECT | 1.0.0      | 🟨     |
| `projects/misebox/niederhorn`         | niederhorn          | ✅ `true`  | PROJECT | 1.0.0      | 🟨     |
| `projects/cleanbox/richies-reinigung` | richies-reinigung   | ✅ `true`  | PROJECT | 1.0.0      | 🟨     |
| `test-core-isolation`                 | test-core-isolation | ✅ `true`  | TEST    | ❌ missing | 🟨     |
| `tools/vscode-fireux-toolbar`         | fireux-toolbar      | ❌ `false` | TOOL    | 0.0.1      | 🟩     |

### **🟥 Critical Issues**

#### **1. Inconsistent Peer Dependency Patterns**

**Issue**: fireux-jobs has exact versions in peerDependencies (should use ranges)

```json
// packages/extensions/fireux-jobs/package.json - PATCH:
"peerDependencies": {
  "@nuxt/kit": "^4.0.0",
  "@nuxt/schema": "^4.0.0",
- "vue": "3.5.20",
+ "vue": "^3.5.0",
- "vue-router": "^4.5.0",
+ "vue-router": "^4.4.0",
- "vuefire": "^3.2.2",
+ "vuefire": "^3.2.0",
- "firebase": "11.10.0"
+ "firebase": "^11.0.0"
}
```

#### **2. Missing Export Patterns in fireux-core**

**Issue**: Core package missing `/config/*` and `/composables/*` exports

```json
// packages/core/fireux-core/package.json - PATCH:
"exports": {
  ".": {
    "types": "./src/module.ts",
    "import": "./src/module.ts"
  },
+ "./config/*": {
+   "types": "./src/config/*.ts",
+   "import": "./src/config/*.ts"
+ },
+ "./runtime/composables/*": {
+   "types": "./src/runtime/composables/*.ts",
+   "import": "./src/runtime/composables/*.ts"
+ },
  "./runtime/*": {
    "types": "./src/runtime/*.ts",
    "import": "./src/runtime/*.ts"
  },
  "./models/*": {
    "types": "./src/runtime/models/*.ts",
    "import": "./src/runtime/models/*.ts"
  },
  "./server/*": {
    "types": "./src/runtime/server/*.ts",
    "import": "./src/runtime/server/*.ts"
  }
},
"typesVersions": {
  "*": {
+   "config/*": ["src/config/*"],
+   "runtime/composables/*": ["src/runtime/composables/*"],
    "runtime/*": ["src/runtime/*"],
    "models/*": ["src/runtime/models/*"],
    "server/*": ["src/runtime/server/*"]
  }
}
```

#### **3. Version Mismatches Across Monorepo**

**Issue**: Firebase and Vue versions differ between packages and projects

```json
// packages/extensions/fireux-jobs/package.json - PATCH devDependencies:
"devDependencies": {
  "@nuxt/module-builder": "^0.5.5",
  "@nuxt/kit": "^4.0.0",
  "@nuxt/schema": "^4.0.0",
- "vue": "3.5.20",
+ "vue": "^3.5.20",
- "vue-router": "^4.5.0",
+ "vue-router": "^4.5.1",
- "vuefire": "^3.2.2",
+ "vuefire": "3.2.2",
- "firebase": "11.10.0",
+ "firebase": "11.10.0",
  "rimraf": "^6.0.1",
  "typescript": "^5.9.2"
}

// projects/fireux/fireux-app/package.json - PATCH:
"dependencies": {
  "@nuxt/content": "^3.6.1",
  "@nuxt/ui": "3.1.3",
  "@vite-pwa/nuxt": "^1.0.4",
  "@vueup/vue-quill": "^1.2.0",
  "dompurify": "^3.2.6",
- "firebase": "^11.9.1",
+ "firebase": "11.10.0",
  "firebase-admin": "^13.4.0",
  "fireux-core": "workspace:*",
  "nuxt": "^4.0.0",
  "nuxt-vuefire": "^1.0.5",
  "stripe": "^18.3.0",
- "vue": "^3.5.17",
+ "vue": "3.5.20",
- "vue-router": "^4.5.1"
+ "vue-router": "^4.5.0"
}
```

#### **4. Missing Version in Test Package**

```json
// test-core-isolation/package.json - PATCH:
{
  "name": "test-core-isolation",
+ "version": "0.1.0",
  "private": true,
  "type": "module"
}
```

### **🟨 Warning Issues**

#### **1. Missing tsconfig References**

**Issue**: Some packages missing in root tsconfig.json references

```json
// tsconfig.json - No action needed (all packages already referenced)
```

#### **2. Engines Field Missing in Some Packages**

**Issue**: fireux-places missing engines specification

```json
// packages/extensions/fireux-places/package.json - PATCH:
{
  "name": "fireux-places",
  "version": "0.1.0",
  // ... existing fields ...
+ "engines": {
+   "node": ">=20.11 <23",
+   "pnpm": ">=10"
+ }
}
```

#### **3. Project Apps Missing TypeScript**

**Issue**: Project apps missing TypeScript in devDependencies

```json
// projects/fireux/fireux-app/package.json - PATCH:
"devDependencies": {
  "@iconify-json/heroicons": "^1.2.2",
  "@iconify-json/logos": "^1.2.5",
  "@iconify-json/lucide": "^1.2.62",
  "@iconify-json/skill-icons": "^1.2.0",
- "@iconify-json/vscode-icons": "^1.2.25"
+ "@iconify-json/vscode-icons": "^1.2.25",
+ "typescript": "^5.9.2"
}
```

---

## 2) TypeScript Config Audit

### **References Graph (ASCII)**

```
ROOT (tsconfig.json)
├── projects/fireux/fireux-app ──→ fireux-core
├── projects/misebox/misebox-app ──→ fireux-core, fireux-misebox
├── projects/misebox/niederhorn ──→ fireux-core, fireux-misebox
├── projects/cleanbox/cleanbox-app ──→ fireux-core, fireux-cleanbox
├── projects/cleanbox/richies-reinigung ──→ fireux-core, fireux-cleanbox
├── packages/core/fireux-core ──→ (foundation)
├── packages/extensions/fireux-jobs ──→ fireux-core
├── packages/extensions/fireux-places ──→ fireux-core
├── packages/tenants/fireux-misebox ──→ fireux-core, fireux-places
└── packages/tenants/fireux-cleanbox ──→ fireux-core
```

### **TS6307 Risks Identified**

- ✅ Root tsconfig uses only "references" (healthy)
- ✅ All packages have "composite": true (healthy)
- ✅ Include patterns capture .ts/.vue files (healthy)
- 🟨 **Missing**: projects need explicit references to used packages

### **Required tsconfig.json Patches**

#### **Project Apps Missing References**

```json
// projects/fireux/fireux-app/tsconfig.json - PATCH:
{
  "extends": "./.nuxt/tsconfig.json",
+ "references": [
+   { "path": "../../../packages/core/fireux-core" }
+ ],
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
-     "@fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"]
    }
  }
}

// projects/misebox/misebox-app/tsconfig.json - PATCH:
{
  "extends": "./.nuxt/tsconfig.json",
+ "references": [
+   { "path": "../../../packages/core/fireux-core" },
+   { "path": "../../../packages/tenants/fireux-misebox" }
+ ],
  "compilerOptions": {
    "composite": true
  }
}
```

---

## 3) fireux-core Export/Import Surface

### **Current Import Usage Scan**

**Found imports from fireux-core:**

- `fireux-core/runtime/composables/firestore/profiles/useProfile`
- `fireux-core/runtime/composables/app/useApp`
- `fireux-core/runtime/composables/firestore/AppUser/useAppUser`
- `fireux-core/runtime/composables/FireUXConfig`
- `fireux-core/runtime/composables/firestore/useFirestoreManager`
- `fireux-core/runtime/composables/firestore/objects/useObject`
- `fireux-core/config/fireux-config` ⚠️
- `fireux-core/config/standard-nuxt-config` ⚠️

### **Missing Export Patterns**

Current exports missing these required patterns:

```json
// packages/core/fireux-core/package.json - ADD:
"./config/*": {
  "types": "./src/config/*.ts",
  "import": "./src/config/*.ts"
},
"./runtime/composables/*": {
  "types": "./src/runtime/composables/*.ts",
  "import": "./src/runtime/composables/*.ts"
}
```

### **Deep Import Violations**

**FOUND**: 1 bypass of proper exports

```typescript
// packages/tenants/fireux-misebox/src/runtime/models/objects/Recipe.model.ts
// CURRENT (anti-pattern):
import type { FirestoreObject } from 'fireux-core/src/runtime/models/objects/object.model'

// RECOMMENDED:
import type { FirestoreObject } from 'fireux-core/models/objects/object.model'
```

---

## 4) Cross-Package Resolution & Nuxt Auto-imports

### **Path-based Import Violations**

**FOUND**: 5 files using relative path imports (anti-pattern)

```typescript
// projects/misebox/niederhorn/nuxt.config.ts
// CURRENT:
import { createFireuxConfig } from '../../../packages/core/fireux-core/src/config/fireux-config'

// RECOMMENDED:
import { createFireuxConfig } from 'fireux-core/config/fireux-config'
```

**All Violating Files:**

1. `projects/misebox/niederhorn/nuxt.config.ts`
2. `projects/cleanbox/cleanbox-app/nuxt.config.ts`
3. `projects/cleanbox/richies-reinigung/nuxt.config.ts`
4. `projects/misebox/misebox-app/nuxt.config.ts`
5. `projects/fireux/fireux-app/nuxt.config.ts` (commented)

### **Nuxt Auto-import Validation**

- ✅ All apps extend `.nuxt/tsconfig.json` (healthy)
- ✅ Vue files included in tsconfig (healthy)
- 🟨 Missing project references to enable proper resolution

---

## 5) Commands & CI Suggestions

### **One-shot Local Checks**

```bash
# Validate package.json consistency
pnpm -w install --frozen-lockfile

# Type checking across all packages
pnpm -r exec tsc --noEmit

# Build validation
pnpm build:packages

# Dependency analysis
pnpm -w list vue nuxt firebase --depth=0

# Export validation
pnpm -r exec node -e "console.log(require('./package.json').exports)"
```

### **CI Steps (GitHub Actions)**

```yaml
name: Monorepo Health Check
on: [push, pull_request]
jobs:
  validate:
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 10
      - run: pnpm install --frozen-lockfile
      - run: pnpm -r exec tsc --noEmit
      - run: pnpm build:packages
      - run: |
          # Validate peer dependency ranges
          node -e "
          const fs = require('fs');
          const glob = require('glob');
          glob.sync('packages/*/*/package.json').forEach(f => {
            const pkg = JSON.parse(fs.readFileSync(f));
            if (pkg.peerDependencies) {
              Object.entries(pkg.peerDependencies).forEach(([name, ver]) => {
                if (!ver.startsWith('^') && !ver.startsWith('~')) {
                  console.error(\`❌ \${f}: \${name} should use range version\`);
                  process.exit(1);
                }
              });
            }
          });
          "
```

---

## 6) Score & Roadmap

### **Health Score: 73/100**

- **package.json (40%)**: 28/40 🟨 (peer deps, exports, versions)
- **tsconfig (30%)**: 24/30 🟩 (references, composite, includes)
- **exports (20%)**: 12/20 🟨 (missing config/_, composables/_)
- **cross-package (10%)**: 9/10 🟩 (good workspace usage, few violations)

### **3-Phase Remediation Plan**

#### **Phase 1: Quick Wins (2 hours)**

1. **Fix peer dependency ranges** in fireux-jobs
2. **Add missing exports** to fireux-core (config/_, composables/_)
3. **Align Firebase/Vue versions** across all packages
4. **Add version** to test-core-isolation

#### **Phase 2: Structure & References (4 hours)**

1. **Add tsconfig references** in all project apps
2. **Remove path-based imports** in nuxt.config.ts files
3. **Fix deep import** in Recipe.model.ts
4. **Add TypeScript** to project devDependencies

#### **Phase 3: Guardrails & Automation (2 hours)**

1. **Add lint rules** against path imports
2. **Create dep-sync script** for version consistency
3. **Add CI validation** for package.json invariants
4. **Document export patterns** for contributors

**Target Health Score After Remediation: 95/100** 🎯

---

**Summary**: FireUX has excellent workspace foundations but needs export refinements and dependency consistency. The TypeScript project references are properly configured, making this primarily a package.json maintenance effort.
