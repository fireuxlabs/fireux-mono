import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { readWeekdayTimeOpenState } from '../../utils/weekday-time'
import { useKitchenServiceNow } from '../../kitchen/composables/useKitchenServiceNow'

type MenuServiceChipColor = 'neutral' | 'success' | 'error'

export function useMenuServiceComputed(
  serviceHours: MaybeRefOrGetter<unknown>,
  options: {
    orderType?: MaybeRefOrGetter<string | null | undefined>
  } = {}
) {
  const { now: serviceNow } = useKitchenServiceNow()
  const menuServiceOpenState = computed(() =>
    readWeekdayTimeOpenState(toValue(serviceHours), serviceNow.value)
  )
  const orderType = computed(() =>
    String(toValue(options.orderType) || '').trim()
  )
  const menuServiceChip = computed(() => {
    const known = menuServiceOpenState.value.known
    const open = menuServiceOpenState.value.open
    const isPreOrder = orderType.value === 'pre_order'
    const color: MenuServiceChipColor =
      isPreOrder || !known ? 'neutral' : open ? 'success' : 'error'

    return {
      known,
      open,
      color,
      label: isPreOrder
        ? ''
        : !known
          ? 'Opening hours unavailable'
          : open
            ? 'Open now'
            : 'Not open',
    }
  })

  return {
    menuServiceChip,
    menuServiceOpenState,
  }
}
