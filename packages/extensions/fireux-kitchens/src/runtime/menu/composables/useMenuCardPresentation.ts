import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { MenuDirectoryEntry } from '../models/menu-directory.response.ts'
import {
  menuRoutePath,
  directoryMenuRouteScope,
  type MenuRouteScope,
} from '../utils/menu-route'

const text = (value: unknown) => String(value ?? '').trim()

export function useMenuCardPresentation(
  menu: MaybeRefOrGetter<MenuDirectoryEntry>,
  routeScope: MaybeRefOrGetter<MenuRouteScope>
) {
  const source = computed(() => toValue(menu))
  const menuName = computed(() => text(source.value.name))
  const menuDescription = computed(() => text(source.value.description))
  const kitchenName = computed(() =>
    text(
      source.value.kitchen?.name ||
        source.value.source?.kitchen_name ||
        (source.value.kind === 'doc' ? source.value.description : '')
    )
  )
  const kitchenImageUrl = computed(() =>
    text(source.value.kitchen?.logo_image_url)
  )
  const avatarClass = computed(() => {
    const shade = source.value.kitchen?.image_shade
    if (shade === 'light') return 'fx-avatar-shade--light'
    if (shade === 'dark') return 'fx-avatar-shade--dark'
    return ''
  })
  const menuOfferings = computed(() => source.value.offering_options ?? [])
  const effectiveRouteScope = computed(() => {
    const scope = toValue(routeScope)
    return scope.kind === 'root' && source.value.source?.kitchen_slug
      ? directoryMenuRouteScope(source.value.source.kitchen_slug)
      : scope
  })
  const browseTo = computed(() =>
    menuRoutePath({
      scope: effectiveRouteScope.value,
      menuId: source.value.slug || source.value.source?.menu_slug,
    })
  )

  return {
    effectiveRouteScope,
    avatarClass,
    browseTo,
    kitchenImageUrl,
    kitchenName,
    menuOfferings,
    menuDescription,
    menuName,
  }
}
