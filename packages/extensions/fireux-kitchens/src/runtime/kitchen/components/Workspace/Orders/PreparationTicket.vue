<template>
  <UCard :class="{ 'ring-2 ring-primary': selected }">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-xl font-semibold">#{{ order.number }}</h2>
        <UBadge :color="order.state === 'ready' ? 'success' : 'warning'" variant="soft">
          {{ order.state === 'ready' ? 'Ready' : 'Preparing' }}
        </UBadge>
      </div>
    </template>
    <ul class="space-y-2">
      <li v-for="line in order.lines" :key="line.id" class="flex gap-3">
        <strong>{{ line.quantity }}×</strong><span>{{ line.item.name }}</span>
      </li>
    </ul>
    <template #footer>
      <UButton v-if="order.state === 'preparing'" label="Mark ready"
        :disabled="!interactive" :loading="pending" @click="$emit('ready', order.id)" />
      <div v-else class="flex flex-wrap gap-2">
        <UButton :label="selected ? 'Selected for handoff' : 'Select for handoff'"
          :aria-pressed="selected" :disabled="!interactive" @click="$emit('toggle', order.id)" />
        <UButton label="Back to prep" color="neutral" variant="soft"
          :disabled="!interactive" @click="$emit('return', order.id)" />
      </div>
    </template>
  </UCard>
</template>
<script setup lang="ts">
import type { KitchenPreparationOrder } from '../../../models/preparation-order.model'
withDefaults(defineProps<{
  order: KitchenPreparationOrder
  interactive: boolean
  selected?: boolean
  pending?: boolean
}>(), { selected: false, pending: false })
defineEmits<{ ready: [id: string]; return: [id: string]; toggle: [id: string] }>()
</script>
