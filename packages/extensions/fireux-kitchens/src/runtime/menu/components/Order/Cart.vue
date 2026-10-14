<template>
  <UCard>
    <h2 class="text-xl font-semibold">Your order</h2>
    <p v-if="!lines.length" class="mt-3 text-muted">
      Choose items from the menu.
    </p>
    <ul class="divide-y divide-default">
      <li v-for="line in lines" :key="line.key" class="space-y-2 py-3">
        <p class="font-medium">{{ line.quantity }} × {{ line.name }}</p>
        <div class="flex items-center justify-between gap-2">
          <span>{{ money(line.unitPrice * line.quantity) }}</span>
          <UInputNumber
            :model-value="line.quantity"
            :min="0"
            :max="99"
            :step="1"
            :disabled="pending"
            :aria-label="`Quantity for ${line.name}`"
            disable-wheel-change
            class="w-32"
            @update:model-value="(quantity) => updateQuantity(line, quantity)"
          />
        </div>
      </li>
    </ul>
    <p v-if="lines.length" class="mt-3 text-lg font-bold">
      Items total {{ money(total) }}
    </p>
  </UCard>
  <slot />
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
