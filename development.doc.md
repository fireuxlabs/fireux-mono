# 🚀 FireUX Development Guide

## 🏗️ Architecture Overview

**99% Shared, 1% Unique** - Three production apps powered by shared modules:

- **`packages/fireux-core/`** - Shared Nuxt 3 module (200+ components, pages, composables)
- **`packages/fireux-jobs/`** - Universal job management system for service industries
- **`projects/fireux/`** - Main company app (yellow theme)
- **`projects/cleanbox/`** - Cleaning industry platform (green theme)
- **`projects/misebox/`** - Culinary industry platform (blue theme)

## 🛠️ Technology Stack

### Frontend

- **Nuxt 3** - Full-stack Vue framework
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **Nuxt UI** - Component library

### Backend & Services

- **Firebase Auth** - Authentication system
- **Firestore** - NoSQL database
- **Stripe** - Payment processing
- **Cloudinary** - Image management

### Development

- **pnpm Workspaces** - Monorepo management
- **ESLint & Prettier** - Code quality
- **Auto-imports** - Component/composable resolution

## 📁 Monorepo Structure

```
fireux/
├── packages/                # Shared modules
│   ├── fireux-core/         # Core Nuxt 3 module (99% shared functionality)
│   │   ├── src/runtime/     # 200+ components, pages, layouts
│   │   ├── src/module.ts    # Module configuration
│   │   └── src/*-config.ts  # Auto-import configurations
│   └── fireux-jobs/         # Job management module ✨ NEW
│       ├── src/runtime/     # Job models, pages, composables
│       └── src/module.ts    # Jobs module configuration
├── projects/                # Production applications
│   ├── fireux/fireux-app/   # Main company app (yellow)
│   ├── cleanbox/cleanbox-app/ # Cleaning platform (green) + Jobs ✅
│   └── misebox/misebox-app/   # Culinary platform (blue) + Jobs ✅
├── playground/              # Development testing (red)
└── pnpm-workspace.yaml      # Workspace configuration
```

## 🚀 Development Workflow

### Initial Setup

```bash
# Clone and install
git clone https://github.com/your-org/fireux
cd fireux
pnpm install

# Start development
pnpm dev:fireux      # Main app    (localhost:3005)
pnpm dev:cleanbox    # CleanBox    (localhost:3007)
pnpm dev:misebox     # Misebox     (localhost:3009)
pnpm dev:playground  # Testing     (localhost:3000)
```

### ✅ LOCKED IN: Navigation & Routing System

Our **authentication-based routing system** is now complete and production-ready across all apps:

```vue
<!-- 🎯 Final implementation pattern (all apps): -->
<template>
  <CoreDefault :routes="routes" />
</template>
<script setup>
const { appUser } = useAppUser()
const jobPublicRoutes = getPublicJobRoutes() || []
const jobPrivateRoutes = appUser.value ? getPrivateJobRoutes() || [] : []
const routes = useRoutes(jobPublicRoutes, jobPrivateRoutes)
</script>
```

**Key Features:**

- **Public routes** (Jobs, Products, Blog) - Always visible
- **Private routes** (Employer, Professional profiles) - Only when authenticated
- **User dashboard group** - Collapsed navigation for mobile
- **Admin group** - Only visible to admin users
- **Three navigation contexts** - menuBarLinks, mobileLinks, dashboardLinks

### Adding Jobs Functionality ✨

The Jobs module demonstrates our modular architecture:

```bash
# Jobs module is already integrated! ✅
# Access via dashboard navigation in Cleanbox and Misebox:
# - /dashboard/employer-profile
# - /dashboard/professional-profile

# To add jobs to a new app:
# 1. Add module to nuxt.config.ts
modules: ['fireux-jobs']

# 2. Import routes in layouts
import { getJobRoutes } from 'fireux-jobs/composables'
const jobRoutes = getJobRoutes()

# 3. Pass to core layouts
<CoreDashboard :extras="jobRoutes" />
```

### Extending Jobs Module

```bash
# Add new job-related page
touch packages/fireux-jobs/src/runtime/pages/dashboard/job-posting.vue
# Register in packages/fireux-jobs/src/module.ts
# Available in all apps using the module

# Add job-specific composable
touch packages/fireux-jobs/src/runtime/composables/useJobManagement.ts
# Export in packages/fireux-jobs/src/runtime/composables/index.ts
# Auto-imported as useJobManagement() wherever jobs module is used
```

## 🎯 Key Features

### Shared Functionality (via FireUX Core)

- **Authentication** - Firebase Auth with user management
- **Database** - Firestore with auto-imported composables
- **Payments** - Stripe integration for subscriptions
- **Blog System** - Content management with rich text editor
- **Product System** - E-commerce with inventory management
- **Admin Panel** - Complete management interface
- **Design System** - TailwindCSS + Nuxt UI components

