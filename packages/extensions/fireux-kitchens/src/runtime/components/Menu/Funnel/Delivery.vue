<template>
  <div class="menu-order-funnel">
    <MenuFunnelDeliveryMap
      :policy="props.policy"
      :zones="deliveryZonesForRender"
    />

    <MenuFunnelDeliveryDetails
      :model-value="props.modelValue"
      :menu-id="props.menuId"
      :kitchen-slug="props.kitchenSlug"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  MenuDeliveryZone,
  MenuOrderTypeConfig,
} from '../../../models/menu/menu.model'
import type { KitchenOrderCustomer } from '../../../models/order.model'
import MenuFunnelDeliveryDetails from './DeliveryDetails.vue'
import MenuFunnelDeliveryMap from './DeliveryMap.vue'

// Menu ordering funnel: docs/concepts/menu-ordering.md
const props = withDefaults(
  defineProps<{
    modelValue: KitchenOrderCustomer
    menuId: string
    kitchenSlug?: string
    policy?: MenuOrderTypeConfig
  }>(),
  {
    kitchenSlug: '',
    policy: undefined,
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: KitchenOrderCustomer): void
}>()

// TODO: Complete delivery-zone editor/config. For this Bären prototype we hard-code zones here;
// final source should return to `props.policy.fulfilment.delivery_zones`.
const deliveryZones: MenuDeliveryZone[] = [
  {
    id: 'ringgenberg-goldswil',
    label: 'Ringgenberg & Goldswil',
    postal_codes: ['3852'],
    color: '#ff7a32',
    min_order_chf: 15,
    fee_chf: 0,
  },
  {
    id: 'interlaken-area',
    label: 'Interlaken area',
    postal_codes: ['3800', '3805', '3806'],
    color: '#2fb7a0',
    min_order_chf: 20,
    fee_chf: 0,
  },
  {
    id: 'niederried',
    label: 'Niederried',
    postal_codes: ['3853'],
    color: '#f4b41a',
    min_order_chf: 30,
    fee_chf: 0,
  },
  {
    id: 'brienz-west',
    label: 'Brienz west',
    postal_codes: [],
    // Provisional test polygon only; replace with verified delivery boundary.
    polygon: [
      { lat: 46.765, lng: 7.975 },
      { lat: 46.766, lng: 8.035 },
      { lat: 46.745, lng: 8.05 },
      { lat: 46.733, lng: 8.005 },
      { lat: 46.743, lng: 7.965 },
    ],
    color: '#39bfe3',
    min_order_chf: 50,
    fee_chf: 10,
  },
]
const policyDeliveryZones = computed(() =>
  props.policy?.fulfilment?.delivery_zones || []
)
const deliveryZonesForRender = computed(() =>
  policyDeliveryZones.value.length ? policyDeliveryZones.value : deliveryZones
)
</script>

<style scoped>
.menu-order-funnel {
  display: grid;
  gap: 1rem;
}
</style>
