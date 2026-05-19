<template>
  <UDashboardPanel id="dashboard-developer">
    <template #header>
      <LayoutsDashboardNavbar title="Developer Settings" />
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
              <UButton to="/" label="Go to Home" variant="soft" class="w-fit" />
            </UPageCard>

            <div v-else class="space-y-6">
              <UPageCard variant="subtle">
                <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div class="space-y-3">
                    <UBadge color="primary" variant="soft" class="w-fit">
                      Developer settings
                    </UBadge>
                    <div class="space-y-2">
                      <h1 class="text-2xl font-semibold tracking-tight text-default">
                        Build and check this app
                      </h1>
                      <p class="max-w-3xl text-sm leading-6 text-dimmed">
                        Developer settings are for app assets, build config,
                        diagnostics, and repo metadata. The local
                        <span class="font-mono">/dev</span> workbench is separate
                        and only exists on a dev server.
                      </p>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <UButton
                      to="/dashboard/admin"
                      color="neutral"
                      variant="soft"
                      icon="i-lucide-badge-check"
                    >
                      App Admin
                    </UButton>
                    <UButton
                      v-if="isLocalDev"
                      to="/dev"
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-terminal"
                    >
                      Dev workbench
                    </UButton>
                  </div>
                </div>
              </UPageCard>

              <AppCardsPill
                v-if="previewCard"
                :to="previewCard.to"
                :thumbnail-url="previewCard.thumbnailUrl"
                :display-name="previewCard.displayName"
                :ecosystem="previewCard.ecosystem"
                :badges="previewCard.badges"
                :show-subtitle="false"
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

const { app, pending, pill: appInterface } = useApp()

const appSnapshot = computed(() => (pending.value ? null : app.value ?? null))
const previewCard = computed(() => (
  appSnapshot.value ? appInterface(appSnapshot.value) : null
))
const isLocalDev = import.meta.dev

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-developer',
    label: 'Developer',
    icon: 'i-lucide-code',
    position: 'top',
    order: 11,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  roles: ['developer'],
})
</script>
