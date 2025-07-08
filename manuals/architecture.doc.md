# FireUX Monorepo Architecture

This document provides a high-level overview of the FireUX monorepo structure and documentation organization.

## 🏗️ Repository Structure

```
fireux/
├── packages/                 # Shared packages/libraries
│   ├── fireux-core/         # Core FireUX framework
│   └── fireux-jobs/         # Background job system
├── projects/                # Individual applications
│   ├── fireux/              # Main FireUX app
│   ├── cleanbox/            # CleanBox app
│   └── misebox/             # MiseBox app
├── manuals/                 # User documentation
└── docs/                    # Developer documentation
```

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
