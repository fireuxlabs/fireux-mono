<template>
  <UDashboardPanel id="console-bnb-home">
    <template #header>
      <LayoutsConsoleNavbar title="BNB" />
    </template>

    <template #body>
      <section class="space-y-6">
        <div class="space-y-2">
          <h1 class="text-2xl font-semibold text-highlighted">
            BNB guest guides
          </h1>
          <p class="max-w-2xl text-sm leading-6 text-muted">
            Choose the guest guide to manage. Sproochli is one public app for now, but
            the console still follows the standard FireUX family and target pattern.
          </p>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <UCard v-for="site in bnbSites" :key="site.id">
            <template #header>
              <div class="flex items-start gap-3">
                <UAvatar :src="site.imageUrl" :alt="site.title" size="md" />
                <div class="min-w-0">
                  <h2 class="font-semibold text-highlighted">
                    {{ site.title }}
                  </h2>
                  <p class="text-sm text-muted">
                    {{ site.subtitle }}
                  </p>
                </div>
              </div>
            </template>

            <div class="space-y-4">
              <dl class="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt class="font-medium text-muted">Public route</dt>
                  <dd class="break-all">{{ site.publicPath }}</dd>
                </div>
                <div>
                  <dt class="font-medium text-muted">Source</dt>
                  <dd>{{ site.source }}</dd>
                </div>
              </dl>

              <div class="flex flex-wrap gap-3">
                <UButton color="primary" icon="i-lucide-arrow-right" @click="openSite(site.id)">
                  Manage guide
                </UButton>
                <UButton :to="site.publicPath" color="neutral" variant="soft" icon="i-lucide-external-link">
                  Open public page
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useConsole } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'

const bnbSites = [
  {
    id: 'holiday-with-nats',
    title: 'Holiday with Nats',
    subtitle: 'Penthouse Holiday Apartment',
    publicPath: '/bnb/holiday-with-nats',
    source: 'Static proof content',
    imageUrl: '/img/app/logo.png',
  },
]

const consoleState = useConsole('bnb', {
  liveItems: bnbSites,
  getId: (site) => site.id,
})

async function openSite(id: string) {
  consoleState.selectEntity(id, 'live')
  await navigateTo('/console/bnb/overview')
}

definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-bnb',
    label: 'BNB',
    icon: 'i-lucide-house-heart',
    position: 'bottom',
    requiresSelection: false,
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
