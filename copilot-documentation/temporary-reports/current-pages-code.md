---
title: Current Pages Source
status: working
created: 2025-10-16
---

# Current Pages Source

Captured below are the full contents of the "Has Current" `index.vue` pages for styling review. Paths are relative to the repository root.

## packages/core/fireux-core/src/runtime/pages/users/index.vue

```vue
<!-- packages/ecosystem/fireux-misebox/src/runtime/pages/users/index.vue -->
<template>
  <UPage>
    <UPageBody class="space-y-6">
      <!-- Current (whatever exists: core/app) -->
      <UCard v-if="currentUser">
        <h3 class="mb-3">Your Profile</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <OrganismsUserCardsPill :user="currentUser" />
          <OrganismsUserCardsProfile :user="currentUser" />
        </div>
      </UCard>

      <!-- CTA when missing (global OR app overlay) -->
      <div v-if="showCreate">
        <UPageSection>
          <UPageCTA :title="ctaTitle" variant="soft">
            <template #links>
              <UButton
                size="lg"
                color="primary"
                :label="primaryLabel"
                :loading="ensuring"
                :disabled="ensuring"
                @click="onEnsure"
              />
            </template>
          </UPageCTA>
        </UPageSection>
      </div>

      <!-- All Users (role-aware: app in tenant, core otherwise) -->
      <UCard>
        <div class="flex items-center justify-between mb-3">
          <h3>
            All Users
            <span v-if="hasLocal">(App)</span>
            <span v-else>(Core)</span>
            ({{ usersList.length }})
          </h3>
          <div class="flex items-center gap-2">
            <span class="opacity-70 text-sm">Showing: {{ showing }}</span>
            <UButton
              v-if="hasLocal && !hasGlobalLoaded"
              size="xs"
              variant="ghost"
              @click="fetchGlobal"
            >
              Load global
            </UButton>
          </div>
        </div>

        <div
          v-if="usersList.length"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <OrganismsUserCardsCell
            v-for="u in usersList"
            :key="u.id"
            :user="u"
            class="cursor-default"
          />
        </div>
        <p v-else class="opacity-70">No users found.</p>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUser } from '../../composables/firestore/user/useUser'

// Nuxt macro: declare for TS in package runtime
declare function definePageMeta(meta: any): void

definePageMeta({
  nav: { key: 'users', label: 'Users', icon: 'i-lucide-users' },
})

// Unified user + collections + ensure/delete helpers
const {
  user,
  collection,
  ensureUser,
  hasCoreProfile: hasCoreUserProfile,
  hasAppProfile: hasAppUserProfile,
} = useUser()

/** CTA visibility: show when missing global OR (tenant) app overlay.
 *  In global env hasAppUserProfile is undefined → treat as satisfied.
 */
const showCreate = computed(() => {
  const hasCore = hasCoreUserProfile.value
  const hasApp = hasAppUserProfile?.value ?? true
  return !(hasCore && hasApp)
})
const primaryLabel = computed(() =>
  hasCoreUserProfile.value ? 'Add to this app' : 'Create User'
)

const ctaTitle = computed(() => 'Complete your user profile to continue.')

// CTA action (guarded)
const ensuring = ref(false)
async function onEnsure() {
  if (ensuring.value) return
  ensuring.value = true
  try {
    await ensureUser()
  } finally {
    ensuring.value = false
  }
}

/** Current (already flattened by useUser) */
const currentUser = computed(() => user.value)

/** List plumbing (aligns with ProfileRoot behavior) */
const hasLocal = computed(() => Boolean(collection.local))
const hasGlobalLoaded = computed(() => Boolean(collection.global?.value))
const showing = computed<'local' | 'global'>(() =>
  hasLocal.value ? 'local' : 'global'
)

const usersList = computed<any[]>(
  () =>
    (collection.local?.value as any[]) ??
    (collection.global?.value as any[]) ??
    []
)

function fetchGlobal() {
  collection.fetchGlobal?.()
}
</script>
```

## packages/core/fireux-core/src/runtime/pages/apps/index.vue

