# Profiles Overview: Models and Cards

This document compiles the canonical Model configs and the UI Card components (Pill, Cell, Profile) for each profile type. Use this as a single reference while aligning and simplifying.

Note: Keep local casing camelCase (bioShort/bioLong). When writing to Firestore, mappers handle snake_case back-compat (bio_short/bio_long) where needed.

---

## Chef

- Model: `packages/tenants/fireux-misebox/src/runtime/models/profiles/Chef.model.ts`
- Cards
  - Pill: `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Cards/Pill.vue`
  - Cell: `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Cards/Cell.vue`
  - Profile: `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Cards/Profile.vue`

```ts
// Chef.model.ts (excerpt)
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/profiles/profile.model'
export interface ChefCoreProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
}
export interface ChefAppProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  specialties?: string[]
}
export const chefConfig: ProfileConfig = {
  id: 'chef',
  collectionName: 'chefs',
  profileType: 'Chef',
  requiredFields: ['name'],
  searchableFields: ['name', 'specialties'],
} as const
```

```vue
<!-- Chef Cards/Pill.vue -->
<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar
        :src="(chef as any)?.avatarUrl"
        :alt="chef?.chef_name || 'Chef'"
        size="sm"
      />
      <div class="profile-info">
        <h4 v-if="chef?.chef_name" class="profile-name">
          {{ chef.chef_name }}
        </h4>
        <p v-if="chef?.specialties?.length" class="profile-title">
          {{ chef.specialties[0] }}
        </p>
      </div>
    </div>
    <div class="chef-debug">
      <details>
        <summary>Full Chef Object (JSON)</summary>
        <pre>{{ JSON.stringify(chef, null, 2) }}</pre>
      </details>
    </div>
  </UCard>
</template>
```

```vue
<!-- Chef Cards/Cell.vue -->
<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="(chef as any)?.avatar || (chef as any)?.avatarUrl || (chef as any)?.profile_image?.url"
        :alt="chef?.name || (chef as any)?.chef_name || 'Chef'"
        size="md"
      />
      <div class="profile-info">
        <h4 v-if="chef?.name || (chef as any)?.chef_name" class="profile-name">
          {{ chef?.name || (chef as any)?.chef_name }}
        </h4>
        <p v-if="chef?.title" class="profile-subtitle">{{ chef.title }}</p>
      </div>
    </div>
    <p v-if="chef?.bioShort || (chef as any)?.bio_short" class="profile-bio">
      {{ chef?.bioShort || (chef as any)?.bio_short }}
    </p>
    <div v-if="chef?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in chef.specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
        >{{ specialty }}</span
      >
      <span v-if="chef.specialties.length > 3" class="tag-more"
        >+{{ chef.specialties.length - 3 }} more</span
      >
    </div>
  </UCard>
</template>
```

```vue
<!-- Chef Cards/Profile.vue -->
<template>
  <UCard class="profile-card" @click="handleClick" style="cursor: pointer">
    <div class="profile-header">
      <UAvatar
        :src="(chef as any)?.avatarUrl || (chef as any)?.avatar || (chef as any)?.profile_image?.url"
        :alt="chef?.chef_name || 'Chef'"
        size="lg"
      />
      <div class="profile-info">
        <h4 v-if="chef?.chef_name" class="profile-name">
          {{ chef.chef_name }}
        </h4>
        <p v-if="chef?.title" class="profile-subtitle">{{ chef.title }}</p>
        <div v-if="chef?.years_experience" class="profile-meta">
          {{ chef.years_experience }}+ years experience
        </div>
      </div>
    </div>
    <p v-if="chef?.bio_long || chef?.bio_short" class="profile-bio">
      {{ chef.bio_long || chef.bio_short }}
    </p>
    <div v-if="chef?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in chef.specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
        >{{ specialty }}</span
      >
      <span v-if="chef.specialties.length > 3" class="tag-more"
        >+{{ chef.specialties.length - 3 }} more</span
      >
    </div>
    <div v-if="chef?.cuisine_expertise?.length" class="profile-section">
      <strong class="section-label">Cuisine Expertise:</strong>
      <span
        v-for="cuisine in chef.cuisine_expertise.slice(0, 2)"
        :key="cuisine"
        class="tag"
        >{{ cuisine }}</span
      >
      <span v-if="chef.cuisine_expertise.length > 2" class="tag-more"
        >+{{ chef.cuisine_expertise.length - 2 }} more</span
      >
    </div>
    <div
      v-if="chef?.available_for_hire || chef?.total_recipes"
      class="profile-stats"
    >
      <div v-if="chef?.available_for_hire" class="stat-item">
        ✅ Available for hire
      </div>
      <div v-if="chef?.total_recipes" class="stat-item">
        📚 {{ chef.total_recipes }} recipes
      </div>
    </div>
  </UCard>
</template>
```

