<template>
  <section class="space-y-4">
    <UAlert
      v-if="!selectedProperty"
      color="neutral"
      variant="soft"
      title="Select a property"
      description="Choose a live property or simulation before opening the property overview."
    />

    <template v-else>
      <UCard>
        <div class="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <img
            :src="selectedProperty.identity.image_url"
            :alt="selectedProperty.identity.name"
            class="aspect-video w-full rounded-md object-cover lg:aspect-square"
          >

          <div class="space-y-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <UBadge color="primary" variant="soft">
                  {{ selectedModeLabel }}
                </UBadge>
                <h2 class="mt-3 text-2xl font-semibold tracking-normal text-highlighted">
                  {{ selectedProperty.identity.name }}
                </h2>
                <p class="mt-1 text-muted">
                  {{ propertyAddress }}
                </p>
              </div>

              <UBadge color="neutral" variant="outline">
                {{ selectedProperty.status }}
              </UBadge>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div class="rounded-md border border-default p-3">
                <p class="text-xs font-medium uppercase text-muted">Type</p>
                <p class="mt-1 font-medium text-highlighted">{{ selectedProperty.identity.property_type }}</p>
              </div>
              <div class="rounded-md border border-default p-3">
                <p class="text-xs font-medium uppercase text-muted">Units</p>
                <p class="mt-1 font-medium text-highlighted">{{ selectedProperty.identity.unit_count }}</p>
              </div>
              <div class="rounded-md border border-default p-3">
                <p class="text-xs font-medium uppercase text-muted">Country</p>
                <p class="mt-1 font-medium text-highlighted">{{ selectedProperty.identity.country }}</p>
              </div>
              <div class="rounded-md border border-default p-3">
                <p class="text-xs font-medium uppercase text-muted">Property ID</p>
                <p class="mt-1 truncate font-mono text-sm text-highlighted">{{ propertyId }}</p>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <div class="grid gap-4 md:grid-cols-3">
        <UCard>
          <p class="text-sm text-muted">Live properties</p>
          <p class="mt-2 text-3xl font-semibold text-highlighted">{{ counts.live }}</p>
        </UCard>
        <UCard>
          <p class="text-sm text-muted">Demo simulations</p>
          <p class="mt-2 text-3xl font-semibold text-highlighted">{{ counts.demo }}</p>
        </UCard>
        <UCard>
          <p class="text-sm text-muted">Test property</p>
          <p class="mt-2 text-3xl font-semibold text-highlighted">{{ counts.test }}</p>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <h3 class="font-semibold text-highlighted">Guest information sections</h3>
        </template>

        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <UButton
            v-for="section in propertySections"
            :key="section.to"
            :to="section.to"
            color="neutral"
            variant="soft"
            :icon="section.icon"
            class="justify-start"
          >
            {{ section.label }}
          </UButton>
        </div>
      </UCard>
    </template>

    <DevFireuxDebugPanel
      title="Property overview"
      scope="console"
      :data="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resolveConsoleModeLabel } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { usePropertyConsoleOverview } from '../../../../composables/fireux/console/property/usePropertyConsoleOverview'

const {
  selectedProperty,
  selectedMode,
  propertyId,
  group,
  debug: consoleDebug,
} = usePropertyConsoleOverview()

const selectedModeLabel = computed(() => resolveConsoleModeLabel(selectedMode.value))
const counts = computed(() => ({
  live: selectedMode.value === 'live' ? group.value.count : 0,
  demo: selectedMode.value === 'demo' ? group.value.count : 0,
  test: selectedMode.value === 'test' ? group.value.count : 0,
}))
const propertyAddress = computed(() =>
  [
    selectedProperty.value?.identity.address_line,
    selectedProperty.value?.identity.city,
    selectedProperty.value?.identity.postcode,
    selectedProperty.value?.identity.country,
  ]
    .filter(Boolean)
    .join(', ')
)
const propertySections = [
  { label: 'Welcome', to: '/console/property/welcome', icon: 'i-lucide-hand-heart' },
  { label: 'Check-in', to: '/console/property/check-in', icon: 'i-lucide-key-round' },
  { label: 'Checkout', to: '/console/property/checkout', icon: 'i-lucide-door-open' },
  { label: 'Emergency', to: '/console/property/emergency', icon: 'i-lucide-siren' },
  { label: 'House Rules', to: '/console/property/house-rules', icon: 'i-lucide-clipboard-check' },
  { label: 'Apartment Guide', to: '/console/property/apartment-guide', icon: 'i-lucide-info' },
  { label: 'Rubbish & Recycling', to: '/console/property/rubbish-recycling', icon: 'i-lucide-recycle' },
  { label: 'Parking', to: '/console/property/parking', icon: 'i-lucide-car' },
  { label: 'Local Guide', to: '/console/property/local-guide', icon: 'i-lucide-map-pin' },
  { label: 'Updates', to: '/console/property/updates', icon: 'i-lucide-megaphone' },
] as const

const debug = computed(() => ({
  selectedMode: selectedMode.value,
  propertyId: propertyId.value,
  selectedProperty: selectedProperty.value,
  counts: counts.value,
  console: consoleDebug.value,
}))
</script>
