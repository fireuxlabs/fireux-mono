<template>
  <UCard>
    <template #title><h2>Your order</h2></template>
    <p v-if="!lines.length">Choose items from the menu.</p>
    <ul v-else class="collection-stack">
      <li v-for="line in lines" :key="line.key" class="fx-card-body-stack">
        <p>{{ line.quantity }} × {{ line.name }}</p>
        <div class="card__header">
          <span>{{ money(line.unitPrice * line.quantity) }}</span>
          <UInputNumber
            :model-value="line.quantity"
            :min="0"
            :max="99"
            :step="1"
            :disabled="pending"
            :aria-label="`Quantity for ${line.name}`"
            disable-wheel-change
            @update:model-value="(quantity) => updateQuantity(line, quantity)"
          />
        </div>
      </li>
    </ul>
    <template #footer>
      <div class="fx-card-body-stack">
        <p v-if="lines.length">Items total {{ money(total) }}</p>
        <slot />
      </div>
    </template>
  </UCard>
</template>
<script setup lang="ts">
import type { CartLine } from '../../models/menu-order-flow.model'
defineProps<{
  lines: CartLine[]
  total: number
  pending: boolean
  money: (amount: number) => string
}>()
const emit = defineEmits<{ adjust: [key: string, delta: number] }>()
function updateQuantity(line: CartLine, quantity: number | null | undefined) {
  if (
    typeof quantity !== 'number' ||
    !Number.isInteger(quantity) ||
    quantity < 0 ||
    quantity > 99
  )
    return
  emit('adjust', line.key, quantity - line.quantity)
}
</script>
