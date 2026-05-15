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
          description="This page defines the BuenoHost editing surface, but it does not write yet. The next implementation step is moving bnbGuides.ts into Firestore and wiring these fields to that document shape."
        />

        <div class="grid gap-4 lg:grid-cols-2">
          <UCard>
            <template #header>
              <h2 class="text-sm font-semibold">Guest welcome</h2>
            </template>

            <div class="space-y-4">
              <UFormField label="Guide title">
                <UInput :model-value="guide.title" readonly />
              </UFormField>
              <UFormField label="Guest message">
                <UInput :model-value="guide.guest_message?.title || ''" readonly />
              </UFormField>
              <UFormField label="Stay date copy">
                <UInput :model-value="guide.guest_message?.subtitle || ''" readonly />
              </UFormField>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-sm font-semibold">Firestore target shape</h2>
            </template>

            <pre class="overflow-x-auto rounded-md bg-elevated p-3 text-xs text-toned">buenohost_guides/{{ guide.slug }}
buenohost_guides/{{ guide.slug }}/sections/welcome
buenohost_guides/{{ guide.slug }}/sections/wifi
buenohost_guides/{{ guide.slug }}/publishing/public</pre>
          </UCard>
        </div>

        <UCard>
          <template #header>
            <h2 class="text-sm font-semibold">Enabled sections</h2>
          </template>

          <div class="grid gap-3 md:grid-cols-2">
            <div
              v-for="section in enabledSections"
              :key="section.id"
              class="rounded-md border border-default p-3"
            >
              <div class="flex items-start gap-3">
                <Icon :name="section.icon" class="mt-0.5 size-4 text-primary" />
                <div>
                  <p class="font-semibold text-highlighted">{{ section.title }}</p>
                  <p class="mt-1 text-sm leading-6 text-muted">{{ section.summary }}</p>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePublishConsoleHeader } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleHeader'
import { alpineViewDemoGuide as guide, getEnabledBnbSections } from '../../../content/bnbGuides'

const enabledSections = computed(() => getEnabledBnbSections(guide))

usePublishConsoleHeader(
  'bnb',
  computed(() => ({
    title: guide.title,
    subtitle: guide.property.name,
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
