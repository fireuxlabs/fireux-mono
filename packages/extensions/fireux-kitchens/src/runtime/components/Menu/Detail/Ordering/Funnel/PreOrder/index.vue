<template>
  <div class="menu-order-funnel">
    <p v-if="policy?.message">
      {{ policy.message }}
    </p>
    <p v-else-if="policy?.notice_hours">
      Pre-orders need at least {{ policy.notice_hours }} hours notice.
    </p>

    <label class="menu-order-field">
      <span>People</span>
      <input
        type="number"
        min="1"
        step="1"
        inputmode="numeric"
        :value="partySize"
        @input="updatePartySize"
      >
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuOrderTypeConfig } from '../../../../../../models/menu/menu.model'
import type { KitchenOrderCustomer } from '../../../../../../models/order.model'

const props = withDefaults(
  defineProps<{
    modelValue: KitchenOrderCustomer
    policy?: MenuOrderTypeConfig
  }>(),
  {
    policy: undefined,
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: KitchenOrderCustomer): void
}>()

const partySize = computed(() =>
  Math.max(1, Math.floor(Number(props.modelValue.party_size || 1) || 1))
)

function updatePartySize(event: Event) {
  const target = event.target as HTMLInputElement | null
  const nextSize = Math.max(1, Math.floor(Number(target?.value || 1) || 1))
  emit('update:modelValue', {
    ...props.modelValue,
    party_size: nextSize,
  })
}
</script>

<style scoped>
.menu-order-funnel {
  display: grid;
  gap: 1rem;
}

.menu-order-funnel p {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.45;
}

.menu-order-field {
  display: grid;
  gap: 0.4rem;
  color: var(--menu-title);
  font-size: 0.86rem;
  font-weight: 900;
}

.menu-order-field input {
  width: 100%;
  padding: 0.75rem 0.85rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--menu-bg) 86%, transparent);
  color: var(--menu-text);
  font: inherit;
}
</style>
