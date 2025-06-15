# 📦 FireUX Packages

_Shared modules and libraries that power the FireUX ecosystem_

## 🏗️ Package Architecture

### `fireux-core/` - The Heart of the Ecosystem

Complete Nuxt 3 module providing everything needed for service business platforms:

**Pages** (25+ shared routes):

- Authentication flow (`/auth/*`)
- User dashboard (`/dashboard/*`)
- Admin panel (`/admin/*`)
- Blog system (`/blog/*`)
- Product system (`/products/*`)
- Design system showcase (`/design-system/*`)

**Components** (200+ auto-imported):

- `Fire*` prefixed components for consistency
- Atoms → Molecules → Organisms → Templates structure
- Firebase-connected forms and data displays
- Responsive, accessible UI components

**Composables** (Auto-imported utilities):

- `useFirebaseAuth()` - Authentication management
- `useFirestore()` - Database operations
- `useStripe()` - Payment processing
- `useAppConfig()` - Application configuration

**Assets & Styling**:

- TailwindCSS + Nuxt UI design system
- SCSS variables and mixins
- Responsive breakpoints and utilities
- Theme customization system

## 🚀 Development Workflow

### Adding New Shared Functionality

```bash
# 1. Develop in core module
cd packages/fireux-core

# 2. Add new component
touch src/runtime/components/organisms/NewFeature.vue
# Auto-imported as <FireNewFeature> in all apps

# 3. Add new page
touch src/runtime/pages/new-feature.vue
# Register in src/pages-config.ts

# 4. Add new composable
touch src/runtime/composables/useNewFeature.ts
# Auto-imported in all apps

# 5. Test registration
node test-reg.js

# 6. Test in playground
cd ../../playground
pnpm dev:playground
```

### Module Configuration

**`src/module.ts`** - Main module definition:

```typescript
export default defineNuxtModule({
  meta: { name: 'fireux-core' },
  setup(options, nuxt) {
    // Auto-import components, composables, pages
    // Configure assets, layouts, plugins
  },
})
```

**`src/pages-config.ts`** - Page registration:

```typescript
export const modulePages = [
  { name: 'dashboard', path: '/dashboard', file: 'dashboard.vue' },
  // ... all shared pages
]
```

**Auto-import Configs**:

- `components-config.ts` - Component auto-imports with `Fire*` prefix
- `composables-config.ts` - Utility function auto-imports

## 🔧 Best Practices

### Component Development

- **Prefix all components** with `Fire*` for namespacing
- **Use TypeScript** for all component props and emits
- **Follow atomic design** principles (Atoms → Molecules → Organisms)
- **Test in playground** before using in production apps

### Composable Development

- **Return reactive refs** for state management
- **Handle loading states** for async operations
- **Provide TypeScript types** for all return values
- **Use Firebase composables** for consistent data handling

### Page Development

- **Register in pages-config.ts** for automatic inclusion
- **Use shared layouts** (`CoreDefault`, `CoreDashboard`)
- **Follow consistent routing** patterns
- **Include proper meta tags** and SEO

## 🧪 Testing Strategy

### Development Testing

```bash
# Test component registration
node test-reg.js

# Test in isolated environment
cd ../../playground
pnpm dev:playground

# Verify in production apps
pnpm dev:fireux
pnpm dev:cleanbox
pnpm dev:misebox
```

### Module Validation

- All components auto-import correctly with `Fire*` prefix
- All composables work across different apps
- All pages register and route properly
- Assets serve correctly from module

## 📦 Package Dependencies

### Core Dependencies

- **Nuxt 3** - Framework and module system
- **Vue 3** - Component framework
- **TypeScript** - Type safety
- **@nuxt/ui** - Base component library
- **TailwindCSS** - Utility-first styling

### Firebase Integration

- **Firebase SDK** - Authentication and database
- **@vuefire/nuxt** - Vue Firebase bindings
- Auto-configured across all consuming apps

### Development Dependencies

- **ESLint & Prettier** - Code quality
- **@nuxt/devtools** - Development experience
- Shared across workspace from root `package.json`

## 🔄 Version Management

```bash
# Update core module version
cd packages/fireux-core
npm version patch|minor|major

# Rebuild module for distribution
pnpm build

# Apps automatically use latest local version
# No need to update package.json in apps
```

## 📚 Documentation

### Three-Document System

- **[README.md](README.md)** - Technical implementation and development guide
- **[copilot.md](copilot.md)** - AI assistant workflows and quick reference
- **[BUSINESS.md](BUSINESS.md)** - Business value and revenue impact

### Related Documentation

- **[Core Module API](fireux-core/README.md)** - Detailed technical reference
- **[Core Module Development](fireux-core/copilot.md)** - Internal development guide
- **[Core Module Business Value](fireux-core/BUSINESS.md)** - Revenue and cost analysis
- **[Root Ecosystem Guide](../README.md)** - Monorepo overview
- **[Projects Development](../projects/README.md)** - App development guide
