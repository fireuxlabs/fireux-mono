import { useRoute } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { usePublicScopedRecords } from 'fireux-core/runtime/composables/fireux/public/scoped/usePublicScopedEntity'
import { useKitchenFetch } from '../../../firestore/kitchen/useKitchen'
import { useMenuCollection } from '../../../firestore/menu/useMenu'
import type { Menu } from '../../../../../models/menu.model'
import { useKitchenPublicMenuUrl } from './useKitchenPublicMenuUrl'

const text = (value: unknown) => String(value ?? '').trim()
const isPublished = (menu: Menu) => text(menu.status) === 'published'
const menuDebug = (menu: Menu) => ({
  id: text(menu.id),
  name: text(menu.name),
  status: text(menu.status),
})

export function useKitchenPublicSingleMenuScope() {
  const route = useRoute()
  const fireux = useFireUXConfig()
  const appId = computed(() => fireux.appId)
  const menuId = computed(() => text(route.params.menuId))
  const publicRoute = useKitchenPublicMenuUrl({
    appId,
    kitchenSlug: computed(() => ''),
  })
  const kitchenId = computed(() => publicRoute.singleKitchenId.value)
  const { kitchen, pending: kitchenPending } = useKitchenFetch(kitchenId)
  const kitchenCollectionPath = computed(() =>
    appId.value ? `apps/${appId.value}/kitchens` : ''
  )
  const menuRead = useMenuCollection(kitchenId, {
    kitchenCollectionPath,
  })
  const publicMenus = usePublicScopedRecords({
    recordKey: menuId,
    records: menuRead.menus,
    recordKeyOf: (menu) => menu.id,
    isPublicRecord: isPublished,
    pending: menuRead.pending,
  })
  const pending = computed(
    () =>
      publicRoute.pending.value ||
      kitchenPending.value ||
      (Boolean(kitchenId.value) && publicMenus.pending.value)
  )
  const debug = computed(() => ({
    route: {
      menuId: menuId.value || null,
    },
    appKitchenLookup: {
      appId: appId.value,
      collectionPath: publicRoute.debug.value.appKitchenCollectionPath,
      count: publicRoute.appKitchenCount.value,
      singleKitchenId: kitchenId.value,
      routeMode: publicRoute.routeMode.value,
      pending: publicRoute.pending.value,
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
    kitchenSlug: computed(() => text(kitchen.value?.slug)),
    kitchen,
    menus: publicMenus.records,
    menu: publicMenus.record,
    kitchenCollectionPath,
    menuCollectionPath: menuRead.collectionPath,
    pending,
    menuLink: (id: Menu['id']) => `/menus/${encodeURIComponent(text(id))}`,
    debug,
  }
}
