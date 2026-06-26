<template>
  <div class="menu-order-funnel">
    <DeliveryMap
      :policy="props.policy"
      :zones="deliveryZonesForRender"
    />

    <DeliveryDetails
      :model-value="props.modelValue"
      :menu-id="props.menuId"
      :kitchen-slug="props.kitchenSlug"
      @update:model-value="emit('update:modelValue', $event)"
      @delivery-zone="emit('deliveryZone', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  MenuDeliveryZone,
  MenuOrderTypeConfig,
} from '../../../../../../models/menu/menu.model'
import type { KitchenOrderCustomer } from '../../../../../../models/order.model'
import DeliveryDetails from './Details.vue'
import DeliveryMap from './Map.vue'

// Menu ordering funnel: docs/concepts/menu-ordering.md
// Delivery owns its dedicated folder; shared funnel shell/components stay in ../.
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
  (event: 'deliveryZone', value: MenuDeliveryZone | null): void
}>()

const policyDeliveryZones = computed(() =>
  props.policy?.fulfilment?.delivery_zones || []
)
const deliveryZonesForRender = computed(() => policyDeliveryZones.value)
</script>

<style scoped>
.menu-order-funnel {
  display: grid;
  gap: 1rem;
}
</style>
