import {
  computed,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import type { MenuOrderingFunnelState } from '../../../../../../models/kitchen/menu/menu-ordering.model'

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
  const detailsStatus = computed(() =>
    `For large groups, we appreciate a pre-order. A kitchen operator needs to receive it at least ${noticeHours.value} hours before you arrive.`
  )
  const kitchenStatus = computed(() =>
    operatorOnline.value
      ? 'A kitchen operator is online to receive this request.'
      : 'No kitchen operator is online right now.'
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
    'The request needs to be received before the notice window closes.'
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
