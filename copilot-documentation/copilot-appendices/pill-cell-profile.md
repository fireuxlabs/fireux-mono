# Pill · Cell · Profile — Unified Profile UI Reference

Purpose: one-stop reference for our main profile UI components (Pill, Cell, Profile) across domains. Includes file paths, props shapes, and the current Vue code for each.

Applies to:

- Core styles scaffold (shared CSS classes)
- Chef, Supplier (tenant: fireux-misebox)
- Professional, Employer (extension: fireux-jobs)

## Shared CSS scaffold

The following class names are provided via Core styles and should be preferred:

- .profile-page, .profile-list
- .profile-cell (base), .profile-pill (modifier)
- .profile-header, .profile-info, .profile-name, .profile-title, .profile-bio
- Domain variants: .chef-cell, .supplier-cell, .professional-cell, .employer-cell

Source: `packages/core/fireux-core/src/runtime/assets/styles/main.scss`

---

## Professional (Jobs)

Model contracts: `packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional.model.ts`

- Namespaces (snake_case aligned):
  - ProfessionalCard.Pill, ProfessionalCard.Cell, ProfessionalCard.Profile

### Pill

Path: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Cards/Pill.vue`

```vue
<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar :src="professional.avatar" :alt="professional.name" size="sm" />
      <div class="profile-info">
        <h4 class="profile-name">{{ professional.name }}</h4>
        <p v-if="professional.title" class="profile-title">
          {{ professional.title }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProfessionalPillProps } from '../../../../../models/profiles/Professional.model'

defineProps<{ professional: ProfessionalPillProps }>()
</script>
```

### Cell

Path: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Cards/Cell.vue`

```vue
<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar :src="professional.avatar" :alt="professional.name" size="md" />
      <div class="profile-info">
        <h4 class="profile-name">{{ professional.name }}</h4>
        <p v-if="professional.title" class="profile-subtitle">
          {{ professional.title }}
        </p>
      </div>
    </div>

    <p v-if="professional.bioShort" class="profile-bio">
      {{ professional.bioShort }}
    </p>

    <div v-if="professional.specialties?.length" class="profile-tags">
      <span
        v-for="(tag, i) in professional.specialties.slice(0, 3)"
        :key="tag + i"
        class="tag"
        >{{ tag }}</span
      >
      <span v-if="professional.specialties.length > 3" class="tag-more">
        +{{ professional.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProfessionalCellProps } from '../../../../../models/profiles/Professional.model'

defineProps<{ professional: ProfessionalCellProps }>()
</script>
```

### Profile

