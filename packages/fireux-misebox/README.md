# 🍽️ FireUX Misebox

Chef and Supplier marketplace module for the FireUX ecosystem.

## 📋 Overview

FireUX Misebox provides comprehensive functionality for Chef and Supplier marketplace applications, including profile management, kitchen operations, and supply chain features.

## 🏗️ Features

### Chef Profiles

- Chef profile creation and management
- Kitchen specialties and certifications
- Portfolio and experience tracking
- Availability and scheduling

### Supplier Profiles

- Supplier profile creation and management
- Product catalog management
- Inventory and pricing
- Order fulfillment capabilities

### Marketplace Features

- Chef-Supplier connections
- Order management system
- Rating and review system
- Communication tools

## 🎨 Components

All components are auto-imported with the `Mise` prefix:

- `<MiseChefCard>` - Chef profile display card
- `<MiseSupplierCard>` - Supplier profile display card
- `<MiseChefForm>` - Chef profile creation/editing form
- `<MiseSupplierForm>` - Supplier profile creation/editing form
- `<MiseKitchenProfile>` - Kitchen information component
- `<MiseProductCatalog>` - Supplier product catalog

## Usage

Add to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    'fireux-core', // Required dependency
    'fireux-misebox',
  ],
})
```

## Components

All components are auto-imported with the `Mise` prefix:

```vue
<template>
  <!-- Chef Components -->
  <MiseChefEdit :chef="chef" @save="onSave" />
  <MiseChefList :chefs="chefs" :loading="loading" />
  <MiseChefProfile :chef="chef" />
  <MiseChefCardsCell :chef="chef" />
  <MiseChefCardsProfile :chef="chef" />
  <MiseChefCreateSystem @create="onCreate" />

  <!-- Supplier Components -->
  <MiseSupplierEdit :supplier="supplier" @save="onSave" />
  <MiseSupplierList :suppliers="suppliers" :loading="loading" />
  <MiseSupplierProfile :supplier="supplier" />
  <MiseSupplierCardsCell :supplier="supplier" />
  <MiseSupplierCardsProfile :supplier="supplier" />
  <MiseSupplierCreateSystem @create="onCreate" />
</template>
```

## Composables

All composables are auto-imported:

```typescript
// Chef Operations
const { createChef } = useChefCreate()
const { updateChef } = useChefUpdate()
const { validateChefData } = useChefValidation()
const { formatChefName } = useChefFormatting()

// Supplier Operations
const { createSupplier } = useSupplierCreate()
const { updateSupplier } = useSupplierUpdate()
const { validateSupplierData } = useSupplierValidation()
const { formatSupplierName } = useSupplierFormatting()
```

## Models

TypeScript interfaces are available:

```typescript
import type { Chef, Supplier } from 'fireux-misebox'
```

## License

MIT
