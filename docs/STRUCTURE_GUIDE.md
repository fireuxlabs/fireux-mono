# 🏗️ FireUX Structure Guide

> **Complete guide to FireUX's unified structure pattern, enforcement tools, and development practices**

## 🎯 Quick Start

```bash
# Validate structure compliance
pnpm structure:validate

# Auto-fix common issues
pnpm structure:fix

# Generate structure report
pnpm structure:report
```

## 🏗️ Unified Structure Pattern

**Key Insight**: FireUX follows a **unified structure pattern** where both `packages/*/runtime/` and `projects/*/app/` use the same Nuxt conventional structure at different scopes.

### **Package Runtime Structure** (Domain Modules)

```
packages/[domain]/src/runtime/
├── components/     # Domain components (Fire*, Job*, Mise*, etc.)
├── composables/    # Domain composables
├── pages/          # Domain pages
├── layouts/        # Domain layouts
├── middleware/     # Domain middleware
├── plugins/        # Domain plugins
├── types/          # Domain types
└── models/         # Domain models
```

### **App Structure** (Applications)

```
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

**Structure Inheritance**: Apps inherit from package runtime and can override/extend functionality.

## 📁 Where to Put Things

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
```

## 🛠️ Enforcement Strategy

### **Automated Tools**

- **Validation Script**: `pnpm structure:validate` - comprehensive structure checking
- **Auto-Fix Script**: `pnpm structure:fix` - automatic cleanup of common issues
- **Custom ESLint Plugin**: Rules for routes, utils, components, models, and imports

### **Enforcement Rules**

#### **Directory Naming Rules**

- `routes/` - Only route-related functions
- `utils/` - Categorized by scope (app, entity, effects)
- `profiles/` - Only profile-related code
- `objects/` - Only object/entity-related code

#### **File Naming Rules**

- `use[Feature]Routes.ts` - Must be in routes/
- `use[Entity]Validation.ts` - Must be in entity utils/
- `use[Entity]Formatting.ts` - Must be in entity utils/
- `*.model.ts` - Must be in models/

#### **Component Prefix Rules**

- **fireux-core**: `<Fire...>` (e.g., `<FireButton>`, `<FireCard>`)
- **fireux-jobs**: `<Job...>` (e.g., `<JobCard>`, `<JobForm>`)
- **fireux-misebox**: `<Mise...>` (e.g., `<MiseChefCard>`, `<MiseSupplierForm>`)
- **fireux-places**: `<Place...>` (e.g., `<PlaceMap>`, `<PlaceSearch>`)

## 🚫 Common Mistakes

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

## 🎯 Pre-Commit Checklist

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

## 📊 Structure Health Dashboard

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
```

## 🛠️ Developer Commands

### **Structure Management**

```bash
pnpm structure:validate     # Validate current structure
pnpm structure:fix         # Auto-fix structure issues
pnpm structure:report      # Generate structure report
```

### **Development Workflow**

```bash
# Multiple apps in parallel
pnpm dev:fireux      # :3000 (yellow theme)
pnpm dev:cleanbox    # :3007 (blue theme)
pnpm dev:misebox     # :3009 (green theme)
pnpm dev:playground  # :3005 (test environment)

# Package development
pnpm build:packages  # Build all packages
pnpm dev:packages    # Develop all packages
pnpm clean:packages  # Clean all packages
```

## 🎓 Best Practices

1. **🏗️ Think in Levels**: Package runtime (domain) vs App (application-specific)
2. **📁 Consistent Directories**: Both levels use same Nuxt structure
3. **🎯 Proper Scoping**: Domain functionality in packages, app-specific in apps
4. **🔗 Smart Inheritance**: Apps inherit and extend package runtime functionality
5. **🧹 Regular Validation**: Run structure validation to maintain compliance
6. **📚 Document Decisions**: Update this guide when adding new patterns

> **Key Insight**: By recognizing that package/runtime and app/ levels share the same structural DNA, we've created a truly unified, scalable architecture that rivals Nuxt 4's structural discipline.
