import { computed, ref, watch, type Ref } from 'vue'
import { useRoute } from '#imports'
import { collection, getDocs } from 'firebase/firestore'
import {
  usePublicScope,
  usePublicScopedRecords,
} from 'fireux-core/runtime/composables/fireux/public/scoped/usePublicScopedEntity'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Dish } from '../../../../../models/dish.model'
import { useKitchenCollection } from '../../../firestore/kitchen/useKitchen'
import { useDishCollection } from '../../../firestore/dish/fetch/useDishCollection'
import { useMenuCollection } from '../../../firestore/menu/useMenu'
import { useMenuSectionCollection } from '../../../firestore/menu/fetch/useMenuSectionCollection'
import type { Menu } from '../../../../../models/menu.model'
import type { MenuItem, MenuSection } from '../../../../../models/menu.model'

const text = (value: unknown) => String(value ?? '').trim()
const isPublished = (menu: Menu) => text(menu.status) === 'published'
const isActiveChild = (value: { status?: unknown }) => text(value.status) !== 'archived'
const menuDebug = (menu: Menu) => ({
  id: text(menu.id),
  name: text(menu.name),
  status: text(menu.status),
})
const sortItems = (items: MenuItem[]) =>
  [...items].sort(
    (a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
      text(a.dish_id).localeCompare(text(b.dish_id))
  )

export type KitchenPublicMenuItemRow = {
  id: string
  item: MenuItem
  dish: Dish | null
  name: string
  description: string
  price: number
}

export type KitchenPublicMenuSectionRow = {
  id: string
  section: MenuSection
  label: string
  description: string
  items: KitchenPublicMenuItemRow[]
}

function usePublicMenuItems(
  sectionCollectionPath: Ref<string>,
  sections: Ref<MenuSection[]>
) {
  const resolveDb = useFirestoreResolver()
  const items = ref<MenuItem[]>([])
  const pending = ref(false)
  let requestId = 0

  watch(
    () => ({
      sectionCollectionPath: sectionCollectionPath.value,
      sectionIds: sections.value.map((section) => text(section.id)),
    }),
    async ({ sectionCollectionPath, sectionIds }) => {
      const currentRequestId = ++requestId
      const ids = sectionIds.filter(Boolean)

      if (!sectionCollectionPath || !ids.length || import.meta.server) {
        items.value = []
        pending.value = false
        return
      }

      pending.value = true

      try {
        const snaps = await Promise.all(
          ids.map((sectionId) =>
            getDocs(collection(resolveDb(), `${sectionCollectionPath}/${sectionId}/items`))
          )
        )

        if (currentRequestId !== requestId) return

        items.value = sortItems(
          snaps.flatMap((snap) =>
            snap.docs.map((doc) => ({
              ...(doc.data() as MenuItem),
              id: doc.id,
            }))
          ).filter(isActiveChild)
        )
      } catch (error) {
        if (import.meta.dev) {
          console.warn('[useKitchenPublicMenuDetail] item read failed', error)
        }
        if (currentRequestId === requestId) items.value = []
      } finally {
        if (currentRequestId === requestId) pending.value = false
      }
    },
    { immediate: true, deep: true }
  )

  return { items, pending }
}

export function useKitchenPublicMenu() {
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
    pending,
    menuLink,
    debug,
  }
}

export function useKitchenPublicMenuDetail() {
  const state = useKitchenPublicMenu()
  const kitchenId = computed(() => text(state.kitchen.value?.id))
  const resolvedMenuId = computed(() => text(state.menu.value?.id))
  const sectionState = useMenuSectionCollection(kitchenId, resolvedMenuId)
  const itemState = usePublicMenuItems(
    sectionState.collectionPath,
    sectionState.sections
  )
  const dishState = useDishCollection(kitchenId)
  const dishesById = computed(() => {
    const map = new Map<string, Dish>()
    for (const dish of dishState.dishes.value) {
      const id = text(dish.id)
      if (id) map.set(id, dish)
    }
    return map
  })
  const itemsBySectionId = computed(() => {
    const map = new Map<string, MenuItem[]>()
    for (const item of itemState.items.value) {
      const sectionId = text(item.section_id)
      if (!sectionId) continue
      map.set(sectionId, [...(map.get(sectionId) ?? []), item])
    }
    return map
  })
  const sectionRows = computed<KitchenPublicMenuSectionRow[]>(() =>
    sectionState.sections.value.map((section) => {
      const sectionId = text(section.id)
      const items = itemsBySectionId.value.get(sectionId) ?? []

      return {
        id: sectionId,
        section,
        label: text(section.label),
        description: text(section.description),
        items: items.map((item) => {
          const dish = dishesById.value.get(text(item.dish_id)) ?? null
          return {
            id: text(item.id),
            item,
            dish,
            name: text(dish?.name) || text(item.dish_id),
            description: text(dish?.description),
            price: Number(item.price || 0),
          }
        }),
      }
    })
  )
  const detailPending = computed(
    () =>
      state.pending.value ||
      sectionState.pending.value ||
      itemState.pending.value ||
      dishState.pending.value
  )
  const debug = computed(() => ({
    ...state.debug.value,
    detail: {
      kitchenId: kitchenId.value,
      menuId: resolvedMenuId.value,
      sectionsPath: sectionState.collectionPath.value,
      dishesPath: dishState.collectionPath.value,
      sectionsCount: sectionState.sections.value.length,
      itemsCount: itemState.items.value.length,
      dishesCount: dishState.dishes.value.length,
      sectionRowsCount: sectionRows.value.length,
      pending: detailPending.value,
    },
  }))

  return {
    ...state,
    sections: sectionState.sections,
    items: itemState.items,
    dishes: dishState.dishes,
    sectionRows,
    detailPending,
    debug,
  }
}
