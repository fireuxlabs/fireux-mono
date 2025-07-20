# FireUX Core Package

The core framework package providing authentication, database integration, UI components, and server functionality for FireUX applications.

## 🎯 Purpose

FireUX Core is the foundational package that provides:

- Authentication system (Firebase Auth)
- Database integration (Firestore)
- Payment processing (Stripe)
- UI components and layouts
- Server-side API endpoints
- Composables and utilities

## 📦 Package Structure

```
fireux-core/
├── src/
│   ├── config/              # Configuration files
│   ├── runtime/             # Runtime components
│   │   ├── components/      # Vue components
│   │   ├── composables/     # Vue composables
│   │   ├── layouts/         # Nuxt layouts
│   │   ├── pages/           # Nuxt pages
│   │   ├── models/          # TypeScript interfaces
│   │   ├── plugins/         # Nuxt plugins
│   │   └── server/          # Server-side code
│   │       └── api/         # API endpoints
│   └── module.ts            # Nuxt module definition
└── core.doc.md             # This documentation
```

## 🔌 Installation & Usage

```bash
# Install in a Nuxt project
pnpm add @fireux/core

# Add to nuxt.config.ts
modules: ['@fireux/core']
```

## 🏗️ Key Features

### **Authentication**

- Firebase Auth integration
- User management composables
- Protected route middleware

### **Database**

- Firestore integration
- CRUD operations
- Real-time subscriptions

### **Payments**

- Stripe integration
- Subscription management
- Product catalog

### **UI Components**

- Pre-built Vue components
- Consistent design system
- Responsive layouts

## � Recent Features

### Unified Profile System (July 2025)

**Config-Driven Profile Architecture**

- **Location**: `src/runtime/components/organisms/profiles/`
- **Components**:
  - `Card.vue` - Universal profile card component
  - `configs/chef.config.ts` - Chef profile configuration
  - `configs/supplier.config.ts` - Supplier profile configuration
- **Types**: `src/runtime/types/profile-config.ts` - TypeScript interfaces
- **Benefits**: Scalable, maintainable, reusable across all profile types

**Implementation Status**:

- ✅ Unified Card component with dynamic field rendering
- ✅ Configuration files for Chef and Supplier profiles
- ✅ TypeScript interfaces and type safety
- 🔄 Integration into MiseBox Chef/Supplier pages (next phase)

## �📚 Detailed Documentation

- [API Endpoints](./src/runtime/server/api/api.doc.md)
- [Authentication](./src/runtime/auth.doc.md)
- [Database](./src/runtime/database.doc.md)
- [Components](./src/runtime/components/components.doc.md)
- [Composables](./src/runtime/composables/composables.doc.md)

## 🔧 Development

```bash
# Development mode
pnpm dev

# Build package
pnpm build

# Run tests
pnpm test
```

## 📋 Dependencies

- **Nuxt 3** - Full-stack framework
- **Vue 3** - UI framework
- **Firebase** - Authentication & database
- **Stripe** - Payment processing
- **TypeScript** - Type safety