---

## Supplier

- Model: `packages/tenants/fireux-misebox/src/runtime/models/profiles/Supplier.model.ts`
- Cards
  - Pill: `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Cards/Pill.vue`
  - Cell: `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Cards/Cell.vue`
  - Profile: `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Cards/Profile.vue`

```ts
// Supplier.model.ts (excerpt)
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/profiles/profile.model'
export interface SupplierCoreProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
}
export interface SupplierAppProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  specialties?: string[]
}
export const supplierConfig: ProfileConfig = {
  id: 'supplier',
  collectionName: 'suppliers',
  profileType: 'Supplier',
  requiredFields: ['name'],
  searchableFields: ['name', 'specialties', 'business_type'],
} as const
```

```vue
<!-- Supplier Cards/Pill.vue -->
<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar
        :src="(supplier as any)?.avatar || (supplier as any)?.avatarUrl || (supplier as any)?.profile_image?.url"
        :alt="(supplier as any)?.name || (supplier as any)?.business_name || 'Supplier'"
        size="sm"
      />
      <div class="profile-info">
        <h4
          v-if="(supplier as any)?.name || (supplier as any)?.business_name"
          class="profile-name"
        >
          {{ (supplier as any)?.name || (supplier as any)?.business_name }}
        </h4>
        <p v-if="supplier?.specialties?.length" class="profile-title">
          {{ supplier.specialties[0] }}
        </p>
      </div>
    </div>
  </UCard>
</template>
```

```vue
<!-- Supplier Cards/Cell.vue -->
<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="(supplier as any)?.avatar || (supplier as any)?.avatarUrl || (supplier as any)?.profile_image?.url"
        :alt="(supplier as any)?.name || (supplier as any)?.business_name || (supplier as any)?.company_name || 'Supplier'"
        size="md"
      />
      <div class="profile-info">
        <h4
          v-if="(supplier as any)?.name || (supplier as any)?.business_name || (supplier as any)?.company_name"
          class="profile-name"
        >
          {{ (supplier as any)?.name || (supplier as any)?.business_name || (supplier as any)?.company_name }}
        </h4>
        <p v-if="supplier?.business_type" class="profile-subtitle">
          {{ supplier.business_type }}
        </p>
      </div>
    </div>
    <p
      v-if="(supplier as any)?.bioShort || (supplier as any)?.bio_short"
      class="profile-bio"
    >
      {{ (supplier as any)?.bioShort || (supplier as any)?.bio_short }}
    </p>
    <div v-if="supplier?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in supplier.specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
        >{{ specialty }}</span
      >
      <span v-if="supplier.specialties.length > 3" class="tag-more"
        >+{{ supplier.specialties.length - 3 }} more</span
      >
    </div>
  </UCard>
</template>
```

