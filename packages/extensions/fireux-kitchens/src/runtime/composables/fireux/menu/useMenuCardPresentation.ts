import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useMenuServiceComputed } from '../firestore/menu/useMenu'
import type { PublicMenuIndexItem } from '../../../models/kitchen/menu/menu-index.model'
import {
  menuRoutePath,
  type MenuRouteScope,
} from '../../../utils/kitchen-menu-route'

const text = (value: unknown) => String(value ?? '').trim()

export function useMenuCardPresentation(
  menu: MaybeRefOrGetter<PublicMenuIndexItem>,
  routeScope: MaybeRefOrGetter<MenuRouteScope>
) {
  const source = computed(() => toValue(menu))
  const menuName = computed(() => text(source.value.name))
  const menuDescription = computed(() => text(source.value.description))
  const kitchenName = computed(() => text(
    source.value.kitchen?.name ||
    source.value.source?.kitchen_name ||
    (source.value.kind === 'doc' ? source.value.description : '')
  ))
  const kitchenImageUrl = computed(() => text(
    source.value.kitchen?.logo_image_url
  ))
  const avatarClass = computed(() => {
    const shade = source.value.kitchen?.image_shade
    if (shade === 'light') return 'fx-avatar-shade--light'
    if (shade === 'dark') return 'fx-avatar-shade--dark'
    return ''
  })
  const menuContexts = computed(() => source.value.contexts ?? [])
  const browseTo = computed(() => menuRoutePath({
    scope: toValue(routeScope),
    menuId: source.value.id,
  }))
  const serviceHours = computed(() =>
    source.value.service_hours?.operation_hours
  )
  const { menuServiceChip } = useMenuServiceComputed(serviceHours)

  return {
    avatarClass,
    browseTo,
    kitchenImageUrl,
    kitchenName,
    menuContexts,
    menuDescription,
    menuName,
    menuServiceChip,
  }
}
