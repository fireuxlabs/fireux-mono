<template>
  <UCard class="overflow-hidden">
    <template #header>
      <div class="card__header">
        <div class="card__media">
          <UIcon
            name="i-lucide-receipt-text"
            class="shrink-0"
            aria-hidden="true"
          />
          <h2 class="min-w-0 break-words">
            {{
              order.location?.name ||
              (order.number ? `#${order.number}` : 'Order')
            }}
          </h2>
        </div>
        <div v-if="order.location" class="min-w-0 max-w-[40%]">
          <p
            :aria-label="
              order.number ? `Order ${order.number}` : 'Unnumbered order'
            "
            class="break-words tabular-nums"
          >
            {{ order.number ? `#${order.number}` : 'Order' }}
          </p>
        </div>
      </div>
      <p v-if="order.fulfilment" class="mt-2">{{ fulfilmentLabel }}</p>
      <p v-if="order.requested_at" class="mt-1">
        Requested {{ order.requested_at.slice(0, 16).replace('T', ' ') }} UTC
      </p>
    </template>
    <ul
      v-if="order.lines.length"
      class="divide-y divide-default"
      aria-label="Order lines"
    >
      <li
        v-for="line in order.lines"
        :key="line.id"
        class="space-y-2 px-4 py-3"
      >
        <div class="fx-card__chips">
          <UBadge
            color="primary"
            variant="soft"
            class="shrink-0 justify-center gap-1"
          >
            <strong class="break-all tabular-nums">{{ line.quantity }}</strong>
            <span class="break-all">{{
              line.unit_code === 'C62'
                ? '×'
                : unitLabels[line.unit_code] || line.unit_code
            }}</span>
          </UBadge>
          <span class="min-w-0 flex-1 break-words pt-0.5">{{
            line.item.name
          }}</span>
        </div>
        <div v-if="editable" class="fx-card__actions">
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
        <ul
          v-if="line.notes?.length"
          class="fx-card-body-stack"
          aria-label="Item choices"
        >
          <li v-for="(note, index) in line.notes" :key="index">{{ note }}</li>
        </ul>
      </li>
    </ul>
    <div v-else class="py-6">
      <UIcon name="i-lucide-list-plus" aria-hidden="true" />
      <p>No items yet</p>
    </div>
    <template #footer>
      <div
        v-if="order.customer || order.delivery_address"
        class="fx-card-body-stack"
      >
        <p v-if="order.customer?.name" class="break-words">
          Customer: {{ order.customer.name }}
        </p>
        <p
          v-if="showContactDetails && order.customer?.phone"
          class="break-words"
        >
          {{ order.customer.phone }}
        </p>
        <p
          v-if="showContactDetails && order.delivery_address"
          class="whitespace-pre-line break-words"
        >
          Delivery: {{ order.delivery_address }}
        </p>
      </div>
      <div class="card__header">
        <span>{{ channelLabel }}</span>
        <span v-if="order.placed_by" class="min-w-0 break-words"
          >Placed by {{ order.placed_by.name }}</span
        >
      </div>
    </template>
  </UCard>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Order } from '../../models/order.model'
const props = withDefaults(
  defineProps<{
    order: Order
    editable?: boolean
    showContactDetails?: boolean
  }>(),
  {
    editable: true,
    showContactDetails: true,
  }
)
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
