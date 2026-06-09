import { computed } from 'vue'
import { useRoute } from '#imports'
import {
  usePublicScope,
  usePublicScopedRecords,
} from 'fireux-core/runtime/composables/fireux/public/scoped/usePublicScopedEntity'
import { useKitchenCollection } from '../../../firestore/kitchen/useKitchen'
import { useMenuCollection } from '../../../firestore/menu/useMenu'
import type { Menu } from '../../../../../models/menu.model'

const text = (value: unknown) => String(value ?? '').trim()
const isPublished = (menu: Menu) => text(menu.status) === 'published'
const menuDebug = (menu: Menu) => ({
  id: text(menu.id),
  name: text(menu.name),
  status: text(menu.status),
})

export function useKitchenPublicMenuScope() {
  const route = useRoute()
  const kitchenSlug = computed(() => text(route.params.slug))
  const menuId = computed(() => text(route.params.menuId))
  const { kitchens, pending: kitchensPending } = useKitchenCollection()
  const publicKitchen = usePublicScope({
    scopeKey: kitchenSlug,
    scopes: kitchens,
    scopeKeyOf: (kitchen) => kitchen.slug,
    scopeIdOf: (kitchen) => kitchen.id,
    pending: kitchensPending,
  })
  const menuRead = useMenuCollection(publicKitchen.scopeId)
  const publicMenus = usePublicScopedRecords({
    recordKey: menuId,
    records: menuRead.menus,
    recordKeyOf: (menu) => menu.id,
    isPublicRecord: isPublished,
    pending: menuRead.pending,
  })
  const pending = computed(
    () =>
      publicKitchen.pending.value ||
      (Boolean(publicKitchen.scopeId.value) && publicMenus.pending.value)
  )
  const menuLink = (id: Menu['id']) =>
    `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus/${encodeURIComponent(text(id))}`
  const debug = computed(() => ({
    route: {
      kitchenSlug: kitchenSlug.value,
      menuId: menuId.value || null,
    },
    kitchen: publicKitchen.scope.value
      ? {
          id: text(publicKitchen.scope.value.id),
          slug: text(publicKitchen.scope.value.slug),
          name: text(publicKitchen.scope.value.name),
        }
      : null,
    kitchenLookup: {
      pending: kitchensPending.value,
      count: (kitchens.value ?? []).length,
      matchesSlug: Boolean(publicKitchen.scope.value),
    },
    menuLookup: {
      kitchenId: publicKitchen.scopeId.value,
      collectionPath: menuRead.collectionPath.value,
      pending: menuRead.pending.value,
      rawCount: (menuRead.menus.value ?? []).length,
      publicCount: publicMenus.records.value.length,
      rawMenus: (menuRead.menus.value ?? []).map(menuDebug),
      publicMenus: publicMenus.records.value.map(menuDebug),
      selectedMenu: publicMenus.record.value
        ? menuDebug(publicMenus.record.value)
        : null,
    },
    pending: pending.value,
  }))

  return {
    kitchenSlug,
    kitchen: publicKitchen.scope,
    menus: publicMenus.records,
    menu: publicMenus.record,
    menuCollectionPath: menuRead.collectionPath,
    pending,
    menuLink,
    debug,
  }
}
