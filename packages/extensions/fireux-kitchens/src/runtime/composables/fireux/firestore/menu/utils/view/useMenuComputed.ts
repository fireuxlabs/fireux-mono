import { computed, toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import type { KitchenMenu as Menu } from '../../../../../../models/kitchen/menu/kitchen-menu.model'
import { readWeekdayTimeOpenState } from '../../../../../../utils/weekday-time'
import { useKitchenServiceNow } from '../../../../kitchen/useKitchenServiceNow'
import { useMenuInterface } from './useMenuInterface'

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
    const color: MenuServiceChipColor = isPreOrder || !known
      ? 'neutral'
      : open
        ? 'success'
        : 'error'

    return {
      known,
      open,
      color,
      // TODO(menu-ordering): migrate kitchen hours into editable menu-level
      // service windows. Pre-orders can be submitted any time; confirmation is
      // gated by kitchen opening hours or an operator being signed in.
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

export function useMenuComputed(
  menu: Ref<Menu | null | undefined>,
  pending: Ref<boolean>
) {
  const { pill: menuInterface } = useMenuInterface()
  const menuServiceHours = computed(() =>
    menu.value?.ordering?.service_hours?.operation_hours
  )
  const menuServiceComputed = useMenuServiceComputed(menuServiceHours)

  const isPending = computed(() => Boolean(pending.value))
  const menuCard = computed(() => (menu.value ? menuInterface(menu.value) : null))
  const menuSearchText = computed(() =>
    menuCard.value ? JSON.stringify(menuCard.value).toLowerCase() : ''
  )

  return {
    isPending,
    menuCard,
    menuSearchText,
    ...menuServiceComputed,
  }
}
