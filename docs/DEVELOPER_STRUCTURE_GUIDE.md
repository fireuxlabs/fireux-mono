# 📚 Developer Unified Structure Guide

> **Key Insight**: FireUX follows a **unified structure pattern** where both `packages/*/runtime/` and `projects/*/app/` use the same Nuxt conventional structure at different scopes.

## 🏗️ Unified Structure Pattern

### **The Pattern**

Both package runtime and app levels follow identical Nuxt directory conventions:

```
# Package Runtime Level (Domain modules)
packages/[domain]/src/runtime/
├── components/     # Domain components
├── composables/    # Domain composables
├── pages/          # Domain pages
├── layouts/        # Domain layouts
├── middleware/     # Domain middleware
├── plugins/        # Domain plugins
├── types/          # Domain types
└── models/         # Domain models

# App Level (Final applications)
projects/[app]/app/
├── components/     # App-specific components
├── composables/    # App-specific composables
├── pages/          # App-specific pages
├── layouts/        # App-specific layouts
├── middleware/     # App-specific middleware
├── plugins/        # App-specific plugins
├── types/          # App-specific types
└── config/         # App-specific config
```

### **Structure Scopes**

- **Package Runtime**: Domain-specific functionality (jobs, misebox, cleanbox)
- **App Level**: Application-specific overrides and additions

## 🚀 Quick Commands

```bash
# Check structure compliance
pnpm structure:validate

# Auto-fix common issues
pnpm structure:fix

# Generate structure report
pnpm structure:report
```

## 📁 Unified Structure Rules

### 🎯 **Both Levels Follow Same Pattern**

```typescript
// ✅ Package runtime level (domain scope)
packages/fireux-jobs/src/runtime/
├── components/organisms/Job/    # JobCard, JobForm
├── composables/app/routes/      # useJobRoutes
├── pages/jobs/                  # Domain pages
└── types/                       # Job interfaces

// ✅ App level (application scope)
projects/fireux-app/app/
├── components/custom/           # App-specific components
├── composables/analytics/       # App-specific composables
├── pages/                       # App override pages
└── config/                      # App configuration
```

### 🔗 **Structure Inheritance**

- App level **inherits** from package runtime level
- App level can **override** package runtime components/pages
- App level can **extend** with app-specific functionality

### 🛠️ **Directory Standards**

Both levels must use standard Nuxt directories:

- `components/` - Vue components
- `composables/` - Composition API functions
- `pages/` - File-based routing
- `layouts/` - Layout components
- `middleware/` - Route middleware
- `plugins/` - Nuxt plugins
- `types/` - TypeScript definitions

## 📁 Where to Put Things (Unified Approach)

### 🔗 Route Functions

```typescript
// ✅ Package runtime level (domain routes)
packages/[package]/src/runtime/composables/app/routes/
├── use[Package]Routes.ts         # Domain routes
└── use[Package]ProfileRoutes.ts  # Domain profile routes

// ✅ App level (app-specific routes)
projects/[app]/app/composables/app/routes/
├── useAppRoutes.ts               # App-specific routes
└── useCustomRoutes.ts            # App custom routes

// ❌ Wrong - breaks unified pattern
packages/[package]/src/runtime/composables/use[Package]Routes.ts
projects/[app]/app/routes.ts      # Should be in composables/app/routes/
```

### 🛠️ Utility Functions

```typescript
// ✅ Package runtime level (domain utils)
packages/[package]/src/runtime/composables/app/utils/
├── use[Feature]Helper.ts         # Domain utilities
└── use[Feature]Formatter.ts      # Domain formatters

// ✅ App level (app utils)
projects/[app]/app/composables/app/utils/
├── useAnalytics.ts              # App-specific utilities
└── useCustomFormatting.ts       # App custom utilities

// ✅ Entity-specific utils (both levels)
*/composables/firestore/[Entity]/utils/
├── use[Entity]Validation.ts
└── use[Entity]Formatting.ts
```

### 🎯 Components

```vue
<!-- ✅ Package runtime level (domain components) -->
<!-- packages/fireux-jobs/src/runtime/components/ -->
<JobCard />
<!-- Domain component -->
<JobApplicationForm />

<!-- ✅ App level (app components) -->
<!-- projects/fireux-app/app/components/ -->
<CustomJobCard />
<!-- App-specific override -->
<AppSpecificWidget />

<!-- ❌ Wrong - inconsistent structure -->
<!-- packages/*/components/ -->
<!-- Missing runtime/ level -->
<!-- projects/*/components/ -->
<!-- Missing app/ level -->
```

### 📋 Pages

```vue
<!-- ✅ Package runtime level (domain pages) -->
<!-- packages/fireux-jobs/src/runtime/pages/ -->
/jobs/index.vue
<!-- Domain page -->
/jobs/[id].vue
<!-- Domain dynamic page -->

<!-- ✅ App level (app pages) -->
<!-- projects/fireux-app/app/pages/ -->
/index.vue
<!-- App landing page -->
/about.vue
<!-- App-specific page -->
/jobs/custom.vue
<!-- App extension to domain -->
```

## 🔧 Adding New Features (Unified Approach)

### 📦 **Determine Correct Level**

1. **Package Runtime Level** (Domain functionality):
   - Domain-specific components, pages, composables
   - Shared across multiple apps in that domain
   - Example: `JobCard` component used in multiple job apps

2. **App Level** (Application-specific):
   - App-specific overrides and customizations
   - App-unique functionality
   - Example: Custom landing page for specific app

### 📦 Adding a New Component

