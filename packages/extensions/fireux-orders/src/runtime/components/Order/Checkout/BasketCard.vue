<template>
  <UCard>
    <template #header>
      <div class="text-base font-semibold">Basket</div>
    </template>

    <div class="space-y-3">
      <div
        v-for="(line, index) in items"
        :key="lineKey(line, index)"
        class="flex items-start justify-between gap-3 rounded border border-default p-3"
      >
        <div class="min-w-0">
          <div class="font-medium">{{ line.label }}</div>
          <div class="text-xs text-dimmed">{{ formatPrice(line.price_minor, line.currency_code) }} each</div>
        </div>

        <div class="flex items-center gap-2">
          <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-minus" @click="emit('decrement', index)" />
          <div class="w-7 text-center text-sm font-medium">{{ line.qty }}</div>
          <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-plus" @click="emit('increment', index)" />
          <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="emit('remove', index)" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between">
        <div class="text-sm text-dimmed">Subtotal</div>
        <div class="font-semibold">{{ formatPrice(subtotalMinor, currencyCode) }}</div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { OrderLine } from '../../../models/order.model'

defineProps<{
  items: OrderLine[]
  subtotalMinor: number
  currencyCode: string
}>()

const emit = defineEmits<{
  (event: 'increment', index: number): void
  (event: 'decrement', index: number): void
  (event: 'remove', index: number): void
}>()

const lineKey = (line: OrderLine, index: number) =>
  `${line.dish_id}:${line.label}:${line.price_minor}:${line.currency_code}:${index}`

const formatPrice = (priceMinor?: number, currency?: string) => {
  const amount = Number(priceMinor || 0) / 100
  const code = String(currency || 'CHF').trim().toUpperCase() || 'CHF'

  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
</script>
