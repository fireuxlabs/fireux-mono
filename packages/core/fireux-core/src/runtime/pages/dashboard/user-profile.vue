<!-- packages/core/fireux-core/src/runtime/pages/dashboard/user-profile.vue -->
<template>
  <UDashboardPanel id="user-profile">
    <template #header>
      <LayoutsDashboardNavbar title="Profile" />
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6 space-y-6">
        <MoleculesStateCard
          v-if="isLoading"
          layout="banner"
          loading
          title="Loading profile…"
        />

        <MoleculesStateCard
          v-else-if="!resolvedUser"
          layout="banner"
          title="Profile not found."
        />

        <ClientOnly v-else>
          <LayoutsDashboardProfileEdit class="grid gap-6 lg:grid-cols-2">
            <template #preview>
              <ClientOnly>
                <OrganismsUserPreview />
              </ClientOnly>
            </template>

            <template #core>
              <OrganismsUserEditCore :user="resolvedUser" />
            </template>

            <template #app>
              <OrganismsUserEditApp :user="resolvedUser" />
            </template>
          </LayoutsDashboardProfileEdit>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-user-profile',
    label: 'Profile',
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
useHeadFn?.({ title: 'Profile' })

const { currentUser, isLoading } = useUser()

const resolvedUser = computed(() => currentUser.value ?? null)
</script>
