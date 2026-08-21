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
import type { KitchenSurface } from '../../composables/firestore/utils/view/useKitchenInterface'
import type { KitchenFulfilmentConfig } from '../../models/kitchen.model.ts'
import {
  readKitchenCurrencyCode,
  readKitchenFulfilmentConfig,
} from '../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: KitchenSurface | null
  fulfilment?: KitchenFulfilmentConfig | null
}>()

const deliveryZones = computed(
  () =>
    props.fulfilment?.delivery_zones ||
    readKitchenFulfilmentConfig(props.kitchen).delivery_zones
)
const currencyCode = computed(() => readKitchenCurrencyCode(props.kitchen))
const deliveryCenter = computed(() => {
  const lat = Number(props.kitchen?.lat)
  const lng = Number(props.kitchen?.lng)

  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined
})
</script>
