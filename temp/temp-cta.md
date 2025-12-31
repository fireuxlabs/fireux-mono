# CTA Inventory (Runtime)

Repo-truth snapshot (runtime only) focused on the **CTA surface** (`UPageCTA`).

- Included `CTA.vue` files: 9
- Last updated: 2025-12-31

This file has two goals:
1) **Current state**: what each CTA renders today.
2) **Desired state**: the lean/clean canon we want across entities and objects.

---

## Current state

### Core — App CTA

Path: `packages/core/fireux-core/src/runtime/components/organisms/App/CTA.vue`

Pattern: **Ensure/Create CTA** (preview only when ready)

```vue
<UPageCTA
  title="Current app"
  description="The app currently resolved for this runtime."
  variant="naked"
>
  <template #default>
    <OrganismsAppCardsPreview v-if="isResolved && isInitialized" />
    <OrganismsAppCreateSystem v-else />
    <UButton variant="ghost" size="sm" to="/learn-more">Learn more</UButton>
  </template>
</UPageCTA>

// state: const { isResolved, isInitialized } = useApp()
```

Notes:
- Preview is **inside** the CTA surface.
- Preview is **pessimistic** (requires `isResolved && isInitialized`).
- Create/System owns the flow.

### Core — User CTA

Path: `packages/core/fireux-core/src/runtime/components/organisms/User/CTA.vue`

Pattern: **Ensure/Create CTA** (preview only when ready)

```vue
<UPageCTA title="Current user" description="..." variant="naked">
  <OrganismsUserCardsPreview v-if="isResolved && isInitialized" />
  <OrganismsUserCreateSystem v-else />
</UPageCTA>

// state: const { isResolved, isInitialized } = useUser()
```

Notes:
- CTA is intentionally “dumb”: it only chooses Preview vs System.

### Extensions — Blog CTA

Path: `packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/CTA.vue`

Pattern: **Navigate CTA** (permission-gated)

```vue
<UPageCTA v-if="canPublishBlog" title="Publish a post" :description="..." variant="naked">
  <template #links>
    <UButton color="primary" size="lg" to="/blog/create">Draft a post</UButton>
  </template>
</UPageCTA>
```

Notes:
- This is a classic “link CTA”. No create-system needed.

### Extensions — Product CTA

Path: `packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/CTA.vue`

Pattern: **Navigate CTA** (permission-gated)

```vue
<UPageCTA v-if="canPublishProduct" title="Add a product" description="..." variant="naked">
  <template #default>
    <p class="text-sm ...">...</p>
  </template>
  <template #links>
    <UButton color="primary" size="lg" to="/products/create">Create product</UButton>
  </template>
</UPageCTA>
```

### Extensions — Job CTA

Path: `packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/CTA.vue`

Pattern: **Hybrid** (depends on having an Agent profile)

```vue
<OrganismsProfilesAgentCTA v-if="!hasAgentProfile" />

<UPageCTA v-else title="Post a job" description="..." variant="naked">
  <template #default>
    <!-- shows current Agent profile cell/pill -->
  </template>
  <template #links>
    <UButton color="primary" size="lg" to="/jobs/create">Create job posting</UButton>
  </template>
</UPageCTA>
```

Notes:
- Agent-ness is treated as a prerequisite, and the CTA delegates to the Agent CTA when missing.

### Extensions — Agent CTA

Path: `packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/CTA.vue`

Pattern: **Ensure/Create CTA** (CTA chooses CreateSystem vs preview)

```vue
<UPageCTA title="Agent profile" description="..." variant="naked">
  <template #default>
    <div v-if="!hasAgentProfile">
      <OrganismsProfilesAgentCreateSystem />
    </div>

    <div v-else>
      <UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
        {{ showCellView ? 'Show pill' : 'Show cell' }}
      </UButton>

      <OrganismsProfilesAgentCardsCell v-if="showCellCard && cell" :agent="cell" />
      <OrganismsProfilesAgentCardsPill v-else-if="pill" :agent="pill" />
    </div>
  </template>
</UPageCTA>

// state: const { pill, cell } = useAgent(); const hasAgentProfile = computed(() => hasProfile('agent'))
```

