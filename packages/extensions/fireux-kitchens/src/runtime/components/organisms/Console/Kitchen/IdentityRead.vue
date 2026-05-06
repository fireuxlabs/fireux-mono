<template>
  <div class="space-y-6">
    <UPageCard
      v-if="!selectedKitchen"
      title="No kitchen selected"
      description="Select a kitchen to view its identity."
      variant="subtle"
    />

    <template v-else>
      <UCard>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <UAvatar
            :src="imageUrl"
            :alt="name || 'Kitchen'"
            :text="imageInitials"
            size="3xl"
            class="shrink-0"
          />

          <div class="min-w-0 space-y-2">
            <div>
              <h2 class="text-xl font-semibold text-highlighted">
                {{ name || 'Untitled kitchen' }}
              </h2>
              <p v-if="tagline" class="text-sm text-dimmed">
                {{ tagline }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <UBadge v-if="selectedMode" color="neutral" variant="subtle">
                {{ selectedMode }}
              </UBadge>
              <UBadge v-if="placeId" color="neutral" variant="subtle">
                Place linked
              </UBadge>
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="console-summary-grid">
          <div class="console-summary-field">
            Short address:
            <span class="console-summary-value">{{ shortAddress || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Formatted address:
            <span class="console-summary-value">{{ formattedAddress || 'Unset' }}</span>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">Details</div>
          </div>
        </template>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Place ID:
            <span class="console-summary-value">{{ placeId || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Source:
            <span class="console-summary-value">{{ source || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Slug:
            <span class="console-summary-value">{{ slug || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Currency:
            <span class="console-summary-value">{{ currencyCode || 'CHF' }}</span>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">Opening Hours</div>
          </div>
        </template>

        <div v-if="openingRows.length" class="space-y-3">
          <div class="console-summary-field">
            Timezone:
            <span class="console-summary-value">
              {{ openingTimezone }}
            </span>
          </div>

          <div class="grid gap-2 sm:grid-cols-2">
            <div
              v-for="row in openingRows"
              :key="row.key"
              class="rounded-md border border-default px-3 py-2 text-sm"
            >
              <span class="font-medium text-highlighted">{{ row.label }}</span>
              <span class="ml-2 text-dimmed">{{ row.value }}</span>
            </div>
          </div>

          <p v-if="openingNotes" class="text-sm text-dimmed">
            {{ openingNotes }}
          </p>
        </div>

        <p v-else class="text-sm text-dimmed">
          Opening hours are not set yet.
        </p>
      </UCard>
    </template>

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen identity"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/app/kitchen-console/useKitchenConsoleIdentity'
import type {
  KitchenOpeningHours,
  Weekday,
} from '../../../../models/kitchen.model'

const {
  selectedKitchen,
  selectedMode,
  name,
  tagline,
  placeId,
  debug,
} = useKitchenConsoleIdentity()
const isDev = import.meta.dev

const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)
const imageUrl = computed(() => String(kitchen.value?.image_url ?? ''))
const shortAddress = computed(() => String(kitchen.value?.short_address ?? ''))
const formattedAddress = computed(() => String(kitchen.value?.formatted_address ?? ''))
const source = computed(() => String(kitchen.value?.source ?? ''))
const slug = computed(() => String(kitchen.value?.slug ?? ''))
const currencyCode = computed(() => String(kitchen.value?.currency_code ?? 'CHF'))
const openingHours = computed(
  () => kitchen.value?.opening_hours as KitchenOpeningHours | undefined
)
const weekdays: Array<{ key: Weekday; label: string }> = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
]
const openingTimezone = computed(
  () => String(openingHours.value?.timezone || 'Europe/Zurich')
)
const openingNotes = computed(() => String(openingHours.value?.notes || ''))
const openingRows = computed(() => {
  if (!openingHours.value) return []

  return weekdays.map(({ key, label }) => {
    const windows = openingHours.value?.weekly?.[key] ?? []
    return {
      key,
      label,
      value: windows.length
        ? windows.map((window) => `${window.start}-${window.end}`).join(', ')
        : 'Closed',
    }
  })
})
const imageInitials = computed(() => {
  const text = String(name.value || '').trim()
  if (!text) return 'K'
  const parts = text.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
})
</script>
