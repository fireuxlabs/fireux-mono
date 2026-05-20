<template>
  <UDashboardPanel id="app-admin">
    <template #header>
      <LayoutsDashboardNavbar title="Admin" />
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <UPageCard v-if="pending" variant="subtle">
          <p class="text-sm text-dimmed">Loading app…</p>
        </UPageCard>

        <UPageCard
          v-else-if="!app"
          title="App not available"
          description="No app data found for this environment."
          variant="subtle"
        >
          <UButton to="/" label="Go to Home" variant="soft" class="w-fit" />
        </UPageCard>

        <div v-else class="space-y-6">
          <AppCardsProfile v-if="appProfileModel" :model="appProfileModel" />

          <AppEditSectionsInfo :app="app" />

          <AppEditAdmin :app="app" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { useAppProfileView } from '../../composables/fireux/firestore/core/app/utils/view/useAppProfileView'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'

const { app, pending } = useApp()
const { model: appProfileModel } = useAppProfileView(app)

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-admin',
    label: 'Admin',
    icon: 'i-lucide-shield-check',
    position: 'middle',
    order: 10,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