Notes:
- This is currently a “fat CTA” (pill/cell toggle + preview selection live here).
- It does correctly treat `Create/System.vue` as the system (no `CtaSystem` files).

### Extensions — Professional CTA

Path: `packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/CTA.vue`

Pattern: **Ensure/Create CTA** (CTA chooses CreateSystem vs preview)

```vue
<UPageCTA title="Professional profile" description="..." variant="naked">
  <template #default>
    <div v-if="!hasProfessionalProfile">
      <OrganismsProfilesProfessionalCreateSystem />
    </div>

    <div v-else>
      <UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
        {{ showCellView ? 'Show pill' : 'Show cell' }}
      </UButton>

      <OrganismsProfilesProfessionalCardsCell v-if="showCellCard && cell" :professional="cell" />
      <OrganismsProfilesProfessionalCardsPill v-else-if="pill" :professional="pill" />
    </div>
  </template>
</UPageCTA>
```

### Ecosystem — Chef CTA

Path: `packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue`

Pattern: **Ensure/Create CTA** (CTA chooses CreateSystem vs preview)

```vue
<UPageCTA title="Chef profile" description="..." variant="naked">
  <template #default>
    <div v-if="!hasChefProfile">
      <OrganismsProfilesChefCreateSystem />
    </div>

    <div v-else>
      <UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
        {{ showCellView ? 'Show pill' : 'Show cell' }}
      </UButton>

      <OrganismsProfilesChefCardsCell v-if="showCellCard && cell" :chef="cell" />
      <OrganismsProfilesChefCardsPill v-else-if="pill" :chef="pill" />
    </div>
  </template>
</UPageCTA>
```

### Ecosystem — Supplier CTA

Path: `packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/CTA.vue`

Pattern: **Ensure/Create CTA** (CTA chooses CreateSystem vs preview)

```vue
<UPageCTA title="Supplier profile" description="..." variant="naked">
  <template #default>
    <div v-if="!hasSupplierProfile">
      <OrganismsProfilesSupplierCreateSystem />
    </div>

    <div v-else>
      <UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
        {{ showCellView ? 'Show pill' : 'Show cell' }}
      </UButton>

      <OrganismsProfilesSupplierCardsCell v-if="showCellCard && cell" :supplier="cell" />
      <OrganismsProfilesSupplierCardsPill v-else-if="pill" :supplier="pill" />
    </div>
  </template>
</UPageCTA>
```

---

## Desired state (lean + clean)

### Canon: two CTA families

1) **Navigate / Link CTA**
   - Presentational CTA that points somewhere (`to="..."`).
   - Can be gated by a single boolean (permissions) but should avoid embedding multi-step ensure logic.

2) **Ensure / Create CTA**
   - Presentational CTA that only chooses between:
     - a Preview (when ready), and
     - a self-contained `Create/System` component (when not ready).
   - All auth/ensure/loading/error logic lives in the System component.

### Canon: the “App-style” lean CTA shape

```vue
<UPageCTA title="…" description="…" variant="naked">
  <Preview v-if="isResolved && isInitialized" />
  <CreateSystem v-else />
</UPageCTA>
```

Rules:
- **Preview must be inside the CTA** (no content above the CTA that looks like “preview”).
- **CTA is pessimistic**: don’t show Preview until ready (`isResolved && isInitialized`).
- **No slot-props system contract** for new work. Prefer a self-rendering System component.
- **No “fat CTA”**: CTA should not compute multi-step state machines.
- Secondary actions (like “Learn more”) are okay, but should be consistent and not carry ensure logic.

### Where CTA logic should live (computed guidance)

