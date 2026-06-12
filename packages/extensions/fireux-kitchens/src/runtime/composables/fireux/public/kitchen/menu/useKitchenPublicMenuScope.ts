import { computed } from 'vue'
import { useRoute } from '#imports'
import {
  usePublicScopedRecords,
} from 'fireux-core/runtime/composables/fireux/public/scoped/usePublicScopedEntity'
import { useKitchenFetch } from '../../../firestore/kitchen/useKitchen'
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
  const { kitchen, pending: kitchenPending } = useKitchenFetch(kitchenSlug)
  const kitchenId = computed(() => text(kitchen.value?.id))
  const menuRead = useMenuCollection(kitchenId)
  const publicMenus = usePublicScopedRecords({
    recordKey: menuId,
    records: menuRead.menus,
    recordKeyOf: (menu) => menu.id,
    isPublicRecord: isPublished,
    pending: menuRead.pending,
  })
  const pending = computed(
    () =>
      kitchenPending.value ||
      (Boolean(kitchenId.value) && publicMenus.pending.value)
  )
  const menuLink = (id: Menu['id']) =>
    `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus/${encodeURIComponent(text(id))}`
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
    kitchen,
    menus: publicMenus.records,
    menu: publicMenus.record,
    menuCollectionPath: menuRead.collectionPath,
    pending,
    menuLink,
    debug,
  }
}
