<template>
  <div class="space-y-6">
    <UPageCard
      v-if="!kitchenId"
      title="No kitchen selected"
      description="Select a kitchen to view its identity."
      variant="subtle"
    />

    <UPageCard
      v-else-if="!selectedKitchen"
      title="Loading kitchen identity"
      description="Restoring the selected kitchen."
      variant="subtle"
    />

    <template v-else>
      <UCard>
        <div
          class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              class="size-24 shrink-0 overflow-hidden rounded-xl border border-default bg-muted sm:size-28"
            >
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
                <h2
                  class="text-2xl font-semibold tracking-normal text-highlighted"
                >
                  {{ name || 'Untitled kitchen' }}
                </h2>
                <p v-if="tagline" class="mt-1 text-sm text-dimmed">
                  {{ tagline }}
                </p>
                <p
                  v-if="shortAddress || formattedAddress"
                  class="mt-2 text-sm text-toned"
                >
                  {{ shortAddress || formattedAddress }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
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
        <UCard v-if="hasDeliveryMenus">
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
            <div class="workspace-summary-field">
              Code:
              <span class="workspace-summary-value">{{
                currencyCode || 'Missing'
              }}</span>
            </div>
            <div class="workspace-summary-field">
              Display:
              <span class="workspace-summary-value">{{
                currencyFormatLabel
              }}</span>
            </div>
            <div class="workspace-summary-field">
              Menu display:
              <span class="workspace-summary-value">
                {{ showCurrency ? 'Currency shown' : 'Currency hidden' }}
              </span>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-truck" class="size-5 text-muted" />
              <div>
                <div class="text-base font-semibold text-highlighted">
                  Delivery fulfilment
                </div>
                <p class="text-sm text-dimmed">
                  {{ deliveryZones.length }} delivery zone{{
                    deliveryZones.length === 1 ? '' : 's'
                  }}
                </p>
              </div>
            </div>
          </template>

          <div v-if="deliveryZones.length" class="space-y-2">
            <div
              v-for="zone in deliveryZones"
              :key="zone.id"
              class="workspace-summary-field"
            >
              {{ zone.label }}
              <span class="workspace-summary-value">
                Min {{ currencyCode || 'currency' }}
                {{ zone.min_order_chf || 0 }} · fee
                {{ currencyCode || 'currency' }} {{ zone.fee_chf || 0 }}
              </span>
            </div>
          </div>

          <p v-else class="text-sm text-dimmed">
            No delivery zones configured.
          </p>
        </UCard>
      </div>
    </template>

    <DevDebugPanel
      title="Kitchen identity"
      scope="workspace"
      object-origin="fetched"
      :objects="{ selectedKitchen, place, menus }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: render shared Place identity and currency in Kitchen workspace summaries.
import { computed } from 'vue'
import { useKitchenWorkspaceIdentity } from '../../../composables/workspace/identity/useKitchenWorkspaceIdentity'
import { useKitchenWorkspacePlace } from '../../../composables/workspace/identity/useKitchenWorkspacePlace'
import { useKitchenWorkspaceMenus } from '../../../composables/workspace/Menus/useKitchenWorkspaceMenus'
import { readKitchenFulfilmentConfig } from '../../../utils/kitchen-readers'
import { menuAcceptsOrderType } from '../../../../menu/utils/menu-ordering-policy'

const {
  selectedKitchen,
  kitchenId,
  name: kitchenName,
  tagline: kitchenTagline,
  placeId,
  debug,
} = useKitchenWorkspaceIdentity()
const { place, currencyCode } = useKitchenWorkspacePlace()
const { menus } = useKitchenWorkspaceMenus()

const kitchen = computed(
  () => selectedKitchen.value as Record<string, unknown> | null
)
const name = computed(() =>
  String(
    kitchenName.value || place.value?.name || place.value?.short_name || ''
  )
)
const tagline = computed(() =>
  String(kitchenTagline.value || place.value?.brand_tagline || '')
)
const imageUrl = computed(() =>
  String(
    (kitchen.value?.identity as Record<string, unknown> | undefined)
      ?.image_url || ''
  )
)
const shortAddress = computed(() =>
  String(place.value?.short_address || kitchen.value?.short_address || '')
)
const formattedAddress = computed(() =>
  String(
    place.value?.formatted_address || kitchen.value?.formatted_address || ''
  )
)
const slug = computed(() => String(kitchen.value?.slug ?? ''))
const currencyFormat = computed(() =>
  String(kitchen.value?.menu_currency_format ?? 'dash')
)
const showCurrency = computed(() => kitchen.value?.menu_show_currency !== false)
const deliveryZones = computed(
  () => readKitchenFulfilmentConfig(kitchen.value).delivery_zones
)
const hasDeliveryMenus = computed(() =>
  menus.value.some((menu) => menuAcceptsOrderType(menu, 'delivery'))
)

const currencyFormatLabel = computed(() => {
  if (currencyFormat.value === 'symbol') return 'Symbol'
  if (currencyFormat.value === 'code') return 'Code'
  return 'Dash'
})
const menuDisplaySummary = computed(
  () =>
    `${currencyCode.value || 'Missing currency'} · ${currencyFormatLabel.value} · ${
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
