import { useRoute } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { usePublicScopedRecords } from 'fireux-core/runtime/composables/fireux/public/scoped/usePublicScopedEntity'
import { useKitchenFetch } from '../../firestore/kitchen/useKitchen'
import { useKitchenMenuCollection } from '../../firestore/menu/useMenu'
import type { Menu } from '../../../../models/kitchen/menu/menu.model'
import { useKitchenMenuUrl } from './useKitchenMenuUrl'

const text = (value: unknown) => String(value ?? '').trim()
const isPublished = (menu: Menu) => text(menu.status) === 'published'
const menuDebug = (menu: Menu) => ({
  id: text(menu.id),
  name: text(menu.name),
  status: text(menu.status),
})

export function useKitchenSingleMenuScope() {
  const route = useRoute()
  const fireux = useFireUXConfig()
  const appId = computed(() => fireux.appId)
  const menuId = computed(() => text(route.params.menuId))
  const menuRoute = useKitchenMenuUrl({
    appId,
    kitchenSlug: computed(() => ''),
  })
  const kitchenId = computed(() => menuRoute.singleKitchenId.value)
  const { kitchen, pending: kitchenPending } = useKitchenFetch(kitchenId)
  const kitchenCollectionPath = computed(() =>
    appId.value ? `apps/${appId.value}/kitchens` : ''
  )
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
      menuRoute.pending.value ||
      kitchenPending.value ||
      (Boolean(kitchenId.value) && publishedMenus.pending.value)
  )
  const debug = computed(() => ({
    route: {
      menuId: menuId.value || null,
    },
    appKitchenLookup: {
      appId: appId.value,
      collectionPath: menuRoute.debug.value.appKitchenCollectionPath,
      count: menuRoute.appKitchenCount.value,
      singleKitchenId: kitchenId.value,
      routeMode: menuRoute.routeMode.value,
      pending: menuRoute.pending.value,
    },
    kitchen: kitchen.value
      ? {
          id: text(kitchen.value.id),
          slug: text(kitchen.value.slug),
          name: text((kitchen.value as Record<string, unknown>).name),
        }
      : null,
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
    kitchenSlug: computed(() => text(kitchen.value?.slug)),
    kitchen,
    menus: publishedMenus.records,
    menu: publishedMenus.record,
    kitchenCollectionPath,
    menuCollectionPath: menuRead.collectionPath,
    pending,
    menuLink: (id: Menu['id']) => `/menus/${encodeURIComponent(text(id))}`,
    debug,
  }
}
