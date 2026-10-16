<template>
  <section class="space-y-6">
    <KitchenDetailMenuHeader
      v-if="presentation"
      :venue="presentation"
      :venue-path="venuePath"
      :title="serviceLabel"
    />
    <KitchenDetailState
      v-else
      :outcome="outcome"
      :has-kitchen="Boolean(kitchen)"
      @refresh="refresh()"
    />
    <p
      v-if="presentation && service === 'room_service' && roomNumber"
      class="text-lg font-medium"
      data-room-context
    >
      Room {{ roomNumber }}
    </p>
    <p
      v-if="presentation && service === 'table' && tableNumber"
      class="text-lg font-medium"
      data-table-context
    >
      Table {{ tableNumber }}
    </p>
    <template v-if="presentation">
      <p v-if="menus.pending.value" role="status" class="text-sm text-muted">
        Loading food and drinks…
      </p>
      <div v-else-if="menus.error.value" role="alert" class="space-y-2">
        <p>Food and drinks could not be loaded. Please try again.</p>
        <MoleculesCopyError :message="String(menus.error.value)" />
        <UButton
          label="Try again"
          color="neutral"
          variant="soft"
          @click="menus.refresh()"
        />
      </div>
      <div v-else-if="sections.length" class="space-y-8" :style="styleVars">
        <nav
          :aria-label="`${serviceLabel} sections`"
          class="flex flex-wrap gap-2"
        >
          <UButton
            v-for="(section, index) in sections"
            :key="section.key"
            :to="`#service-section-${index}`"
            :label="section.label"
            color="neutral"
            variant="soft"
            size="sm"
          />
        </nav>
        <section
          v-for="(section, index) in sections"
          :key="section.key"
          :id="`service-section-${index}`"
          class="scroll-mt-6"
        >
          <h2 class="text-xl font-semibold">{{ section.label }}</h2>
          <KitchenDetailOfferingTimes
            v-if="section.offerings.length"
            :offerings="section.offerings"
            compact
            class="mt-2"
          />
          <div class="grid gap-x-8 md:grid-cols-2">
            <div
              v-for="(row, itemIndex) in section.items"
              :key="row.key"
              class="min-w-0"
            >
              <MenuDetailItem
                :item="row.item"
                collapse-extras
                :accessibility-id="`service-${index}-${itemIndex}`"
                :currency-code="row.presentation.currencyCode"
                :currency-format="row.presentation.currencyFormat || 'code'"
                :show-currency="row.presentation.showCurrency !== false"
                available-options-label="Options"
                optional-extras-label="Extras"
              />
              <p
                v-if="
                  row.label &&
                  row.label !== row.item.name &&
                  row.alternatives.length
                "
                class="text-sm text-muted"
              >
                {{ row.label }}
              </p>
              <details v-if="row.alternatives.length" class="my-3 text-sm">
                <summary class="cursor-pointer text-muted">
                  Other serving times and prices
                </summary>
                <div
                  v-for="(offer, offerIndex) in row.alternatives"
                  :key="offerIndex"
                  class="mt-3 space-y-1"
                >
                  <p class="font-medium">
                    {{ offer.label }} ·
                    {{
                      formatCurrencyAmount(offer.item.price, {
                        currencyCode: offer.presentation.currencyCode,
                        format: offer.presentation.currencyFormat || 'code',
                      })
                    }}
                  </p>
                  <p v-for="option in offer.item.priceOptions" :key="option.id">
                    {{ option.label }} ·
                    {{
                      formatCurrencyAmount(option.price, {
                        currencyCode: offer.presentation.currencyCode,
                        format: 'code',
                      })
                    }}
                  </p>
                  <KitchenDetailOfferingTimes
                    :offerings="offer.offerings"
                    compact
                  />
                </div>
              </details>
              <KitchenDetailOfferingTimes
                v-if="!section.offerings.length"
                :offerings="row.offerings"
                compact
                class="mt-2 mb-4"
              />
            </div>
          </div>
        </section>
      </div>
      <p v-else class="rounded-xl border border-default p-5 text-muted">
        {{
          service === 'table'
            ? 'No food or drinks are available at your table.'
            : service === 'room_service'
              ? 'No food or drinks are available for room service.'
              : `No food or drinks are available for ${service}.`
        }}
      </p>
      <div
        v-if="service !== 'room_service' && service !== 'table'"
        class="border-t border-default pt-4"
      >
        <UButton
          :to="browsePath"
          label="All menus"
          color="neutral"
          variant="link"
          trailing-icon="i-lucide-arrow-right"
        />
      </div>
    </template>
  </section>
</template>
<script setup lang="ts">
import { computed, toRef } from 'vue'
import { setResponseStatus, useHead, useSeoMeta } from '#imports'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useKitchenDetail } from '../../composables/useKitchenDetail'
import { useMenuThemeSurface } from '../../../menu/composables/useMenuThemeSurface'
import {
  directoryMenuRouteScope,
  menuRouteIndexPath,
} from '../../../menu/utils/menu-route'
import type { MenuService } from '../../../menu/utils/service-menu'
import {
  serviceSections,
  type MenuServiceSource,
} from '../../../menu/utils/service-sections'
import { useKitchenOfferingNow } from '../../composables/useKitchenOfferingNow'
import { formatCurrencyAmount } from '../../../utils/currency-display'
const props = defineProps<{
  kitchenSlug: string
  service: MenuService
  roomNumber?: string
  tableNumber?: string
}>()
const slug = toRef(props, 'kitchenSlug')
const service = toRef(props, 'service')
const serviceLabel = computed(() =>
  service.value === 'room_service'
    ? 'Room service'
    : service.value === 'table'
      ? 'At your table'
      : service.value === 'delivery'
        ? 'Delivery'
        : 'Collection'
)
const scope = computed(() => directoryMenuRouteScope(slug.value))
const endpoint = computed(
  () =>
    `/api/menus/service/items?service=${service.value}&kitchenSlug=${encodeURIComponent(slug.value)}`
)
const menus = useLiveAsyncData<{ sources: MenuServiceSource[] }>(
  computed(() => `menu-service-items:${service.value}:${slug.value}`),
  (fetch) => fetch(endpoint.value),
  { watch: [endpoint] }
)
const { now: pricingNow } = useKitchenOfferingNow()
const sections = computed(() =>
  serviceSections(menus.data.value?.sources || [], pricingNow.value)
)
const { styleVars } = useMenuThemeSurface()
const { kitchen, presentation, outcome, refresh, statusCode, ready } =
  useKitchenDetail(slug)
const venuePath = computed(() => `/kitchens/${encodeURIComponent(slug.value)}`)
const browsePath = computed(() => menuRouteIndexPath(scope.value))
await Promise.all([ready, menus])
if (import.meta.server && statusCode.value) setResponseStatus(statusCode.value)
useHead({
  title: () =>
    `${presentation.value?.display_name || 'Restaurant'} | ${serviceLabel.value}`,
})
useSeoMeta({
  robots: () =>
    service.value === 'room_service' ||
    service.value === 'table' ||
    statusCode.value ||
    menus.error.value
      ? 'noindex, nofollow'
      : undefined,
})
</script>
