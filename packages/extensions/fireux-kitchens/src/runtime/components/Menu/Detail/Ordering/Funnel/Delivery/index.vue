<template>
  <div class="menu-order-step menu-order-step--delivery">
    <KitchenFulfilmentDeliveryZonesMap
      v-if="hasDeliveryZones"
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
const hasDeliveryZones = computed(() => deliveryZonesForRender.value.length > 0)
</script>

<style scoped>
.menu-order-step {
  display: grid;
  gap: 0.85rem;
}

.menu-order-step--delivery :deep(.delivery-zones-map) {
  gap: 0.5rem;
}

.menu-order-step--delivery :deep(.delivery-zones-map__canvas) {
  aspect-ratio: 16 / 7;
  max-height: 11rem;
  border-radius: 1rem;
}

.menu-order-step--delivery :deep(.delivery-zones-map__key) {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem 0.6rem;
}

.menu-order-step--delivery :deep(.delivery-zones-map__key-item) {
  font-size: 0.76rem;
}
</style>
