<template>
  <section class="space-y-6 py-8">
    <h1 class="text-2xl font-semibold">Order ticket</h1>
    <section class="space-y-3" aria-labelledby="init-heading">
      <h2 id="init-heading" class="font-semibold">1. Init</h2>
      <UFormField label="Channel">
        <SegmentedSelector
          v-model="channel"
          :items="channels"
          label="Channel"
        />
      </UFormField>
      <UFormField v-if="channel === 'website'" label="Customer">
        <SegmentedSelector
          v-model="identity"
          :items="[
            { label: 'Guest', value: 'guest' },
            { label: 'Signed in', value: 'identified' },
          ]"
          label="Customer"
        />
      </UFormField>
      <p v-if="channel === 'pos'" class="text-sm text-muted">
        Example staff identity: Alex.
      </p>
      <p
        v-if="channel === 'website' && identity === 'identified'"
        class="text-sm text-muted"
      >
        Example signed-in customer: Sam.
      </p>
      <StagePreview :order="initOrder" name="init" label="init" />
    </section>
    <section
      v-if="channel === 'pos' || channel === 'kiosk' || channel === 'website'"
      class="space-y-3"
      aria-labelledby="pre-info-heading"
    >
      <h2 id="pre-info-heading" class="font-semibold">2. Pre-info</h2>
      <UFormField
        v-if="channel === 'pos' || channel === 'kiosk'"
        label="Fulfilment"
      >
        <SegmentedSelector
          v-model="kioskChoice"
          :items="[
            { label: 'Eat in', value: 'on_site' },
            { label: 'Takeaway', value: 'takeaway' },
          ]"
          label="Fulfilment"
        />
      </UFormField>
      <UFormField v-if="channel === 'website'" label="Website entrance">
        <SegmentedSelector
          v-model="websiteEntry"
          :items="[
            { label: 'Collection', value: 'collection' },
            { label: 'Delivery', value: 'delivery' },
            { label: 'Table QR', value: 'table' },
          ]"
          label="Website entrance"
        />
      </UFormField>
      <div
        v-if="channel === 'website' && websiteEntry === 'table'"
        class="grid max-w-sm gap-3"
      >
        <UFormField label="Table name supplied by QR"
          ><UInput v-model="tableName" :maxlength="200" class="w-full"
        /></UFormField>
        <UFormField label="Table reference (optional)"
          ><UInput v-model="tableId" :maxlength="128" class="w-full"
        /></UFormField>
        <p v-if="!tableName.trim()" class="text-sm text-muted">
          Table context has not been supplied yet.
        </p>
      </div>
      <StagePreview :order="preOrder" name="pre" label="pre-info" />
    </section>
    <section class="space-y-3" aria-labelledby="items-heading">
      <h2 id="items-heading" class="font-semibold">3. Items</h2>
      <UButton
        :label="itemsAdded ? 'Clear example items' : 'Add fixed food items'"
        color="neutral"
        variant="soft"
        @click="itemsAdded = !itemsAdded"
      />
      <StagePreview :order="itemsOrder" name="items" label="items" />
    </section>
    <section
      v-if="itemsAdded"
      class="max-w-sm space-y-3"
      aria-labelledby="post-info-heading"
    >
      <h2 id="post-info-heading" class="font-semibold">4. Post-info</h2>
      <p v-if="!selectedFulfilment" class="text-sm text-muted">
        Choose fulfilment in Pre-info first.
      </p>
      <template v-else>
        <UFormField v-if="needsLocation" label="Table / location (if needed)"
          ><UInput v-model="postLocation" :maxlength="200" class="w-full"
        /></UFormField>
        <UFormField
          v-if="needsName"
          :label="remoteOrder ? 'Customer name' : 'Pickup name (if needed)'"
          ><UInput v-model="customerName" :maxlength="200" class="w-full"
        /></UFormField>
        <p
          v-if="remoteOrder && identity === 'identified'"
          class="text-sm text-muted"
        >
          Customer name supplied by the signed-in profile: Sam.
        </p>
        <UFormField v-if="remoteOrder" label="Contact phone"
          ><UInput v-model="phone" type="tel" :maxlength="64" class="w-full"
        /></UFormField>
        <UFormField
          v-if="selectedFulfilment === 'delivery'"
          label="Delivery address"
          ><UTextarea v-model="address" :maxlength="500" class="w-full"
        /></UFormField>
        <UFormField
          v-if="websiteEntry !== 'table'"
          label="Requested time (optional)"
          ><UInput v-model="requestedTime" type="datetime-local" class="w-full"
        /></UFormField>
      </template>
      <StagePreview :order="order" name="order" label="order" />
    </section>
    <section class="max-w-sm space-y-3" aria-labelledby="review-heading">
      <h2 id="review-heading" class="font-semibold">5. Review and submit</h2>
      <Ticket
        :order="order"
        :editable="false"
        data-testid="review-ticket-preview"
      />
      <div
        v-if="reviewIssues.length"
        class="rounded-lg border border-default p-4"
        role="status"
      >
        <p class="mb-2 font-medium">Still needed</p>
        <ul class="list-disc space-y-1 pl-5 text-sm">
          <li v-for="issue in reviewIssues" :key="issue">{{ issue }}</li>
        </ul>
      </div>
      <p v-else class="text-sm text-muted">
        Required example information is complete.
      </p>
      <UButton
        :label="submittedOrder ? 'Submitted' : 'Submit order'"
        :disabled="reviewIssues.length > 0 || Boolean(submittedOrder)"
        @click="submitExample"
      />
      <p class="text-xs text-muted">Preview only. No order is sent.</p>
      <details class="rounded-lg border border-default p-4">
        <summary class="cursor-pointer text-sm font-medium">
          View review data
        </summary>
        <pre
          class="mt-3 overflow-auto text-sm"
          data-testid="review-json"
        ><code>{{ JSON.stringify(submittedOrder || order, null, 2) }}</code></pre>
      </details>
    </section>
    <section
      v-if="submittedOrder && successView"
      class="max-w-sm space-y-3"
      aria-labelledby="success-heading"
    >
      <h2 id="success-heading" class="font-semibold">6. Success</h2>
      <UFormField
        v-if="submittedOrder.requested_at && channel === 'website'"
        label="Confirmation outcome"
      >
        <SegmentedSelector
          v-model="successOutcome"
          :items="[
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Deposit required', value: 'deposit' },
          ]"
          label="Confirmation outcome"
        />
      </UFormField>
      <SuccessPreview :view="successView" />
      <p class="text-xs text-muted">
        Confirmation preview. Actions are not connected.
      </p>
    </section>
  </section>
