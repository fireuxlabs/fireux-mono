# Misebox Application Documentation

## Overview

Misebox is a culinary marketplace application that connects Chefs and Suppliers in a comprehensive platform. The application features a modern, config-driven architecture for profile management and scalable component systems.

## Current Architecture Status (July 2025)

### ✅ Completed Components

#### 1. Navigation System

- **Location**: `/app/layouts/default.vue`
- **Features**:
  - Added Chefs route (`/chefs`) with chef-hat icon
  - Added Suppliers route (`/suppliers`) with truck icon
  - Integrated with existing job routes and system routes
  - Mobile-responsive navigation

#### 2. Unified Profile Card System

- **Location**: `/packages/fireux-core/src/runtime/components/organisms/profiles/Card.vue`
- **Features**:
  - Config-driven architecture supports multiple profile types
  - Dynamic field rendering with customizable layouts
  - Responsive design with image, content, and action sections
  - Extensible for future profile types

#### 3. Profile Configurations

- **Chef Config**: `/packages/fireux-core/src/runtime/components/organisms/profiles/configs/chef.config.ts`
  - Displays: name, cuisine, experience, location, skills, bio
  - Actions: View Profile, Message, Book Consultation
  - 94 lines of comprehensive configuration

- **Supplier Config**: `/packages/fireux-core/src/runtime/components/organisms/profiles/configs/supplier.config.ts`
  - Displays: company, specialties, certifications, location, description
  - Actions: View Profile, Request Quote, Contact
  - 105 lines of comprehensive configuration

#### 4. Profile Type System

- **Location**: `/packages/fireux-core/src/runtime/types/profile-config.ts`
- **Features**: TypeScript interfaces for profile configurations
- **Types**: ProfileConfig, ProfileField, ProfileAction, FieldType enums

#### 5. Legacy Components (Ready for Refactoring)

- **BaseProfileList**: `/app/components/BaseProfileList.vue` - Generic list container
- **ChefCard**: `/app/components/ChefCard.vue` - Legacy chef-specific card
- **SupplierCard**: `/app/components/SupplierCard.vue` - Legacy supplier-specific card

#### 6. Page Structure

- **Chefs Page**: `/app/pages/chefs/index.vue` - Placeholder ready for integration
- **Suppliers Page**: `/app/pages/suppliers/index.vue` - Placeholder ready for integration

### 🔄 Recent Maintenance & Cleanup

#### Restored Files (Post-Refactor Recovery)

- `/packages/fireux-core/src/runtime/firebase.client.ts` - Firebase client configuration
- `/packages/fireux-core/src/runtime/composables/firestore/objects/Product/useCreateProductState.ts`
- `/packages/fireux-core/src/runtime/composables/firestore/objects/Product/Prices/useCreatePricesState.ts`
- `/packages/fireux-core/src/runtime/composables/firestore/objects/Blog/useBlogPostUtils.ts`
- `/packages/fireux-core/src/runtime/composables/firestore/objects/Blog/useBlogPosts.ts` (imports fixed)
- `/packages/fireux-core/src/runtime/composables/firestore/objects/Blog/useCreateBlogPostState.ts`
- `/packages/fireux-core/src/runtime/composables/firestore/objects/Product/useProductUtils.ts`

#### Codebase Health

- ✅ No empty files or directories
- ✅ No unnecessary index.ts barrel exports
- ✅ All config files have appropriate content
- ✅ Clean monorepo structure maintained

### 🎯 Next Development Phase: Profile System Integration

#### Priority Tasks

1. **Replace Legacy Components**
   - Integrate unified Card.vue into `/chefs` and `/suppliers` pages
   - Replace ChefCard.vue and SupplierCard.vue with config-driven Card.vue
   - Update BaseProfileList.vue to work with new Card system

2. **Data Integration**
   - Connect profile configs to actual Firestore data
   - Implement filtering and sorting for profile listings
   - Add search functionality for profiles

3. **Component Naming & Structure**
   - Consider renaming components for clarity (as per user feedback)
   - Consolidate component architecture for maintainability

#### Technical Approach

- **Config-Driven**: All profile types use same Card.vue with different configs
- **Scalable**: Easy to add new profile types (Restaurants, Food Trucks, etc.)
- **Maintainable**: Single source of truth for profile display logic
- **Reusable**: Core components can be used across other fireux applications