```vue
<!-- Supplier Cards/Profile.vue -->
<template>
  <UCard class="profile-card" @click="handleClick" style="cursor: pointer">
    <div class="profile-header">
      <UAvatar
        :src="(supplier as any)?.avatar || (supplier as any)?.avatarUrl || (supplier as any)?.profile_image?.url"
        :alt="(supplier as any)?.name || (supplier as any)?.company_name || (supplier as any)?.business_name || 'Supplier'"
        size="lg"
      />
      <div class="profile-info">
        <h4
          v-if="(supplier as any)?.name || (supplier as any)?.company_name"
          class="profile-name"
        >
          {{ (supplier as any)?.name || (supplier as any)?.company_name }}
        </h4>
        <p v-if="supplier?.business_type" class="profile-subtitle">
          {{ supplier.business_type }}
        </p>
        <div
          v-if="(supplier as any)?.locations?.length"
          class="profile-location"
        >
          <UIcon
            name="i-lucide-map-pin"
          /><span>{{ formatLocation((supplier as any).locations[0]) }}</span>
        </div>
        <div v-if="(supplier as any)?.years_in_business" class="profile-meta">
          {{ (supplier as any).years_in_business }}+ years in business
        </div>
      </div>
    </div>
    <p
      v-if="(supplier as any)?.bioLong || (supplier as any)?.bio_long || (supplier as any)?.bioShort || (supplier as any)?.bio_short"
      class="profile-bio"
    >
      {{ (supplier as any)?.bioLong || (supplier as any)?.bio_long || (supplier as any)?.bioShort || (supplier as any)?.bio_short }}
    </p>
    <div v-if="(supplier as any)?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in (supplier as any).specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
        >{{ specialty }}</span
      >
      <span v-if="(supplier as any)?.specialties?.length > 3" class="tag-more"
        >+{{ (supplier as any)?.specialties?.length - 3 }} more</span
      >
    </div>
    <div
      v-if="(supplier as any)?.products_offered?.length"
      class="profile-section"
    >
      <strong class="section-label">Products:</strong>
      <span
        v-for="product in (supplier as any).products_offered.slice(0, 2)"
        :key="product"
        class="tag"
        >{{ product }}</span
      >
      <span
        v-if="(supplier as any).products_offered.length > 2"
        class="tag-more"
        >+{{ (supplier as any).products_offered.length - 2 }} more</span
      >
    </div>
    <div class="profile-stats">
      <div v-if="(supplier as any)?.employee_count" class="profile-stat">
        <UIcon name="i-lucide-users" /><span
          >{{ (supplier as any).employee_count }} employees</span
        >
      </div>
      <div
        v-if="(supplier as any)?.certifications?.length"
        class="profile-stat"
      >
        <UIcon name="i-lucide-shield-check" /><span
          >{{ (supplier as any).certifications.length }} certifications</span
        >
      </div>
      <div v-if="(supplier as any)?.delivery_range" class="profile-stat">
        <UIcon name="i-lucide-truck" /><span
          >{{ (supplier as any).delivery_range }}km delivery</span
        >
      </div>
    </div>
  </UCard>
</template>
```

---

## Employer

- Model: `packages/extensions/fireux-jobs/src/runtime/models/profiles/Employer.model.ts`
- Cards
  - Pill: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer/Cards/Pill.vue`
  - Cell: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer/Cards/Cell.vue`
  - Profile: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer/Cards/Profile.vue`

```ts
// Employer.model.ts (excerpt)
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/profiles/profile.model'
export interface EmployerCoreProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
}
export interface EmployerAppProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  specialties?: string[]
}
export const employerConfig: ProfileConfig = {
  id: 'employer',
  collectionName: 'employers',
  profileType: 'Employer',
  requiredFields: ['name'],
  searchableFields: ['name', 'specialties', 'business_type'],
} as const
```

```vue
<!-- Employer Cards/Pill.vue -->
<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar
        :src="(employer as any)?.avatar || (employer as any)?.avatarUrl || (employer as any)?.profile_image?.url"
        :alt="(employer as any)?.name || (employer as any)?.company_name || 'Employer'"
        size="sm"
      />
      <div class="profile-info">
        <h4
          v-if="(employer as any)?.name || (employer as any)?.company_name"
          class="profile-name"
        >
          {{ (employer as any)?.name || (employer as any)?.company_name }}
        </h4>
        <p v-if="employer?.business_type" class="profile-title">
          {{ employer.business_type }}
        </p>
      </div>
    </div>
  </UCard>
</template>
```

```vue
<!-- Employer Cards/Cell.vue -->
<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="(employer as any)?.avatar || (employer as any)?.avatarUrl || (employer as any)?.profile_image?.url"
        :alt="(employer as any)?.name || (employer as any)?.company_name || 'Employer'"
        size="md"
      />
      <div class="profile-info">
        <h4
          v-if="(employer as any)?.name || (employer as any)?.company_name"
          class="profile-name"
        >
          {{ (employer as any)?.name || (employer as any)?.company_name }}
        </h4>
        <p v-if="employer?.business_type" class="profile-subtitle">
          {{ employer.business_type }}
        </p>
      </div>
    </div>
    <p
      v-if="(employer as any)?.bioShort || (employer as any)?.bio_short"
      class="profile-bio"
    >
      {{ (employer as any)?.bioShort || (employer as any)?.bio_short }}
    </p>
    <div v-if="employer?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in employer.specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
        >{{ specialty }}</span
      >
      <span v-if="employer.specialties.length > 3" class="tag-more"
        >+{{ employer.specialties.length - 3 }} more</span
      >
    </div>
  </UCard>
