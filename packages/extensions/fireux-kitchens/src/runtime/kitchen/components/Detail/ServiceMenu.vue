<template>
  <section class="service-menu">
    <KitchenDetailMenuHeader
      v-if="presentation"
      :venue="presentation"
      :venue-path="venuePath"
      :title="serviceLabel"
      :currency-code="currencyCode"
    />
    <div
      v-if="
        presentation && (service === 'collection' || service === 'delivery')
      "
      class="service-menu__navigation"
    >
      <KitchenDetailMenuServices
        :kitchen-slug="kitchenSlug"
        :active="service"
      />
      <UButton
        to="/kitchens/"
        label="Explore other menus"
        color="neutral"
        variant="link"
        trailing-icon="i-lucide-arrow-right"
        size="sm"
      />
    </div>
    <KitchenDetailState
      v-if="!presentation"
      :outcome="outcome"
      :has-kitchen="Boolean(kitchen)"
      @refresh="refresh()"
    />
    <p
      v-if="presentation && service === 'room_service' && roomNumber"
      class="service-menu__location"
      data-room-context
    >
      Room {{ roomNumber }}
    </p>
    <p
      v-if="presentation && service === 'table' && tableNumber"
      class="service-menu__location"
      data-table-context
    >
      Table {{ tableNumber }}
    </p>
    <p
      v-if="selectedOffering?.collection_timing === 'next_day'"
      class="service-menu__status"
    >
      Order today for collection from tomorrow, during the hours below.
    </p>
    <template v-if="presentation">
      <p v-if="menus.pending.value" role="status" class="service-menu__status">
        Loading food and drinks…
      </p>
      <div
        v-else-if="menus.error.value"
        role="alert"
        class="service-menu__error"
      >
        <p>Food and drinks could not be loaded. Please try again.</p>
        <FireCopyError :message="String(menus.error.value)" />
        <UButton
          label="Try again"
          color="neutral"
          variant="soft"
          @click="menus.refresh()"
        />
      </div>
      <MenuServiceCatalogue
        v-else-if="sections.length && !checkoutService"
        :sections="sections"
        :service-label="serviceLabel"
        :style="styleVars"
      />
      <p v-else-if="!checkoutService" class="service-menu__empty">
        {{
          service === 'table'
            ? 'No food or drinks are available at your table.'
            : service === 'room_service'
              ? 'No food or drinks are available for room service.'
              : `No food or drinks are available for ${service}.`
        }}
      </p>
    </template>
    <MenuSelection
      v-if="checkoutService"
      :key="kitchenSlug + ':' + offeringId + ':' + service"
      :sections="sections"
      :kitchen-slug="kitchenSlug"
      :entry-id="offeringId"
      :venue="presentation"
      :currency-code="currencyCode"
      :service="checkoutService"
      @reset="emit('reset')"
      :catalogue-ready="
        Boolean(presentation) && !menus.pending.value && !menus.error.value
      "
    />
  </section>
</template>
<script setup lang="ts">
import { useAsyncData } from 'nuxt/app'

import { computed, toRef } from 'vue'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import { setResponseStatus, useHead, useSeoMeta, useRoute } from '#imports'

import { useKitchenDetail } from '../../composables/useKitchenDetail'
import { useMenuThemeSurface } from '../../../menu/composables/useMenuThemeSurface'
import type { MenuService } from '../../../menu/utils/service-menu'
import {
  serviceSections,
  type MenuServiceSource,
} from '../../../menu/utils/service-sections'
import { useKitchenOfferingNow } from '../../composables/useKitchenOfferingNow'
const props = defineProps<{
  kitchenSlug: string
  service: MenuService
  roomNumber?: string
  tableNumber?: string
}>()
const emit = defineEmits<{ reset: [] }>()
const checkoutService = computed(() =>
  props.service === 'collection' ||
  props.service === 'eat_in' ||
  props.service === 'takeaway'
    ? props.service
    : undefined
)
const slug = toRef(props, 'kitchenSlug')
const service = toRef(props, 'service')
const route = useRoute()
const offeringId = computed(() =>
  typeof route.query.offering === 'string' ? route.query.offering : ''
)
const selectedOffering = computed(() =>
  menus.data.value?.sources
    .flatMap((source) => source.offerings)
    .find((offering) => offering.id === offeringId.value)
)
const serviceLabel = computed(
  () =>
    (service.value === 'eat_in'
      ? 'Eat in'
      : service.value === 'takeaway'
        ? 'Takeaway'
        : '') ||
    selectedOffering.value?.name ||
    (service.value === 'room_service'
      ? 'Room service'
      : service.value === 'table'
        ? 'At your table'
        : service.value === 'delivery'
          ? 'Delivery'
          : 'Collection')
)
const endpoint = computed(
  () =>
    `/api/menus/service/items?service=${service.value}&kitchenSlug=${encodeURIComponent(slug.value)}${offeringId.value ? '&offering=' + encodeURIComponent(offeringId.value) : ''}`
)
const menus = useAsyncData<{ sources: MenuServiceSource[] }>(
  computed(() => `menu-service-items:${service.value}:${slug.value}`),
  async (_nuxtApp, { signal }) => {
    const fetchRead = $fetch.create({ signal, cache: 'no-store' })
    return fetchRead(endpoint.value)
  },
  { watch: [endpoint] }
)
const { now: pricingNow } = useKitchenOfferingNow()
const sections = computed(() =>
  serviceSections(menus.data.value?.sources || [], pricingNow.value)
)
const { styleVars } = useMenuThemeSurface()
const { kitchen, place, presentation, outcome, refresh, statusCode, ready } =
  useKitchenDetail(slug)
const currencyCode = computed(() =>
  checkoutService.value || service.value === 'delivery'
    ? readPlaceCurrencyCode(place.value)
    : ''
)
const venuePath = computed(() => `/kitchens/${encodeURIComponent(slug.value)}`)
await Promise.all([ready, menus])
if (import.meta.server && statusCode.value) setResponseStatus(statusCode.value)
useHead({
  title: () =>
    `${presentation.value?.display_name || 'Restaurant'} | ${serviceLabel.value}`,
})
useSeoMeta({
  description: () =>
    `${serviceLabel.value} food and drinks from ${presentation.value?.display_name || 'this kitchen'}. Browse the menu and current serving times.`,
  robots: () =>
    service.value === 'room_service' ||
    service.value === 'eat_in' ||
    service.value === 'takeaway' ||
    service.value === 'table' ||
    statusCode.value ||
    menus.error.value
      ? 'noindex, nofollow'
      : undefined,
})
</script>

<style scoped>
.service-menu {
  display: grid;
  gap: 1.5rem;
}
.service-menu__navigation {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.service-menu__location {
  font-size: 1.125rem;
  font-weight: 500;
}
.service-menu__status {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
}
.service-menu__error {
  display: grid;
  gap: 0.5rem;
}
.service-menu__empty {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  padding: 1.25rem;
  color: var(--ui-text-muted);
}
</style>
