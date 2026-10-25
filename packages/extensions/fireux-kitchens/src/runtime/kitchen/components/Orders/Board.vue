<template>
  <section ref="board" class="order-board min-h-full space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap gap-2" aria-label="Order states">
        <UButton
          v-for="state in states"
          :key="state"
          :label="`${labels[state]} · ${allOrders.filter((entry) => entry.state === state).length}`"
          color="neutral"
          :variant="selectedStates.includes(state) ? 'solid' : 'outline'"
          :aria-pressed="selectedStates.includes(state)"
          class="min-h-11 px-4"
          @click="toggleState(state)"
        />
      </div>
      <div class="flex items-center gap-2">
        <UButton
          :label="fullscreen ? 'Exit full screen' : 'Full screen'"
          :icon="fullscreen ? 'i-lucide-minimize' : 'i-lucide-maximize'"
          color="neutral"
          variant="outline"
          :aria-pressed="fullscreen"
          @click="toggleFullscreen"
        />
      </div>
    </header>
    <UModal
      v-model:open="editorOpen"
      title="Order"
      :ui="{ content: 'sm:max-w-5xl' }"
      ><template #body
        ><KitchenOrdersEditor
          v-if="editorOpen"
          :initial-order="editorOrder || undefined" /></template
    ></UModal>
    <UAlert
      v-if="draftSource.error.value"
      color="error"
      description="Some open orders could not be loaded."
    />
    <p v-if="!kitchenId" class="py-16 text-center text-muted">
      Select a Kitchen first.
    </p>
    <UAlert
      v-if="error || refreshTransport.error.value || fullscreenError"
      color="error"
      :description="error || refreshTransport.error.value || fullscreenError"
    />
    <p
      v-if="loaded && !allOrders.length && !error"
      class="py-20 text-center text-xl text-muted"
    >
      No orders yet
    </p>
    <p
      v-else-if="loaded && !visibleOrders.length && !error"
      class="py-20 text-center text-muted"
    >
      No orders in the selected states.
    </p>
    <div class="ticket-grid">
      <article
        v-for="entry in visibleOrders"
        :key="entry.order.id"
        class="board-ticket overflow-hidden rounded-xl border border-default bg-default"
        :style="{
          borderTopColor: colours[entry.state as keyof typeof colours],
        }"
        :aria-label="`Order ${entry.order.number}`"
      >
        <div
          class="flex items-center justify-between px-4 py-2 text-sm font-semibold"
        >
          <span>{{ labels[entry.state as keyof typeof labels] }}</span>
        </div>
        <KitchenOrdersTicket
          :order="entry.order"
          :editable="false"
          :show-contact-details="false"
          class="rounded-none ring-0"
        />
        <div class="space-y-3 border-t border-default p-3">
          <UButton
            v-if="entry.state === 'open'"
            label="Open order"
            block
            size="lg"
            @click="openEditor(entry)"
          />
          <UButton
            v-if="entry.state === 'received'"
            label="Accept order"
            block
            size="lg"
            :disabled="pending"
            @click="respond(entry, 'accepted')"
          />
          <UButton
            v-if="entry.state === 'accepted'"
            label="Start preparing"
            block
            size="lg"
            :disabled="pending"
            @click="respond(entry, 'preparing')"
          />
          <UButton
            v-if="entry.state === 'preparing'"
            label="Mark ready"
            block
            size="lg"
            :disabled="pending"
            @click="respond(entry, 'ready')"
          />
          <UButton
            v-if="entry.state === 'ready'"
            label="Complete order"
            block
            size="lg"
            :disabled="pending"
            @click="respond(entry, 'completed')"
          />
          <FireDisclosurePanel
            v-if="
              entry.state === 'received' ||
              entry.order.customer?.phone ||
              entry.order.delivery_address
            "
            :title="
              entry.state === 'received'
                ? 'Respond / order details'
                : 'Order details'
            "
            :default-open="false"
            variant="ghost"
            size="sm"
            class="text-sm"
          >
            <div class="space-y-3 pt-3">
              <p v-if="entry.order.customer?.phone">
                {{ entry.order.customer.phone }}
              </p>
              <p
                v-if="entry.order.delivery_address"
                class="whitespace-pre-line"
              >
                {{ entry.order.delivery_address }}
              </p>
              <template v-if="entry.state === 'received'">
                <UFormField label="Estimate (minutes)"
                  ><!-- @vue-generic {string | number, {}} -->
                  <UInput
                    v-model="estimates[entry.order.id]"
                    type="number"
                    min="1"
                    max="1440"
                    class="w-full"
                /></UFormField>
                <UFormField label="Message / reason for declining"
                  ><UTextarea
                    v-model="messages[entry.order.id]"
                    :maxlength="500"
                    class="w-full"
                /></UFormField>
                <UButton
                  label="Decline order"
                  color="error"
                  variant="soft"
                  block
                  :disabled="pending || !messages[entry.order.id]?.trim()"
                  @click="respond(entry, 'declined')"
                />
              </template>
            </div>
          </FireDisclosurePanel>
        </div>
      </article>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useKitchenWorkspace } from '../../composables/workspace/useKitchenWorkspace'
