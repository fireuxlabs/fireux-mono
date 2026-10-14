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
          <div class="flex gap-1">
            <UButton
              icon="i-lucide-minus"
              :aria-label="`Remove one ${line.name}`"
              color="neutral"
              variant="soft"
              :disabled="pending"
              @click="emit('adjust', line.key, -1)"
            /><UButton
              icon="i-lucide-plus"
              :aria-label="`Add one ${line.name}`"
              color="neutral"
              variant="soft"
              :disabled="pending || line.quantity >= 99"
              @click="emit('adjust', line.key, 1)"
            />
          </div>
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
import type { CartLine } from '../../composables/useMenuOrderFlow'
defineProps<{
  lines: CartLine[]
  total: number
  pending: boolean
  money: (amount: number) => string
}>()
const emit = defineEmits<{ adjust: [key: string, delta: number] }>()
</script>
