# Profiles Stack

## Core profile composables (`packages/core/fireux-core/src/runtime/composables/firestore/core/profile`)

- `useProfile.ts` – wraps `useProfileFetch` with the active user id (via `useAuth`) and returns grouped profile refs.
- `main/useProfileCollection.ts` – streams global + tenant overlay collections and merges them into a single computed list.
- `main/useProfileDelete.ts` – stub for future delete handling; exposes `deleteProfile`, `deleting`, `deleteError` refs.
- `main/useProfileEnsure.ts` – placeholder ensure helper returning `{ createdCore: false, createdApp: false }`.
- `main/useProfileFetch.ts` – fetches core + tenant overlay documents for a given profile id and returns raw refs.
- Domain-specific layers own computed/update flows; core profile utilities stop at fetching/collection.

## Profile-related page scripts

### jobs extension (`packages/extensions/fireux-jobs/src/runtime/pages`)

`professionals/index.vue`:

```ts
<script setup lang="ts">
import { definePageMeta, useHead } from '#imports'
import { useProfessional } from '../../composables/firestore/profiles/Professional/useProfessional.ts'
import { useProfessionalCreate } from '../../composables/firestore/profiles/Professional/useProfessionalCreate.ts'
import { useProfessionalComputed } from '../../composables/firestore/profiles/Professional/main/useProfessionalComputed.ts'
import { useProfessionalInterface } from '../../composables/firestore/profiles/Professional/main/useProfessionalInterface.ts'
import { useProfessionalCollection } from '../../composables/firestore/profiles/Professional/main/useProfessionalCollection.ts'

definePageMeta({
  nav: {
    key: 'professionals',
    label: 'Professionals',
    icon: 'i-lucide-user-round',
    order: 65,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Professionals',
  layout: 'default',
  name: 'ProfessionalsIndexPage',
})

useHead({ title: 'Professionals' })

const { profile } = useProfessional()
const currentProfessional = profile.activeProfile

const { createProfessional } = useProfessionalCreate()
const creating = createProfessional.state
const onCreate = async () => { await createProfessional() }
</script>
```

`professionals/[id].vue`:

```ts
<script setup lang="ts">
  import {professionalConfig} from '../../models/profiles/Professional.model'
</script>
```

`dashboard/professional-profile.vue`:

```ts
<script setup lang="ts">
declare function definePageMeta(meta: any): void
import { computed } from 'vue'
import type { ProfessionalCoreProfile } from '../../models/profiles/Professional.model'
import { useProfessional } from '../../composables/firestore/profiles/Professional/useProfessional'
import { useProfessionalComputed } from '../../composables/firestore/profiles/Professional/main/useProfessionalComputed'
import { useProfessionalInterface } from '../../composables/firestore/profiles/Professional/main/useProfessionalInterface'
import { useProfessionalCreate } from '../../composables/firestore/profiles/Professional/useProfessionalCreate'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-professional-profile',
    label: 'Professional Profile',
    icon: 'i-lucide-user-round-cog',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'professional',
  },
  requiresAuth: true,
})

const { profile } = useProfessional()
const { coreProfile, activeProfile } = useProfessionalComputed(profile)
const { pillProps, cellProps, profileProps } = useProfessionalInterface(profile)
const { createProfessional } = useProfessionalCreate()

const currentProfessional = activeProfile
const currentProfessionalPill = computed(() =>
  currentProfessional.value ? pillProps(currentProfessional.value) : null
)
const currentProfessionalCell = computed(() =>
  currentProfessional.value ? cellProps(currentProfessional.value) : null
)
const currentProfessionalProfileCard = computed(() =>
  currentProfessional.value ? profileProps(currentProfessional.value) : null
)

const professionalRecord = computed<ProfessionalCoreProfile | null>(
  () => coreProfile.value
)

const hero = computed(() => {
  const cell = currentProfessionalCell.value
  if (!cell) return null
  const pill = currentProfessionalPill.value
  return {
    pillComponent: pill ? 'JobProfilesProfessionalCardsPill' : undefined,
    pillProps: pill ? { professional: pill } : null,
    pillClass: null,
    cellComponent: 'OrganismsProfilesProfessionalCardsCell',
    cellProps: { professional: cell },
  }
})

const creating = createProfessional.state
const onEnsure = async () => {
  await createProfessional()
}
</script>
```

