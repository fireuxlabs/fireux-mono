<!--
source: proposed-editable.dashboard-pages.md (repo root)
imported: 2025-12-08
note: moved from repo root during doc cleanup
-->

# Proposed Editable Dashboard Pages

Reference snapshots for every dashboard parent involved in core/app edit surfaces. Each snippet reflects the canonical structure every domain should mirror.

## Component Stack Reference

- User: `packages/core/fireux-core/src/runtime/components/organisms/User/Edit/{Preview,Core,App}.vue`
- App: `packages/core/fireux-core/src/runtime/components/organisms/App/Edit/{Preview,Core,App}.vue` (+ `Edit.vue` wrapper)
- Agent: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Agent/Edit/{Preview,Core,App}.vue`
- Professional: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Edit/{Preview,Core,App}.vue`
- Chef: `packages/ecosystem/fireux-misebox/src/runtime/components/Organisms/profiles/Chef/Edit/{Preview,Core,App}.vue`
- Supplier: `packages/ecosystem/fireux-misebox/src/runtime/components/Organisms/profiles/Supplier/Edit/{Preview,Core,App}.vue`

## Generic Profile Template

```vue
<!-- TEMPLATE: packages/ECOSYSTEM_OR_EXTENSION_PATH/src/runtime/pages/dashboard/x/profile.vue -->
<template>
  <UDashboardPanel id="dashboard-x-profile">
    <template #header>
      <UDashboardNavbar title="X Profile">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="hasXProfile" class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <OrganismsProfileEditProfile v-if="coreProfile">
          <template #core>
            <OrganismsProfilesXEditCore :x="coreProfile" />
          </template>

          <template v-if="appProfile" #app>
            <OrganismsProfilesXEditApp :x="appProfile" />
          </template>
        </OrganismsProfileEditProfile>

        <div v-else class="fallback loading">X profile data is loading.</div>
      </div>

      <div v-else class="fallback">X profile not found.</div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrganismsProfileEditProfile from 'fireux-core/runtime/components/organisms/Profile/Edit/Profile.vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { useX } from '../../../composables/firestore/profiles/X/useX.ts'

const profileKey = 'x'
const profileLabel = 'X'
const navTitle = `${profileLabel} Profile`

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-x-profile',
    label: navTitle,
    icon: 'i-lucide-user',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: profileKey,
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useX()
const { user } = useUser()

const hasXProfile = computed(() => {
  const source = user.value?.profiles
  return Array.isArray(source) && source.includes(profileKey)
})
</script>

<style scoped>
.fallback {
  margin: 0;
  padding: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
}

.loading {
  text-transform: none;
  letter-spacing: normal;
  font-size: 0.875rem;
  opacity: 0.7;
}
</style>
```

## User Profile — `packages/core/fireux-core/src/runtime/pages/dashboard/user-profile.vue`

```vue
<!-- packages/core/fireux-core/src/runtime/pages/dashboard/user-profile.vue -->
<template>
  <UDashboardPanel id="user-profile">
    <template #header>
      <UDashboardNavbar title="User Profile" :ui="{ right: 'gap-2' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            icon="i-lucide-eye"
            size="sm"
            variant="soft"
            :color="activeSection === 'preview' ? 'primary' : 'gray'"
            :aria-pressed="activeSection === 'preview'"
            @click="toggleSection"
          >
            <span class="hidden sm:inline">
              {{ activeSection === 'preview' ? 'Show editor' : 'Show preview' }}
            </span>
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="currentUser" class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-2">
          <Transition name="fade-toggle">
            <ClientOnly v-show="showPreview">
              <OrganismsUserPreview
                :user="currentUser"
                :pill="currentUserPill"
                :cell="currentUserCell"
                :link="userLink"
              />
            </ClientOnly>
          </Transition>

          <Transition name="fade-toggle">
            <LayoutsDashboardProfileEdit v-show="showEditor">
              <template #core>
                <OrganismsUserEditCore :user="currentUser" />
              </template>
              <template #app>
                <OrganismsUserEditApp :user="currentUser" />
              </template>
            </LayoutsDashboardProfileEdit>
          </Transition>
        </div>
      </div>

      <div
        v-else
        class="rounded border border-gray-200 bg-white py-8 text-center shadow-sm"
      >
        <UIcon
          name="i-heroicons-user-circle"
          class="mx-auto mb-4 h-12 w-12 text-gray-400"
        />
        <p>{{ isLoading ? 'Loading profile...' : 'Profile not found.' }}</p>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import { useUser } from '../../composables/firestore/core/user/useUser'
import type {
  User,
  UserCard,
} from 'fireux-core/runtime/models/core/user.model.ts'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-user-profile',
    label: 'User Profile',
    icon: 'i-lucide-user',
    order: 30,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

const useHeadFn = (globalThis as any).useHead as
  | undefined
  | ((input: any) => void)
useHeadFn?.({ title: 'Your Profile' })

const { currentUser, pillProps, isLoading } = useUser()
const activeSection = ref<'preview' | 'edit'>('edit')

const breakpoints = useBreakpoints(breakpointsTailwind)
const isDesktop = breakpoints.greaterOrEqual('lg')

const showPreview = computed(
  () => isDesktop.value || activeSection.value === 'preview'
)
const showEditor = computed(
  () => isDesktop.value || activeSection.value === 'edit'
)

const toggleSection = () => {
  activeSection.value = activeSection.value === 'preview' ? 'edit' : 'preview'
}

const buildCell = (
  user: User,
  pill: UserCard.Pill | null
): UserCard.Cell | null => {
  if (!pill) return null
  const role = (user.appUser?.role ?? user.role)?.trim().toLowerCase()
  return {
    ...pill,
    id: user.id ?? '-',
    profiles: [...(pill.badges ?? [])],
    role: role || '-',
    memberships: pill.memberships ?? [],
  }
}

const currentUserPill = computed(() =>
  currentUser.value ? pillProps(currentUser.value) : null
)
const currentUserCell = computed(() =>
  currentUser.value
    ? buildCell(currentUser.value, pillProps(currentUser.value))
    : null
)
const userLink = computed(() =>
  currentUser.value?.id ? `/users/${currentUser.value.id}` : null
)
</script>
```