- Each entity/object should have a *single canonical* computed source for CTA gating and labels.
- Prefer `.../utils/view/use*Computed.ts` for cross-cutting view state (e.g. `isResolved`, `isInitialized`, `cta`).
- Avoid duplicating “base profile CTA state” across per-profile computed composables.

Concrete desired direction for profiles:
- **No generic Profile Create/System**. “Profile” is shared plumbing; creation UX should be a delta.
- Each domain profile gets its own System component (delta point): `ChefCreateSystem`, `SupplierCreateSystem`, `AgentCreateSystem`, `ProfessionalCreateSystem`.
- Shared profile *readiness* signals should centralize in `useProfileComputed` (merge core+tenant overlay, resolved/initialized flags).
- `useChefComputed` / `useSupplierComputed` / `useAgentComputed` / `useProfessionalComputed` should only add *domain-specific* derived data (fields, validations, display helpers), not re-implement CTA state machines.

### Target refactor candidates (when we start cleaning)

- Stop using the generic slot-props `OrganismsProfileCreateSystem` from the CTA layer.
- For each profile (Chef/Supplier/Agent/Professional):
  - Add a profile-specific, self-rendering CTA System component (delta point).
  - Update the profile CTA to the lean “Preview vs System” toggle.

## Ecosystem — Chef CTA

Path: `packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue`

```vue
<!-- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue -->
<template>
  <UPageCTA
    title="Chef profile"
    description="Showcase your culinary strengths so kitchens can match you to the right stations and menus."
    variant="naked"
  >
    <template #default>
      <div v-if="!hasChefProfile" class="space-y-2">
        <OrganismsProfilesChefCreateSystem />
      </div>

      <div v-else class="space-y-4">
        <div class="flex justify-end">
          <UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
            {{ showCellView ? 'Show pill' : 'Show cell' }}
          </UButton>
        </div>

        <div class="space-y-4">
          <OrganismsProfilesChefCardsCell v-if="showCellCard && cell" :chef="cell" />
          <OrganismsProfilesChefCardsPill v-else-if="pill" :chef="pill" />
          <p v-else class="text-sm text-slate-500">No chef profile loaded.</p>
        </div>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useChef } from '../../../../composables/fireux/firestore/profiles/Chef/useChef'

const { pill, cell } = useChef()
const { hasProfile } = useUser()

const hasChefProfile = computed(() => hasProfile('chef'))

const canToggle = computed(() => Boolean(cell.value))
const showCellView = ref(false)
const showCellCard = computed(() => canToggle.value && showCellView.value)
const toggleView = () => {
  if (!canToggle.value) return
  showCellView.value = !showCellView.value
}

watch(canToggle, (enabled: boolean) => {
  if (!enabled) showCellView.value = false
})
</script>
```

## Ecosystem — Supplier CTA

Path: `packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/CTA.vue`

```vue
<template>
  <UPageCTA
    title="Supplier profile"
    description="Introduce your products to chefs and venues across the FireUX network."
    variant="naked"
  >
    <template #default>
      <div v-if="!hasSupplierProfile" class="space-y-2">
        <OrganismsProfilesSupplierCreateSystem />
      </div>

      <div v-else class="space-y-4">
        <div class="flex justify-end">
          <UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
            {{ showCellView ? 'Show pill' : 'Show cell' }}
          </UButton>
        </div>

        <div class="space-y-4">
          <OrganismsProfilesSupplierCardsCell
            v-if="showCellCard && cell"
            :supplier="cell"
          />
          <OrganismsProfilesSupplierCardsPill v-else-if="pill" :supplier="pill" />
          <p v-else class="text-sm text-slate-500">No supplier profile loaded.</p>
        </div>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { useSupplier } from '../../../../composables/fireux/firestore/profiles/Supplier/useSupplier.ts'

const { pill, cell } = useSupplier()
const { hasProfile } = useUser()

const hasSupplierProfile = computed(() => hasProfile('supplier'))

const canToggle = computed(() => Boolean(cell.value))
const showCellView = ref(false)
const showCellCard = computed(() => canToggle.value && showCellView.value)
const toggleView = () => {
  if (!canToggle.value) return
  showCellView.value = !showCellView.value
}

watch(canToggle, (enabled: boolean) => {
  if (!enabled) showCellView.value = false
})
</script>
```

