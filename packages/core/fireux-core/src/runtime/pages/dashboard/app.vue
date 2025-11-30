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
      <div class="space-y-6">
        <UCard v-if="isAdmin && currentApp" variant="subtle">
          <div class="grid gap-6 lg:grid-cols-2">
            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <OrganismsAppCardsPill :app="currentAppPill" />
                <OrganismsAppCardsCell :app="currentApp" :to="appLink" />
              </div>
              <OrganismsAppCardsProfile :app="currentApp" />
            </div>

            <OrganismsAppEdit :app="currentApp" />
          </div>
        </UCard>

        <UCard v-else-if="isAdmin && !isLoading">
          <div class="py-8 text-center space-y-2">
            <UIcon
              name="i-heroicons-cog-8-tooth"
              class="mx-auto h-12 w-12 text-gray-400"
            />
            <p class="text-sm text-gray-500">App settings not found.</p>
          </div>
        </UCard>

        <UCard v-else-if="!isLoading && !isAdmin">
          <div class="py-8 text-center space-y-2">
            <UIcon
              name="i-heroicons-lock-closed"
              class="mx-auto h-12 w-12 text-gray-400"
            />
            <p class="text-sm text-gray-500">
              You don’t have permission to edit this app.
            </p>
          </div>
        </UCard>

        <UCard v-else>
          <div class="py-8 text-center space-y-2">
            <UIcon
              name="i-heroicons-arrow-path"
              class="mx-auto h-12 w-12 animate-spin text-gray-300"
            />
            <p class="text-sm text-gray-500">Loading app settings…</p>
          </div>
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
import { useAppInterface } from '../../composables/firestore/core/app/state/useAppInterface.ts'

const { app } = useApp()
const { isAdmin } = useUser()
const { pillProps: appPillProps } = useAppInterface(app)
const router = useRouter()

const isLoading = computed(() => app.value === undefined)
const currentApp = computed(() =>
  app.value === undefined ? null : app.value ?? null
)
const appLink = computed(() => {
  const value = currentApp.value
  return value?.id ? `/apps/${value.id}` : null
})
const currentAppPill = computed(() =>
  currentApp.value ? appPillProps(currentApp.value) : null
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