</template>
<script setup lang="ts">
import Ticket from '../Orders/Ticket.vue'
import StagePreview from './Orders/Preview.vue'
import SuccessPreview from './Orders/Success.vue'
import SegmentedSelector from 'fireux-core/runtime/components/molecules/SegmentedSelector.vue'
import { computed, ref, watch } from 'vue'
import { type Order, type OrderLine } from '../../models/order.model'
import { readOrder } from '../../utils/ordering'
import { orderSubmissionIssues } from '../../utils/order-submission'
const channels = [
  { label: 'POS', value: 'pos' as const },
  { label: 'Kiosk', value: 'kiosk' as const },
  { label: 'Website', value: 'website' as const },
]
const channel = ref<'pos' | 'kiosk' | 'website'>('pos')
const kioskChoice = ref<'' | 'on_site' | 'takeaway'>('')
const websiteEntry = ref<'' | 'collection' | 'delivery' | 'table'>('')
const identity = ref<'' | 'guest' | 'identified'>('')
const itemsAdded = ref(false)
const exampleLines: OrderLine[] = [
  {
    id: 'example-line-pizza',
    item: { id: 'example-pizza', name: 'Margherita pizza' },
    quantity: 1,
    unit_code: 'C62',
  },
  {
    id: 'example-line-fries',
    item: { id: 'example-fries', name: 'French fries' },
    quantity: 2,
    unit_code: 'C62',
  },
]
const tableName = ref('')
const tableId = ref('')
const postLocation = ref('')
const customerName = ref('')
const phone = ref('')
const address = ref('')
const requestedTime = ref('')
const selectedFulfilment = computed(() =>
  channel.value === 'website'
    ? websiteEntry.value === 'table'
      ? 'on_site'
      : websiteEntry.value
    : kioskChoice.value
)
const remoteOrder = computed(
  () =>
    channel.value === 'website' &&
    ['collection', 'delivery'].includes(websiteEntry.value)
)
const needsName = computed(() =>
  remoteOrder.value
    ? identity.value !== 'identified'
    : channel.value === 'kiosk' || kioskChoice.value === 'takeaway'
)
const needsLocation = computed(
  () =>
    selectedFulfilment.value === 'on_site' &&
    !(channel.value === 'website' && tableName.value.trim())
)
function clearPostInfo() {
  postLocation.value = ''
  customerName.value = ''
  phone.value = ''
  address.value = ''
  requestedTime.value = ''
}
watch([channel, kioskChoice, websiteEntry], clearPostInfo, { flush: 'sync' })
watch(
  identity,
  () => {
    customerName.value = ''
    phone.value = ''
  },
  { flush: 'sync' }
)

