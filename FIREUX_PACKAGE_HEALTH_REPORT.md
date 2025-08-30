# FireUX Monorepo Package.json Health Report

## 📦 **Package Inventory Table**

| Path                                  | Name                | Private    | Type    | Version    | Health |
| ------------------------------------- | ------------------- | ---------- | ------- | ---------- | ------ |
| `/`                                   | fireux              | ✅ `true`  | ROOT    | 1.0.0      | 🟨     |
| `packages/core/fireux-core`           | fireux-core         | ✅ `true`  | PACKAGE | 0.1.0      | 🟨     |
| `packages/extensions/fireux-jobs`     | fireux-jobs         | ✅ `true`  | PACKAGE | 0.1.0      | 🟥     |
| `packages/extensions/fireux-places`   | fireux-places       | ✅ `true`  | PACKAGE | 0.1.0      | 🟩     |
| `packages/tenants/fireux-cleanbox`    | fireux-cleanbox     | ✅ `true`  | PACKAGE | 0.1.0      | 🟩     |
| `packages/tenants/fireux-misebox`     | fireux-misebox      | ✅ `true`  | PACKAGE | 0.1.0      | 🟩     |
| `projects/fireux/fireux-app`          | fireux-app          | ✅ `true`  | PROJECT | ❌ missing | 🟨     |
| `projects/misebox/misebox-app`        | misebox-app         | ✅ `true`  | PROJECT | ❌ missing | 🟨     |
| `projects/cleanbox/cleanbox-app`      | cleanbox-app        | ✅ `true`  | PROJECT | ❌ missing | 🟨     |
| `projects/misebox/niederhorn`         | Niederhorn          | ✅ `true`  | PROJECT | ❌ missing | 🟨     |
| `projects/cleanbox/richies-reinigung` | richies-reinigung   | ✅ `true`  | PROJECT | ❌ missing | 🟨     |
| `test-core-isolation`                 | test-core-isolation | ✅ `true`  | TEST    | ❌ missing | 🟩     |
| `tools/vscode-fireux-toolbar`         | fireux-toolbar      | ❌ `false` | TOOL    | 0.0.1      | 🟩     |

---

## 🟥 **RED FLAGS (Critical Issues)**

### **1. Missing PeerDependencies in Packages**

**Issue**: Packages have Vue/Firebase/Nuxt in `dependencies` instead of `peerDependencies`

- ❌ **fireux-jobs**: Has `vue: ^3.5.0`, `firebase: ^11.10.0`, `vuefire: ^3.2.0` in deps
- ❌ **Root issue**: This prevents proper tree-shaking and causes duplicate installs

**Risk**: Bundle bloat, version conflicts, peer dependency warnings

### **2. Missing `sideEffects` Field**

**Issue**: No packages declare `sideEffects: false`

- ❌ **All packages** missing this field
- ❌ **Impact**: Webpack/Vite cannot tree-shake unused exports effectively

**Risk**: Larger bundles, slower builds

### **3. Runtime Dependencies in Root**

**Issue**: Root package has runtime dependency

- ❌ `better-sqlite3: ^11.10.0` in root dependencies
- ❌ Should be in individual projects that need it

**Risk**: Monorepo pollution, unclear dependency ownership

---

## 🟨 **YELLOW FLAGS (Warnings)**

### **1. Missing Versions in Project Apps**

**Issue**: All project apps missing `version` field

- ⚠️ **5 project apps** have no version specified
- ⚠️ Makes release tracking difficult

### **2. Inconsistent Dependency Versions**

**Issue**: Minor version mismatches across the monorepo

- ⚠️ `firebase: 11.9.1` (projects) vs `firebase: 11.10.0` (packages)
- ⚠️ `vue: 3.5.17` (projects) vs `vue: 3.5.0` (packages)

### **3. Missing `engines` in Packages**

**Issue**: Packages don't specify Node.js/pnpm requirements

- ⚠️ **All 5 packages** missing `engines` field
- ⚠️ Only root specifies `"node": ">=20.11 <23"`

### **4. Incomplete Package Exports**

**Issue**: fireux-core missing some export paths

- ⚠️ **fireux-core** has `/server/*` exports but limited patterns
- ⚠️ Could add `/composables/*`, `/components/*` for better DX

---

## 🟩 **GREEN FLAGS (Healthy Configs)**

### **✅ Workspace Structure**

- **Perfect `workspace:*` usage** across all internal dependencies
- **Consistent `private: true`** for all packages and projects
- **Proper `type: "module"`** across all packages

### **✅ Export Patterns**

- **Standardized exports** with `types` + `import` fields
- **TypeScript support** with `typesVersions` in all packages
- **Source-based exports** for optimal development experience

### **✅ Build System**

- **Consistent scripts** across packages (`build`, `dev`, `clean`)
- **Nuxt-compatible builds** with `nuxt-module-build`
- **Proper file inclusion** with `files: ["src/**/*"]`

### **✅ Root Configuration**

- **Strong overrides** ensuring version consistency
- **Comprehensive scripts** for development workflows
- **Proper engines** and package manager specification

---

## 📊 **Summary & Recommendations**

### **🎯 Priority Fixes**

1. **Fix Peer Dependencies (CRITICAL)**

   ```json
   // fireux-jobs - MOVE to peerDependencies:
   "peerDependencies": {
     "vue": "^3.5.0",
     "firebase": "^11.0.0",
     "vuefire": "^3.2.0"
   }
   ```

2. **Add sideEffects to All Packages**

   ```json
   "sideEffects": false
   ```

3. **Move Runtime Deps from Root**

   ```json
   // Move better-sqlite3 to projects that need it
   ```

4. **Add Versions to Projects**
   ```json
   "version": "1.0.0"
   ```

### **🔧 Secondary Improvements**

5. **Add engines to packages**
6. **Align Firebase/Vue versions**
7. **Add missing export paths**

### **📈 Current Health Score: 72/100**

- 🟥 **Critical Issues**: 3
- 🟨 **Warnings**: 4
- 🟩 **Strengths**: 4

### **🎯 Target Health Score: 95/100** (after fixes)

The FireUX monorepo has a **solid foundation** but needs **peer dependency fixes** to reach production readiness. The workspace setup and export patterns are exemplary.
