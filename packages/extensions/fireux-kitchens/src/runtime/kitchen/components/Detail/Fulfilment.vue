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
import type { KitchenFulfilment } from '../../models/fulfilment.model.ts'
import { readKitchenFulfilmentConfig } from '../../utils/kitchen-readers'

const props = defineProps<{
  kitchen: KitchenSurface | null
  fulfilment?: KitchenFulfilment | null
}>()

const deliveryZones = computed(
  () =>
    props.fulfilment?.delivery_zones ||
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
