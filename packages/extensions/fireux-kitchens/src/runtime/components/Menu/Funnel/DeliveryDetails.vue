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

    <MenuFunnelFields
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <MenuFunnelDeliveryAddressAutocomplete
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

    <div
      v-if="debugJson"
      class="delivery-details__debug"
    >
      <div class="delivery-details__debug-header">
        <span>Delivery debug</span>
        <button
          type="button"
          @click="copyDebug"
        >
          {{ debugCopied ? 'Copied' : 'Copy' }}
        </button>
      </div>
      <pre>{{ debugJson }}</pre>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { MenuDeliveryAddressPrediction } from '../../../composables/fireux/public/menu/useMenuDeliveryAddressAutocomplete'
import { useMenuDeliveryAddressCheck } from '../../../composables/fireux/public/menu/useMenuDeliveryAddressCheck'
import type { MenuDeliveryZone } from '../../../models/menu/menu.model'
import type { KitchenOrderCustomer } from '../../../models/order.model'
import MenuFunnelDeliveryAddressAutocomplete from './DeliveryAddressAutocomplete.vue'
import MenuFunnelFields from './Fields.vue'

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
const selectedPlaceId = ref('')
const debugCopied = ref(false)
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
const debugJson = computed(() => {
  if (!import.meta.dev || !result.value?.debug) return ''

  return JSON.stringify(result.value.debug, null, 2)
})

onMounted(() => {
  seedTestDeliveryCustomer()
})

async function selectAddress(prediction: MenuDeliveryAddressPrediction) {
  selectedPlaceId.value = prediction.place_id
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
  selectedPlaceId.value = ''
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

  selectedPlaceId.value = testDeliveryCustomer.address_place_id
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

async function copyDebug() {
  if (!import.meta.client || !debugJson.value) return

  try {
    await navigator.clipboard.writeText(debugJson.value)
    debugCopied.value = true
    window.setTimeout(() => {
      debugCopied.value = false
    }, 1400)
  } catch {
    debugCopied.value = false
  }
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

.delivery-details__debug {
  margin: 0;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: 0.85rem;
  background: color-mix(in srgb, var(--menu-bg) 86%, transparent);
  color: var(--menu-muted);
}

.delivery-details__debug-header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 10%, transparent);
  font-size: 0.72rem;
  font-weight: 900;
}

.delivery-details__debug button {
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-bg) 72%, transparent);
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  font-size: 0.7rem;
  font-weight: 900;
  padding: 0.28rem 0.55rem;
}

.delivery-details__debug pre {
  overflow: auto;
  max-height: 14rem;
  margin: 0;
  padding: 0.75rem;
  font-size: 0.72rem;
  line-height: 1.45;
  white-space: pre-wrap;
}
</style>