Path: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Cards/Profile.vue`

```vue
<template>
  <UCard class="profile-card" @click="handleClick" style="cursor: pointer">
    <div class="profile-header">
      <UAvatar
        :src="
          (professional as any)?.avatar ||
          (professional as any)?.avatarUrl ||
          (professional as any)?.profile_image?.url
        "
        :alt="
          (professional as any)?.name ||
          (professional as any)?.professional_name ||
          'Professional'
        "
        size="lg"
      />
      <div class="profile-info">
        <h4
          v-if="
            (professional as any)?.name ||
            (professional as any)?.professional_name
          "
          class="profile-name"
        >
          {{
            (professional as any)?.name ||
            (professional as any)?.professional_name
          }}
        </h4>
        <p v-if="professional?.title" class="profile-subtitle">
          {{ professional.title }}
        </p>
        <div
          v-if="(professional as any)?.locations?.length"
          class="profile-location"
        >
          <UIcon name="i-lucide-map-pin" />
          <span>{{ getLocationText((professional as any).locations[0]) }}</span>
        </div>
        <div
          v-if="
            getExperienceYears((professional as any)?.kitchen_experience) > 0
          "
          class="profile-meta"
        >
          {{ getExperienceYears((professional as any)?.kitchen_experience) }}+
          years experience
        </div>
      </div>
    </div>
    <p
      v-if="
        (professional as any)?.bioLong ||
        (professional as any)?.bio_long ||
        (professional as any)?.bioShort ||
        (professional as any)?.bio_short
      "
      class="profile-bio"
    >
      {{
        (professional as any)?.bioLong ||
        (professional as any)?.bio_long ||
        (professional as any)?.bioShort ||
        (professional as any)?.bio_short
      }}
    </p>

    <div
      v-if="(professional as any)?.cuisine_types?.length"
      class="profile-tags"
    >
      <span
        v-for="cuisine in (professional as any).cuisine_types.slice(0, 3)"
        :key="cuisine"
        class="tag"
      >
        {{ cuisine }}
      </span>
      <span
        v-if="(professional as any).cuisine_types.length > 3"
        class="tag-more"
      >
        +{{ (professional as any).cuisine_types.length - 3 }} more
      </span>
    </div>

    <div v-if="(professional as any)?.skills?.length" class="profile-section">
      <strong class="section-label">Skills:</strong>
      <span
        v-for="skill in (professional as any).skills.slice(0, 2)"
        :key="skill"
        class="tag"
      >
        {{ skill }}
      </span>
      <span v-if="(professional as any).skills.length > 2" class="tag-more">
        +{{ (professional as any).skills.length - 2 }} more
      </span>
    </div>

    <div class="profile-stats">
      <div v-if="(professional as any)?.hourly_rate" class="profile-stat">
        <UIcon name="i-lucide-dollar-sign" />
        <span>${{ (professional as any).hourly_rate }}/hour</span>
      </div>
      <div v-if="(professional as any)?.availability" class="profile-stat">
        <UIcon name="i-lucide-clock" />
        <span>{{ (professional as any).availability }}</span>
      </div>
      <div v-if="latestExp" class="profile-stat">
        <UIcon name="i-lucide-building" />
        <span>{{ latestExp.role }} at {{ latestExp.name }}</span>
      </div>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { Professional } from '../../../../../models/profiles/Professional.model'

const props = defineProps<{
  professional?: Partial<Professional>
  navigate?: (profile: any) => void
}>()

const handleClick = () => {
  if (props.navigate && props.professional) {
    props.navigate(props.professional)
  }
}

function getLocationText(location: any): string {
  if (!location) return ''
  if (location?.formatted_address) {
    return String(location.formatted_address)
  }
  if (location?.city || location?.country) {
    return [location.city, location.country].filter(Boolean).join(', ')
  }
  return 'Location not specified'
}

function getExperienceYears(experiences: any[] | undefined): number {
  if (!Array.isArray(experiences) || experiences.length === 0) return 0
  let years = 0
  for (const exp of experiences) {
    const from = parseInt(exp?.from_year) || 0
    const to = exp?.ongoing
      ? new Date().getFullYear()
      : parseInt(exp?.to_year) || from
    years += Math.max(0, to - from)
  }
  return years
}

const latestExp = computed(() => {
  const list = (props.professional as any)?.kitchen_experience as
    | any[]
    | undefined
  if (!Array.isArray(list) || list.length === 0) return null as any
  const ongoing = list.find((e) => e?.ongoing)
  if (ongoing) return ongoing
  const sorted = [...list].sort((a, b) => {
    const aYear = parseInt(a?.to_year || new Date().getFullYear())
    const bYear = parseInt(b?.to_year || new Date().getFullYear())
    return bYear - aYear
  })
  return sorted[0] || null
})
</script>
```

---

## Employer (Jobs)

### Pill

Path: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer/Cards/Pill.vue`

```vue
<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar :src="employer.avatar" :alt="employer.name" size="sm" />
      <div class="profile-info">
        <h4 class="profile-name">{{ employer.name }}</h4>
        <p v-if="employer.title" class="profile-title">{{ employer.title }}</p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { EmployerPillProps } from '../../../../../models/profiles/Employer.model'

defineProps<{ employer: EmployerPillProps }>()
</script>
```

### Cell