## App Settings — `packages/core/fireux-core/src/runtime/pages/dashboard/app.vue`

```vue
<!-- packages/core/fireux-core/src/runtime/pages/dashboard/app.vue -->
<template>
  <UDashboardPanel id="dashboard-app">
    <template #header>
      <UDashboardNavbar title="App Settings">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6 space-y-6">
        <!-- Loading state -->
        <UCard v-if="isLoading">
          <div class="fallback loading">Loading app settings…</div>
        </UCard>

        <!-- Not admin -->
        <UCard v-else-if="!isAdmin">
          <div class="fallback">
            You don’t have permission to edit this app.
          </div>
        </UCard>

        <!-- Main app panel -->
        <UCard v-else-if="currentApp" variant="subtle">
          <div class="grid gap-6 lg:grid-cols-2">
            <ClientOnly>
              <OrganismsAppPreview />
            </ClientOnly>

            <OrganismsAppEdit :app="currentApp" />
          </div>
        </UCard>

        <!-- Not found -->
        <UCard v-else>
          <div class="fallback">App settings not found.</div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useApp } from '../../composables/firestore/core/app/useApp.ts'
import { useUser } from '../../composables/firestore/core/user/useUser.ts'

const { app } = useApp()
const { isAdmin } = useUser()
const router = useRouter()

const isLoading = computed(() => app.value === undefined)
const currentApp = computed(() =>
  app.value === undefined ? null : app.value ?? null
)

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-app',
    label: 'App Settings',
    icon: 'i-lucide-badge-check',
    order: 10,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  roles: ['admin'],
})

if (import.meta.client) {
  watch(
    () => ({ loading: isLoading.value, admin: isAdmin.value }),
    ({ loading, admin }) => {
      if (!loading && !admin) {
        router.replace('/dashboard')
      }
    },
    { immediate: true }
  )
}
</script>

<style scoped>
.fallback {
  margin: 0;
  padding: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
}

.loading {
  text-transform: none;
  letter-spacing: normal;
  font-size: 0.875rem;
  opacity: 0.7;
}
</style>
```

## Agent Profile — `packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/profile.vue`

```vue
<template>
  <UDashboardPanel id="dashboard-agent-profile">
    <template #header>
      <UDashboardNavbar :title="navTitle">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="hasAgentProfile" class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <OrganismsProfileEditProfile v-if="coreProfile">
          <template #core>
            <OrganismsProfilesAgentEditCore :agent="coreProfile" />
          </template>

          <template v-if="appProfile" #app>
            <OrganismsProfilesAgentEditApp :agent="appProfile" />
          </template>
        </OrganismsProfileEditProfile>

        <div v-else class="fallback loading">
          Agent profile data is loading.
        </div>
      </div>

      <div v-else class="fallback">Agent profile not found.</div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrganismsProfileEditProfile from 'fireux-core/runtime/components/organisms/Profile/Edit/Profile.vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { useAgent } from '../../../composables/firestore/profiles/Agent/useAgent'
import { agentConfig } from '../../../models/profiles/Agent.model'

const profileKey = 'agent'
const navLabel = agentConfig.navLabel ?? `${agentConfig.profileType} Profile`
const navIcon = agentConfig.navIcon ?? 'i-lucide-user'
const navTitle = navLabel

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-agent-profile',
    label: navLabel,
    icon: navIcon,
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: profileKey,
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useAgent()
const { user } = useUser()

const hasAgentProfile = computed(() => {
  const source = user.value?.profiles
  return Array.isArray(source) && source.includes(profileKey)
})
</script>

<style scoped>
.fallback {
  margin: 0;
  padding: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
}

.loading {
  text-transform: none;
  letter-spacing: normal;
  font-size: 0.875rem;
  opacity: 0.7;
}
</style>
```

## Professional Profile — `packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue`

