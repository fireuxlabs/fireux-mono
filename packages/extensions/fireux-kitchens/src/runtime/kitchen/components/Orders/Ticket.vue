<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold">#{{ order.number }}</h2>
          <p class="text-sm text-muted">{{ channelLabel }}</p>
        </div>
      </div>
    </template>
    <ul v-if="order.lines.length" class="space-y-2" aria-label="Order lines">
      <li v-for="line in order.lines" :key="line.id" class="space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex gap-3">
            <strong>{{ line.quantity }} {{ line.unit_code }}</strong>
            <span>{{ line.item.name }}</span>
          </div>
          <div class="flex gap-1">
            <UButton
              label="Edit quantity"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="editLine(line.id, line.quantity)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              size="sm"
              :aria-label="`Remove ${line.item.name}`"
              @click="$emit('remove-line', line.id)"
            />
          </div>
        </div>
        <form
          v-if="editingLineId === line.id"
          class="flex flex-wrap items-end gap-2"
          @submit.prevent="
            emit('update-quantity', line.id, Number(editQuantity))
          "
        >
          <UFormField :label="`Quantity for ${line.item.name}`">
            <UInput
              v-model="editQuantity"
              type="number"
              step="any"
              required
              class="w-28"
            />
          </UFormField>
          <UButton type="submit" label="Save quantity" size="sm" />
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="editingLineId = ''"
          />
        </form>
      </li>
    </ul>
    <p v-else class="text-sm text-muted">No items yet</p>
  </UCard>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Order } from '../../models/order.model'
const props = defineProps<{ order: Order }>()
const emit = defineEmits<{
  'update-quantity': [lineId: string, quantity: number]
  'remove-line': [lineId: string]
  'editing-change': [editing: boolean]
}>()
const editingLineId = ref('')
const editQuantity = ref<string | number>(1)
function editLine(id: string, quantity: number) {
  editingLineId.value = id
  editQuantity.value = quantity
}
watch(editingLineId, (id) => emit('editing-change', Boolean(id)), {
  flush: 'sync',
})
watch(
  () => props.order,
  () => {
    editingLineId.value = ''
  }
)
const channelLabels = {
  pos: 'POS',
  kiosk: 'Kiosk',
  website: 'Website',
  app: 'App',
  api: 'API',
}
const channelLabel = computed(() => channelLabels[props.order.channel])
</script>