</template>
```

```vue
<!-- Employer Cards/Profile.vue -->
<template>
  <UCard class="profile-card" @click="handleClick" style="cursor: pointer">
    <div class="profile-header">
      <UAvatar
        :src="(employer as any)?.avatar || (employer as any)?.avatarUrl || (employer as any)?.profile_image?.url"
        :alt="(employer as any)?.name || (employer as any)?.company_name || 'Employer'"
        size="lg"
      />
      <div class="profile-info">
        <h4
          v-if="(employer as any)?.name || (employer as any)?.company_name"
          class="profile-name"
        >
          {{ (employer as any)?.name || (employer as any)?.company_name }}
        </h4>
        <p v-if="employer?.business_type" class="profile-subtitle">
          {{ employer.business_type }}
        </p>
        <div v-if="employer?.locations?.length" class="profile-location">
          <UIcon name="i-lucide-map-pin" /><span>{{
            employer.locations[0].formatted_address
          }}</span>
        </div>
        <div v-if="(employer as any)?.years_established" class="profile-meta">
          Est. {{ (employer as any).years_established }}
        </div>
      </div>
    </div>
    <p
      v-if="(employer as any)?.bioLong || (employer as any)?.bio_long || (employer as any)?.bioShort || (employer as any)?.bio_short"
      class="profile-bio"
    >
      {{ (employer as any)?.bioLong || (employer as any)?.bio_long || (employer as any)?.bioShort || (employer as any)?.bio_short }}
    </p>
    <div
      v-if="employer?.specialties?.length || (employer as any)?.cuisine_types?.length"
      class="profile-tags"
    >
      <span
        v-for="specialty in ((employer?.specialties ?? (employer as any)?.cuisine_types ?? []) as string[]).slice(0, 3)"
        :key="specialty"
        class="tag"
        >{{ specialty }}</span
      >
      <span
        v-if="((employer?.specialties ?? (employer as any)?.cuisine_types ?? []) as string[]).length > 3"
        class="tag-more"
        >+{{ ((employer?.specialties ?? (employer as any)?.cuisine_types ?? []) as string[]).length - 3 }}
        more</span
      >
    </div>
    <div v-if="(employer as any)?.benefits?.length" class="profile-section">
      <strong class="section-label">Benefits:</strong>
      <span
        v-for="benefit in (employer as any).benefits.slice(0, 2)"
        :key="benefit"
        class="tag"
        >{{ benefit }}</span
      >
      <span v-if="(employer as any).benefits.length > 2" class="tag-more"
        >+{{ (employer as any).benefits.length - 2 }} more</span
      >
    </div>
    <div class="profile-stats">
      <div v-if="(employer as any)?.employee_count" class="profile-stat">
        <UIcon name="i-lucide-users" /><span
          >{{ (employer as any).employee_count }} employees</span
        >
      </div>
      <div v-if="(employer as any)?.active_jobs?.length" class="profile-stat">
        <UIcon name="i-lucide-briefcase" /><span
          >{{ (employer as any).active_jobs.length }} open positions</span
        >
      </div>
      <div v-if="(employer as any)?.company_size" class="profile-stat">
        <UIcon name="i-lucide-building" /><span
          >{{ (employer as any).company_size }} company</span
        >
      </div>
    </div>
  </UCard>
</template>
```

---

## Professional

- Model: `packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional.model.ts`
- Cards
  - Pill: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Cards/Pill.vue`
  - Cell: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Cards/Cell.vue`
  - Profile: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Cards/Profile.vue`

```ts
// Professional.model.ts (excerpt)
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/profiles/profile.model'
export interface ProfessionalCoreProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
}
export interface ProfessionalAppProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  specialties?: string[]
}
export const professionalConfig: ProfileConfig = {
  id: 'professional',
  collectionName: 'professionals',
  profileType: 'Professional',
  requiredFields: ['name'],
  searchableFields: ['name', 'specialties'],
} as const
```

```vue
<!-- Professional Cards/Pill.vue -->
<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar
        :src="(professional as any)?.avatarUrl"
        :alt="professional?.professional_name || 'Professional'"
        size="sm"
      />
      <div class="profile-info">
        <h4 v-if="professional?.professional_name" class="profile-name">
          {{ professional.professional_name }}
        </h4>
        <p v-if="professional?.title" class="profile-title">
          {{ professional.title }}
        </p>
      </div>
    </div>
  </UCard>
</template>
```

