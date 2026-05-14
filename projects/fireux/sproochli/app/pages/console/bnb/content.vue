<template>
  <UDashboardPanel id="console-bnb-content">
    <template #header>
      <LayoutsConsoleNavbar title="BNB Content" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          color="warning"
          variant="soft"
          icon="i-lucide-construction"
          title="Editor storage is the next step"
          description="This page defines the BNB editing surface, but it does not write yet. The next implementation step is moving bnbGuides.ts into the dedicated Sproochli Firestore database and wiring these fields to that document shape."
        />

        <div class="grid gap-4 lg:grid-cols-2">
          <UCard>
            <template #header>
              <h2 class="text-sm font-semibold">Guest welcome</h2>
            </template>

            <div class="space-y-4">
              <UFormField label="Guide title">
                <UInput model-value="Holiday with Nats" readonly />
              </UFormField>
              <UFormField label="Guest message">
                <UInput model-value="Welcome Family Watson" readonly />
              </UFormField>
              <UFormField label="Stay date copy">
                <UInput model-value="Today - 27th of March" readonly />
              </UFormField>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-sm font-semibold">Firestore target shape</h2>
            </template>

            <pre class="overflow-x-auto rounded-md bg-elevated p-3 text-xs text-toned">sproochli_sites/holiday-with-nats
sproochli_sites/holiday-with-nats/pages/welcome
sproochli_sites/holiday-with-nats/pages/wifi
sproochli_sites/holiday-with-nats/guests/current</pre>
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
    key: 'console-bnb-content',
    label: 'Content',
    icon: 'i-lucide-pencil',
    position: 'top',
    requiresSelection: true,
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