### 🏗️ Architecture Patterns

#### Configuration System

```typescript
// Example usage pattern
const chefConfig = useProfileConfig('chef')
// Returns comprehensive display and interaction configuration
```

#### Component Integration

```vue
<!-- Future page implementation -->
<template>
  <BaseProfileList>
    <Card
      v-for="profile in profiles"
      :key="profile.id"
      :profile="profile"
      :config="profileConfig"
    />
  </BaseProfileList>
</template>
```

### 📁 File Structure

```
projects/misebox/misebox-app/
├── app/
│   ├── layouts/default.vue (✅ Navigation configured)
│   ├── pages/
│   │   ├── chefs/index.vue (🔄 Ready for integration)
│   │   └── suppliers/index.vue (🔄 Ready for integration)
│   └── components/
│       ├── BaseProfileList.vue (🔄 Legacy, needs integration)
│       ├── ChefCard.vue (🔄 Legacy, to be replaced)
│       └── SupplierCard.vue (🔄 Legacy, to be replaced)
└── packages/fireux-core/
    └── src/runtime/
        ├── components/organisms/profiles/
        │   ├── Card.vue (✅ Unified component)
        │   └── configs/
        │       ├── chef.config.ts (✅ Complete)
        │       └── supplier.config.ts (✅ Complete)
        └── types/profile-config.ts (✅ Type definitions)
```

### 🚀 Development Status

- **Phase 1**: ✅ COMPLETE - Unified architecture and foundation
  - Unified Card component built and configured
  - Chef and Supplier configs complete (94 & 105 lines respectively)
  - TypeScript interfaces and type safety implemented
  - Navigation routes added to default layout
  - All missing files restored from recent refactor

- **Phase 2**: 🔄 READY TO START - Profile Page Integration
  - Integrate unified Card component into `/chefs` and `/suppliers` pages
  - Replace legacy ChefCard and SupplierCard components
  - Implement BaseProfileList with config-driven architecture
  - Add filtering, sorting, and search functionality

- **Phase 3**: 📋 PLANNED - Enhancement and Expansion
  - Add new profile types (Restaurants, Food Trucks, etc.)
  - Implement advanced filtering and search
  - Add profile creation and editing flows
  - Performance optimization and testing

### 📋 Next Steps (Phase 2)

1. **Update Chef Page** (`/app/pages/chefs/index.vue`)
   - Import unified Card component from fireux-core
   - Use chef.config.ts for card configuration
   - Replace legacy ChefCard usage

2. **Update Supplier Page** (`/app/pages/suppliers/index.vue`)
   - Import unified Card component from fireux-core
   - Use supplier.config.ts for card configuration
   - Replace legacy SupplierCard usage

3. **Refactor BaseProfileList** (`/app/components/BaseProfileList.vue`)
   - Make it truly generic and config-aware
   - Add filtering, sorting, and search capabilities
   - Ensure responsive design

4. **Legacy Cleanup**
   - Remove or refactor ChefCard.vue and SupplierCard.vue
   - Clean up any remaining duplicate code
   - Update imports throughout the codebase

### 📋 Development Guidelines

1. **Config-First**: Always create/update configs before implementing UI
2. **Type Safety**: Use TypeScript interfaces for all profile structures
3. **Reusability**: Build components that work across profile types
4. **Scalability**: Design for future profile types and features
5. **Maintainability**: Keep single source of truth for profile logic

### 🏗️ File Structure Status

**✅ Completed & Ready**

```
fireux-core/src/runtime/
├── components/organisms/profiles/
│   ├── Card.vue (Unified, config-driven)
│   └── configs/
│       ├── chef.config.ts (94 lines, complete)
│       └── supplier.config.ts (105 lines, complete)
├── types/profile-config.ts (Type definitions)
└── [all restored files from refactor]

misebox-app/app/
├── layouts/default.vue (Navigation updated)
├── pages/
│   ├── chefs/index.vue (Ready for integration)
│   └── suppliers/index.vue (Ready for integration)
└── components/
    ├── BaseProfileList.vue (Ready for refactor)
    ├── ChefCard.vue (Legacy, to be replaced)
    └── SupplierCard.vue (Legacy, to be replaced)
```

---

_Last Updated: July 13, 2025_
_Status: Phase 1 Complete - Ready for Profile Integration_
_Next: Integrate unified Card system into Chef/Supplier pages_
