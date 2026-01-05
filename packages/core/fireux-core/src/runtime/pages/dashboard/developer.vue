<template>
  <UDashboardPanel id="dashboard-developer">
    <template #header>
      <LayoutsDashboardNavbar title="Developer Settings" />
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <UPage>
          <UPageBody>
            <UPageHeader description="Developer-only app diagnostics and controls." />

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

            <OrganismsAppDeveloper v-else :app="appSnapshot" />
          </UPageBody>
        </UPage>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'
import OrganismsAppDeveloper from '../../components/organisms/App/Developer.vue'

const { app, pending, card } = useApp()

const appSnapshot = (pending.value ? null : app.value) ?? null
void card

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-developer',
    label: 'Developer',
    icon: 'i-lucide-code',
    order: 11,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