import { useKitchenOrderDraftCollection } from '../../composables/useKitchenOrderDraftCollection'
import { useKitchenAccess } from '../../composables/useKitchenAccess'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useOrderExchange } from '../../composables/useOrderExchange'
import type { SavedOrderDraft } from '../../models/order.model'
import type {
  OrderSubmission,
  OrderSubmissionState,
} from '../../models/order-submission.model'
const workspace = useKitchenWorkspace()
const access = useKitchenAccess()
const session = useAppSession()
const kitchenId = computed(() =>
  !session.pending.value &&
  !session.error.value &&
  session.appUser.value &&
  access.outcome.value === 'ready' &&
  access.ids.value.includes(workspace.id.value || '')
    ? workspace.id.value || ''
    : ''
)
const accessScope = computed(() =>
  JSON.stringify([
    session.appUser.value,
    access.outcome.value,
    access.ids.value,
    Boolean(access.error.value),
  ])
)
const { request, pending, error, version } = useOrderExchange(
  kitchenId,
  accessScope
)
const refreshTransport = useOrderExchange(kitchenId, accessScope)
const orders = ref<OrderSubmission[]>([])
const loaded = ref(false)
const estimates = ref<Record<string, string | number>>({})
const messages = ref<Record<string, string>>({})
const board = ref<HTMLElement | null>(null)
const fullscreen = ref(false)
const fullscreenError = ref('')
type BoardEntry = Omit<OrderSubmission, 'state'> & {
  state: OrderSubmissionState | 'open'
}
const draftSource = useKitchenOrderDraftCollection(kitchenId, { all: true })
const editorOpen = ref(false)
const editorOrder = ref<SavedOrderDraft | null>(null)
function openEditor(entry: BoardEntry) {
  editorOrder.value = entry
  editorOpen.value = true
}
const allOrders = computed<BoardEntry[]>(() => {
  const submitted = new Set(orders.value.map((entry) => entry.order.id))
  return [
    ...draftSource.drafts.value
      .filter((entry) => !submitted.has(entry.order.id))
      .map((entry) => ({
        ...entry,
        state: 'open' as const,
        message: '',
        estimate_minutes: null,
      })),
    ...orders.value,
  ]
})
const states = [
  'open',
  'received',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'declined',
] as const
const selectedStates = ref<string[]>([...states])
const labels = {
  open: 'Open',
  completed: 'Completed',
  declined: 'Declined',
  received: 'New',
  accepted: 'Waiting',
  preparing: 'Preparing',
  ready: 'Ready',
}
const colours = {
  open: '#a78bfa',
  completed: '#64748b',
  declined: '#ef4444',
  received: '#f59e0b',
  accepted: '#94a3b8',
  preparing: '#3b82f6',
  ready: '#10b981',
}
const visibleOrders = computed(() =>
  allOrders.value
    .filter((entry) => selectedStates.value.includes(entry.state))
    .sort((a, b) => Number(a.order.number) - Number(b.order.number))
)
function toggleState(state: string) {
  selectedStates.value = selectedStates.value.includes(state)
    ? selectedStates.value.filter((value) => value !== state)
    : [...selectedStates.value, state]
}
function syncFullscreen() {
  fullscreen.value = document.fullscreenElement === board.value
}
async function toggleFullscreen() {
  fullscreenError.value = ''
  try {
    if (fullscreen.value) await document.exitFullscreen()
    else if (board.value?.requestFullscreen)
      await board.value.requestFullscreen()
    else fullscreenError.value = 'Full screen is unavailable in this browser.'
  } catch {
    fullscreenError.value =
      'This browser could not enter full screen. Try opening the board in your regular browser.'
  }
}
onMounted(() => document.addEventListener('fullscreenchange', syncFullscreen))
onUnmounted(() =>
  document.removeEventListener('fullscreenchange', syncFullscreen)
)
async function refresh() {
  if (!kitchenId.value || refreshTransport.pending.value) return
  const result = await refreshTransport.request(
    '/api/workspace/kitchen/submitted-orders',
    {},
    'GET'
  )
  if (Array.isArray(result)) {
    orders.value = result
    loaded.value = true
  } else if (refreshTransport.error.value) {
    orders.value = []
    loaded.value = false
  }
}
async function respond(entry: BoardEntry, state: OrderSubmissionState) {
  const estimate = estimates.value[entry.order.id]
  const result = await request(
    '/api/workspace/kitchen/submitted-orders/respond',
    {
      orderId: entry.order.id,
      expectedRevision: entry.revision,
      state,
      message: messages.value[entry.order.id] || entry.message,
      estimate_minutes:
        estimate === undefined || estimate === ''
          ? entry.estimate_minutes
          : Number(estimate),
    }
  )
  if (result && !Array.isArray(result))
    orders.value = orders.value.map((saved) =>
      saved.order.id === result.order.id ? result : saved
    )
}
watch(
  version,
  () => {
    editorOrder.value = null
    editorOpen.value = false
    orders.value = []
    loaded.value = false
    estimates.value = {}
    messages.value = {}
    void refresh()
  },
  { flush: 'sync' }
)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  void refresh()
  timer = setInterval(() => {
    void refresh()
  }, 4000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.ticket-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  align-items: start;
  gap: 16px;
}
.board-ticket {
  border-top-width: 4px;
}
.order-board:fullscreen {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 24px;
  background: var(--ui-bg);
}
</style>
