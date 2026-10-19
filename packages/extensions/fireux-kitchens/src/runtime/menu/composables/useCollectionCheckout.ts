import { computed, ref, watch, onMounted, onScopeDispose, type Ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useOrderExchange } from '../../kitchen/composables/useOrderExchange'
import { useKitchenOfferingNow } from '../../kitchen/composables/useKitchenOfferingNow'
import { readOpeningHoursStatus } from 'fireux-places/runtime/place/utils/opening-hours-status'
import { orderSubmissionIssues } from '../../kitchen/utils/order-submission'
import {
  collectionOrder,
  collectionSelections,
} from '../utils/collection-checkout'
import { serviceItemSignature } from '../utils/service-basket'
import type { MenuServiceOffer } from '../utils/service-sections'
import type { OrderSubmission } from '../../kitchen/models/order-submission.model'
import type { useServiceBasket } from './useServiceBasket'

/** One checkout over the Collection owner's basket; existing transport owns auth and scoped requests. */
export function useCollectionCheckout(input: {
  basket: ReturnType<typeof useServiceBasket>
  offers: Ref<MenuServiceOffer[]>
  ready: Ref<boolean>
  kitchenSlug: Ref<string>
}) {
  const { basket, offers, ready } = input
  const kitchenId = computed(
    () =>
      basket.lines.value[0]?.source.kitchenId ||
      offers.value[0]?.source.kitchenId ||
      ''
  )
  const { currentUser } = useAuth()
  const transport = useOrderExchange(kitchenId, input.kitchenSlug)
  const { now } = useKitchenOfferingNow()
  const websiteEnabled =
    useRuntimeConfig().public.ordering?.channels?.includes('website')
  const name = ref(''),
    phone = ref('')
  const submission = ref<OrderSubmission | null>(null)
  const attempt = ref<Record<string, unknown> | null>(null)
  const locked = computed(() =>
    Boolean(attempt.value || transport.pending.value || submission.value)
  )
  const issues = computed(() => {
    if (attempt.value || submission.value) return []
    const messages = orderSubmissionIssues(
      collectionOrder(basket.lines.value, 'pending', name.value, phone.value)
    )
    if (!currentUser.value)
      messages.push(
        'Your ordering session is loading. Please try again shortly.'
      )
    if (!websiteEnabled) messages.push('Online ordering is unavailable.')
    if (!ready.value)
      messages.push(
        'Wait for food and drinks to reload before placing your order.'
      )
    else if (basket.staleKeys.value.length)
      messages.push(
        'Remove changed or unavailable items and choose them again.'
      )
    else if (
      basket.lines.value.some((line) => {
        const offer = offers.value.find(
          (row) => serviceItemSignature(row) === line.signature
        )
        return !offer?.offerings.some(
          (service) =>
            !service.paused &&
            service.collection_timing !== 'next_day' &&
            readOpeningHoursStatus(
              service.hours,
              service.hours?.timezone,
              now.value
            ).open
        )
      })
    )
      messages.push(
        'Collection is closed for one or more items. Please order during serving hours.'
      )
    return messages
  })
  async function submit() {
    if (issues.value.length || transport.pending.value || submission.value)
      return
    if (!attempt.value)
      attempt.value = {
        menuId:
          basket.lines.value[0]!.source.menuSlug ||
          basket.lines.value[0]!.source.menuId,
        kitchenSlug: input.kitchenSlug.value,
        order: collectionOrder(
          basket.lines.value,
          crypto.randomUUID(),
          name.value,
          phone.value
        ),
        selections: collectionSelections(basket.lines.value),
        expectedTotal: basket.totalMinor.value / 100,
      }
    const sent = attempt.value
    const result = await transport.request(
      '/api/ordering/menu-submit',
      JSON.parse(JSON.stringify(sent))
    )
    if (attempt.value !== sent) return
    if (result && !Array.isArray(result)) {
      submission.value = result
      return
    }
    const status = transport.failureStatus.value
    if (status >= 400 && status < 500 && ![408, 429].includes(status)) {
      const message = transport.error.value
      const receipt = await transport.request('/api/ordering/response', {
        orderId: (sent.order as { id: string }).id,
      })
      if (attempt.value !== sent) return
      if (receipt && !Array.isArray(receipt)) submission.value = receipt
      else {
        // A missing receipt confirms that editing cannot duplicate an earlier attempt.
        if (transport.failureStatus.value === 404) attempt.value = null
        transport.error.value = message
      }
    }
  }

  async function refresh() {
    const id = submission.value?.order.id
    if (!id || transport.pending.value) return
    const result = await transport.request('/api/ordering/response', {
      orderId: id,
    })
    if (result && !Array.isArray(result) && submission.value?.order.id === id)
      submission.value = result
  }
  function reset() {
    if (transport.pending.value) return
    attempt.value = null
    submission.value = null
    name.value = ''
    phone.value = ''
    basket.clear()
  }
  watch(transport.version, () => {
    attempt.value = null
    submission.value = null
    name.value = ''
    phone.value = ''
  })
  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    timer = setInterval(() => {
      if (
        submission.value &&
        !['completed', 'declined'].includes(submission.value.state)
      )
        void refresh()
    }, 4000)
  })
  onScopeDispose(() => {
    if (timer) clearInterval(timer)
  })
  const responseTitle = computed(
    () =>
      ({
        received: 'Order received',
        accepted: 'Order accepted',
        preparing: 'Your order is being prepared',
        ready: 'Your order is ready',
        completed: 'Order completed',
        declined: 'Order declined',
      })[submission.value?.state || 'received']
  )
  const responseMessage = computed(() =>
    submission.value?.state === 'ready'
      ? 'Please go to the counter to collect your order.'
      : submission.value?.state === 'received'
        ? 'The kitchen is reviewing your order. Please wait for confirmation.'
        : submission.value?.state === 'declined'
          ? 'The kitchen could not accept your order.'
          : submission.value?.state === 'completed'
            ? 'Thank you. Your order has been completed.'
            : 'The kitchen has your order. Updates will appear here.'
  )
  return {
    name,
    phone,
    submission,
    locked,
    issues,
    pending: transport.pending,
    error: transport.error,
    submit,
    reset,
    responseTitle,
    responseMessage,
  }
}
