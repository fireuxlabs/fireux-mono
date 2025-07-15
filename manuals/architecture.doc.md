# FireUX Monorepo Architecture

This document provides a high-level overview of the FireUX monorepo structure and domain-driven architecture.

## 🏗️ Repository Structure

```
fireux/
├── packages/                 # Domain-specific Nuxt modules
│   ├── fireux-core/         # Core framework (Firebase, auth, base components)
│   ├── fireux-jobs/         # Job marketplace functionality
│   ├── fireux-misebox/      # Chef/Supplier marketplace functionality
│   └── fireux-places/       # Location and places management
├── projects/                # Production applications
│   ├── fireux/              # Main platform (core only)
│   ├── cleanbox/            # Cleaning services (core + jobs)
│   └── misebox/             # Culinary services (core + jobs + misebox)
├── manuals/                 # User documentation
└── docs/                    # Developer documentation
```

## 🎯 Domain-Driven Architecture

### **Package Separation by Domain**

Each package contains domain-specific functionality:

- **fireux-core**: Framework fundamentals (NO DOMAIN CODE)
  - Authentication & Firebase integration
  - Base UI components (buttons, forms, cards)
  - Core composables and utilities
  - Admin tools and server APIs

- **fireux-jobs**: Job marketplace domain
  - Employer/Professional profiles
  - Job posting and application logic
  - Job-specific routing and components

- **fireux-misebox**: Chef/Supplier marketplace domain
  - Chef/Supplier profiles and management
  - Kitchen operations and supply chain
  - Marketplace-specific components and logic

- **fireux-places**: Location services domain
  - Google Places API integration
  - Geolocation and mapping utilities
  - Address validation and management

### **Auto-Import Conventions**

Each package uses a unique prefix for auto-imported components:

- `<Fire...>` - Core framework components
- `<Job...>` - Job marketplace components
- `<Mise...>` - Chef/Supplier marketplace components
- `<Place...>` - Location and mapping components

## 📚 Documentation Hierarchy

### **Level 1: Monorepo (Root)**

- `README.md` - Repository overview
- `BUSINESS.md` - Business logic documentation
- `architecture.doc.md` - This file (excluded from builds)

### **Level 2: Packages**

- `packages/README.md` - Package overview
- `packages/*/package.doc.md` - Individual package documentation

### **Level 3: Applications**

- `projects/README.md` - Application overview
- `projects/*/app.doc.md` - Individual app documentation

### **Level 4: Features/Modules**

- `src/*/feature.doc.md` - Feature-specific documentation
- `api/*/endpoint.doc.md` - API endpoint documentation

## 🎯 Documentation Standards

1. **`.doc.md` files** - Excluded from builds, visible in Git
2. **Scoped naming** - `{scope}.doc.md` (e.g., `stripe.doc.md`, `auth.doc.md`)
3. **Hierarchical flow** - General → Specific
4. **Cross-references** - Link between related documentation

## 🔧 Build Configuration

All `*.doc.*` files are automatically excluded from production builds via:

```typescript
// packages/fireux-core/src/module.ts
nuxt.options.nitro.ignore.push('**/*.doc.*')
```

## 📖 Quick Navigation

- [Core Package Documentation](./packages/fireux-core/core.doc.md)
- [API Documentation](./packages/fireux-core/src/runtime/server/api/api.doc.md)
- [Stripe Integration](./packages/fireux-core/src/runtime/server/api/stripe/stripe.doc.md)
- [Firestore Integration](./packages/fireux-core/src/runtime/server/api/firestore/firestore.doc.md)
