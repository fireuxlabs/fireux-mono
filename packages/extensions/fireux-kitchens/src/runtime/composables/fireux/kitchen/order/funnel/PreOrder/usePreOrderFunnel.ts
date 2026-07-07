import {
  computed,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import type { MenuOrderingFunnelState } from '../../../../../../models/kitchen/menu/menu-ordering.model'
import { readWeekdayTimeNextOpeningText } from '../../../../../../utils/weekday-time-next'

const preOrderDepositPerPerson = 10
const money = (amount: number, currencyCode: string) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount)

export function usePreOrderFunnel(
  order: MaybeRefOrGetter<MenuOrderingFunnelState>,
  options: {
    operatorOnline?: MaybeRefOrGetter<boolean>
  } = {}
) {
  const currentOrder = computed(() => toValue(order))
  const currencyCode = computed(() =>
    currentOrder.value.currencyCode.trim().toUpperCase()
  )
  const noticeHours = computed(() =>
    Math.max(0, Number(currentOrder.value.policy?.notice_hours || 24))
  )
  const depositLabel = computed(() =>
    `${money(preOrderDepositPerPerson, currencyCode.value)} deposit per person`
  )
  const operatorOnline = computed(() => toValue(options.operatorOnline) !== false)
  const nextOpening = computed(() =>
    readWeekdayTimeNextOpeningText(currentOrder.value.serviceHours?.operation_hours)
  )
  const detailsStatus = computed(() =>
    `For large groups, we appreciate a pre-order. Choose an arrival time during serving hours and send it at least ${noticeHours.value} hours before you arrive.`
  )
  const kitchenStatus = computed(() =>
    operatorOnline.value
      ? 'A kitchen operator is online to receive this request.'
      : 'No kitchen operator is online right now. Leave an email and the team will confirm that they have your request.'
  )
  const depositStatus = computed(() =>
    depositLabel.value
      ? `Once confirmed, we will ask for a ${depositLabel.value}.`
      : 'Once confirmed, the kitchen will send the next step.'
  )
  const operatorStatus = computed(() =>
    operatorOnline.value ? 'online' : 'offline'
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
    operatorStatus,
    ready,
    timingStatus,
  }
}
