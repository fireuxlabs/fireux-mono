<template>
  <UDashboardPanel id="console-developer">
    <template #header>
      <LayoutsConsoleNavbar title="Developer Settings" />
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <UPage>
          <UPageBody class="pagebody">
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

            <div v-else class="space-y-6">
              <AppCardsPill
                v-if="previewCard"
                :to="previewCard.to"
                :thumbnail-url="previewCard.thumbnailUrl"
                :display-name="previewCard.displayName"
                :ecosystem="previewCard.ecosystem"
                :badges="previewCard.badges"
                :link="Boolean(previewCard.to)"
                class="block"
              />
              <AppEditDev :app="appSnapshot" />
            </div>
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

const { app, pending, interface } = useApp()

const appSnapshot = (pending.value ? null : app.value) ?? null
const previewCard = computed(() => (appSnapshot ? interface(appSnapshot) : null))

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'console-developer',
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
