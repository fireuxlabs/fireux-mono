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
                    {{ guide.title }}
                  </h1>
                  <p class="mt-1 text-sm text-muted">
                    {{ guide.property.name }}
                  </p>
                </div>
              </div>
            </template>

            <div class="space-y-4">
              <UAlert
                color="neutral"
                variant="soft"
                icon="i-lucide-database"
                title="Demo data today, Firestore editor next"
                description="The public guide is rendered from local demo-safe content. The console route is in place so the same shape can move into the dedicated BuenoHost database."
              />

              <div class="grid gap-3 sm:grid-cols-3">
                <UButton to="/console/bnb/content" color="primary" variant="soft" icon="i-lucide-pencil">
                  Edit information
                </UButton>
                <UButton :to="`/bnb/${guide.slug}`" color="neutral" variant="soft" icon="i-lucide-external-link">
                  Open guide
                </UButton>
                <UButton to="/bnb" color="neutral" variant="soft" icon="i-lucide-list">
                  All guides
                </UButton>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-sm font-semibold">Guide status</h2>
            </template>
            <dl class="space-y-3 text-sm">
              <div>
                <dt class="font-medium text-muted">Status</dt>
                <dd class="capitalize">{{ guide.status }}</dd>
              </div>
              <div>
                <dt class="font-medium text-muted">Sections</dt>
                <dd>{{ guide.sections.length }}</dd>
              </div>
              <div>
                <dt class="font-medium text-muted">Public path</dt>
                <dd class="break-all">/bnb/{{ guide.slug }}</dd>
              </div>
            </dl>
          </UCard>
        </div>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePublishConsoleHeader } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleHeader'
import { alpineViewDemoGuide as guide } from '../../../content/bnbGuides'

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