Path: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer/Cards/Cell.vue`

```vue
<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar :src="employer.avatar" :alt="employer.name" size="md" />
      <div class="profile-info">
        <h4 class="profile-name">{{ employer.name }}</h4>
        <p v-if="employer.title" class="profile-subtitle">
          {{ employer.title }}
        </p>
      </div>
    </div>

    <p v-if="employer.bioShort" class="profile-bio">
      {{ employer.bioShort }}
    </p>

    <div v-if="employer.specialties?.length" class="profile-tags">
      <span
        v-for="(tag, i) in employer.specialties.slice(0, 3)"
        :key="tag + i"
        class="tag"
        >{{ tag }}</span
      >
      <span v-if="employer.specialties.length > 3" class="tag-more">
        +{{ employer.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { EmployerCellProps } from '../../../../../models/profiles/Employer.model'

defineProps<{ employer: EmployerCellProps }>()
</script>
```

### Profile

Path: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer/Cards/Profile.vue`

```vue
<template>
  <UCard class="profile-card" @click="handleClick" style="cursor: pointer">
    <div class="profile-header">
      <UAvatar
        :src="
          (employer as any)?.avatar ||
          (employer as any)?.avatarUrl ||
          (employer as any)?.profile_image?.url
        "
        :alt="
          (employer as any)?.name ||
          (employer as any)?.company_name ||
          'Employer'
        "
        size="lg"
      />
      <div class="profile-info">
        <h4
          v-if="(employer as any)?.name || (employer as any)?.company_name"
          class="profile-name"
        >
          {{ (employer as any)?.name || (employer as any)?.company_name }}
        </h4>
        <p v-if="(employer as any)?.business_type" class="profile-subtitle">
          {{ (employer as any).business_type }}
        </p>
        <div
          v-if="(employer as any)?.locations?.length"
          class="profile-location"
        >
          <UIcon name="i-lucide-map-pin" />
          <span>{{ (employer as any).locations[0]?.formatted_address }}</span>
        </div>
        <div v-if="(employer as any)?.years_established" class="profile-meta">
          Est. {{ (employer as any).years_established }}
        </div>
      </div>
    </div>
    <p
      v-if="
        (employer as any)?.bioLong ||
        (employer as any)?.bio_long ||
        (employer as any)?.bioShort ||
        (employer as any)?.bio_short
      "
      class="profile-bio"
    >
      {{
        (employer as any)?.bioLong ||
        (employer as any)?.bio_long ||
        (employer as any)?.bioShort ||
        (employer as any)?.bio_short
      }}
    </p>

    <div
      v-if="
        employer?.specialties?.length ||
        (employer as any)?.cuisine_types?.length
      "
      class="profile-tags"
    >
      <span
        v-for="specialty in (
          (employer?.specialties ??
            (employer as any)?.cuisine_types ??
            []) as string[]
        ).slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span
        v-if="
          (
            (employer?.specialties ??
              (employer as any)?.cuisine_types ??
              []) as string[]
          ).length > 3
        "
        class="tag-more"
      >
        +{{
          (
            (employer?.specialties ??
              (employer as any)?.cuisine_types ??
              []) as string[]
          ).length - 3
        }}
        more
      </span>
    </div>

    <div v-if="(employer as any)?.benefits?.length" class="profile-section">
      <strong class="section-label">Benefits:</strong>
      <span
        v-for="benefit in (employer as any).benefits.slice(0, 2)"
        :key="benefit"
        class="tag"
      >
        {{ benefit }}
      </span>
      <span v-if="(employer as any).benefits.length > 2" class="tag-more">
        +{{ (employer as any).benefits.length - 2 }} more
      </span>
    </div>

    <div class="profile-stats">
      <div v-if="(employer as any)?.employee_count" class="profile-stat">
        <UIcon name="i-lucide-users" />
        <span>{{ (employer as any).employee_count }} employees</span>
      </div>
      <div v-if="(employer as any)?.active_jobs?.length" class="profile-stat">
        <UIcon name="i-lucide-briefcase" />
        <span>{{ (employer as any).active_jobs.length }} open positions</span>
      </div>
      <div v-if="(employer as any)?.company_size" class="profile-stat">
        <UIcon name="i-lucide-building" />
        <span>{{ (employer as any).company_size }} company</span>
      </div>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import type { Employer } from '../../../../../models/profiles/Employer.model'

const props = defineProps<{
  employer?: Partial<Employer>
  navigate?: (profile: any) => void
}>()

const handleClick = () => {
  if (props.navigate && props.employer) {
    props.navigate(props.employer)
  }
}
</script>
```

---

## Chef (Misebox)

### Pill

Path: `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Cards/Pill.vue`

```vue
<template>
  <UCard class="pill">
    <div class="pill-inner">
      <UAvatar
        :src="chef.avatar"
        :alt="chef.display_name"
        size="sm"
        :text="avatarInitials"
      />
      <div class="meta">
        <div class="name">{{ chef.display_name || 'Chef' }}</div>
        <div v-if="chef.title" class="title">{{ chef.title }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChefCard } from '../../../../../models/profiles/Chef.model'

const props = defineProps<{ chef: ChefCard.Pill }>()

const avatarInitials = computed(() => {
  const name = (props.chef.display_name || '').trim()
  if (!name) return 'C'
  return name
    .split(/\s+/)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
})
</script>
```

### Cell

Path: `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Cards/Cell.vue`

```vue
<template>
  <UCard class="cell">
    <div class="cell-inner">
      <UAvatar
        :src="chef.avatar"
        :alt="chef.display_name"
        size="md"
        :text="avatarInitials"
      />
      <div class="meta">
        <div class="name">{{ chef.display_name || 'Chef' }}</div>
        <div v-if="chef.title" class="title">{{ chef.title }}</div>
        <div v-if="chef.bioShort" class="subtitle">{{ chef.bioShort }}</div>

        <div v-if="chef.specialties?.length" class="cell-badges">
          <UBadge
            v-for="s in chef.specialties"
            :key="s"
            size="xs"
            variant="soft"
          >
            {{ s }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChefCard } from '../../../../../models/profiles/Chef.model'

const props = defineProps<{ chef: ChefCard.Cell }>()

const avatarInitials = computed(() => {
  const name = (props.chef.display_name || '').trim()
  if (!name) return 'C'
  return name
    .split(/\s+/)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
})
</script>
```

### Profile

Path: `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Cards/Profile.vue`

```vue
<template>
  <UCard class="profile">
    <div class="profile-header">
      <UAvatar :src="chef.avatar" :alt="displayName" size="xl" />
      <div class="meta">
        <div class="name">{{ displayName }}</div>
        <div v-if="chef.title" class="subtitle">{{ chef.title }}</div>
      </div>
    </div>

    <div v-if="bioText" class="section">
      <div class="section-title">Bio</div>
      <p class="body">{{ bioText }}</p>
    </div>

    <div v-if="chef.specialties?.length" class="section">
      <div class="section-title">Specialties</div>
      <div class="tags">
        <UBadge v-for="s in chef.specialties" :key="s" variant="soft" size="xs">
          {{ s }}
        </UBadge>
      </div>
    </div>

    <div v-if="createdText" class="section">
      <div class="section-title">Timestamps</div>
      <div class="meta-row">
        <span>Created: {{ createdText }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChefCard } from '../../../../../models/profiles/Chef.model'

const props = defineProps<{ chef: ChefCard.Profile }>()

const displayName = computed(() => props.chef?.display_name || 'Chef')
const bioText = computed(
  () => props.chef?.bioLong ?? props.chef?.bioShort ?? ''
)
const createdText = computed(() => '')
</script>
```

---

## Supplier (Misebox)

### Pill

Path: `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Cards/Pill.vue`

```vue
<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar :src="supplier.avatar" :alt="supplier.display_name" size="sm" />
      <div class="profile-info">
        <h4 class="profile-name">{{ supplier.display_name }}</h4>
        <p v-if="supplier.title" class="profile-title">{{ supplier.title }}</p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { SupplierCard } from '../../../../../models/profiles/Supplier.model'

defineProps<{ supplier: SupplierCard.Pill }>()
</script>
```

### Cell

Path: `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Cards/Cell.vue`

```vue
<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar :src="supplier.avatar" :alt="supplier.display_name" size="md" />
      <div class="profile-info">
        <h4 class="profile-name">{{ supplier.display_name }}</h4>
        <p v-if="supplier.title" class="profile-subtitle">
          {{ supplier.title }}
        </p>
      </div>
    </div>

    <p v-if="supplier.bioShort" class="profile-bio">
      {{ supplier.bioShort }}
    </p>

    <div v-if="supplier.specialties?.length" class="profile-tags">
      <span
        v-for="(tag, i) in supplier.specialties.slice(0, 3)"
        :key="tag + i"
        class="tag"
        >{{ tag }}</span
      >
      <span v-if="supplier.specialties.length > 3" class="tag-more">
        +{{ supplier.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { SupplierCard } from '../../../../../models/profiles/Supplier.model'

defineProps<{ supplier: SupplierCard.Cell }>()
</script>
```

### Profile

Path: `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Cards/Profile.vue`

```vue
<template>
  <UCard class="profile-card" @click="handleClick" style="cursor: pointer">
    <div class="profile-header">
      <UAvatar
        :src="
          (supplier as any)?.avatar ||
          (supplier as any)?.avatarUrl ||
          (supplier as any)?.profile_image?.url
        "
        :alt="
          (supplier as any)?.name ||
          (supplier as any)?.company_name ||
          (supplier as any)?.business_name ||
          'Supplier'
        "
        size="lg"
      />
      <div class="profile-info">
        <h4
          v-if="(supplier as any)?.name || (supplier as any)?.company_name"
          class="profile-name"
        >
          {{ (supplier as any)?.name || (supplier as any)?.company_name }}
        </h4>
        <p v-if="(supplier as any)?.business_type" class="profile-subtitle">
          {{ (supplier as any).business_type }}
        </p>
        <div
          v-if="(supplier as any)?.locations?.length"
          class="profile-location"
        >
          <UIcon name="i-lucide-map-pin" />
          <span>{{ formatLocation((supplier as any).locations[0]) }}</span>
        </div>
        <div v-if="(supplier as any)?.years_in_business" class="profile-meta">
          {{ (supplier as any).years_in_business }}+ years in business
        </div>
      </div>
    </div>
    <p
      v-if="
        (supplier as any)?.bioLong ||
        (supplier as any)?.bio_long ||
        (supplier as any)?.bioShort ||
        (supplier as any)?.bio_short
      "
      class="profile-bio"
    >
      {{
        (supplier as any)?.bioLong ||
        (supplier as any)?.bio_long ||
        (supplier as any)?.bioShort ||
        (supplier as any)?.bio_short
      }}
    </p>

    <div v-if="(supplier as any)?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in (supplier as any).specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span v-if="(supplier as any)?.specialties?.length > 3" class="tag-more">
        +{{ (supplier as any)?.specialties?.length - 3 }} more
      </span>
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
      >
        {{ product }}
      </span>
      <span
        v-if="(supplier as any).products_offered.length > 2"
        class="tag-more"
      >
        +{{ (supplier as any).products_offered.length - 2 }} more
      </span>
    </div>

    <div class="profile-stats">
      <div v-if="(supplier as any)?.employee_count" class="profile-stat">
        <UIcon name="i-lucide-users" />
        <span>{{ (supplier as any).employee_count }} employees</span>
      </div>
      <div
        v-if="(supplier as any)?.certifications?.length"
        class="profile-stat"
      >
        <UIcon name="i-lucide-shield-check" />
        <span
          >{{ (supplier as any).certifications.length }} certifications</span
        >
      </div>
      <div v-if="(supplier as any)?.delivery_range" class="profile-stat">
        <UIcon name="i-lucide-truck" />
        <span>{{ (supplier as any).delivery_range }}km delivery</span>
      </div>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import type { Supplier } from '../../../../../models/profiles/Supplier.model'

const props = defineProps<{
  supplier?: Partial<Supplier>
  navigate?: (profile: any) => void
}>()

const handleClick = () => {
  if (props.navigate && props.supplier) {
    props.navigate(props.supplier)
  }
}

const formatLocation = (
  loc: { city?: string; country?: string } | undefined
) => {
  if (!loc) return ''
  if (loc.city && loc.country) return `${loc.city}, ${loc.country}`
  return loc.city || loc.country || ''
}
</script>
```

---

## Notes and follow-ups

- Professional/Employer components contain legacy fallbacks (name vs display_name, bioShort vs bio_short). This is intentional for backward compatibility and safe to remove once all data is normalized to snake_case.
- Prefer the shared CSS classes from Core for new components and keep “Pill → Cell → Profile” structure consistent across domains.
