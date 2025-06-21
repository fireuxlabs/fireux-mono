# 🚀 FireUX Dev Relay - ROOT

## Quick Start

```bash
pnpm dev:fireux      # Yellow app  :3005
pnpm dev:cleanbox    # Green app   :3007
pnpm dev:misebox     # Blue app    :3009
pnpm dev:playground  # Test env    :3000
```

## 🧭 Routing System ✅ LOCKED IN

**Authentication-based routing system complete and production-ready across all apps.**

### Final Implementation Pattern

```vue
<!-- All apps use this pattern -->
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

### Authentication Timing Fix ⚡

**Issue**: Layouts rendering before user authentication completes  
**Fix**: Use `await useAppUser()` in layout script setup

```vue
<!-- ✅ Correct pattern -->
<script setup>
const { appUser } = await useAppUser()
const jobPrivateRoutes = appUser ? getPrivateJobRoutes() || [] : []
</script>
```

### Route Visibility Rules

- **System Routes**: Always visible (App, Products, Blog)
- **Public Routes**: Always visible (Jobs from modules)
- **Private Routes**: Authenticated only (Employer/Professional Profile)
- **User Group**: Dashboard routes for authenticated users
- **Admin Group**: Admin features for admin role

## 🚀 Deployment Status

**All apps live and functional:**

| App | URL | Status |
|-----|-----|--------|
| **FireUX** | https://fireux-2005.web.app | ✅ Live |
| **CleanBox** | https://cleanbox.web.app | ✅ Live |
| **MiseBox** | https://misebox-78f9c.web.app | ✅ Live |

### Quick Deploy All Apps

```bash
# Deploy all three apps at once
./deploy-all.sh
```

## Architecture

- **Core**: All shared functionality → `packages/copilot.md`
- **Apps**: Theme variants only → `projects/copilot.md`
- **99% shared, 1% unique**

## Navigation Relay

**Working on shared features?** → `packages/fireux-core/copilot.md`
**Need overview first?** → `README.md`

### `/projects/`

**Production applications** - Each app inherits from FireUX Core:

- `fireux/` - Yellow theme, main company app
- `cleanbox/` - Green theme, organization tools
- `misebox/` - Blue theme, data management
- Each contains only unique `index.vue` and app-specific config

### `/playground/`

**Development testing** - Red theme, comprehensive landing page for testing components

## 🛠️ Development Commands

```bash
# Development servers
pnpm dev:fireux      # http://localhost:3005
pnpm dev:cleanbox    # http://localhost:3007
pnpm dev:misebox     # http://localhost:3006
pnpm dev:playground  # http://localhost:3004

# Package management
pnpm install         # Install all dependencies
pnpm build          # Build all packages
```

## 🎨 Creating New Apps

1. Copy existing app structure from `projects/fireux/fireux-app/`
2. Update `app.config.ts` with new color theme
3. Create unique `pages/index.vue` landing page
4. Configure Firebase project in `.env`
5. Add dev script to root `package.json`

### Quick App Commands

```bash
# Change app theme
Edit: app.config.ts → colors: { primary: 'newcolor' }

# Unique landing page
Edit: pages/index.vue → app-specific content

# Firebase config
Edit: config/service-account.json + .env

# New app (copy existing)
cp -r projects/fireux/fireux-app projects/newapp/newapp-app
```

## 🔧 Core Module Development

### Quick Core Tasks

```bash
# Add shared page
Edit: packages/fireux-core/src/runtime/pages/newpage.vue
Register: packages/fireux-core/src/pages-config.ts
→ Auto-available in all apps

# Add shared component
Add: packages/fireux-core/src/runtime/components/organisms/NewComponent.vue
→ Auto-imported as <FireNewComponent>

# Add composable
Add: packages/fireux-core/src/runtime/composables/useNewFeature.ts
→ Auto-available everywhere

# Test registration system
cd packages/fireux-core && node test-reg.js

# Test in playground immediately
cd playground && pnpm dev:playground
```

## 🔧 Key Files

- **Root**: `pnpm-workspace.yaml`, `package.json` - Workspace configuration
- **Apps**: `app.config.ts`, `nuxt.config.ts`, `package.json` - App configuration
- **Core**: `src/module.ts`, `src/pages-config.ts` - Module definition

## 📋 Best Practices

- **Never duplicate code** - Add shared functionality to FireUX Core
- **Keep apps minimal** - Only unique landing pages and configurations
- **Use TypeScript** - Maintain type safety across all modules
- **Test in playground** - Validate components before production use
- **Follow naming conventions** - Prefix components with `Fire*`

## 🚀 Deployment

Each app can be deployed independently while sharing the same FireUX Core module. This ensures consistency across deployments while allowing for app-specific customizations.

- Houses individual applications built using FireUX Core.
- Each project has its own `README.md` and `copilot.md` for app-specific details.
- **Further Information**: Refer to `projects/README.md` and `projects/copilot.md` for details.

## 🚀 Deployment Commands

### Quick Deploy (All Apps Live ✅)

```bash
# FireUX (https://fireux-2005.web.app)
cd projects/fireux/fireux-app
pnpm run build && firebase deploy --only hosting

# CleanBox (https://cleanbox.web.app)
cd projects/cleanbox/cleanbox-app
pnpm run build && firebase deploy --only hosting

# MiseBox (https://misebox-78f9c.web.app)
cd projects/misebox/misebox-app
pnpm run build && firebase deploy --only hosting
```

### Deployment Troubleshooting

#### **🔧 Core Module Issues**

```bash
# TypeError: Cannot read properties of undefined
cd packages/fireux-core
pnpm run build  # Check for TypeScript errors

# Fix: Ensure proper default export in module.ts
export default defineNuxtModule({ ... })
```

#### **🔧 Jobs Module Issues**

```bash
# Module resolution failures
ls packages/fireux-jobs/dist/runtime/composables/

# If empty, manually create:
mkdir -p packages/fireux-jobs/dist/runtime/composables

# index.mjs:
export { getJobRoutes } from '../../../src/runtime/composables/index.ts'

# index.d.ts:
export { getJobRoutes } from '../../../src/runtime/composables/index'
```

#### **🔧 Build Failures**

```bash
# Clear everything
rm -rf node_modules .nuxt .output
pnpm install

# Rebuild packages first
cd packages/fireux-core && pnpm run build
cd ../fireux-jobs && pnpm run build

# Then rebuild app
cd ../../projects/[app]/[app]-app
pnpm run build
```

### Live Deployment Status

| App      | Status  | URL                   | Last Deploy |
| -------- | ------- | --------------------- | ----------- |
| FireUX   | ✅ Live | fireux-2005.web.app   | ✅          |
| CleanBox | ✅ Live | cleanbox.web.app      | ✅          |
| MiseBox  | ✅ Live | misebox-78f9c.web.app | ✅          |

## Quick Start