watch(
  channel,
  () => {
    kioskChoice.value = ''
    websiteEntry.value = ''
    identity.value = ''
    tableName.value = ''
    tableId.value = ''
  },
  { flush: 'sync' }
)
/** Local entry fixtures only; no authentication or production initiation is implied. */
const order = computed<Order>(() => {
  const draft: Order = {
    id: `example-${channel.value}`,
    number: '',
    channel: channel.value,
    lines: itemsAdded.value ? exampleLines : [],
  }
  if (channel.value === 'pos')
    draft.placed_by = { kind: 'person', id: 'example-staff', name: 'Alex' }
  if (channel.value === 'pos' || channel.value === 'kiosk')
    draft.fulfilment = kioskChoice.value
  if (channel.value === 'website') {
    draft.fulfilment =
      websiteEntry.value === 'table' ? 'on_site' : websiteEntry.value
    if (websiteEntry.value === 'table' && tableName.value.trim())
      draft.location = {
        name: tableName.value.trim(),
        ...(tableId.value.trim() ? { id: tableId.value.trim() } : {}),
      }
  }
  if (channel.value === 'website' && identity.value === 'identified')
    draft.placed_by = { kind: 'person', id: 'example-customer', name: 'Sam' }
  if (itemsAdded.value && selectedFulfilment.value) {
    if (
      !draft.location &&
      selectedFulfilment.value === 'on_site' &&
      postLocation.value.trim()
    )
      draft.location = { name: postLocation.value.trim() }
    const name =
      remoteOrder.value && identity.value === 'identified'
        ? 'Sam'
        : needsName.value
          ? customerName.value.trim()
          : ''
    const contact = remoteOrder.value ? phone.value.trim() : ''
    if (name || contact)
      draft.customer = {
        ...(name ? { name } : {}),
        ...(contact ? { phone: contact } : {}),
      }
    if (selectedFulfilment.value === 'delivery' && address.value.trim())
      draft.delivery_address = address.value.trim()
    if (
      websiteEntry.value !== 'table' &&
      requestedTime.value &&
      Number.isFinite(Date.parse(requestedTime.value))
    )
      draft.requested_at = new Date(requestedTime.value).toISOString()
  }
  return readOrder(draft)
})
const initOrder = computed<Order>(() =>
  readOrder({
    id: order.value.id,
    number: order.value.number,
    channel: order.value.channel,
    lines: [],
    ...(order.value.placed_by ? { placed_by: order.value.placed_by } : {}),
  })
)
const preOrder = computed<Order>(() =>
  readOrder({
    ...initOrder.value,
    fulfilment: selectedFulfilment.value,
    ...(channel.value === 'website' &&
    websiteEntry.value === 'table' &&
    tableName.value.trim()
      ? {
          location: {
            name: tableName.value.trim(),
            ...(tableId.value.trim() ? { id: tableId.value.trim() } : {}),
          },
        }
      : {}),
  })
)
const itemsOrder = computed<Order>(() =>
  readOrder({ ...preOrder.value, lines: order.value.lines })
)
const reviewIssues = computed(() => {
  const value = order.value
  const issues = orderSubmissionIssues(value)
  if (
    itemsAdded.value &&
    websiteEntry.value !== 'table' &&
    requestedTime.value &&
    !Number.isFinite(Date.parse(requestedTime.value))
  )
    issues.push('Enter a valid requested time or leave it empty.')
  return issues
})
const successOutcome = ref<'confirmed' | 'deposit'>('confirmed')
const submittedOrder = ref<Order | null>(null)
function submitExample() {
  if (reviewIssues.value.length || submittedOrder.value) return
  submittedOrder.value = readOrder(order.value)
}
watch(
  [() => JSON.stringify(order.value), requestedTime],
  () => {
    submittedOrder.value = null
    successOutcome.value = 'confirmed'
  },
  { flush: 'sync' }
)
const successView = computed(() => {
  const value = submittedOrder.value
  if (!value) return null
  const scheduled = value.requested_at?.slice(0, 16).replace('T', ' ')
  if (
    scheduled &&
    channel.value === 'website' &&
    successOutcome.value === 'deposit'
  )
    return {
      title: 'Confirm your pre-order',
      message: `Your order is reserved for ${scheduled} UTC. Please pay the required deposit to confirm it.`,
      action: 'Pay deposit',
      icon: 'i-lucide-credit-card',
    }
  if (scheduled)
    return {
      title: 'Order scheduled',
      message: `Your order is confirmed for ${scheduled} UTC.${value.fulfilment === 'delivery' ? ' We’ll deliver it to your address.' : value.fulfilment === 'on_site' ? ' Please arrive at your selected time.' : ' Please collect it at your selected time.'}`,
      action: 'View order',
      icon: 'i-lucide-calendar-check',
    }
  if (value.fulfilment === 'delivery')
    return {
      title: 'Your order is on its way',
      message: 'Your driver is expected in about 20 minutes.',
      action: 'Track delivery',
      icon: 'i-lucide-truck',
    }
  if (value.fulfilment === 'on_site' && value.location)
    return {
      title: 'Order confirmed',
      message: `Your order is confirmed for ${value.location.name}.`,
      action: 'View order',
      icon: 'i-lucide-utensils',
    }
  if (value.fulfilment === 'collection')
    return {
      title: 'Order confirmed',
      message: 'Please go to the collection counter to collect your order.',
      action: 'View collection details',
      icon: 'i-lucide-shopping-bag',
    }
  return {
    title: 'Order confirmed',
    message: 'Please go to the counter to collect your order.',
    action: 'View order',
    icon: 'i-lucide-check',
  }
})
</script>
