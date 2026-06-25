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
      @select="checkAddressValue"
    />

    <div class="delivery-details__actions">
      <button
        class="delivery-details__check"
        type="button"
        :disabled="locationPending || pending"
        @click="useCurrentLocation"
      >
        <UIcon name="i-lucide-navigation" class="delivery-details__icon" />
        {{ locationPending ? 'Locating...' : 'Use current location' }}
      </button>

      <button
        class="delivery-details__check"
        type="button"
        :disabled="pending || !address"
        @click="checkAddress"
      >
        {{ pending ? 'Checking...' : 'Check address' }}
      </button>
    </div>

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
import { computed, ref } from 'vue'
import { useMenuDeliveryAddressCheck } from '../../../composables/fireux/public/menu/useMenuDeliveryAddressCheck'
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
}>()

const address = computed(() => String(props.modelValue?.address || '').trim())
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
const locationPending = ref(false)
const locationError = ref('')
const statusMessage = computed(() => {
  if (locationError.value) return locationError.value
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

function checkAddress() {
  locationError.value = ''
  return check(address.value)
}

function checkAddressValue(value: string) {
  locationError.value = ''
  return check(value)
}

function updateAddress(value: string) {
  emit('update:modelValue', {
    ...props.modelValue,
    address: value,
  })
}

function useCurrentLocation() {
  locationError.value = ''
  if (!import.meta.client || !navigator.geolocation) {
    locationError.value = 'Current location is not available in this browser.'
    return
  }

  locationPending.value = true
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const checked = await check({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })

      if (checked?.address?.formatted) {
        emit('update:modelValue', {
          ...props.modelValue,
          address: checked.address.formatted,
        })
      }
      locationPending.value = false
    },
    () => {
      locationError.value = 'Current location permission was not granted.'
      locationPending.value = false
    },
    {
      enableHighAccuracy: false,
      maximumAge: 60000,
      timeout: 10000,
    }
  )
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

.delivery-details__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.delivery-details__check {
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  justify-content: center;
  justify-self: start;
  border: 1px solid color-mix(in srgb, var(--menu-accent) 44%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-accent) 12%, var(--menu-bg));
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 900;
  padding: 0.65rem 0.9rem;
}

.delivery-details__icon {
  width: 1rem;
  height: 1rem;
}

.delivery-details__check:disabled {
  cursor: not-allowed;
  opacity: 0.55;
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
