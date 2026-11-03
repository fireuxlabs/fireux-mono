import { computed, ref, watch, onMounted, onScopeDispose, type Ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useOrderExchange } from '../../kitchen/composables/useOrderExchange'
import { useKitchenOfferingNow } from '../../kitchen/composables/useKitchenOfferingNow'
import { readOpeningHoursStatus } from 'fireux-places/runtime/place/utils/opening-hours-status'
import { orderSubmissionIssues } from '../../kitchen/utils/order-submission'
import {
  serviceOrder,
  serviceSelections,
  type MenuCheckoutService,
} from '../utils/ordering/checkout'
import { serviceItemSignature } from '../utils/ordering/basket'
import type { MenuServiceOffer } from '../utils/ordering/sections'
import type { OrderSubmission } from '../../kitchen/models/order-submission.model'
import type { useServiceBasket } from './useServiceBasket'
import { useServiceRecovery } from './useServiceRecovery'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

/** One checkout over a Menu basket; existing transport owns auth and scoped requests. */
export function useServiceCheckout(input: {
  basket: ReturnType<typeof useServiceBasket>
  offers: Ref<MenuServiceOffer[]>
  ready: Ref<boolean>
  kitchenSlug: Ref<string>
  entryId?: Ref<string>
  service?: MenuCheckoutService
}) {
  const { basket, offers, ready } = input
  const service = input.service || 'collection'
  const kiosk = service !== 'collection'
  const label =
    service === 'eat_in'
      ? 'Eat in'
      : service === 'takeaway'
        ? 'Takeaway'
        : 'Collection'
  const kitchenId = computed(
    () =>
      basket.lines.value[0]?.source.kitchenId ||
      offers.value[0]?.source.kitchenId ||
      ''
  )
  const { currentUser } = useAuth()
  const transport = useOrderExchange(kitchenId, input.kitchenSlug)
  const { now } = useKitchenOfferingNow()
  const channelEnabled = useRuntimeConfig().public.ordering?.channels?.includes(
    kiosk ? 'kiosk' : 'website'
  )
  const name = ref(''),
    phone = ref('')
  const submission = ref<OrderSubmission | null>(null)
  const attempt = ref<Record<string, unknown> | null>(null)
  const resets = ref(0)
  const locked = computed(() =>
    Boolean(attempt.value || transport.pending.value || submission.value)
  )
  const issues = computed(() => {
    if (attempt.value || submission.value) return []
    const messages = orderSubmissionIssues(
      serviceOrder(
        basket.lines.value,
        'pending',
        name.value,
        phone.value,
        service
      )
    )
    if (!currentUser.value)
      messages.push(
        'Your ordering session is loading. Please try again shortly.'
      )
    if (kiosk && currentUser.value && !currentUser.value.isAnonymous)
      messages.push(
        'Open Kiosk in a private browser window without a staff account.'
      )
    if (!channelEnabled) messages.push('Ordering is unavailable.')
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
        `${label} is closed for one or more items. Please order during serving hours.`
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
        order: serviceOrder(
          basket.lines.value,
          crypto.randomUUID(),
          name.value,
          phone.value,
          service
        ),
        selections: serviceSelections(basket.lines.value),
        expectedTotal: basket.totalMinor.value / 100,
      }
    const sent = attempt.value
    const payload = JSON.parse(JSON.stringify(sent))
    if (config.isTenant) delete payload.kitchenSlug
    const result = await transport.request('/api/ordering/menu-submit', payload)
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
    if (transport.pending.value && !submission.value) return
    clearSession()
    resets.value++
  }
  function clearSession() {
    attempt.value = null
    submission.value = null
    name.value = ''
    phone.value = ''
    basket.clear()
  }
  const config = useFireUXConfig()
  const recovery = useServiceRecovery({
    service,
    key: computed(() =>
      currentUser.value?.uid
        ? `checkout:${JSON.stringify([config.appId, input.kitchenSlug.value, input.entryId?.value || '', service, currentUser.value.uid])}`
        : ''
    ),
    lines: basket.lines,
    name,
    phone,
    attempt,
    clear: clearSession,
    resume: () => {
      void resume()
    },
  })
  async function resume() {
    const sent = attempt.value
    if (!sent) return
    const result = await transport.request('/api/ordering/response', {
      orderId: (sent.order as { id: string }).id,
    })
    if (attempt.value === sent && result && !Array.isArray(result))
      submission.value = result
  }
  let timer: ReturnType<typeof setInterval> | undefined
  let resetTimer: ReturnType<typeof setTimeout> | undefined
  let mounted = false
  // A shared touchscreen must clear between customers. An unresolved submission
  // keeps its exact retry reference; it must never be timed out into a new order.
  function scheduleReset() {
    if (resetTimer) clearTimeout(resetTimer)
    resetTimer = undefined
    if (!mounted || !kiosk || transport.pending.value) return
    if (submission.value) resetTimer = setTimeout(reset, 30000)
    else if (!attempt.value && basket.lines.value.length)
      resetTimer = setTimeout(reset, 120000)
  }
  watch(
    [basket.lines, attempt],
    () => {
      if (!submission.value) scheduleReset()
    },
    { deep: true }
  )
  watch(() => submission.value?.order.id, scheduleReset)
  onMounted(() => {
    mounted = true
    scheduleReset()
    timer = setInterval(() => {
      if (
        submission.value &&
        !['completed', 'declined'].includes(submission.value.state)
      )
        void refresh()
    }, 4000)
  })
  onScopeDispose(() => {
    mounted = false
    if (timer) clearInterval(timer)
    if (resetTimer) clearTimeout(resetTimer)
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
      ? 'Your order is ready to collect.'
      : submission.value?.state === 'received'
        ? 'Waiting for the kitchen to accept your order.'
        : submission.value?.state === 'declined'
          ? 'The kitchen could not accept your order.'
          : submission.value?.state === 'completed'
            ? 'Thank you. Your order has been completed.'
            : submission.value?.state === 'preparing'
              ? 'The kitchen is preparing your order.'
              : 'The kitchen has accepted your order. We’ll update you when it’s ready.'
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
    refresh,
    recoveryError: recovery.error,
    kiosk,
    label,
    resets,
    responseTitle,
    responseMessage,
  }
}
