import { collection, getDocs } from 'firebase/firestore'
import { computed, ref, watch, type Ref } from 'vue'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Dish } from '../../../models/dish.model'
import type { MenuItem, MenuSection } from '../../../models/menu.model'
import { useDishCollection } from '../firestore/dish/fetch/useDishCollection'
import { useKitchenCollection } from '../firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenMenuCollection } from '../console/kitchen/operations/menu/fetch/useKitchenMenuCollection'
import { useKitchenMenuSectionCollection } from '../console/kitchen/operations/menu/fetch/useKitchenMenuSectionCollection'
import { kitchenMenuItemsPath } from '../console/kitchen/operations/menu/paths'

type PublicMenuItemRow = {
  item: MenuItem
  dish: Dish | null
  label: string
  description: string
  price: number
}

type PublicMenuSectionRow = {
  section: MenuSection
  items: PublicMenuItemRow[]
}

const ROOT_KITCHENS = 'kitchens'
const clean = (value: unknown) => String(value ?? '').trim()

export function usePublicKitchenMenu(
  kitchenSlug: Ref<string>,
  menuId?: Ref<string>
) {
  const resolveDb = useFirestoreResolver()
  const { kitchens, pending: kitchensPending } = useKitchenCollection()
  const kitchen = computed(
    () =>
      kitchens.value.find((item) => clean((item as any).slug) === kitchenSlug.value) ??
      null
  )
  const kitchenId = computed(() => clean(kitchen.value?.id))
  const menuRead = useKitchenMenuCollection(kitchenId, {
    kitchenCollectionPath: ROOT_KITCHENS,
  })
  const menus = computed(() => menuRead.publishedMenus.value)
  const menu = computed(() => {
    const id = clean(menuId?.value)
    return id ? menus.value.find((item) => clean(item.id) === id) ?? null : null
  })
  const sectionRead = useKitchenMenuSectionCollection(
    kitchenId,
    computed(() => clean(menu.value?.id)),
    { kitchenCollectionPath: ROOT_KITCHENS }
  )
  const dishRead = useDishCollection(kitchenId, {
    kitchenCollectionPath: ROOT_KITCHENS,
  })
  const itemRows = ref<Array<{ sectionId: string; item: MenuItem }>>([])
  const itemsPending = ref(false)

  watch(
    [kitchenId, menu, sectionRead.sections],
    async () => {
      const currentKitchenId = kitchenId.value
      const currentMenuId = clean(menu.value?.id)
      const sections = sectionRead.sections.value
      itemRows.value = []

      if (!currentKitchenId || !currentMenuId || !sections.length) return

      itemsPending.value = true
      try {
        const nextRows: Array<{ sectionId: string; item: MenuItem }> = []
        for (const section of sections) {
          const sectionId = clean(section.id)
          const path = kitchenMenuItemsPath({
            kitchenCollectionPath: ROOT_KITCHENS,
            kitchenId: currentKitchenId,
            menuId: currentMenuId,
            sectionId,
          })
          if (!path) continue
          const snap = await getDocs(collection(resolveDb(), path))
          snap.docs.forEach((docSnap) => {
            const item = { ...(docSnap.data() as MenuItem), id: docSnap.id }
            if (item.status !== 'archived') nextRows.push({ sectionId, item })
          })
        }
        itemRows.value = nextRows
      } finally {
        itemsPending.value = false
      }
    },
    { immediate: true }
  )

  const dishesById = computed(() => {
    const map = new Map<string, Dish>()
    dishRead.dishes.value.forEach((dish) => {
      const id = clean(dish.id)
      if (id) map.set(id, dish)
    })
    return map
  })
  const sectionRows = computed<PublicMenuSectionRow[]>(() =>
    sectionRead.sections.value.map((section) => {
      const sectionId = clean(section.id)
      const items = itemRows.value
        .filter((row) => row.sectionId === sectionId)
        .map<PublicMenuItemRow>((row) => {
          const dish = dishesById.value.get(clean(row.item.dish_id)) ?? null
          return {
            item: row.item,
            dish,
            label: clean(dish?.name),
            description: clean(dish?.description),
            price: Number(row.item.price || 0),
          }
        })
        .filter((row) => row.dish && row.label)

      return { section, items }
    })
  )

  const pending = computed(
    () =>
      kitchensPending.value ||
      menuRead.pending.value ||
      sectionRead.pending.value ||
      dishRead.pending.value ||
      itemsPending.value
  )
  const unavailable = computed(
    () =>
      !pending.value &&
      (!kitchen.value || Boolean(menuId?.value && !menu.value))
  )

  return {
    kitchen,
    kitchenId,
    menus,
    menu,
    sections: sectionRead.sections,
    sectionRows,
    pending,
    unavailable,
  }
}
