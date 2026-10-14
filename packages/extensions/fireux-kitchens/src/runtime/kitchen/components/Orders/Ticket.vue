<template>
  <UCard :ui="{ header: 'px-4 py-4', body: 'p-0 sm:p-0', footer: 'px-4 py-2.5' }" class="overflow-hidden ring-1 ring-default">
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex min-w-0 items-start gap-2.5">
          <UIcon name="i-lucide-receipt-text" class="mt-1 size-5 shrink-0 text-muted" aria-hidden="true" />
          <h2 class="min-w-0 break-words text-2xl font-bold leading-tight text-highlighted">{{ order.location?.name || (order.number ? `#${order.number}` : 'Order') }}</h2>
        </div>
        <div v-if="order.location" class="min-w-0 max-w-[40%] text-right">
          <p :aria-label="order.number ? `Order ${order.number}` : 'Unnumbered order'" class="break-words text-xl font-bold tabular-nums text-highlighted">{{ order.number ? `#${order.number}` : 'Order' }}</p>
        </div>
      </div>
      <p v-if="order.fulfilment" class="mt-2 text-lg font-semibold text-highlighted">{{ fulfilmentLabel }}</p>
      <p v-if="order.requested_at" class="mt-1 text-sm font-medium">Requested {{ order.requested_at.slice(0, 16).replace('T', ' ') }} UTC</p>
    </template>
    <ul v-if="order.lines.length" class="divide-y divide-default" aria-label="Order lines">
      <li v-for="line in order.lines" :key="line.id" class="space-y-2 px-4 py-3">
        <div class="flex items-start gap-3">
          <UBadge color="primary" variant="soft" class="min-h-8 min-w-12 max-w-28 shrink-0 justify-center gap-1 rounded-md px-2 py-1 whitespace-normal">
            <strong class="break-all text-xl font-bold leading-tight tabular-nums">{{ line.quantity }}</strong>
            <span class="break-all text-xs font-medium">{{ line.unit_code === 'C62' ? '×' : unitLabels[line.unit_code] || line.unit_code }}</span>
          </UBadge>
          <span class="min-w-0 flex-1 break-words pt-0.5 text-xl font-semibold leading-snug text-highlighted">{{ line.item.name }}</span>
        </div>
          <div v-if="editable" class="flex justify-end gap-2">
            <UButton
              label="Edit quantity"
              color="neutral"
              variant="ghost"
              size="sm"
              class="min-h-10"
              :aria-label="`Edit quantity for ${line.item.name}`"
              @click="editLine(line.id, line.quantity)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              size="sm"
              class="min-h-10 min-w-10"
              :aria-label="`Remove ${line.item.name}`"
              @click="$emit('remove-line', line.id)"
            />
          </div>
        <form
          v-if="editable && editingLineId === line.id"
          class="flex flex-wrap items-end gap-2 rounded-lg bg-elevated p-3"
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
    <div v-else class="py-6 text-center">
      <UIcon name="i-lucide-list-plus" class="mb-2 size-6 text-muted" aria-hidden="true" />
      <p class="font-medium">No items yet</p>
    </div>
    <template #footer>
      <div v-if="order.customer || order.delivery_address" class="mb-3 space-y-1 text-sm">
        <p v-if="order.customer?.name" class="break-words font-semibold">Customer: {{ order.customer.name }}</p>
        <p v-if="showContactDetails && order.customer?.phone" class="break-words">{{ order.customer.phone }}</p>
        <p v-if="showContactDetails && order.delivery_address" class="whitespace-pre-line break-words">Delivery: {{ order.delivery_address }}</p>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-muted">
        <span>{{ channelLabel }}</span>
        <span v-if="order.placed_by" class="min-w-0 break-words">Placed by {{ order.placed_by.name }}</span>
      </div>
    </template>
  </UCard>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Order } from '../../models/order.model'
const props = withDefaults(defineProps<{ order: Order; editable?: boolean; showContactDetails?: boolean }>(), {
  editable: true,
  showContactDetails: true,
})
const emit = defineEmits<{
  'update-quantity': [lineId: string, quantity: number]
  'remove-line': [lineId: string]
  'editing-change': [editing: boolean]
}>()
const editingLineId = ref('')
const editQuantity = ref<string | number>(1)
const unitLabels: Record<string, string> = { KGM: 'kg', LTR: 'l', HUR: 'h' }
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
const fulfilmentLabel = computed(() => {
  const method = props.order.fulfilment
  if (method === 'on_site') return 'Eat in'
  if (method === 'takeaway') return 'Takeaway'
  if (method === 'collection') return 'Collection'
  if (method === 'delivery') return 'Delivery'
  return ''
})
</script>
