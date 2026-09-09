<template>
  <MoleculesDisclosurePanel
    v-if="deliveryZones.length"
    title="Delivery area"
    description="Minimum order and delivery fee by zone."
    icon="i-lucide-truck"
    :default-open="false"
  >
    <UCard class="mt-4">
      <ClientOnly>
        <KitchenDetailDeliveryZonesMap
          :zones="deliveryZones"
          :currency-code="currencyCode"
          :center="deliveryCenter"
        />
      </ClientOnly>
    </UCard>
  </MoleculesDisclosurePanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from '#imports'
import type { KitchenSurface } from '../../models/kitchen-interface.model'
import type { KitchenFulfilment } from '../../models/fulfilment.model.ts'
import { readKitchenFulfilmentConfig } from '../../utils/kitchen-readers'

const props = defineProps<{
  kitchen: KitchenSurface | null
}>()

const fulfilmentPath = computed(() =>
  props.kitchen?.slug
    ? `/api/kitchens/${encodeURIComponent(props.kitchen.slug)}/fulfilment`
    : ''
)
const { data: fulfilment } = useFetch<KitchenFulfilment>(fulfilmentPath, {
  immediate: Boolean(fulfilmentPath.value),
  watch: [fulfilmentPath],
})

const deliveryZones = computed(
  () =>
    fulfilment.value?.delivery_zones ||
    readKitchenFulfilmentConfig(props.kitchen).delivery_zones
)
const currencyCode = computed(() =>
  String(props.kitchen?.currency_code || '').trim().toUpperCase()
)
const deliveryCenter = computed(() => {
  const lat = Number(props.kitchen?.lat)
  const lng = Number(props.kitchen?.lng)

  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined
})
</script>