1. **Choose correct level**:

   ```vue
   <!-- Domain component (package runtime) -->
   packages/fireux-jobs/src/runtime/components/molecules/JobCard.vue

   <!-- App-specific component (app level) -->
   projects/fireux-app/app/components/custom/CustomJobCard.vue
   ```

2. **Follow unified structure**:
   - Both use `components/` directory
   - Both follow atomic design (atoms/, molecules/, organisms/)
   - Both use proper prefixes

### 🎯 Adding Pages

1. **Domain pages** (package runtime):

   ```vue
   <!-- packages/fireux-jobs/src/runtime/pages/jobs/index.vue -->
   <template>
     <div>Generic job listing page</div>
   </template>
   ```

2. **App-specific pages** (app level):
   ```vue
   <!-- projects/fireux-app/app/pages/jobs/featured.vue -->
   <template>
     <div>App-specific featured jobs page</div>
   </template>
   ```

### 🛠️ Adding Composables

1. **Domain composables** (package runtime):

   ```typescript
   // packages/fireux-jobs/src/runtime/composables/firestore/Job/useJobs.ts
   export function useJobs() {
     // Domain job logic
   }
   ```

2. **App composables** (app level):
   ```typescript
   // projects/fireux-app/app/composables/analytics/useJobAnalytics.ts
   export function useJobAnalytics() {
     // App-specific analytics
   }
   ```

## 🚫 Common Mistakes (Unified Structure)

### ❌ **Wrong Level Placement**

```typescript
// Don't put app-specific code in package runtime
packages / fireux - jobs / src / runtime / components / CustomAppHeader.vue // Wrong!
projects / fireux - app / app / components / CustomAppHeader.vue // Correct!

// Don't put domain code in app level when it could be shared
projects / fireux - app / app / components / JobCard.vue // Wrong!
packages / fireux - jobs / src / runtime / components / molecules / JobCard.vue // Correct!
```

### ❌ **Inconsistent Directory Structure**

```typescript
// Both levels must follow same Nuxt conventions
packages/*/src/runtime/utils/          // Wrong! Not standard Nuxt
packages/*/src/runtime/composables/    // Correct! Standard Nuxt

projects/*/app/helpers/                // Wrong! Not standard Nuxt
projects/*/app/composables/            // Correct! Standard Nuxt
```

### ❌ **Breaking Unified Pattern**

```typescript
// Don't mix structure patterns
packages/fireux-jobs/routes/           // Wrong! Should be composables/app/routes/
packages/fireux-jobs/src/runtime/composables/app/routes/  // Correct!

projects/fireux-app/app/routes/        // Wrong! Should be composables/app/routes/
projects/fireux-app/app/composables/app/routes/           // Correct!
```

## 🎯 Pre-Commit Checklist (Unified Structure)

Before committing structural changes:

- [ ] ✅ `pnpm structure:validate` passes
- [ ] 🏗️ File placed at correct level (package runtime vs app)
- [ ] 📁 Standard Nuxt directory used (`components/`, `composables/`, etc.)
- [ ] 🎯 Proper component prefixes used
- [ ] 🧪 Test in playground: `pnpm dev:playground`
- [ ] 📱 Test in target app: `pnpm dev:[app]`
- [ ] 🔗 All imports working correctly
- [ ] 📁 No empty directories left behind
- [ ] 📋 Models have `.model.ts` suffix
- [ ] 🏗️ Unified structure pattern maintained

## 🛠️ Troubleshooting (Unified Structure)

### Structure Validation Fails

```bash
# See what's wrong
pnpm structure:validate

# Auto-fix common issues
pnpm structure:fix

# Re-validate
pnpm structure:validate
```

### Wrong Level Placement

1. Determine if feature is domain-specific or app-specific
2. Move to correct level (package runtime vs app)
3. Update imports if necessary
4. Test in relevant apps

### Inconsistent Directory Structure

1. Check both package runtime and app levels use same Nuxt directories
2. Move files to standard directories (`composables/`, `components/`, etc.)
3. Update auto-import configurations if needed

## 📊 Structure Health Dashboard (Unified Pattern)

Monitor unified structure compliance:

```bash
# Quick health check
pnpm structure:validate

# Count unified structure compliance
find packages -path "*/src/runtime" | wc -l     # Package runtime count
find projects -path "*/app" | wc -l             # App level count

# Verify standard Nuxt directories
find packages projects -name "components" -type d | wc -l   # Components
find packages projects -name "composables" -type d | wc -l  # Composables
find packages projects -name "pages" -type d | wc -l        # Pages

# Check for non-standard directories
find packages projects -type d -name "*" ! -name "components" ! -name "composables" ! -name "pages" ! -name "layouts" ! -name "middleware" ! -name "plugins" ! -name "types" ! -name "models" ! -name "config" | grep -E "(runtime|app)/" | head -10
```

## 🎓 Unified Structure Best Practices

1. **🏗️ Think in Levels**: Package runtime (domain) vs App (application-specific)
2. **📁 Consistent Directories**: Both levels use same Nuxt structure
3. **🎯 Proper Scoping**: Domain functionality in packages, app-specific in apps
4. **🔗 Smart Inheritance**: Apps inherit and extend package runtime functionality
5. **🧹 Regular Validation**: Run structure validation to maintain compliance
6. **📚 Document Decisions**: Update this guide when adding new patterns

> **💡 Unified Principle**: If it follows Nuxt conventions at the package runtime level, it should follow the same conventions at the app level. This creates a predictable, scalable architecture!
