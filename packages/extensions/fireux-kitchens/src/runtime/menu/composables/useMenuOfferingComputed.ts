import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { readWeekdayTimeOpenState } from '../../utils/weekday-time'
import { useKitchenOfferingNow } from '../../kitchen/composables/useKitchenOfferingNow'

type MenuOfferingChipColor = 'neutral' | 'success' | 'error'

export function useMenuOfferingComputed(
  offeringHours: MaybeRefOrGetter<unknown>,
  options: {
    orderType?: MaybeRefOrGetter<string | null | undefined>
  } = {}
) {
  const { now: serviceNow } = useKitchenOfferingNow()
  const menuOfferingOpenState = computed(() =>
    readWeekdayTimeOpenState(toValue(offeringHours), serviceNow.value)
  )
  const orderType = computed(() =>
    String(toValue(options.orderType) || '').trim()
  )
  const menuOfferingChip = computed(() => {
    const known = menuOfferingOpenState.value.known
    const open = menuOfferingOpenState.value.open
    const isPreOrder = orderType.value === 'pre_order'
    const color: MenuOfferingChipColor =
      isPreOrder || !known ? 'neutral' : open ? 'success' : 'error'

    return {
      known,
      open,
      color,
      label: isPreOrder
        ? ''
        : !known
          ? 'Serving times unavailable'
          : open
            ? 'Serving now'
            : 'Not serving now',
    }
  })

  return {
    menuOfferingChip,
    menuOfferingOpenState,
  }
}