```vue
<template>
  <UPage>
    <UPageHeader
      title="Apps"
      description="Browse registered FireUX apps and confirm their core metadata."
      icon="i-lucide-grid"
    >
      <template #actions>
        <UBadge v-if="!isLoading" variant="subtle">{{ total }} total</UBadge>
      </template>
    </UPageHeader>

    <UPageBody class="space-y-6">
      <UCard>
        <template #header>
          <div
            class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 class="text-base font-medium">Registered apps</h3>
              <p class="text-sm text-dimmed">
                {{
                  hasApps
                    ? 'Active entries in the apps collection.'
                    : 'No apps have been registered yet.'
                }}
              </p>
            </div>
            <UBadge v-if="isLoading" variant="soft" color="neutral"
              >Loading</UBadge
            >
            <UBadge v-else variant="outline" color="neutral"
              >{{ total }} apps</UBadge
            >
          </div>
        </template>

        <div v-if="isLoading" class="space-y-3">
          <USkeleton v-for="n in 3" :key="n" class="h-20 w-full" />
        </div>

        <div v-else-if="hasApps" class="grid gap-4 md:grid-cols-2">
          <UPageCard
            v-for="app in appsList"
            :key="app.id"
            variant="subtle"
            :ui="{ container: 'flex flex-col gap-2' }"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs uppercase tracking-wide text-dimmed">App</p>
                <h4 class="text-lg font-semibold leading-tight truncate">
                  {{ displayName(app) }}
                </h4>
                <p class="text-sm text-dimmed mt-1 truncate">
                  ID: {{ app.id }}
                </p>
              </div>
            </div>
            <div class="flex flex-wrap gap-3 text-xs text-dimmed">
              <span class="uppercase tracking-wide">Role: {{ app.role }}</span>
              <span class="uppercase tracking-wide"
                >Ecosystem: {{ app.ecosystem }}</span
              >
              <span v-if="app.app_short_name" class="uppercase tracking-wide">
                Short: {{ app.app_short_name }}
              </span>
            </div>
          </UPageCard>
        </div>

        <div v-else class="py-12 text-center text-dimmed">
          <UIcon name="i-lucide-inbox" class="mx-auto mb-4 size-8" />
          <p class="text-sm font-medium">No apps found</p>
          <p class="text-xs mt-2">
            Add an app via the admin tooling to surface it in this list.
          </p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-medium">Debug</h3>
            <UBadge variant="subtle" color="neutral">
              {{ isLoading ? 'Loading' : 'Ready' }}
            </UBadge>
          </div>
        </template>
        <dl class="grid gap-3 sm:grid-cols-2">
          <div>
            <dt class="text-xs uppercase tracking-wide text-dimmed">Loading</dt>
            <dd class="text-sm font-mono">{{ String(isLoading) }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-dimmed">Count</dt>
            <dd class="text-sm font-mono">{{ total }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-xs uppercase tracking-wide text-dimmed">
              Raw payload
            </dt>
            <dd class="text-xs font-mono whitespace-pre-wrap break-words">
              {{ debugPayload }}
            </dd>
          </div>
        </dl>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppDoc } from '../../models/core/app.model'
import { useApp } from '../../composables/app/useApp'

declare function definePageMeta(meta: any): void

definePageMeta({
  nav: {
    key: 'apps',
    label: 'Apps',
    icon: 'i-lucide-grid',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Apps',
  description: 'Registered FireUX apps',
})

const { apps } = useApp()

const appsList = computed<AppDoc[]>(() => {
  const list = apps.value ?? []
  return [...list].sort((a, b) => {
    const aName = toDisplayName(a)
    const bName = toDisplayName(b)
    return aName.localeCompare(bName)
  })
})

const isLoading = computed(() => apps.value === undefined)
const total = computed(() => appsList.value.length)
const hasApps = computed(() => total.value > 0)

const debugPayload = computed(() => JSON.stringify(apps.value ?? [], null, 2))

function toDisplayName(app: AppDoc) {
  return app?.app_name ?? app?.app_short_name ?? app?.id ?? ''
}

function displayName(app: AppDoc) {
  const value = toDisplayName(app)
  return value.length > 0 ? value : 'Unnamed App'
}
</script>
```