```vue
<!-- Professional Cards/Cell.vue -->
<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="(professional as any)?.avatar || (professional as any)?.avatarUrl || (professional as any)?.profile_image?.url"
        :alt="(professional as any)?.name || (professional as any)?.professional_name || 'Professional'"
        size="md"
      />
      <div class="profile-info">
        <h4
          v-if="(professional as any)?.name || (professional as any)?.professional_name"
          class="profile-name"
        >
          {{ (professional as any)?.name || (professional as any)?.professional_name }}
        </h4>
        <p v-if="professional?.title" class="profile-subtitle">
          {{ professional.title }}
        </p>
      </div>
    </div>
    <p
      v-if="(professional as any)?.bioShort || (professional as any)?.bio_short"
      class="profile-bio"
    >
      {{ (professional as any)?.bioShort || (professional as any)?.bio_short }}
    </p>
    <div v-if="professional?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in professional.specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
        >{{ specialty }}</span
      >
      <span v-if="professional.specialties.length > 3" class="tag-more"
        >+{{ professional.specialties.length - 3 }} more</span
      >
    </div>
  </UCard>
</template>
```

```vue
<!-- Professional Cards/Profile.vue -->
<template>
  <UCard class="profile-card" @click="handleClick" style="cursor: pointer">
    <div class="profile-header">
      <UAvatar
        :src="(professional as any)?.avatar || (professional as any)?.avatarUrl || (professional as any)?.profile_image?.url"
        :alt="(professional as any)?.name || (professional as any)?.professional_name || 'Professional'"
        size="lg"
      />
      <div class="profile-info">
        <h4
          v-if="(professional as any)?.name || (professional as any)?.professional_name"
          class="profile-name"
        >
          {{ (professional as any)?.name || (professional as any)?.professional_name }}
        </h4>
        <p v-if="professional?.title" class="profile-subtitle">
          {{ professional.title }}
        </p>
        <div
          v-if="(professional as any)?.locations?.length"
          class="profile-location"
        >
          <UIcon
            name="i-lucide-map-pin"
          /><span
            >{{ getLocationText((professional as any).locations[0]) }}</span
          >
        </div>
        <div
          v-if="getExperienceYears((professional as any)?.kitchen_experience) > 0"
          class="profile-meta"
        >
          {{ getExperienceYears((professional as any)?.kitchen_experience) }}+
          years experience
        </div>
      </div>
    </div>
    <p
      v-if="(professional as any)?.bioLong || (professional as any)?.bio_long || (professional as any)?.bioShort || (professional as any)?.bio_short"
      class="profile-bio"
    >
      {{ (professional as any)?.bioLong || (professional as any)?.bio_long || (professional as any)?.bioShort || (professional as any)?.bio_short }}
    </p>
    <div
      v-if="(professional as any)?.cuisine_types?.length"
      class="profile-tags"
    >
      <span
        v-for="cuisine in (professional as any).cuisine_types.slice(0, 3)"
        :key="cuisine"
        class="tag"
        >{{ cuisine }}</span
      >
      <span
        v-if="(professional as any).cuisine_types.length > 3"
        class="tag-more"
        >+{{ (professional as any).cuisine_types.length - 3 }} more</span
      >
    </div>
    <div v-if="(professional as any)?.skills?.length" class="profile-section">
      <strong class="section-label">Skills:</strong>
      <span
        v-for="skill in (professional as any).skills.slice(0, 2)"
        :key="skill"
        class="tag"
        >{{ skill }}</span
      >
      <span v-if="(professional as any).skills.length > 2" class="tag-more"
        >+{{ (professional as any).skills.length - 2 }} more</span
      >
    </div>
    <div class="profile-stats">
      <div v-if="(professional as any)?.hourly_rate" class="profile-stat">
        <UIcon name="i-lucide-dollar-sign" /><span
          >${{ (professional as any).hourly_rate }}/hour</span
        >
      </div>
      <div v-if="(professional as any)?.availability" class="profile-stat">
        <UIcon
          name="i-lucide-clock"
        /><span>{{ (professional as any).availability }}</span>
      </div>
      <div v-if="latestExp" class="profile-stat">
        <UIcon name="i-lucide-building" /><span
          >{{ latestExp.role }} at {{ latestExp.name }}</span
        >
      </div>
    </div>
  </UCard>
</template>
```

---

End of overview.
