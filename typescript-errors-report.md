# FireUX Monorepo TypeScript Errors Report

Generated: 29 August 2025

## Summary of All TypeScript Errors by Package

### 1. fireux-core Package
**Location**: `/packages/core/fireux-core`
**Total Errors**: ~70 errors across multiple files

#### Critical Import/Module Issues:
- **src/runtime/composables/firestore/objects/Product/**: Missing `product.model` module
  - Files affected: `useCreatePricesState.ts`, `useCreateProductState.ts`, `useProducts.ts`, `useProductFormatting.ts`, `useProductValidation.ts`
  - Error: `Cannot find module '../../../../models/product.model'`

- **src/runtime/models/objects/blogPost.model.ts**: Missing `protocols` module
  - Error: `Cannot find module './protocols'`

- **src/runtime/server/api/firestore/update-document.post.ts**: Missing Nuxt server imports
  - Missing: `defineEventHandler`, `readBody`, `createError`

#### Property/Type Issues:
- **AppUser model**: Missing `subscription` property (12+ errors)
  - Files: `useAppUserComputed.ts`, `useAppUserSubscription.ts`
  - Property: `appUser.subscription` does not exist

- **Profile models**: Missing `uid` property
  - Files: `useBlogPostUtils.ts`, `useBlogFormatting.ts`
  - Property: `appUser.uid` does not exist

#### TypeScript Configuration Issues:
- Missing `computed` import in `useObject.ts`
- Missing return types causing Promise type mismatches
- `verbatimModuleSyntax` causing type import issues
- Unused parameters and variables (6133 errors)

---

### 2. fireux-jobs Package
**Location**: `/packages/extensions/fireux-jobs`
**Total Errors**: 26 errors across 16 files

#### Critical Import/Module Issues:
- **src/runtime/models/objects/Job.model.ts**: Wrong path to core object model
  - Current: `../../../../../fireux-core/src/runtime/models/objects/object.model`
  - Should be: `fireux-core/runtime/models/objects/object.model`

- **src/runtime/models/profiles/**: Wrong paths to core profile models
  - Files: `Employer.model.ts`, `Professional.model.ts`
  - Current: `../../../../../../../packages/core/fireux-core/src/runtime/models/profiles/profile.model`
  - Should be: `fireux-core/runtime/models/profiles/profile.model`

- **src/runtime/composables/app/routes/useJobRoutes.ts**: Wrong path to core types
  - Current: `../../../../../../../core/fireux-core/src/runtime/types/routeLink`
  - Should be: `fireux-core/runtime/types/routeLink`

#### Cross-Package Import Issues:
- **Project Reference Errors**: Files from fireux-core not listed in project files
  - Multiple files: `useObject.ts`, `useFirestoreManager.ts`, etc.
  - Root cause: TypeScript project references not properly configured

#### Missing Composable Imports:
- **src/runtime/composables/firestore/profiles/**: Missing Firestore imports
  - Files: `useEmployerUpdate.ts`, `useProfessionalUpdate.ts`
  - Missing: `useFirestore`, `useFirestoreUtils`

#### Model Property Issues:
- **Employer model**: Missing `business_name` property
  - File: `useEmployerFilters.ts`
  - Property: `employer.business_name` does not exist

---

### 3. fireux-misebox Package
**Location**: `/packages/tenants/fireux-misebox`
**Total Errors**: 47 errors across 12 files

#### Critical Import/Module Issues:
- **src/runtime/composables/firestore/core/useMiseApp.ts**: Cannot find useApp
  - Current: `fireux-core/runtime/composables/app/useApp`
  - Error: Cannot find module (path mapping issue)

- **src/runtime/models/objects/Recipe.model.ts**: Wrong path to core object model
  - Current: `fireux-core/src/runtime/models/objects/object.model`
  - Should be: `fireux-core/runtime/models/objects/object.model`

- **src/runtime/models/profiles/**: Path mapping issues
  - Files: `Chef.model.ts`, `Supplier.model.ts`
  - Various import path issues

#### Cross-Package Dependencies:
- **Jobs package dependency**: Importing from fireux-jobs without proper reference
  - File: `useMiseboxRoutes.ts`
  - Import: `../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes`

#### TypeScript Configuration Issues:
- **Type-only imports**: `verbatimModuleSyntax` requires type-only imports
  - Files: `components-config.ts`, `composables-config.ts`
  - Missing: `import type { Resolver }`

#### Model Property Issues:
- **Chef model**: Missing properties (`chef_experience`, `certifications`, `hourly_rate`)
- **Supplier model**: Missing properties (`uid`, `website`, `years_in_business`, `employee_count`, `payment_terms`)
- **Ingredient model**: Missing properties (`description`, `tags`, `categories`, `allergens`, `organic`, `seasonal`, `local`)

---

### 4. fireux-places Package
**Location**: `/packages/extensions/fireux-places`
**Status**: Not fully tested, but likely has similar cross-package import issues

---

### 5. fireux-cleanbox Package
**Location**: `/packages/tenants/fireux-cleanbox`
**Status**: Not fully tested, but likely has similar tenant package issues

---

## Root Cause Analysis

### 1. Path Mapping Inconsistencies
**Problem**: Inconsistent use of path mappings vs relative paths
**Solution**: Standardize all cross-package imports to use `fireux-core/*` path mapping

### 2. TypeScript Project References
**Problem**: Files from fireux-core not listed in dependent project file lists
**Solution**: Either include more files or adjust project reference configuration

### 3. Missing Model Properties
**Problem**: Model interfaces incomplete or out of sync
**Solution**: Update model interfaces to match actual data usage

### 4. verbatimModuleSyntax Configuration
**Problem**: TypeScript 5.x requires explicit type imports
**Solution**: Add `type` keyword to type-only imports

### 5. Missing Auto-Import Configuration
**Problem**: Composables not auto-imported across packages
**Solution**: Ensure Nuxt auto-import configuration includes cross-package composables

---

## Priority Fix Order

### High Priority (Blocking Development)
1. **Fix useApp import in fireux-misebox** ✅ ATTEMPTED
2. **Standardize path mappings across all packages**
3. **Fix model import paths in all packages**
4. **Add missing model properties**

### Medium Priority (Development Quality)
1. **Fix type-only import issues**
2. **Add missing composable imports**
3. **Resolve project reference issues**

### Low Priority (Code Quality)
1. **Remove unused variables**
2. **Add proper return types**
3. **Fix implicit any types**

---

## Current Status
- **fireux-core**: 70+ errors (foundation issues)
- **fireux-jobs**: 26 errors (path mappings + model issues)
- **fireux-misebox**: 47 errors (import resolution + model issues)
- **Total Estimated**: 140+ errors across entire monorepo

**Next Steps**: Focus on path mapping standardization and model interface completion.
