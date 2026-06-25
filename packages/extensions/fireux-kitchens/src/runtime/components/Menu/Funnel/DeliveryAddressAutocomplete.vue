<template>
  <label class="delivery-address">
    <span>Delivery address</span>

    <span class="delivery-address__control">
      <UIcon
        name="i-lucide-map-pin"
        class="delivery-address__icon"
      />
      <input
        :value="modelValue"
        autocomplete="street-address"
        placeholder="Start typing your address"
        required
        type="text"
        @focus="open = true"
        @input="update"
      >
    </span>

    <span
      v-if="open && predictions.length"
      class="delivery-address__suggestions"
    >
      <button
        v-for="prediction in predictions"
        :key="prediction.place_id"
        type="button"
        @mousedown.prevent="select(prediction)"
      >
        <strong>{{ prediction.structured_formatting?.main_text || prediction.description }}</strong>
        <span v-if="prediction.structured_formatting?.secondary_text">
          {{ prediction.structured_formatting.secondary_text }}
        </span>
      </button>
    </span>

    <span
      v-else-if="pending"
      class="delivery-address__hint"
    >
      Finding addresses...
    </span>

    <span
      v-else-if="error"
      class="delivery-address__hint"
    >
      {{ error }}
    </span>
  </label>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue'
import {
  useMenuDeliveryAddressAutocomplete,
  type MenuDeliveryAddressPrediction,
} from '../../../composables/fireux/public/menu/useMenuDeliveryAddressAutocomplete'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'select', value: string): void
}>()

const open = ref(false)
const query = toRef(props, 'modelValue')
const {
  predictions,
  pending,
  error,
} = useMenuDeliveryAddressAutocomplete(query)

function update(event: Event) {
  const input = event.target as HTMLInputElement | null

  open.value = true
  emit('update:modelValue', input?.value || '')
}

function select(prediction: MenuDeliveryAddressPrediction) {
  open.value = false
  emit('update:modelValue', prediction.description)
  emit('select', prediction.description)
}
</script>

<style scoped>
.delivery-address {
  position: relative;
  display: grid;
  gap: 0.35rem;
  color: var(--menu-muted);
  font-size: 0.78rem;
  font-weight: 850;
}

.delivery-address__control {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.5rem;
  align-items: center;
  padding: 0 0.85rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--menu-bg) 86%, var(--menu-text));
  color: var(--menu-text);
}

.delivery-address__icon {
  width: 1rem;
  height: 1rem;
  color: var(--menu-muted);
}

.delivery-address input {
  width: 100%;
  min-height: 2.8rem;
  border: 0;
  background: transparent;
  color: var(--menu-text);
  font: inherit;
  outline: none;
}

.delivery-address__suggestions {
  position: absolute;
  z-index: 4;
  top: calc(100% + 0.35rem);
  right: 0;
  left: 0;
  display: grid;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: 0.9rem;
  background: var(--menu-bg);
  box-shadow: 0 1rem 2.5rem color-mix(in srgb, var(--menu-text) 18%, transparent);
}

.delivery-address__suggestions button {
  display: grid;
  gap: 0.15rem;
  padding: 0.75rem 0.85rem;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 10%, transparent);
  background: transparent;
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.delivery-address__suggestions button:last-child {
  border-bottom: 0;
}

.delivery-address__suggestions button:hover {
  background: color-mix(in srgb, var(--menu-accent) 10%, transparent);
}

.delivery-address__suggestions strong {
  font-weight: 900;
}

.delivery-address__suggestions span,
.delivery-address__hint {
  color: var(--menu-muted);
  font-size: 0.78rem;
  font-weight: 750;
}
</style>
