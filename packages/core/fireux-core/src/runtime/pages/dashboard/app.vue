<!-- FILE: packages/core/fireux-core/src/runtime/pages/dashboard/app.vue -->
<template>
  <UDashboardPanel id="dashboard-app">
    <template #header>
      <LayoutsDashboardNavbar title="Admin" />
    </template>

    <template #body>
      <div class="fx-panels-stack">
        <!-- Header pills -->
        <div class="flex flex-wrap items-center gap-2">
          <OrganismsAppCardsPill
            v-if="appCard"
            v-bind="appCard"
            :show-subtitle="false"
            :link="Boolean(appCard.to)"
            class="block"
          />

          <OrganismsUserCardsPill
            v-if="userCard"
            v-bind="userCard"
            :show-subtitle="false"
            :link="Boolean(userCard.to)"
            class="block"
          />
        </div>

        <!-- Loading -->
        <UPageCard v-if="pending" variant="subtle">
          <p class="text-sm text-dimmed">Loading app…</p>
        </UPageCard>

        <!-- Missing app -->
        <UPageCard
          v-else-if="!app"
          title="App not available"
          description="No app data found for this environment."
          variant="subtle"
        >
          <UButton to="/" label="Go to Home" variant="soft" class="w-fit" />
        </UPageCard>

        <!-- Main panels -->
        <div v-else class="fx-panels-masonry">
          <div class="fx-panels-masonry__item mb-10">
            <OrganismsAppCardsProfile
              v-if="appCard"
              v-bind="appCard"
              :app="app"
            />
          </div>

          <OrganismsAppEditAdmin />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, definePageMeta } from '#imports'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

const { app, pending, card: appToCard } = useApp()
const { user, card: userToCard } = useUser()

// Reactive mapping lives in the consumer (simple + explicit)
const appCard = computed(() => appToCard(app.value))
const userCard = computed(() => userToCard(user.value))

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