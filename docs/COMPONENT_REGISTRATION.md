# Global Component Registration Guide

## Profile Components Auto-Import Map

All profile components are automatically registered and available globally across all FireUX apps.

### **MiseBox Domain (Chef/Supplier)**

#### Chef Profile Components:
```vue
<!-- Available as: -->
<MiseChefPill :chef="chefData" />
<MiseChefCell :chef="chefData" />
<MiseChefProfile :chef="chefData" />

<!-- Management Components: -->
<MiseChefCTA :chef="chefData" />
<MiseChefEdit :chef="chefData" />
<MiseChefProfile :chef="chefData" />
```

#### Supplier Profile Components:
```vue
<!-- Available as: -->
<MiseSupplierPill :supplier="supplierData" />
<MiseSupplierCell :supplier="supplierData" />
<MiseSupplierProfile :supplier="supplierData" />

<!-- Management Components: -->
<MiseSupplierCTA :supplier="supplierData" />
<MiseSupplierEdit :supplier="supplierData" />
<MiseSupplierProfile :supplier="supplierData" />
```

### **Jobs Domain (Professional/Employer)**

#### Professional Profile Components:
```vue
<!-- Available as: -->
<JobProfessionalPill :professional="professionalData" />
<JobProfessionalCell :professional="professionalData" />
<JobProfessionalProfile :professional="professionalData" />

<!-- Management Components: -->
<JobProfessionalCTA :professional="professionalData" />
<JobProfessionalEdit :professional="professionalData" />
<JobProfessionalProfile :professional="professionalData" />
```

#### Employer Profile Components:
```vue
<!-- Available as: -->
<JobEmployerPill :employer="employerData" />
<JobEmployerCell :employer="employerData" />
<JobEmployerProfile :employer="employerData" />

<!-- Management Components: -->
<JobEmployerCTA :employer="employerData" />
<JobEmployerEdit :employer="employerData" />
<JobEmployerProfile :employer="employerData" />
```

## Component Matrix Summary

| Domain | Entity | Pill | Cell | Profile |
|--------|--------|------|------|---------|
| **MiseBox** | Chef | `<MiseChefPill>` | `<MiseChefCell>` | `<MiseChefProfile>` |
| **MiseBox** | Supplier | `<MiseSupplierPill>` | `<MiseSupplierCell>` | `<MiseSupplierProfile>` |
| **Jobs** | Professional | `<JobProfessionalPill>` | `<JobProfessionalCell>` | `<JobProfessionalProfile>` |
| **Jobs** | Employer | `<JobEmployerPill>` | `<JobEmployerCell>` | `<JobEmployerProfile>` |

## Usage in Apps

### In MiseBox App:
```vue
<template>
  <!-- Chef components available -->
  <MiseChefPill :chef="chef" />
  <MiseSupplierCell :supplier="supplier" />
  
  <!-- Jobs components NOT available (different domain) -->
  <!-- <JobProfessionalPill> ❌ Not imported -->
</template>
```

### In FireUX Job App:
```vue
<template>
  <!-- Jobs components available -->
  <JobProfessionalPill :professional="professional" />
  <JobEmployerCell :employer="employer" />
  
  <!-- MiseBox components NOT available (different domain) -->
  <!-- <MiseChefPill> ❌ Not imported -->
</template>
```

### In Combined App (using both modules):
```vue
<template>
  <!-- All components available -->
  <MiseChefPill :chef="chef" />
  <JobProfessionalCell :professional="professional" />
  <MiseSupplierProfile :supplier="supplier" />
  <JobEmployerProfile :employer="employer" />
</template>
```

## Consistent Progressive Enhancement

All components follow the same enhancement pattern:

- **Pill**: Minimal (name + 1 thing)
- **Cell**: Enhanced (name + subtitle + bio + tags)  
- **Profile**: Rich (above + section + stats)

No matter which domain, the user experience is identical!