`employers/index.vue`:

```ts
<script setup lang="ts">
import { computed } from 'vue'
import { useEmployer } from '../../composables/firestore/profiles/Employer/useEmployer.ts'
import { useEmployerComputed } from '../../composables/firestore/profiles/Employer/main/useEmployerComputed.ts'
import { useEmployerInterface } from '../../composables/firestore/profiles/Employer/main/useEmployerInterface.ts'
import { useEmployerCollection } from '../../composables/firestore/profiles/Employer/main/useEmployerCollection.ts'
import { useEmployerCreate } from '../../composables/firestore/profiles/Employer/main/useEmployerCreate.ts'

const { profile } = useEmployer()
const { activeProfile } = useEmployerComputed(profile)
const { pillProps, cellProps } = useEmployerInterface(profile)
const { employers } = useEmployerCollection()
const { createEmployer } = useEmployerCreate()

const current = activeProfile

const roster = computed(() => employers.value ?? [])
const directoryPills = computed(() =>
  roster.value.map((entry) => pillProps(entry))
)
const totalEmployers = computed(() => directoryPills.value.length)

const creating = createEmployer.state

const onCreate = async () => {
  await createEmployer()
}
</script>
```

`employers/[id].vue`:

```ts
<script setup lang="ts">
  import {employerConfig} from '../../models/profiles/Employer.model'
</script>
```

`dashboard/employer-profile.vue`:

```ts
<script setup lang="ts">
declare function definePageMeta(meta: any): void
import { computed } from 'vue'
import { type Employer } from '../../models/profiles/Employer.model'
import { useEmployer } from '../../composables/firestore/profiles/Employer/useEmployer'
import { useEmployerComputed } from '../../composables/firestore/profiles/Employer/main/useEmployerComputed'
import { useEmployerInterface } from '../../composables/firestore/profiles/Employer/main/useEmployerInterface'
import { useEmployerCreate } from '../../composables/firestore/profiles/Employer/main/useEmployerCreate'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-employer-profile',
    label: 'Employer Profile',
    icon: 'i-lucide-briefcase-business',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'employer',
  },
  requiresAuth: true,
})

const { profile } = useEmployer()
const { coreProfile, appProfile, activeProfile } = useEmployerComputed(profile)
const { pillProps, cellProps, profileProps } = useEmployerInterface(profile)
const { createEmployer } = useEmployerCreate()

const currentEmployer = activeProfile
const currentEmployerPill = computed(() =>
  currentEmployer.value ? pillProps(currentEmployer.value) : null
)
const currentEmployerCell = computed(() =>
  currentEmployer.value ? cellProps(currentEmployer.value) : null
)
const currentEmployerProfileCard = computed(() =>
  currentEmployer.value ? profileProps(currentEmployer.value) : null
)

const employerRecord = computed<Employer | null>(() => {
  const active = currentEmployer.value
  if (!active) return null
  const displayName =
    active.display_name ??
    active.title ??
    active.organization_name ??
    'Employer'
  return {
    id: active.id,
    display_name: displayName,
    avatar: active.avatar ?? active.avatar_url ?? undefined,
    core: coreProfile.value,
    app: appProfile.value,
  }
})

const hero = computed(() => {
  const cell = currentEmployerCell.value
  if (!cell) return null
  const pill = currentEmployerPill.value
  return {
    pillComponent: pill ? 'JobProfilesEmployerCardsPill' : undefined,
    pillProps: pill ? { employer: pill } : null,
    pillClass: null,
    cellComponent: 'OrganismsProfilesEmployerCardsCell',
    cellProps: { employer: cell },
  }
})

const creating = createEmployer.state
const onEnsure = async () => {
  await createEmployer()
}
</script>
```

### misebox tenant (`packages/tenants/fireux-misebox/src/runtime/pages`)

`chefs/index.vue`:

```ts
<script setup lang="ts">
import { computed } from 'vue'
import { useChef } from '../../composables/firestore/profiles/Chef/useChef.ts'

const chef = useChef()
const { profile, pillProps, cellProps, createChef, collection, activeProfile } =
  chef

const current = activeProfile

const roster = computed(() => collection.chefs?.value ?? [])
const directoryPills = computed(() =>
  roster.value.map((entry) => pillProps(entry))
)
const totalChefs = computed(() => directoryPills.value.length)

const globalChefs = computed(() => collection.global?.value ?? [])
const localChefs = computed(() => collection.local?.value ?? [])

const creating = createChef.state

const onCreate = async () => {
  await createChef()
}
</script>
```

`chefs/[id].vue`:

```ts
<script setup lang="ts">
  import {chefConfig} from '../../models/profiles/Chef.model'
</script>
```

`suppliers/index.vue`:

```ts
<script setup lang="ts">
import { computed } from 'vue'
import { useSupplier } from '../../composables/firestore/profiles/Supplier/useSupplier.ts'
import { useSupplierComputed } from '../../composables/firestore/profiles/Supplier/main/useSupplierComputed.ts'
import { useSupplierInterface } from '../../composables/firestore/profiles/Supplier/main/useSupplierInterface.ts'
import { useSupplierCollection } from '../../composables/firestore/profiles/Supplier/main/useSupplierCollection.ts'
import { useSupplierCreate } from '../../composables/firestore/profiles/Supplier/main/useSupplierCreate.ts'

const { profile } = useSupplier()
const { activeProfile } = useSupplierComputed(profile)
const { pillProps, cellProps } = useSupplierInterface(profile)
const { suppliers, global, local } = useSupplierCollection()
const { createSupplier } = useSupplierCreate()

const current = activeProfile

const roster = computed(() => suppliers.value ?? [])
const directoryPills = computed(() =>
  roster.value.map((entry) => pillProps(entry))
)
const totalSuppliers = computed(() => directoryPills.value.length)

const globalSuppliers = computed(() => global?.value ?? [])
const localSuppliers = computed(() => local?.value ?? [])

const creating = createSupplier.state

const onCreate = async () => {
  await createSupplier()
}
</script>
```

`suppliers/[id].vue`:

```ts
<script setup lang="ts">
  import {supplierConfig} from '../../models/profiles/Supplier.model'
</script>
```

## Component scripts (selected profile UI building blocks)

### Professional components (`packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional`)

`Cards/Pill.vue`:

```ts
<script setup lang="ts">
import type { ProfessionalCard } from '../../../../../models/profiles/Professional.model'

const props = defineProps<{ professional: ProfessionalCard.Pill }>()
</script>
```

`Cards/Cell.vue`:

```ts
<script setup lang="ts">
import type { ProfessionalCard } from '../../../../../models/profiles/Professional.model'

const props = defineProps<{ professional: ProfessionalCard.Cell }>()
</script>
```

`Cards/Profile.vue`:

```ts
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  professional?: any
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

const allExperience = computed<any[]>(() => {
  const p: any = props.professional || {}
  const rel = Array.isArray(p?.relevant_experience) ? p.relevant_experience : []
  const oth = Array.isArray(p?.other_experience) ? p.other_experience : []
  return [...rel, ...oth]
})

const experienceYears = computed(() => getExperienceYears(allExperience.value))

const latestExp = computed(() => {
  const list = allExperience.value
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

### Employer components (`packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer`)

`Cards/Pill.vue`:

```ts
<script setup lang="ts">
import type { EmployerCard } from '../../../../../models/profiles/Employer.model'

const props = defineProps<{ employer: EmployerCard.Pill }>()
</script>
```

`Cards/Cell.vue`:

```ts
<script setup lang="ts">
import type { EmployerCard } from '../../../../../models/profiles/Employer.model'

const props = defineProps<{ employer: EmployerCard.Cell }>()
</script>
```

`Cards/Profile.vue`:

```ts
<script setup lang="ts">
const props = defineProps<{
  employer?: any
  navigate?: (profile: any) => void
}>()