### ✨ Jobs Module (via FireUX Jobs) - **NEW**

- **🏢 Employer Profiles** - Company information and job posting management (`/dashboard/employer-profile`)
- **👤 Professional Profiles** - Service worker profiles for cleaning/culinary industries (`/dashboard/professional-profile`)
- **🔗 Route Integration** - Seamless dashboard navigation integration
- **🌍 Universal Design** - Works across cleaning and culinary business platforms
- **📦 Modular Architecture** - Optional 4.1kB module that extends existing apps
- **⚡ Zero Breaking Changes** - Fully backward compatible with existing functionality

**Production Status**: ✅ Live in both Cleanbox and Misebox apps

### App-Specific

Each app inherits all shared functionality but customizes:

- Landing page (`pages/index.vue`)
- Theme colors (`app.config.ts`)
- Firebase configuration
- Domain-specific content
- **Job module integration** (optional via `extras` prop)

## 🔧 Development Patterns

### Adding Shared Features

All shared functionality goes in `packages/fireux-core/`:

```bash
# Add new shared page
touch packages/fireux-core/src/runtime/pages/new-feature.vue
# Register in packages/fireux-core/src/pages-config.ts
# Available in all apps immediately

# Add new component
touch packages/fireux-core/src/runtime/components/organisms/NewComponent.vue
# Auto-imported as <FireNewComponent> in all apps

# Add new composable
touch packages/fireux-core/src/runtime/composables/useNewFeature.ts
# Auto-imported in all apps
```

### Creating New Apps

```bash
# Copy existing app structure
cp -r projects/fireux/fireux-app projects/newapp/newapp-app
# Customize theme, Firebase config, and landing page
```

## 🎨 Color System & Theming

### App Color Configurations

Each app uses a consistent two-color system based on Nuxt UI colors:

| App            | Primary  | Neutral | Primary Hex | Neutral Hex |
| -------------- | -------- | ------- | ----------- | ----------- |
| **FireUX**     | `yellow` | `zinc`  | `#EAB308`   | `#71717A`   |
| **CleanBox**   | `blue`   | `slate` | `#3B82F6`   | `#64748B`   |
| **MiseBox**    | `green`  | `slate` | `#22C55E`   | `#64748B`   |
| **Playground** | `red`    | `slate` | `#EF4444`   | `#64748B`   |

### How to Choose Colors

