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
          {{ menuDisplaySummary }}
                </UBadge>
              </div>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div class="rounded-lg border border-default px-3 py-2">
              <div class="text-xs font-medium text-muted">Slug</div>
              <div class="truncate text-sm font-medium text-highlighted">
                {{ slug || 'Unset' }}
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

      <div class="grid gap-4 lg:grid-cols-2">
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-wallet" class="size-5 text-muted" />
              <div>
                <div class="text-base font-semibold text-highlighted">
                  Menu display
                </div>
                <p class="text-sm text-dimmed">{{ menuDisplaySummary }}</p>
              </div>
            </div>
          </template>

          <div class="space-y-3">
            <div class="console-summary-field">
              Code:
              <span class="console-summary-value">{{ currencyCode || 'CHF' }} from Place</span>
            </div>
            <div class="console-summary-field">
              Display:
              <span class="console-summary-value">{{ currencyFormatLabel }}</span>
            </div>
            <div class="console-summary-field">
              Public menu:
              <span class="console-summary-value">
                {{ showCurrency ? 'Currency shown' : 'Currency hidden' }}
              </span>
            </div>
          </div>
        </UCard>
      </div>
    </template>

    <DevFireuxDebugPanel
      title="Kitchen identity"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/console/kitchen/identity/useKitchenConsoleIdentity'

const {
  selectedKitchen,
  selectedMode,
  name,
  tagline,
  placeId,
  debug,
} = useKitchenConsoleIdentity()

const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)
const imageUrl = computed(() =>
  String(kitchen.value?.display_image_url || kitchen.value?.image_url || '')
)
const shortAddress = computed(() => String(kitchen.value?.short_address ?? ''))
const formattedAddress = computed(() => String(kitchen.value?.formatted_address ?? ''))
const slug = computed(() => String(kitchen.value?.slug ?? ''))
const currencyCode = computed(() => String(kitchen.value?.default_currency_code ?? 'CHF'))
const currencyFormat = computed(() => String(kitchen.value?.menu_currency_format ?? 'dash'))
const showCurrency = computed(() => kitchen.value?.menu_show_currency !== false)

const currencyFormatLabel = computed(() => {
  if (currencyFormat.value === 'symbol') return 'Symbol'
  if (currencyFormat.value === 'code') return 'Code'
  return 'Dash'
})
const menuDisplaySummary = computed(
  () =>
    `${currencyCode.value || 'CHF'} · ${currencyFormatLabel.value} · ${
      showCurrency.value ? 'Shown' : 'Hidden'
    }`
)
const imageInitials = computed(() => {
  const text = String(name.value || '').trim()
  if (!text) return 'K'
  const parts = text.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
})
</script>