const handleClick = () => {
  if (props.navigate && props.employer) {
    props.navigate(props.employer)
  }
}
</script>
```

(Additional employer/professional edit forms pull in rich update helpers but are omitted here for brevity.)

## Component stacks by profile domain

### Professional (fireux-jobs)

- **Pages:** `/professionals` (listing + CTA), `/professionals/[id]` (detail via `OrganismsProfilePage`), `/dashboard/professional-profile` (editor).
- **Composables:** `useProfessional`, `main/useProfessionalComputed`, `main/useProfessionalInterface`, `main/useProfessionalCollection`, `main/useProfessionalUpdate`, `useProfessionalCreate`.
- **Interface helpers:** `useProfessionalInterface(profile)` now adds `ctaFor(target?)` alongside pill/cell/profile mappers.
- **UI components:** `OrganismsProfessionalSections{Single,Collection}`, `JobProfilesProfessionalCards{Pill,Cell,Profile}`, `JobProfilesProfessionalEdit`, experience field components under `Fields/Experience`, modal/sections referenced by dashboards.

| Scope     | File / Component                                                                                                 | Primary trigger                                                                                                                        | Central dependencies                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Page      | `packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue`                                      | Uses sections components; CTA delegates to `useProfessionalCreate().createProfessional` via `useProfessionalInterface(profile).ctaFor` | `useProfessional()`, `useProfessionalComputed(profile)`, `useProfessionalInterface(profile)` |
| Page      | `packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional-profile.vue`                           | Experience saves call `useProfessionalUpdate(profile).setRelevantExperience/Other`                                                     | `useProfessional()` for refs, `useProfessionalComputed(profile)` for merge                   |
| Component | `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Sections/Single.vue`     | Presents pill/cell/profile snapshot for current professional                                                                           | `useProfessional()`, `useProfessionalComputed(profile)`, `useProfessionalInterface(profile)` |
| Component | `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Sections/Collection.vue` | Directory mapping rendered pills for all professionals                                                                                 | `useProfessionalCollection()`, `useProfessionalInterface(profile)`                           |
| Component | `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Edit.vue`                | Emits `save` events wired to `useProfessionalUpdate(profile)` helpers                                                                  | Depends on `useProfessionalComputed(profile)` for current record                             |
| Component | `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Cards/Profile.vue`       | Emits navigation callback, no mutation                                                                                                 | Only reads `useProfessionalInterface` output                                                 |
| Component | `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Cards/Pill.vue`          | Navigation only                                                                                                                        | `useProfessionalInterface.pillProps`                                                         |

### Employer (fireux-jobs)

- **Pages:** `/employers`, `/employers/[id]`, `/dashboard/employer-profile`.
- **Composables:** `useEmployer`, `main/useEmployerComputed`, `main/useEmployerInterface`, `main/useEmployerCollection`, `main/useEmployerCreate`, `main/useEmployerUpdate`.
- **UI components:** `JobProfilesEmployerCards{Pill,Cell,Profile}`, `JobProfilesEmployerEdit`, CTA/Create helpers.

### Chef (misebox tenant)

- **Pages:** `/chefs`, `/chefs/[id]`, `/dashboard/chef-profile` (in the tenant module; mirrors jobs stack).
- **Composables:** `useChef()` bundle exposes profile refs, pills, cells, create handler, and collection utilities.
- **UI components:** `MiseProfilesChefCards{Pill,Cell,Profile}`, `OrganismsProfilesChefEdit`, etc.

### Supplier (misebox tenant)

- **Pages:** `/suppliers`, `/suppliers/[id]`, `/dashboard/supplier-profile`.
- **Composables:** `useSupplier`, `main/useSupplierComputed`, `main/useSupplierInterface`, `main/useSupplierCollection`, `main/useSupplierCreate`.
- **UI components:** `MiseProfilesSupplierCards{Pill,Cell,Profile}`, supporting edit/create components under the tenant runtime.

---

This document should help spot the moving pieces (core composables, page scripts, and component stacks) whenever we introduce new profile types or relocate profile UI away from the shared `Organisms/Profile` templates.