1. **Visit [Nuxt UI Colors](https://ui.nuxt.com/getting-started/theming#colors)** to see available color options
2. **Pick a primary color** that matches your brand (e.g., `blue`, `green`, `yellow`)
3. **Pick a neutral color** for secondary elements (usually `slate`, `gray`, or `zinc`)
4. **Update your app configuration** in two places:

#### Step 1: Update `app/app.config.ts`

```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue', // Your chosen primary color
      neutral: 'slate', // Your chosen neutral color
    },
  },
})
```

#### Step 2: Update `.env` file

Convert your colors to hex values (without `#` prefix):

```bash
# Replace with your hex values (no # prefix)
APP_PRIMARY_COLOR=3B82F6  # blue-500
APP_NEUTRAL_COLOR=64748B  # slate-500
```

#### Hex Color Reference

Common Nuxt UI colors and their hex values:

- **red**: `EF4444` | **orange**: `F97316` | **yellow**: `EAB308`
- **green**: `22C55E` | **blue**: `3B82F6` | **purple**: `8B5CF6`
- **slate**: `64748B` | **gray**: `6B7280` | **zinc**: `71717A`

> 💡 **Tip**: Use a color picker tool or search "tailwind [color] 500" to find the exact hex values.

### Color Usage in Components

Colors automatically propagate throughout the app:

```vue
<template>
  <!-- Uses your primary color -->
  <UButton color="primary">Primary Button</UButton>

  <!-- Uses your neutral color -->
  <UButton color="neutral">Neutral Button</UButton>

  <!-- CSS variables are also available -->
  <div class="text-primary-500 bg-neutral-100">Themed content</div>
</template>
```

## 🚀 Deployment & Production

### Live Applications

All three FireUX applications are successfully deployed to Firebase Hosting:

| Application  | Status  | Live URL                                               | Firebase Project |
| ------------ | ------- | ------------------------------------------------------ | ---------------- |
| **FireUX**   | ✅ Live | [fireux-2005.web.app](https://fireux-2005.web.app)     | `fireux-2005`    |
| **CleanBox** | ✅ Live | [cleanbox.web.app](https://cleanbox.web.app)           | `cleanbox-f15bc` |
| **MiseBox**  | ✅ Live | [misebox-78f9c.web.app](https://misebox-78f9c.web.app) | `misebox-78f9c`  |

### Quick Deployment

```bash
# Deploy all apps at once
./deploy-all.sh

# Or individual deployment
cd projects/cleanbox/cleanbox-app && pnpm build && pnpm exec firebase deploy
cd projects/misebox/misebox-app && pnpm build && pnpm exec firebase deploy
cd projects/fireux/fireux-app && pnpm build && pnpm exec firebase deploy
```

### Deployment Process

Each app follows the same Firebase deployment pattern:

```bash
# 1. Build the application
cd projects/[app-name]/[app-name]-app
pnpm run build

# 2. Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Critical Fixes Applied

#### ⚠️ **FireUX Core Import/Export Issues**

**Problem**: TypeScript compilation errors due to incorrect import/export patterns in the core module.

**Solution**: Fixed module exports in `/packages/fireux-core/src/module.ts`:

```typescript
// ✅ FIXED: Proper default export syntax
export default defineNuxtModule({
  meta: {
    name: 'fireux-core',
    configKey: 'fireuxCore',
  },
  // ... configuration
})
```

**Impact**: Enables successful builds across all three applications.

#### ⚠️ **FireUX Jobs Missing Dist Files**

**Problem**: Empty distribution files preventing jobs module from working correctly.

**Solution**: Manually created proper exports in `/packages/fireux-jobs/dist/runtime/composables/index.mjs`:

```javascript
// ✅ MANUALLY CREATED: Proper composable exports
export { getJobRoutes } from '../../../src/runtime/composables/index.ts'
```

**Files Fixed**:

- `/packages/fireux-jobs/dist/runtime/composables/index.mjs`
- `/packages/fireux-jobs/dist/runtime/composables/index.d.ts`

**Impact**: Jobs module now works correctly in CleanBox and MiseBox applications.

### Build Configuration

Each app uses Firebase preset for optimal deployment:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'firebase',
  },
  // ... other configuration
})
```

### Firebase Configuration

Each app has its own Firebase project with hosting configuration:

```json
// firebase.json (example)
{
  "hosting": {
    "public": ".output/public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Deployment Checklist

Before deploying any app:

1. **✅ Core Module**: Ensure `fireux-core` builds without TypeScript errors
2. **✅ Jobs Module**: Verify `fireux-jobs` dist files exist and export correctly
3. **✅ App Build**: Test local build with `pnpm run build`
4. **✅ Firebase Setup**: Confirm correct Firebase project is configured
5. **✅ Environment**: Verify all environment variables are set
6. **✅ Deploy**: Run `firebase deploy --only hosting`

### Troubleshooting Common Issues

#### **TypeScript Build Errors**

```bash
# Check for import/export issues in core module
cd packages/fireux-core
pnpm run build

# Fix missing type definitions
pnpm run dev
```

#### **Module Resolution Errors**

```bash
# Rebuild all packages
pnpm run build:packages

# Clear cache and reinstall
rm -rf node_modules .nuxt
pnpm install
```

#### **Jobs Module Not Working**

```bash
# Verify dist files exist
ls packages/fireux-jobs/dist/runtime/composables/

# Manually create if missing (see fixes above)
# Then rebuild application
```

## 🤝 Contributing

1. **Never duplicate code** - Add shared functionality to FireUX Core
2. **Keep apps minimal** - Only unique content and configurations
3. **Use modular approach** - Create focused modules like FireUX Jobs for specific features
4. **Use TypeScript** - Maintain type safety across modules
5. **Test in playground** - Validate components before production
6. **Follow naming** - Prefix components with `Fire*`
7. **Document thoroughly** - Maintain `.doc.md` files for detailed documentation

### Development Best Practices

- **Start minimal**: Build working versions first, optimize later
- **Test integration early**: Real app integration reveals design issues
- **Avoid over-engineering**: Simple prop passing beats complex state management
- **Commit working features**: Don't commit half-finished implementations
- **Use semantic versioning**: Follow proper versioning for module releases

## 📚 Documentation System

### Three-Document Pattern

Each level of the monorepo maintains documentation for different audiences:

**README.md** - GitHub-visible overview and quick start  
**[name].doc.md** - Detailed technical documentation (excluded from production builds)  
**[context].doc.md** - Context-specific guides (e.g., `development.doc.md`, `business.doc.md`)

### Documentation Structure

```
fireux/
├── README.md                    # 🏠 GitHub overview & quick start
├── architecture.doc.md          # 🏗️ System architecture
├── business.doc.md              # 💼 Business strategy
├── development.doc.md           # 🚀 This file - development guide
├── packages/
│   ├── fireux-core/
│   │   └── core.doc.md          # 🎯 Core module documentation
│   └── fireux-jobs/
│       └── jobs.doc.md          # 🏢 Jobs module documentation
└── projects/
    └── README.md                # 🎨 App development guide
```

**Document Exclusion**: All `*.doc.*` files are excluded from production builds via Nuxt configuration.
