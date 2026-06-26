<template>
  <section
    class="delivery-details"
    aria-label="Delivery details"
  >
    <div>
      <p class="delivery-details__eyebrow">
        Delivery details
      </p>
      <h3>Where should we bring it?</h3>
    </div>

    <FunnelFields
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <DeliveryAddressAutocomplete
      :model-value="address"
      @update:model-value="updateAddress"
      @select="selectAddress"
    />

    <p
      v-if="statusMessage"
      class="delivery-details__status"
      :class="{ 'delivery-details__status--good': result?.deliverable }"
      aria-live="polite"
    >
      {{ statusMessage }}
    </p>

  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { MenuDeliveryAddressPrediction } from '../../../../../../composables/fireux/public/menu/useMenuDeliveryAddressAutocomplete'
import { useMenuDeliveryAddressCheck } from '../../../../../../composables/fireux/public/menu/useMenuDeliveryAddressCheck'
import type { MenuDeliveryZone } from '../../../../../../models/menu/menu.model'
import type { KitchenOrderCustomer } from '../../../../../../models/order.model'
import FunnelFields from '../Fields.vue'
import DeliveryAddressAutocomplete from './AddressAutocomplete.vue'

const props = defineProps<{
  modelValue: KitchenOrderCustomer
  menuId: string
  kitchenSlug?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: KitchenOrderCustomer): void
  (event: 'deliveryZone', value: MenuDeliveryZone | null): void
}>()

const address = computed(() => String(props.modelValue?.address || '').trim())
const testDeliveryCustomer = {
  phone: '+447583282242',
  address: 'Bachtalenweg 21, 3852 Ringgenberg, Switzerland',
  address_place_id: 'ChIJFayHzjejj0cRgEyCW4Yg5R4',
} as const
const {
  pending,
  error,
  result,
  check,
} = useMenuDeliveryAddressCheck(
  computed(() => props.menuId),
  {
    kitchenSlug: computed(() => props.kitchenSlug || ''),
  }
)
const statusMessage = computed(() => {
  if (pending.value) return 'Checking delivery area...'
  if (error.value) return error.value
  if (!result.value) return ''
  if (!result.value.deliverable) return result.value.reason
  const zone = result.value.zone
  if (!zone) return result.value.reason

  return [
    `Delivery zone: ${zone.label}`,
    zone.min_order_chf !== undefined ? `minimum CHF ${zone.min_order_chf}` : '',
    zone.fee_chf !== undefined ? `fee CHF ${zone.fee_chf}` : '',
  ].filter(Boolean).join(' · ')
})

onMounted(() => {
  seedTestDeliveryCustomer()
})

async function selectAddress(prediction: MenuDeliveryAddressPrediction) {
  emit('update:modelValue', {
    ...props.modelValue,
    address: prediction.description,
    address_place_id: prediction.place_id,
  })

  const checked = await check({
    address: prediction.description,
    place_id: prediction.place_id,
  })
  emit('deliveryZone', checked?.deliverable ? checked.zone || null : null)
}

function updateAddress(value: string) {
  emit('deliveryZone', null)
  emit('update:modelValue', {
    ...props.modelValue,
    address: value,
    address_place_id: '',
  })
}

async function seedTestDeliveryCustomer() {
  if (!import.meta.dev) return
  if (props.modelValue.address || props.modelValue.address_place_id) return

  emit('update:modelValue', {
    ...props.modelValue,
    phone: props.modelValue.phone || testDeliveryCustomer.phone,
    address: testDeliveryCustomer.address,
    address_place_id: testDeliveryCustomer.address_place_id,
  })

  const checked = await check({
    address: testDeliveryCustomer.address,
    place_id: testDeliveryCustomer.address_place_id,
  })
  emit('deliveryZone', checked?.deliverable ? checked.zone || null : null)
}
</script>

<style scoped>
.delivery-details {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--menu-bg) 92%, var(--menu-text));
}

.delivery-details__eyebrow,
.delivery-details h3 {
  margin: 0;
}

.delivery-details__eyebrow {
  color: var(--menu-muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.delivery-details h3 {
  color: var(--menu-text);
  font-size: 1.05rem;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.delivery-details__status {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1.4;
}

.delivery-details__status--good {
  color: var(--menu-text);
}
</style>