## packages/ecosystem/fireux-misebox/src/runtime/pages/chefs/index.vue

```vue
<!-- packages/ecosystem/fireux-misebox/src/runtime/pages/chefs/index.vue -->
<template>
  <UPage>
    <UContainer class="py-8">
      <OrganismsProfileRoot :config="chefConfig" :onEnsure="onEnsureChef">
        <!-- Current profile (optional) -->
        <template #current-assets="{ profile }">
          <template v-if="profile">
            <OrganismsProfilesChefCardsPill :chef="profile" class="mb-3" />
            <OrganismsProfilesChefCardsCell :chef="profile" />
          </template>
        </template>

        <!-- List items -->
        <template #item="{ profile }">
          <OrganismsProfilesChefCardsCell :chef="profile" />
        </template>
      </OrganismsProfileRoot>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { chefConfig } from '../../models/profiles/Chef.model'
import { useChefCreate } from '../../composables/firestore/profiles/Chef/useChefCreate'

const { createChef } = useChefCreate()

async function onEnsureChef() {
  // minimal: delegate creation; no UI side-effects here
  await createChef()
}
</script>
```

## packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/index.vue

```vue
<template>
  <UPage>
    <UContainer class="py-8">
      <OrganismsProfileRoot
        :config="supplierConfig"
        :onEnsure="onEnsureSupplier"
      >
        <!-- Current profile (optional) -->
        <template #current-assets="{ profile }">
          <template v-if="profile">
            <OrganismsProfilesSupplierCardsPill
              :supplier="profile"
              class="mb-3"
            />
            <OrganismsProfilesSupplierCardsCell :supplier="profile" />
          </template>
        </template>

        <!-- List items -->
        <template #item="{ profile }">
          <OrganismsProfilesSupplierCardsCell :supplier="profile" />
        </template>
      </OrganismsProfileRoot>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { supplierConfig } from '../../models/profiles/Supplier.model'
import { useSupplierCreate } from '../../composables/firestore/profiles/Supplier/useSupplierCreate'

const { createSupplier } = useSupplierCreate()
async function onEnsureSupplier() {
  await createSupplier()
}
</script>
```

## packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue

```vue
<template>
  <UPage>
    <UContainer class="py-8">
      <OrganismsProfileRoot
        :config="agentConfig"
        :onEnsure="onEnsureAgent"
      >
        <!-- Current profile (optional) -->
        <template #current-assets="{ profile }">
          <template v-if="profile">
            <OrganismsProfilesAgentCardsPill
              :agent="profile"
              class="mb-3"
            />
            <OrganismsProfilesAgentCardsCell :agent="profile" />
          </template>
        </template>

        <!-- List items -->
        <template #item="{ profile }">
          <OrganismsProfilesAgentCardsCell :agent="profile" />
        </template>
      </OrganismsProfileRoot>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { agentConfig } from '../../models/profiles/Agent.model'
import { useAgentCreate } from '../../composables/firestore/profiles/Agent/useAgentCreate'

const { createAgent } = useAgentCreate()
async function onEnsureAgent() {
  await createAgent()
}
</script>
```

## packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue

```vue
<template>
  <UPage>
    <UContainer class="py-8">
      <OrganismsProfileRoot
        :config="professionalConfig"
        :onEnsure="onEnsureProfessional"
      >
        <!-- Current profile (optional) -->
        <template #current-assets="{ profile }">
          <template v-if="profile">
            <OrganismsProfilesProfessionalCardsPill
              :professional="profile"
              class="mb-3"
            />
            <OrganismsProfilesProfessionalCardsCell :professional="profile" />
          </template>
        </template>

        <!-- List items -->
        <template #item="{ profile }">
          <OrganismsProfilesProfessionalCardsCell :professional="profile" />
        </template>
      </OrganismsProfileRoot>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { professionalConfig } from '../../models/profiles/Professional.model'
import { useProfessionalCreate } from '../../composables/firestore/profiles/Professional/useProfessionalCreate'

const { createProfessional } = useProfessionalCreate()
async function onEnsureProfessional() {
  await createProfessional()
}
</script>
```
