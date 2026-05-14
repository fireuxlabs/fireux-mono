<template>
  <UDashboardPanel id="console-bnb-overview">
    <template #header>
      <LayoutsConsoleNavbar title="BNB Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <UCard>
            <template #header>
              <div class="flex items-start gap-3">
                <div class="rounded-md bg-primary/10 p-2 text-primary">
                  <Icon name="i-lucide-house-heart" class="size-5" />
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase text-primary">
                    Selected guide
                  </p>
                  <h1 class="mt-1 text-2xl font-semibold text-highlighted">
                    Holiday with Nats
                  </h1>
                  <p class="mt-1 text-sm text-muted">
                    Penthouse Holiday Apartment
                  </p>
                </div>
              </div>
            </template>

            <div class="space-y-4">
              <UAlert
                color="neutral"
                variant="soft"
                icon="i-lucide-database"
                title="Static proof today, Firestore editor next"
                description="The public guide is currently rendered from local proof content. The console route is in place so the next step can move the same shape into the dedicated Sproochli Firestore database."
              />

              <div class="grid gap-3 sm:grid-cols-2">
                <UButton to="/console/bnb/content" color="primary" variant="soft" icon="i-lucide-pencil">
                  Edit information
                </UButton>
                <UButton to="/bnb/holiday-with-nats" color="neutral" variant="soft" icon="i-lucide-external-link">
                  Open public guide
                </UButton>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-sm font-semibold">Current canon</h2>
            </template>
            <ul class="space-y-2 text-sm text-muted">
              <li>One public Sproochli site for now.</li>
              <li>BNB content belongs under the BNB console family.</li>
              <li>Guest pages stay public and simple.</li>
              <li>Editing belongs under /console/bnb.</li>
            </ul>
          </UCard>
        </div>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePublishConsoleHeader } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleHeader'

usePublishConsoleHeader(
  'bnb',
  computed(() => ({
    title: 'Holiday with Nats',
    subtitle: 'Penthouse Holiday Apartment',
    imageUrl: '/img/app/logo.png',
  }))
)

definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-bnb-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    position: 'top',
    requiresSelection: true,
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
