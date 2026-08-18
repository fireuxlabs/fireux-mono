import {
  computed,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import type { MenuOrderingFunnelState } from '../../../../../menu/models/menu-ordering.model.ts'
import { menuOrderDepositLabel } from '../../../../../menu/utils/menu-ordering-ui'
import { readWeekdayTimeNextOpeningText } from '../../../../../utils/weekday-time-next'

export function usePreOrderFunnel(
  order: MaybeRefOrGetter<MenuOrderingFunnelState>
) {
  const currentOrder = computed(() => toValue(order))
  const currencyCode = computed(() =>
    currentOrder.value.currencyCode.trim().toUpperCase()
  )
  const noticeHours = computed(() =>
    Math.max(0, Number(currentOrder.value.policy?.notice_hours || 24))
  )
  const depositLabel = computed(() =>
    menuOrderDepositLabel(
      currentOrder.value.policy?.fulfilment?.deposit,
      currencyCode.value
    )
  )
  const nextOpening = computed(() =>
    readWeekdayTimeNextOpeningText(currentOrder.value.serviceHours?.operation_hours)
  )
  const detailsStatus = computed(() =>
    `For large groups, we appreciate a pre-order. Choose an arrival time during serving hours and send it at least ${noticeHours.value} hours before you arrive.`
  )
  const kitchenStatus = computed(() =>
    'Leave an email so the kitchen can confirm this pre-order request.'
  )
  const depositStatus = computed(() =>
    depositLabel.value
      ? `Secure payment for the ${depositLabel.value} is required before the kitchen can accept this pre-order.`
      : 'No online deposit is required for this pre-order.'
  )
  const timingStatus = computed(() =>
    nextOpening.value
      ? `Next serving window starts ${nextOpening.value}.`
      : 'The team will confirm when a kitchen operator is online.'
  )
  const ready = computed(() => true)

  return {
    depositStatus,
    detailsStatus,
    kitchenStatus,
    ready,
    timingStatus,
  }
}
