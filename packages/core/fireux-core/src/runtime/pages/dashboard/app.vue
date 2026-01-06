<!-- FILE: packages/core/fireux-core/src/runtime/pages/dashboard/app.vue -->
<template>
  <UDashboardPanel id="dashboard-app">
    <template #header>
      <LayoutsDashboardNavbar title="Admin"/>

    </template>

    <template #body>
      <div class="space-y-6">
        <div class="flex flex-wrap items-center gap-2">
          <OrganismsAppCardsPill v-if="previewCard" v-bind="previewCard" />
          <OrganismsUserCardsPill
            v-if="adminPill"
            v-bind="{ ...adminPill, subtitle: '' }"
          />
        </div>

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

        <div v-else class="columns-1 md:columns-2 md:[column-gap:1.5rem]">
          <div class="mb-6 break-inside-avoid">
            <OrganismsAppCardsProfile
              v-if="previewCard"
              v-bind="previewCard"
              :app="appSnapshot"
            />
          </div>
          <OrganismsAppEditAdmin :app="appSnapshot" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { computed } from 'vue'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

const { app, pending, card } = useApp()
const { user, card: userCard } = useUser()

const appSnapshot = (pending.value ? null : app.value) ?? null
const previewCard = computed(() => (appSnapshot ? card(appSnapshot) : null))
const adminPill = computed(() => userCard(user.value))

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-app',
    label: 'Admin',
    icon: 'i-lucide-badge-check',
    order: 10,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
