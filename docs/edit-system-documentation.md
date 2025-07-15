# Edit System Documentation

This document outlines the complete edit system created for all profile types in the FireUX ecosystem.

## Overview

I've created comprehensive edit components for four different profile models:

1. **Employer** (Jobs package) - Companies posting jobs
2. **Professional** (Jobs package) - People applying for jobs (chefs, line cooks, pastry chefs, etc.)
3. **Chef** (Misebox package) - Chefs who interact with kitchens and recipes
4. **Supplier** (Misebox package) - Businesses supplying products to the food industry

## Key Distinction: Professional vs Chef

- **Professional**: A person who can apply for jobs in the system (chef, line cook, pastry chef, etc.)
- **Chef**: A chef who interacts with kitchens, recipes, and has a culinary portfolio (different from Professional)

## File Structure

```
packages/fireux-jobs/src/runtime/
├── composables/firestore/
│   ├── Employer/useEmployerUpdate.ts
│   └── Professional/useProfessionalUpdate.ts
└── components/organisms/
    ├── profiles/
    │   ├── Employer/Edit.vue
    │   └── Professional/Edit.vue
    └── objects/
        └── Job/ (existing job components)

projects/misebox/misebox-app/app/
├── composables/firestore/
│   ├── Chef/useChefUpdate.ts
│   └── Supplier/useSupplierUpdate.ts
└── components/organisms/
    ├── Chef/Edit.vue
    └── Supplier/Edit.vue
```

## Usage Examples

### Employer Edit System

```vue
<!-- In a Jobs project -->
<template>
  <FireOrganismsProfilesEmployerEdit :employer="employerData" />
</template>

<script setup>
const employerData = ref({
  company_name: 'Misebox Kitchen',
  email: 'hello@misebox.com',
  business_type: 'restaurant',
  // ... other employer fields
})
</script>
```

### Professional Edit System

```vue
<!-- In a Jobs project -->
<template>
  <FireOrganismsProfilesProfessionalEdit :professional="professionalData" />
</template>

<script setup>
const professionalData = ref({
  professional_name: 'Daniel Watson',
  email: 'daniel@example.com',
  title: 'Sous Chef',
  // ... other professional fields
})
</script>
```

### Chef Edit System

```vue
<!-- In Misebox project -->
<template>
  <ChefEdit :chef="chefData" />
</template>

<script setup>
const chefData = ref({
  chef_name: 'Chef Marco',
  title: 'Executive Chef',
  specialties: ['Italian', 'Modern European'],
  // ... other chef fields
})
</script>
```

### Supplier Edit System

```vue
<!-- In Misebox project -->
<template>
  <SupplierEdit :supplier="supplierData" />
</template>

<script setup>
const supplierData = ref({
  business_name: 'Alpine Fresh Produce',
  business_type: 'farm',
  specialties: ['Organic Vegetables', 'Seasonal Produce'],
  // ... other supplier fields
})
</script>
```

## Component Features

### Standard Form Components Used

- **FireMoleculesFormsFirestoreField** - Single text/number/textarea inputs
- **FireMoleculesFormsFirestoreSelect** - Dropdown selections
- **FireMoleculesFormsFirestoreCheckbox** - Boolean values
- **FireMoleculesFormsFirestoreArrayOfStrings** - String array management

### Styling

All components use the `.edit-component` and `.form-field` classes which have SCSS styling in:

```
packages/fireux-core/src/runtime/assets/styles/scss/components/form.scss
```

The styling provides:

- Alternating background colors for form fields
- Consistent spacing and border radius
- Responsive design
- CSS custom properties for theming

### Update Functions

Each model has a corresponding update composable that provides:

- **Single field updates** - Direct field updates with validation
- **Array field updates** - Array management with proper Firestore updates
- **Complex object updates** - For nested objects requiring custom components

### Data Flow

1. **User edits field** → Component emits change
2. **Update function called** → Validates and formats data
3. **Firestore updated** → Document updated with new value + timestamp
4. **UI reflects change** → Reactive updates show new value

## Advanced Features Needed

Several fields require custom components for complex editing:

### Employer

- **Locations** - Company locations with map integration
- **Operating Hours** - Weekly schedule editor
- **Active Jobs** - Job posting management
- **Contacts** - Multiple contact management
- **Social Media** - Social links editor

### Professional

- **Kitchen Experience** - Employment history with dates
- **Education** - Educational background with institutions
- **Certifications** - Professional certifications with documents
- **Languages** - Language skills with proficiency levels
- **Projects & Volunteering** - Experience entries

### Chef

- **Chef Experience** - Professional kitchen history
- **Culinary Education** - Specialized culinary training
- **Recipe Portfolio** - Recipe management system
- **Gallery Management** - Image portfolio editor
- **Kitchen Connections** - Kitchen relationship management

### Supplier

- **Product Catalog** - Product management with pricing
- **Business Certifications** - Certification document management
- **Client Management** - Active client relationship tracking
- **Testimonials** - Client testimonial system

## Page Implementation

To use these edit components in pages, you would typically create pages like:

```
/employer/[id]/edit - uses FireOrganismsProfilesEmployerEdit
/professional/[id]/edit - uses FireOrganismsProfilesProfessionalEdit
/chef/[id]/edit - uses ChefEdit (in Misebox app)
/supplier/[id]/edit - uses SupplierEdit (in Misebox app)
```

Each page would:

1. Fetch the profile data by ID
2. Pass the data to the edit component
3. Handle any navigation or success/error states

## Security & Validation

- All updates require user authentication
- Users can only edit their own profiles
- Each update includes a timestamp
- Validation and formatting can be added via function props
- Firestore security rules should restrict access appropriately

This system provides a complete, scalable foundation for profile editing across the entire FireUX ecosystem.
