# Profile System Boilerplate Strategy

## Overview
This strategy enables rapid creation of profile systems (Chef, Supplier, Professional, Employer) using consistent patterns while allowing domain-specific nuances.

## Boilerplate Components

### 1. Model Configuration Template
```typescript
// Domain.model.ts
export const domainConfig: ProfileConfig = {
  collectionName: 'domains',
  profileType: 'Domain',
  validationFn: validateDomainProfile,
  requiredFields: ['domain_name', 'specialties'],
  searchableFields: ['domain_name', 'specialties', 'location'],
  defaultValues: { /* domain defaults */ }
}

export const domainCtaConfig = {
  title: '🎯 [Domain Action Title]',
  description: '[Domain value proposition]',
  benefits: ['✨ Benefit 1', '🏠 Benefit 2', '📝 Benefit 3'],
  createPath: '/domains/create',
  createButtonText: 'Create Domain Profile',
  welcomeBackText: '🎯 Welcome back!',
  quickActions: [
    { text: 'Action 1', path: '/domains/action1' },
    { text: 'Action 2', path: '/domains/action2' }
  ]
}
```

### 2. Index Page Template
```vue
<template>
  <FireOrganismsProfilePage
    :profile-config="domainConfig"
    :cta-config="domainCtaConfig"
    :current-profile="currentDomain"
    :profiles="domains"
    :loading="loading"
    :page-config="pageConfig"
    :status-config="statusConfig"
    :show-debug="true"
  >
    <template #profile-card="{ profile }">
      <DomainCardsProfile :domain="profile" />
    </template>
    <template #profile-list="{ profiles, loading }">
      <DomainList :domains="profiles" :loading="loading" />
    </template>
  </FireOrganismsProfilePage>
</template>

<script setup>
import { domainConfig, domainCtaConfig } from '../../models/profiles/Domain.model'

definePageMeta({
  title: 'Browse Domains',
  description: 'Find domains for your needs',
})

const { all: domains, loading, current: currentDomain } = await useProfile(domainConfig)
const { appUsers: appusers } = await useAppUser()
const { appUser } = await useAppUser()

const hasDomainProfile = computed(() => {
  if (!appUser.value) return false
  return !!currentDomain.value
})

const pageConfig = {
  title: 'Browse Domains',
  description: 'Discover domains for your needs.',
}

const statusConfig = {
  activeIcon: '✅',
  createIcon: '🎯',
  activeDescription: 'Your domain profile is active.',
  createDescription: 'Join our community of domains.',
  viewProfileLink: '/dashboard/profile',
  editProfileLink: '/dashboard/profile',
}
</script>
```

### 3. Reusable Patterns
- **Generic Components**: `FireOrganismsProfilePage`, `FireOrganismsProfileCTA`
- **Domain Components**: `DomainCardsProfile`, `DomainList` (follow naming convention)
- **Configuration-Driven**: All behavior controlled by domain configs
- **Slot-Based**: Domain-specific rendering through template slots

## Current Implementation Status

### ✅ Completed Systems
1. **Chef System** (Misebox) - Fully implemented with generic components
2. **Supplier System** (Misebox) - Model config done, index page ready

### 🔄 Pending Systems  
3. **Professional System** (Jobs) - Needs CTA config + index conversion
4. **Employer System** (Jobs) - Needs CTA config + index conversion

## Consolidation Goals

### Code Reduction Achieved
- **Before**: ~250 lines per index page
- **After**: ~60 lines per index page  
- **Reduction**: ~75% code elimination per profile type

### Monorepo Philosophy Demonstrated
- **Generic Core**: Reusable components in `fireux-core`
- **Domain Packages**: Specialized logic in tenant packages
- **Configuration-Driven**: Behavior controlled by domain configs
- **Consistent Patterns**: Same architecture across all profile types

## Next Steps: Consolidation Focus
1. Review and validate existing implementations
2. Ensure component naming consistency
3. Test cross-domain compatibility
4. Document reusable patterns
5. Create tutorial-ready examples

## Tutorial Value
This pattern demonstrates:
- **Monorepo package organization**
- **Generic vs domain-specific separation**
- **Configuration-driven architecture**
- **Slot-based component composition**
- **TypeScript configuration patterns**
