import { computed } from 'vue'
import { useRoute } from '#imports'
import { usePublicScopedRecords } from 'fireux-core/runtime/composables/fireux/public/scoped/usePublicScopedEntity'
import { useKitchenFetch } from '../firestore/useKitchen'
import { useKitchenMenuCollection } from '../../../menu/composables/firestore/useMenu'
import type { Menu } from '../../../menu/models/menu.model.ts'
import {
  directoryMenuRouteScope,
  menuRoutePath,
} from '../../utils/kitchen-menu-route'

const text = (value: unknown) => String(value ?? '').trim()
const isPublished = (menu: Menu) => text(menu.status) === 'published'
const menuDebug = (menu: Menu) => ({
  id: text(menu.id),
  name: text(menu.name),
  status: text(menu.status),
})

export function useKitchenMenuScope() {
  const route = useRoute()
  const kitchenSlug = computed(() => text(route.params.slug))
  const menuId = computed(() => text(route.params.menuId))
  const { kitchen, pending: kitchenPending } = useKitchenFetch(kitchenSlug)
  const kitchenId = computed(() => text(kitchen.value?.id))
  const kitchenCollectionPath = computed(() => 'kitchens')
  const menuRead = useKitchenMenuCollection(kitchenId, {
    kitchenCollectionPath,
  })
  const publishedMenus = usePublicScopedRecords({
    recordKey: menuId,
    records: menuRead.menus,
    recordKeyOf: (menu) => menu.id,
    isPublicRecord: isPublished,
    pending: menuRead.pending,
  })
  const pending = computed(
    () =>
      kitchenPending.value ||
      (Boolean(kitchenId.value) && publishedMenus.pending.value)
  )
  const menuRouteScope = computed(() =>
    directoryMenuRouteScope(kitchenSlug.value)
  )
  const menuLink = (id: Menu['id']) =>
    menuRoutePath({
      scope: menuRouteScope.value,
      menuId: text(id),
    })
  const debug = computed(() => ({
    route: {
      kitchenSlug: kitchenSlug.value,
      menuId: menuId.value || null,
    },
    kitchen: kitchen.value
      ? {
          id: text(kitchen.value.id),
          slug: text(kitchen.value.slug),
          name: text((kitchen.value as Record<string, unknown>).name),
        }
      : null,
    kitchenLookup: {
      pending: kitchenPending.value,
      matchesSlug: Boolean(kitchen.value),
    },
    menuLookup: {
      kitchenId: kitchenId.value,
      collectionPath: menuRead.collectionPath.value,
      pending: menuRead.pending.value,
      rawCount: (menuRead.menus.value ?? []).length,
      publishedCount: publishedMenus.records.value.length,
      rawMenus: (menuRead.menus.value ?? []).map(menuDebug),
      publishedMenus: publishedMenus.records.value.map(menuDebug),
      selectedMenu: publishedMenus.record.value
        ? menuDebug(publishedMenus.record.value)
        : null,
    },
    pending: pending.value,
  }))

  return {
    kitchenSlug,
    kitchen,
    menus: publishedMenus.records,
    menu: publishedMenus.record,
    kitchenCollectionPath,
    menuCollectionPath: menuRead.collectionPath,
    pending,
    menuRouteScope,
    menuLink,
    debug,
  }
}
