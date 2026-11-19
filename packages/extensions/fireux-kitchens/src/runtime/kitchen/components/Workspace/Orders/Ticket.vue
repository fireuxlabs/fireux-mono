<template>
  <PublicKitchenOrdersTicket :order="order">
    <template #line-actions="{ line }">
      <div class="fx-card__actions">
        <UButton
          label="Edit quantity"
          color="neutral"
          variant="ghost"
          size="sm"
          :aria-label="`Edit quantity for ${line.item.name}`"
          @click="editLine(line.id, line.quantity)"
        />
        <UButton
          icon="i-lucide-trash-2"
          color="neutral"
          variant="ghost"
          size="sm"
          :aria-label="`Remove ${line.item.name}`"
          @click="emit('remove-line', line.id)"
        />
      </div>
      <form
        v-if="editingLineId === line.id"
        @submit.prevent="emit('update-quantity', line.id, Number(editQuantity))"
      >
        <UFormField :label="`Quantity for ${line.item.name}`">
          <!-- @vue-generic {string | number, {}} -->
          <UInput v-model="editQuantity" type="number" step="any" required />
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
    </template>
  </PublicKitchenOrdersTicket>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Order } from '../../../records/order'

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
</script>
