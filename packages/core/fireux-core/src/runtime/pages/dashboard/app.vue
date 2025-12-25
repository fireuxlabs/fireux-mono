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
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <UPage>
          <UPageBody>
            <UPageHeader
              description="Admin-only app configuration."
            />

            <UPageCard v-if="pending" variant="subtle">
              <p class="text-sm text-dimmed">Loading app…</p>
            </UPageCard>

            <UPageCard
              v-else-if="!appSnapshot"
              title="App not available"
              description="No app data found for this environment."
              variant="subtle"
            >
              <UButton to="/" label="Go to FireUX.app" variant="soft" class="w-fit" />
            </UPageCard>

            <LayoutsDashboardProfileEdit
              v-else
              class="grid gap-6 lg:grid-cols-2"
            >
              <template #preview>
                <OrganismsAppPreview :app="appSnapshot" :compact="false" />
              </template>

              <template #core>
                <OrganismsAppEditCore :app="appSnapshot" />
              </template>

              <template #app>
                <OrganismsAppEditApp :app="appSnapshot" />
              </template>
            </LayoutsDashboardProfileEdit>
          </UPageBody>
        </UPage>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'
import OrganismsAppPreview from '../../components/organisms/App/Preview.vue'
import OrganismsAppEditCore from '../../components/organisms/App/Edit/Core.vue'
import OrganismsAppEditApp from '../../components/organisms/App/Edit/App.vue'

const { app, pending } = useApp()

const appSnapshot = (pending.value ? null : app.value) ?? null

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
</script>
