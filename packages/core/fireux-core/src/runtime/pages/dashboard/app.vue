<!-- FILE: packages/core/fireux-core/src/runtime/pages/dashboard/app.vue -->
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
            <OrganismsAppEditPreview />

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