## Extensions — Blog CTA

Path: `packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/CTA.vue`

```vue
<template>
  <UPageCTA
    v-if="showCTA"
    title="Publish a post"
    :description="ctaDescription"
    variant="naked"
  >
    <template #links>
      <UButton color="primary" size="lg" to="/blog/create">
        Draft a post
      </UButton>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBlogPermissions } from '../../../../composables/useBlogPermissions'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

const { canPublishBlog } = useBlogPermissions()
const { appName } = useFireUXConfig()

const showCTA = computed(() => canPublishBlog.value)
const ctaDescription = computed(
  () => `Share updates, releases, and stories for ${appName}.`
)
</script>
```

## Extensions — Job CTA

Path: `packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/CTA.vue`

```vue
<template>
  <OrganismsProfilesAgentCTA v-if="!hasAgentProfile" />
  <UPageCTA
    v-else
    title="Post a job"
    description="Create a job posting to reach professionals across this runtime."
    variant="naked"
  >
    <template #default>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <h2>{{ currentProfileTitle }}</h2>
          </template>

          <div class="space-y-4">
            <OrganismsProfilesAgentCardsCell
              v-if="cell"
              :agent="cell"
              class="cta-agent-cell"
            />
            <OrganismsProfilesAgentCardsPill v-if="pill" :agent="pill" />
          </div>
        </UCard>
      </div>
    </template>

    <template #links>
      <UButton
        color="primary"
        size="lg"
        to="/jobs/create"
      >
        Create job posting
      </UButton>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAgent } from '../../../../composables/fireux/firestore/profiles/Agent/useAgent.ts'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'

const { pill, cell } = useAgent()
const { hasProfile } = useUser()

const hasAgentProfile = computed(() => hasProfile('agent'))
const currentProfileTitle = 'Your agent profile'
</script>

<style scoped>

            v-else-if="pill"
            :professional="pill"
          />
          <p v-else class="text-sm text-slate-500">
            No professional profile loaded.
          </p>
        </div>
              <div class="space-y-6">
                <UCard>
                  <template #header>
                    <h2>{{ currentProfileTitle }}</h2>
                  </template>

                  <div class="space-y-4">
                    <OrganismsProfilesAgentCardsCell
                      v-if="cell"
                      :agent="cell"
                      class="cta-agent-cell"
                    />
                    <OrganismsProfilesAgentCardsPill v-if="pill" :agent="pill" />
                  </div>
                </UCard>
              </div>
import { useProfessional } from '../../../../composables/fireux/firestore/profiles/Professional/useProfessional'

const { pill, cell } = useProfessional()
const { hasProfile } = useUser()

const hasProfessionalProfile = computed(() => hasProfile('professional'))

const canToggle = computed(() => Boolean(cell.value))
const showCellView = ref(false)

      >
        <slot
          v-for="it in items"
          name="item"
          :key="it?.id || it?.uid"
          :profile="it"
        />
      </div>
      <p v-else class="opacity-70">{{ emptyText }}</p>
    </UPageSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    current?: any | null
    items?: any[]
    cta?: string
    ctaLabel?: string
    emptyText?: string
    more?: boolean
    moreLabel?: string
    ctaVisible?: boolean
  }>(),
  {
    current: null,
    items: () => [],
    cta: 'Complete your profile',
    ctaLabel: 'Create',
    emptyText: 'Nothing to show yet.',
    more: false,
    moreLabel: 'Load more',
    ctaVisible: undefined,
  }
)

defineEmits<{ (e: 'ensure'): void; (e: 'load-more'): void }>()

const shouldShowCta = computed(() =>
  props.ctaVisible !== undefined ? props.ctaVisible : props.current == null
)
</script>
```
