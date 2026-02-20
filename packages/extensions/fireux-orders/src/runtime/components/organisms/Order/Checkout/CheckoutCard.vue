<template>
  <UCard>
    <template #header>
      <div class="text-base font-semibold">Checkout</div>
    </template>

    <div class="space-y-4">
      <div class="space-y-1">
        <div class="text-xs font-medium text-dimmed">Service mode</div>
        <div
          v-if="serviceModeLocked"
          class="rounded border border-default px-2.5 py-2 text-sm font-medium"
        >
          {{ formatServiceModeLabel(serviceModeModel) }}
        </div>
        <URadioGroup v-else v-model="serviceModeModel" :items="serviceModeOptions" />
      </div>

      <div v-if="serviceModeModel === 'dine_in'" class="space-y-1">
        <div class="text-xs font-medium text-dimmed">
          {{ tableLocked ? 'Table' : 'Table (optional)' }}
        </div>
        <div
          v-if="tableLocked"
          class="rounded border border-default px-2.5 py-2 text-sm font-medium"
        >
          {{ tableLabelModel || 'N/A' }}
        </div>
        <UInput v-else v-model="tableLabelModel" placeholder="e.g. 12" />
      </div>

      <div class="space-y-1">
        <div class="text-xs font-medium text-dimmed">Notes (optional)</div>
        <UTextarea v-model="notesModel" :rows="3" placeholder="Allergies, timing, preferences..." />
      </div>
    </div>

    <template #footer>
      <div class="flex flex-wrap justify-end gap-2">
        <UButton color="neutral" variant="ghost" :disabled="submitting" @click="emit('clear')">
          Clear basket
        </UButton>
        <UButton :loading="submitting" :disabled="isEmpty" @click="emit('confirm')">
          Confirm order
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { RadioGroupItem } from '@nuxt/ui'
import { computed } from 'vue'
import type { OrderServiceMode } from '../../../../models/order.model'

const props = defineProps<{
  serviceMode: OrderServiceMode
  serviceModeLocked: boolean
  tableLabel: string
  tableLocked: boolean
  notes: string
  submitting: boolean
  isEmpty: boolean
}>()

const emit = defineEmits<{
  (event: 'update:serviceMode', value: OrderServiceMode): void
  (event: 'update:tableLabel', value: string): void
  (event: 'update:notes', value: string): void
  (event: 'clear'): void
  (event: 'confirm'): void
}>()

const serviceModeOptions: RadioGroupItem[] = [
  { label: 'Dine-in', value: 'dine_in' },
  { label: 'Collection', value: 'collection' },
  { label: 'Delivery', value: 'delivery' },
]

const serviceModeModel = computed({
  get: () => props.serviceMode,
  set: (value: OrderServiceMode) => emit('update:serviceMode', value),
})

const tableLabelModel = computed({
  get: () => props.tableLabel,
  set: (value: string) => emit('update:tableLabel', String(value || '')),
})

const notesModel = computed({
  get: () => props.notes,
  set: (value: string) => emit('update:notes', String(value || '')),
})

const formatServiceModeLabel = (mode: OrderServiceMode) => {
  if (mode === 'delivery') return 'Delivery'
  if (mode === 'collection') return 'Collection'
  return 'Dine-in'
}
</script>
