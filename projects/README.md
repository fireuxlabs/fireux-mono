# 🎨 FireUX Projects

_Production applications built on the FireUX Core ecosystem_

## 🏗️ Project Architecture

Three production applications sharing 99% of functionality via `fireux-core`:

### 🟡 FireUX (`fireux/fireux-app`) - Port 3005

**Main company platform** showcasing the FireUX ecosystem:

- **Purpose**: Marketing site + customer portal for FireUX products
- **Theme**: Yellow primary (`amber`), zinc neutral
- **Content**: Platform demos, template sales, documentation
- **Unique Features**: Pricing pages, template showcase, contact forms

### 🧼 CleanBox (`cleanbox/cleanbox-app`) - Port 3007

**Cleaning industry marketplace platform**:

- **Purpose**: Service marketplace for cleaning professionals/businesses
- **Theme**: Green primary (`emerald`), stone neutral
- **Content**: Cleaning job board, professional profiles, business management
- **Industry Focus**: Residential cleaning, commercial maintenance, specialized services

### 🍳 Misebox (`misebox/misebox-app`) - Port 3009

**Culinary industry marketplace platform**:

- **Purpose**: Service marketplace for culinary professionals/businesses
- **Theme**: Blue primary (`blue`), gray neutral
- **Content**: Kitchen job board, chef profiles, event catering
- **Industry Focus**: Restaurant staffing, catering, private chef services

## 🚀 Development Workflow

### Shared vs. Unique

**99% Shared** (via `fireux-core`):

- All pages (`/auth`, `/dashboard`, `/admin`, `/blog`, `/products`)
- All components (200+ with `Fire*` prefix)
- All composables (Firebase, Stripe, app state)
- All layouts and styling system
- Complete authentication and payment systems

**1% Unique** (per app):

- Landing page (`pages/index.vue`)
- Theme colors (`app.config.ts`)
- Firebase configuration (`config/service-account.json`)
- Domain-specific content and copy

### Creating New Apps

```bash
# Copy existing app structure
cp -r fireux/fireux-app newapp/newapp-app

# Customize the unique parts:
# 1. Update app.config.ts with new theme colors
# 2. Create new landing page in pages/index.vue
# 3. Setup Firebase config in config/
# 4. Add dev script to root package.json

# Result: Full platform in <1 day
```

## 🛠️ Technical Implementation

### App Configuration

Each app customizes the shared core via configuration:

**`app.config.ts`** - Theme customization:

```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald', // App-specific brand color
      neutral: 'stone', // Supporting neutral palette
    },
  },
})
```

**`nuxt.config.ts`** - Module integration:

```typescript
export default defineNuxtConfig({
  modules: ['fireux-core'], // Inherit all functionality

  css: [
    'fireux-core/assets/css/main.css',
    'fireux-core/assets/design-system/main.scss',
  ],
})
```

### Firebase Setup

Each app maintains separate Firebase projects for data isolation:

```bash
# Each app has its own Firebase config
config/
├── service-account.json  # Admin SDK credentials
└── .env                 # Client-side config
```

### Development Commands

```bash
# Start all apps in parallel
pnpm dev              # All apps + playground

# Individual app development
pnpm dev:fireux       # localhost:3005
pnpm dev:cleanbox     # localhost:3007
pnpm dev:misebox      # localhost:3009
```

## 📊 Performance Benefits

### Development Velocity

- **New App Creation**: 1 day vs. 6 months
- **Feature Development**: Write once, deploy everywhere
- **Bug Fixes**: Single fix benefits all apps
- **Security Updates**: Ecosystem-wide protection

### Maintenance Efficiency

- **Shared Codebase**: 99% less duplication
- **Consistent UX**: Users familiar with one app understand all
- **Type Safety**: TypeScript across entire ecosystem
- **Testing**: Shared test suite covers all functionality

## 📚 Documentation Structure

### Per-App Documentation

Each app includes:

- **README.md** - Setup and deployment instructions
- **Firebase Configuration** - Database and auth setup
- **Environment Variables** - Required configuration
- **Deployment Guide** - Production deployment steps

### Shared Documentation

Common functionality documented in:

- **[Core Module](../packages/fireux-core/README.md)** - Shared features
- **[Packages Guide](../packages/README.md)** - Module development
- **[Root Documentation](../README.md)** - Ecosystem overview

## 📚 Documentation

### Three-Document System

- **[README.md](README.md)** - Technical app development and deployment guide
- **[copilot.md](copilot.md)** - AI assistant workflows for app development
- **[BUSINESS.md](BUSINESS.md)** - Three-platform business model validation

### Related Documentation

- **[Core Module](../packages/fireux-core/README.md)** - Shared functionality reference
- **[Packages Guide](../packages/README.md)** - Module development
- **[Root Overview](../README.md)** - Ecosystem architecture
- **[Business Strategy](../BUSINESS.md)** - Overall business model

## 🤝 Contributing

1. **Focus on unique value** - Only add app-specific features, everything else goes in core
2. **Test across platforms** - Changes should work in all three apps
3. **Maintain consistency** - Follow established patterns and conventions
4. **Document changes** - Update relevant documentation for modifications

---

**The FireUX projects demonstrate that complex, industry-specific platforms can be built rapidly when you have the right foundation. Each app proves the business model while showcasing the technical capabilities of the shared core module.**