```vue
<template>
  <UDashboardPanel id="dashboard-professional-profile">
    <template #header>
      <UDashboardNavbar :title="navTitle">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6 space-y-6">
        <UCard v-if="!hasProfessionalProfile">
          <div class="fallback">Professional profile not found.</div>
        </UCard>

        <UCard v-else-if="isProfileLoading">
          <div class="fallback loading">
            Professional profile data is loading.
          </div>
        </UCard>

        <UCard v-else-if="!resolvedCoreProfile">
          <div class="fallback">
            Your professional profile hasn’t been created yet.
          </div>
        </UCard>

        <div v-else class="grid gap-6 lg:grid-cols-2">
          <OrganismsProfilesProfessionalEditPreview />

          <OrganismsProfileEditProfile>
            <template #core>
              <OrganismsProfilesProfessionalEditCore
                :professional="resolvedCoreProfile"
              />
            </template>

            <template v-if="resolvedAppProfile" #app>
              <OrganismsProfilesProfessionalEditApp
                :professional="resolvedAppProfile"
              />
            </template>
          </OrganismsProfileEditProfile>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrganismsProfileEditProfile from 'fireux-core/runtime/components/organisms/Profile/Edit/Profile.vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { useProfessional } from '../../../composables/firestore/profiles/Professional/useProfessional.ts'
import { professionalConfig } from '../../../models/profiles/Professional/supporting'

const profileKey = professionalConfig.id ?? 'professional'
const navLabel =
  professionalConfig.navLabel ?? `${professionalConfig.profileType} Profile`
const navIcon = professionalConfig.navIcon ?? 'i-lucide-user'
const navTitle = navLabel

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-professional-profile',
    label: navLabel,
    icon: navIcon,
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: profileKey,
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useProfessional()
const { user } = useUser()

const hasProfessionalProfile = computed(() => {
  const source = user.value?.profiles
  return Array.isArray(source) && source.includes(profileKey)
})

const isProfileLoading = computed(() => coreProfile.value === undefined)
const resolvedCoreProfile = computed(() => coreProfile.value ?? null)
const resolvedAppProfile = computed(() => appProfile.value ?? null)
</script>

<style scoped>
.fallback {
  margin: 0;
  padding: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
}

.loading {
  text-transform: none;
  letter-spacing: normal;
  font-size: 0.875rem;
  opacity: 0.7;
}
</style>
```

## Chef Profile — `packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/chef/profile.vue`

```vue
<template>
  <UDashboardPanel id="dashboard-chef-profile">
    <template #header>
      <UDashboardNavbar :title="navTitle">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="hasChefProfile" class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <OrganismsProfileEditProfile v-if="coreProfile">
          <template #core>
            <OrganismsProfilesChefEditCore :chef="coreProfile" />
          </template>

          <template v-if="appProfile" #app>
            <OrganismsProfilesChefEditApp :chef="appProfile" />
          </template>
        </OrganismsProfileEditProfile>

        <div v-else class="fallback loading">Chef profile data is loading.</div>
      </div>

      <div v-else class="fallback">Chef profile not found.</div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrganismsProfileEditProfile from 'fireux-core/runtime/components/organisms/Profile/Edit/Profile.vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { useChef } from '../../../composables/firestore/profiles/Chef/useChef'

const profileKey = 'chef'
const navTitle = 'Chef Profile'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-chef-profile',
    label: navTitle,
    icon: 'i-lucide-chef-hat',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: profileKey,
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useChef()
const { user } = useUser()

const hasChefProfile = computed(() => {
  const source = user.value?.profiles
  return Array.isArray(source) && source.includes(profileKey)
})
</script>

<style scoped>
.fallback {
  margin: 0;
  padding: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
}

.loading {
  text-transform: none;
  letter-spacing: normal;
  font-size: 0.875rem;
  opacity: 0.7;
}
</style>
```

## Supplier Profile — `packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/supplier/profile.vue`

```vue
<template>
  <UDashboardPanel id="dashboard-supplier-profile">
    <template #header>
      <UDashboardNavbar :title="navTitle">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="hasSupplierProfile" class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <OrganismsProfileEditProfile v-if="coreProfile">
          <template #core>
            <OrganismsProfilesSupplierEditCore :supplier="coreProfile" />
          </template>

          <template v-if="appProfile" #app>
            <OrganismsProfilesSupplierEditApp :supplier="appProfile" />
          </template>
        </OrganismsProfileEditProfile>

        <div v-else class="fallback loading">
          Supplier profile data is loading.
        </div>
      </div>

      <div v-else class="fallback">Supplier profile not found.</div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrganismsProfileEditProfile from 'fireux-core/runtime/components/organisms/Profile/Edit/Profile.vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { useSupplier } from '../../../composables/firestore/profiles/Supplier/useSupplier'

const profileKey = 'supplier'
const navTitle = 'Supplier Profile'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-supplier-profile',
    label: navTitle,
    icon: 'i-lucide-package',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: profileKey,
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useSupplier()
const { user } = useUser()

const hasSupplierProfile = computed(() => {
  const source = user.value?.profiles
  return Array.isArray(source) && source.includes(profileKey)
})
</script>

<style scoped>
.fallback {
  margin: 0;
  padding: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
}

.loading {
  text-transform: none;
  letter-spacing: normal;
  font-size: 0.875rem;
  opacity: 0.7;
}
</style>
```
