<template>
  <div class="menu-order-funnel">
    <p v-if="message" class="menu-order-funnel__message">
      {{ message }}
    </p>

    <p v-if="noticeLabel" class="menu-order-funnel__notice">
      {{ noticeLabel }}
    </p>

    <MenuFunnelFields
      :model-value="modelValue"
      notes-placeholder="Preferred date, time, group size, allergies, or anything helpful."
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuOrderTypeConfig } from '../../../models/menu/menu.model'
import type { KitchenOrderCustomer } from '../../../models/order.model'

const props = withDefaults(
  defineProps<{
    modelValue: KitchenOrderCustomer
    policy?: MenuOrderTypeConfig
  }>(),
  {
    policy: undefined,
  }
)

defineEmits<{
  (event: 'update:modelValue', value: KitchenOrderCustomer): void
}>()

const message = computed(() => props.policy?.message || '')
const noticeLabel = computed(() =>
  props.policy?.notice_hours
    ? `Minimum notice: ${props.policy.notice_hours} hours.`
    : ''
)
</script>

<style scoped>
.menu-order-funnel {
  display: grid;
  gap: 1rem;
}

.menu-order-funnel__message,
.menu-order-funnel__notice {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.45;
}

.menu-order-funnel__notice {
  color: var(--menu-title);
}
</style>
