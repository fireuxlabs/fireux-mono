<template>
  <ClientOnly>
    <UPage>
      <UPageHeader :title="pageTitle" :description="pageDescription">
        <template #ctas>
          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-arrow-left"
            to="/kitchens"
          >
            Back
          </UButton>
          <UButton
            size="xs"
            color="primary"
            icon="i-lucide-layout-dashboard"
            :to="dashboardTo"
          >
            Open Kitchen Dashboard
          </UButton>
        </template>
      </UPageHeader>

      <UPageBody class="pagebody">
        <div v-if="loading" class="py-10 text-sm opacity-70">
          Loading kitchen…
        </div>

        <div v-else-if="!kitchen" class="space-y-2">
          <h1 class="text-lg font-semibold">Kitchen Not Found</h1>
          <p>The kitchen you’re looking for doesn’t exist.</p>
          <NuxtLink to="/kitchens" class="text-primary hover:underline">
            ← Back
          </NuxtLink>
        </div>

        <div v-else class="space-y-4">
          <KitchenCardsProfile
            v-if="kitchenProfile"
            :model="kitchenProfile"
          />

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Kitchen Dashboard</div>
            </template>
            <div class="space-y-2 text-sm text-dimmed">
              <p>Upgrade to unlock team, inventory, and operational tools.</p>
              <UButton
                size="xs"
                variant="soft"
                color="primary"
                :to="dashboardTo"
              >
                Upgrade to Kitchen Dashboard
              </UButton>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Location</div>
            </template>

            <div class="space-y-2 text-sm">
              <div v-for="item in details" :key="item.label">
                <div class="text-xs uppercase tracking-wide text-gray-400">
                  {{ item.label }}
                </div>
                <div class="font-medium">
                  {{ item.value }}
                </div>
              </div>

              <div v-if="mapUrl" class="pt-2">
                <UButton
                  size="xs"
                  variant="soft"
                  color="primary"
                  icon="i-lucide-map-pin"
                  :to="mapUrl"
                  target="_blank"
                >
                  View map
                </UButton>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Active jobs</div>
            </template>
            <p class="text-sm text-dimmed">No active jobs listed yet.</p>
          </UCard>
        </div>
      </UPageBody>
    </UPage>

    <template #fallback>
      <div class="py-10 text-sm opacity-70">Loading kitchen…</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useKitchenFetch } from '../../composables/fireux/firestore/objects/kitchen/fetch/useKitchenFetch'
import { useKitchenInterface } from '../../composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface'
import type { Kitchen } from '../../models/objects/kitchen.model'

definePageMeta({
  layout: 'default',
  title: 'Kitchen',
  description: 'View a saved kitchen.',
  head: { title: 'Kitchen' },
})

const { appName } = useFireUXConfig()

const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const dashboardTo = computed(() =>
  docId ? `/kitchens/dashboard/${encodeURIComponent(docId)}` : '/kitchens'
)

const { kitchen: fetchKitchen } = useKitchenFetch()
const rawDoc = docId ? await fetchKitchen(docId) : null

const kitchen = computed<Kitchen | null>(
  () => (rawDoc as any)?.value ?? rawDoc ?? null
)

const { profile } = useKitchenInterface()
const kitchenProfile = computed(() => profile(kitchen.value))
const formatValue = (value: unknown) => {
  if (value == null) return ''
  if (Array.isArray(value)) return value.filter(Boolean).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value).trim()
}

const details = computed(() => {
  const v = kitchen.value
  if (!v) return [] as Array<{ label: string; value: string }>

  const items = [
    {
      label: 'Address',
      value: formatValue(v.formatted_address || v.short_address),
    },
  ]

  return items.filter((item) => item.value)
})

const mapUrl = computed(() => {
  const v = kitchen.value
  if (!v) return ''
  const lat = Number(v.lat)
  const lng = Number(v.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return ''
  return `https://maps.google.com/?q=${lat},${lng}`
})

const loading = computed(() => !rawDoc && !!docId)

const pageTitle = computed(() => kitchen.value?.name || 'Kitchen')
const pageDescription = computed(
  () => kitchen.value?.short_address || kitchen.value?.formatted_address || 'Kitchen details.'
)

useHead({
  title: computed(() => `${appName} | ${pageTitle.value}`),
})
</script>
