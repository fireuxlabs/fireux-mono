<!-- FILE: packages/core/fireux-core/src/runtime/pages/dashboard/app.vue -->
<template>
  <UDashboardPanel id="dashboard-app">
    <template #header>
      <LayoutsDashboardNavbar title="Admin"/>

    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <div class="mb-2 flex flex-wrap items-center gap-2">
          <OrganismsAppCardsPill v-if="previewCard" v-bind="previewCard" />
          <OrganismsUserCardsPill
            v-if="adminPill"
            v-bind="{ ...adminPill, subtitle: '' }"
          />
        </div>
        <UPage>
          <UPageBody>
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
              class="grid gap-6 lg:grid-cols-3"
            >
              <template #preview>
                <div class="space-y-4 min-w-0 lg:col-span-1">
                  <OrganismsAppCardsProfile
                    v-if="previewCard"
                    v-bind="previewCard"
                    :app="appSnapshot"
                  />
                </div>
              </template>

              <template #core>
                <div class="min-w-0 lg:col-span-2">
                  <OrganismsAppEditAdmin :app="appSnapshot" />
                </div>
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
