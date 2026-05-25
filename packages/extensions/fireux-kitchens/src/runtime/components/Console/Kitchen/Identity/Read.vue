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
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div class="size-24 shrink-0 overflow-hidden rounded-xl border border-default bg-muted sm:size-28">
              <img
                v-if="imageUrl"
                :src="imageUrl"
                :alt="name || 'Kitchen'"
                class="size-full object-cover"
              />
              <div
                v-else
                class="flex size-full items-center justify-center text-2xl font-semibold text-muted"
              >
                {{ imageInitials }}
              </div>
            </div>

            <div class="min-w-0 space-y-3">
              <div>
                <h2 class="text-2xl font-semibold tracking-normal text-highlighted">
                  {{ name || 'Untitled kitchen' }}
                </h2>
                <p v-if="tagline" class="mt-1 text-sm text-dimmed">
                  {{ tagline }}
                </p>
                <p v-if="shortAddress || formattedAddress" class="mt-2 text-sm text-toned">
                  {{ shortAddress || formattedAddress }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <UBadge v-if="selectedMode" color="neutral" variant="subtle">
                  {{ selectedMode }}
                </UBadge>
                <UBadge v-if="placeId" color="neutral" variant="subtle">
                  Place linked
                </UBadge>
                <UBadge color="neutral" variant="soft">
                  {{ currencyDisplaySummary }}
                </UBadge>
              </div>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div class="rounded-lg border border-default px-3 py-2">
              <div class="text-xs font-medium text-muted">Slug</div>
              <div class="truncate text-sm font-medium text-highlighted">
                {{ slug || 'Unset' }}
              </div>
            </div>
            <div class="rounded-lg border border-default px-3 py-2">
              <div class="text-xs font-medium text-muted">Primary language</div>
              <div class="truncate text-sm font-medium text-highlighted">
                {{ primaryLanguageLabel }}
              </div>
            </div>
            <div class="rounded-lg border border-default px-3 py-2">
              <div class="text-xs font-medium text-muted">Public address</div>
              <div class="truncate text-sm font-medium text-highlighted">
                {{ shortAddress || 'Unset' }}
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <div class="grid gap-4 lg:grid-cols-3">
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-languages" class="size-5 text-muted" />
              <div>
                <div class="text-base font-semibold text-highlighted">
                  Languages
                </div>
                <p class="text-sm text-dimmed">{{ languageSummary }}</p>
              </div>
            </div>
          </template>

          <div class="space-y-3">
            <div class="console-summary-field">
              Default:
              <span class="console-summary-value">{{ defaultLanguageLabel }}</span>
            </div>
            <div class="console-summary-field">
              Supported:
              <span class="console-summary-value">
                {{ supportedLanguageLabels.join(', ') || 'Unset' }}
              </span>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-wallet" class="size-5 text-muted" />
              <div>
                <div class="text-base font-semibold text-highlighted">
                  Currency
                </div>
                <p class="text-sm text-dimmed">{{ currencyDisplaySummary }}</p>
              </div>
            </div>
          </template>

          <div class="space-y-3">
            <div class="console-summary-field">
              Code:
              <span class="console-summary-value">{{ currencyCode || 'CHF' }}</span>
            </div>
            <div class="console-summary-field">
              Display:
              <span class="console-summary-value">{{ currencyFormatLabel }}</span>
            </div>
            <div class="console-summary-field">
              Source:
              <span class="console-summary-value">{{ source || 'Unset' }}</span>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-clock" class="size-5 text-muted" />
              <div>
                <div class="text-base font-semibold text-highlighted">
                  Opening Hours
                </div>
                <p class="text-sm text-dimmed">{{ openingSummary }}</p>
              </div>
            </div>
          </template>

          <div class="space-y-3">
            <div class="console-summary-field">
              Timezone:
              <span class="console-summary-value">
                {{ openingTimezone }}
              </span>
            </div>

            <div v-if="openingRows.length" class="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
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

            <p v-if="!openingRows.length" class="text-sm text-dimmed">
              Opening hours are not set yet.
            </p>
          </div>
        </UCard>
      </div>
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
import {
  FIREUX_LANGUAGE_OPTIONS,
} from 'fireux-translation/runtime/languages'
import { computed } from 'vue'
import { useKitchenConsoleIdentity } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleIdentity'
import type {
  KitchenLanguageSettings,
  KitchenOpeningHours,
  Weekday,
} from '../../../../../models/kitchen.model'

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
const currencyFormat = computed(() => String(kitchen.value?.currency_format ?? 'dash'))
const primaryLanguage = computed(() => String(kitchen.value?.primary_language ?? ''))
const languageSettings = computed(
  () => kitchen.value?.language_settings as KitchenLanguageSettings | undefined
)
const openingHours = computed(
  () => kitchen.value?.opening_hours as KitchenOpeningHours | undefined
)

const languageOptionsByCode = new Map(
  FIREUX_LANGUAGE_OPTIONS.map((language) => [language.code, language])
)
const formatLanguage = (code: string) => {
  const language = languageOptionsByCode.get(code)
  return language ? `${language.label} (${language.code})` : code
}
const defaultLanguage = computed(() =>
  String(languageSettings.value?.default_language ?? '')
)
const defaultLanguageLabel = computed(() =>
  defaultLanguage.value ? formatLanguage(defaultLanguage.value) : 'Unset'
)
const primaryLanguageLabel = computed(() =>
  primaryLanguage.value ? formatLanguage(primaryLanguage.value) : defaultLanguageLabel.value
)
const supportedLanguages = computed(() =>
  Array.isArray(languageSettings.value?.supported_languages)
    ? languageSettings.value.supported_languages
    : []
)
const supportedLanguageLabels = computed(() =>
  supportedLanguages.value.map((code) => formatLanguage(code))
)
const languageSummary = computed(() => {
  const count = supportedLanguages.value.length
  const defaultLabel = defaultLanguage.value || 'unset'
  return count ? `${defaultLabel} default, ${count} active` : 'Not set yet'
})
const currencyFormatLabel = computed(() => {
  if (currencyFormat.value === 'symbol') return 'Symbol'
  if (currencyFormat.value === 'code') return 'Code'
  return 'Dash'
})
const currencyDisplaySummary = computed(
  () => `${currencyCode.value || 'CHF'} · ${currencyFormatLabel.value}`
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
const openingSummary = computed(() => {
  if (!openingRows.value.length) return 'Not set yet'
  return `${openingTimezone.value}, weekly schedule set`
})
const imageInitials = computed(() => {
  const text = String(name.value || '').trim()
  if (!text) return 'K'
  const parts = text.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
})
</script>
