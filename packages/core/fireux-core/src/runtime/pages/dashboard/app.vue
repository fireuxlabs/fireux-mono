<!-- FILE: packages/core/fireux-core/src/runtime/pages/dashboard/app.vue -->
<template>
  <UDashboardPanel id="dashboard-app">
    <template #header>
      <LayoutsDashboardNavbar title="Admin" />
    </template>

    <template #body>
      <div class="fx-panels-stack">
        <div class="flex flex-wrap items-center gap-2">
          <OrganismsAppCardsPill
            v-if="!pending && app"
            v-bind="{ ...card(app), subtitle: '' }"
          />
          <OrganismsUserCardsPill v-bind="{ ...userCardSafe(user), subtitle: '' }" />
        </div>

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

        <div v-else class="fx-panels-masonry">
          <div class="fx-panels-masonry__item">
            <OrganismsAppCardsProfile
              v-bind="card(app)"
              :app="app"
            />
          </div>
          <OrganismsAppEditAdmin :app="app" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

const { app, pending, card } = useApp()
const { user, card: userCard } = useUser()

const safeUserPill = (() => {
  const fallback = {
    to: '',
    avatar: '',
    title: 'User',
    subtitle: '',
    badges: [],
  }

  return user.value ? userCard(user.value) ?? fallback : fallback
})()


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
