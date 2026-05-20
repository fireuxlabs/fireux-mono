import { collection, getDocs } from 'firebase/firestore'
import { computed, ref, watch, type Ref } from 'vue'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Dish } from '../../../models/dish.model'
import type { Menu, MenuItem, MenuSection } from '../../../models/menu.model'
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

type EmbeddedMenuItem = MenuItem & {
  active?: boolean
  label?: string
  description?: string
  price_options?: Array<{ price?: number }>
}

type EmbeddedMenuSection = MenuSection & {
  active?: boolean
  items?: EmbeddedMenuItem[]
}

type MenuWithEmbeddedSections = {
  sections?: EmbeddedMenuSection[]
}

const ROOT_KITCHENS = 'kitchens'
const clean = (value: unknown) => String(value ?? '').trim()
const cleanIdentity = (value: unknown) => clean(value).toLowerCase()
const sortBySortOrder = <T extends { sort_order?: unknown }>(items: T[]) =>
  [...items].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
const isActiveChild = <T extends { status?: unknown; active?: unknown }>(value: T) =>
  value.status !== 'archived' && value.active !== false

const isPublicMenu = (menu: Menu & { active?: unknown }) =>
  clean(menu.status) === 'published' || (!clean(menu.status) && menu.active === true)

const resolveItemPrice = (item: EmbeddedMenuItem | MenuItem): number => {
  const price = Number(item.price || 0)
  if (Number.isFinite(price) && price > 0) return price

  const options = Array.isArray((item as EmbeddedMenuItem).price_options)
    ? (item as EmbeddedMenuItem).price_options ?? []
    : []
  const optionPrice = Number(
    options.find((option) => Number(option.price || 0) > 0)?.price || 0
  )

  return Number.isFinite(optionPrice) ? optionPrice : 0
}

export function usePublicKitchenMenu(
  kitchenSlug: Ref<string>,
  menuId?: Ref<string>
) {
  const resolveDb = useFirestoreResolver()
  const { kitchens, pending: kitchensPending } = useKitchenCollection()
  const kitchen = computed(
    () =>
      kitchens.value.find(
        (item) => cleanIdentity((item as any).slug) === cleanIdentity(kitchenSlug.value)
      ) ??
      null
  )
  const kitchenByRouteId = computed(
    () =>
      kitchens.value.find(
        (item) => cleanIdentity((item as any).id) === cleanIdentity(kitchenSlug.value)
      ) ?? null
  )
  const canonicalSlug = computed(() => clean((kitchenByRouteId.value as any)?.slug))
  const routeMatchesKitchenId = computed(
    () =>
      Boolean(kitchenByRouteId.value) &&
      cleanIdentity((kitchenByRouteId.value as any)?.id) === cleanIdentity(kitchenSlug.value) &&
      Boolean(canonicalSlug.value) &&
      cleanIdentity(canonicalSlug.value) !== cleanIdentity(kitchenSlug.value)
  )
  const kitchenId = computed(() => clean(kitchen.value?.id))
  const menuRead = useKitchenMenuCollection(kitchenId, {
    kitchenCollectionPath: ROOT_KITCHENS,
  })
  const menus = computed(() => menuRead.menus.value.filter(isPublicMenu))
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
  const usesEmbeddedSections = computed(() =>
    Array.isArray((menu.value as (Menu & MenuWithEmbeddedSections) | null)?.sections)
  )
  const embeddedSections = computed<MenuSection[]>(() => {
    const sections = (menu.value as (Menu & MenuWithEmbeddedSections) | null)?.sections
    if (!Array.isArray(sections)) return []

    return sortBySortOrder(sections.filter(isActiveChild))
  })
  const embeddedItemRows = computed<Array<{ sectionId: string; item: MenuItem }>>(() => {
    const sections = (menu.value as (Menu & MenuWithEmbeddedSections) | null)?.sections
    if (!Array.isArray(sections)) return []

    const rows: Array<{ sectionId: string; item: MenuItem }> = []
    for (const section of sortBySortOrder(sections.filter(isActiveChild))) {
      const sectionId = clean(section.id)
      const items = Array.isArray(section.items) ? section.items : []
      for (const item of sortBySortOrder(items.filter(isActiveChild))) {
        rows.push({
          sectionId,
          item: {
            ...item,
            id: clean(item.id) || clean(item.dish_id),
            kitchen_id: clean(item.kitchen_id) || kitchenId.value,
            menu_id: clean(item.menu_id) || clean(menu.value?.id),
            section_id: clean(item.section_id) || sectionId,
            status: clean(item.status) === 'archived' ? 'archived' : 'active',
            price: resolveItemPrice(item),
          },
        })
      }
    }

    return rows
  })
  const sections = computed(() =>
    usesEmbeddedSections.value ? embeddedSections.value : sectionRead.sections.value
  )
  const resolvedItemRows = computed(() =>
    usesEmbeddedSections.value ? embeddedItemRows.value : itemRows.value
  )

  watch(
    [kitchenId, menu, sectionRead.sections],
    async () => {
      const currentKitchenId = kitchenId.value
      const currentMenuId = clean(menu.value?.id)
      const sections = sectionRead.sections.value
      itemRows.value = []

      if (usesEmbeddedSections.value || !currentKitchenId || !currentMenuId || !sections.length) return

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
    sections.value.map((section) => {
      const sectionId = clean(section.id)
      const items = resolvedItemRows.value
        .filter((row) => row.sectionId === sectionId)
        .map<PublicMenuItemRow>((row) => {
          const dish = dishesById.value.get(clean(row.item.dish_id)) ?? null
          const label = clean((row.item as EmbeddedMenuItem).label) || clean(dish?.name)
          return {
            item: row.item,
            dish,
            label,
            description:
              clean((row.item as EmbeddedMenuItem).description) || clean(dish?.description),
            price: resolveItemPrice(row.item),
          }
        })
        .filter((row) => row.label)

      return { section, items }
    })
  )

  const pending = computed(
    () =>
      kitchensPending.value ||
      menuRead.pending.value ||
      (!usesEmbeddedSections.value && sectionRead.pending.value) ||
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
    canonicalSlug,
    routeMatchesKitchenId,
    menus,
    menu,
    sections,
    sectionRows,
    pending,
    unavailable,
  }
}
