<template>
  <div class="menu-order-fields">
    <label>
      <span>Name</span>
      <input
        :value="modelValue.name || ''"
        type="text"
        autocomplete="name"
        placeholder="Your name"
        required
        @input="update('name', $event)"
      >
    </label>

    <label>
      <span>Phone</span>
      <input
        :value="modelValue.phone || ''"
        type="tel"
        autocomplete="tel"
        placeholder="+41 ..."
        required
        @input="update('phone', $event)"
      >
    </label>

    <label v-if="address" class="menu-order-fields__wide">
      <span>Delivery address</span>
      <input
        :value="modelValue.address || ''"
        type="text"
        autocomplete="street-address"
        placeholder="Street, postcode, town"
        required
        @input="update('address', $event)"
      >
    </label>

    <label class="menu-order-fields__wide">
      <span>Notes</span>
      <textarea
        :value="modelValue.notes || ''"
        rows="3"
        :placeholder="notesPlaceholder"
        @input="update('notes', $event)"
      />
    </label>

    <label class="menu-order-fields__wide">
      <span>Allergy note</span>
      <textarea
        :value="modelValue.allergy_note || ''"
        rows="2"
        placeholder="Allergies or intolerances the kitchen must know."
        @input="update('allergy_note', $event)"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import type { KitchenOrderCustomer } from '../../../../../models/order.model'

const props = withDefaults(
  defineProps<{
    modelValue: KitchenOrderCustomer
    address?: boolean
    notesPlaceholder?: string
  }>(),
  {
    notesPlaceholder: 'Doorbell, allergy note, timing, or anything helpful.',
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: KitchenOrderCustomer): void
}>()

const text = (value: unknown) => String(value ?? '').trim()

function update(field: keyof KitchenOrderCustomer, event: Event) {
  const input = event.target as HTMLInputElement | HTMLTextAreaElement | null
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: text(input?.value),
  })
}
</script>

<style scoped>
.menu-order-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.menu-order-fields label {
  display: grid;
  gap: 0.35rem;
  color: var(--menu-muted);
  font-size: 0.78rem;
  font-weight: 850;
}

.menu-order-fields input,
.menu-order-fields textarea {
  width: 100%;
  padding: 0.75rem 0.85rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--menu-bg) 86%, var(--menu-text));
  color: var(--menu-text);
  font: inherit;
}

.menu-order-fields__wide {
  grid-column: 1 / -1;
}

@media (max-width: 640px) {
  .menu-order-fields {
    grid-template-columns: 1fr;
  }
}
</style>
