import { collection, getDocs } from 'firebase/firestore'
import { computed, ref, watch } from 'vue'
import { useRoute, useRuntimeConfig } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useDishCollection } from '../../../firestore/dish/useDish'
import { useKitchenCollection } from '../../../firestore/kitchen/useKitchen'
import {
  menuItemsPath,
  useMenuCollection,
  useMenuSectionCollection,
} from '../../../firestore/menu/useMenu'
import type { Dish } from '../../../../../models/dish.model'
import type { Menu, MenuItem, MenuSection } from '../../../../../models/menu.model'
import {
  normalizePublicKitchenLanguage,
  resolvePublicKitchenLanguageOptions,
  type PublicKitchenLanguageCode,
  type PublicKitchenLanguageOption,
} from '../sproochli/publicLanguage'

export type PublicMenuItemRow = {
  item: MenuItem
  dish: Dish
  label: string
  description: string
  price: number
}

export type PublicMenuSectionRow = {
  section: MenuSection
  items: PublicMenuItemRow[]
}

const clean = (value: unknown) => String(value ?? '').trim()
const cleanIdentity = (value: unknown) => clean(value).toLowerCase()
const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const queryString = (value: unknown) =>
  Array.isArray(value) ? clean(value[0]) : clean(value)
const isPublicMenu = (menu: Menu) => clean(menu.status) === 'published'
const isPublicReadyMenu = (menu: Menu) =>
  isPublicMenu(menu) && Boolean(clean(menu.name))
const resolveItemPrice = (item: MenuItem): number => {
  const price = Number(item.price ?? 0)
  return Number.isFinite(price) && price > 0 ? price : 0
}
const sortMenus = (a: Menu, b: Menu) =>
  Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) ||
  String(a.name).localeCompare(String(b.name))

function publicKitchenName(kitchen: unknown) {
  const record = kitchen as { name?: unknown; display_name?: unknown } | null
  const name = clean(record?.name)
  if (name) return name

  const displayName = clean(record?.display_name)
  return displayName || 'Kitchen'
}

export function useKitchenPublicMenuIndex() {
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const slug = computed(() => clean(route.params.slug))
  const publicConfig = runtimeConfig.public as Record<string, unknown>
  const fireuxConfig = asRecord(publicConfig.fireux)
  const publicMenuConfig = asRecord(asRecord(fireuxConfig.misebox).publicMenu)
  const runtimeSproochli = asRecord(fireuxConfig.sproochli)
  const { kitchens, pending: kitchensPending } = useKitchenCollection()

  const kitchen = computed(
    () =>
      kitchens.value.find(
        (item) => cleanIdentity((item as any).slug) === cleanIdentity(slug.value)
      ) ?? null
  )
  const kitchenId = computed(() => clean(kitchen.value?.id))
  const languageSettings = computed(() =>
    asRecord((kitchen.value as any)?.language_settings)
  )
  const sproochliEnabled = computed(
    () =>
      runtimeSproochli.enabled !== false &&
      publicMenuConfig.sproochli !== false &&
      languageSettings.value.sproochli !== false
  )
  const selectedLanguage = computed(() =>
    sproochliEnabled.value
      ? normalizePublicKitchenLanguage(queryString(route.query.sproochli))
      : ''
  )
  const languageOptions = computed(() =>
    sproochliEnabled.value
      ? resolvePublicKitchenLanguageOptions(kitchen.value)
      : []
  )
  const publicLanguageQuery = computed(() =>
    selectedLanguage.value ? `?sproochli=${encodeURIComponent(selectedLanguage.value)}` : ''
  )
  const menuRead = useMenuCollection(kitchenId)
  const menus = computed(() =>
    [...menuRead.menus.value].filter(isPublicReadyMenu).sort(sortMenus)
  )
  const pending = computed(
    () => kitchensPending.value || (Boolean(kitchenId.value) && menuRead.pending.value)
  )
  const kitchenTitle = computed(() => clean(kitchen.value?.name) || 'Kitchen menus')
  const menuLink = (menuId: Menu['id']) =>
    `/kitchens/${encodeURIComponent(slug.value)}/menus/${encodeURIComponent(clean(menuId))}${publicLanguageQuery.value}`

  return {
    slug,
    kitchen,
    menus,
    pending,
    languageOptions,
    selectedLanguage,
    kitchenTitle,
    menuLink,
  }
}

export function useKitchenPublicMenuDetail() {
  const route = useRoute()
  const resolveDb = useFirestoreResolver()
  const { appId } = useFireUXConfig()
  const slug = computed(() => clean(route.params.slug))
  const menuId = computed(() => clean(route.params.menuId))
  const { kitchens, pending: kitchensPending } = useKitchenCollection()

  const kitchen = computed(
    () =>
      (kitchens.value ?? []).find(
        (item) => cleanIdentity((item as any).slug) === cleanIdentity(slug.value)
      ) ?? null
  )
  const kitchenId = computed(() => clean(kitchen.value?.id))
  const menuRead = useMenuCollection(kitchenId)
  const menus = computed(() => (menuRead.menus.value ?? []).filter(isPublicMenu))
  const menu = computed(() =>
    menus.value.find((item) => clean(item.id) === menuId.value) ?? null
  )
  const sectionRead = useMenuSectionCollection(
    kitchenId,
    computed(() => clean(menu.value?.id))
  )
  const dishRead = useDishCollection(kitchenId)
  const itemRows = ref<Array<{ sectionId: string; item: MenuItem }>>([])
  const itemsPending = ref(false)

  watch(
    [kitchenId, menu, sectionRead.sections],
    async () => {
      const currentKitchenId = kitchenId.value
      const currentMenuId = clean(menu.value?.id)
      const sections = sectionRead.sections.value ?? []
      itemRows.value = []

      if (!currentKitchenId || !currentMenuId || !sections.length) return

      itemsPending.value = true
      try {
        const nextRows: Array<{ sectionId: string; item: MenuItem }> = []
        for (const section of sections) {
          const sectionId = clean(section.id)
          const path = menuItemsPath({
            kitchenId: currentKitchenId,
            menuId: currentMenuId,
            sectionId,
            appId,
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
    const map = new Map<string, (typeof dishRead.dishes.value)[number]>()
    for (const dish of dishRead.dishes.value ?? []) {
      const id = clean(dish.id)
      if (id) map.set(id, dish)
    }
    return map
  })
  const sectionRows = computed<PublicMenuSectionRow[]>(() =>
    (sectionRead.sections.value ?? []).map((section) => ({
      section,
      items: itemRows.value
        .filter((row) => row.sectionId === clean(section.id))
        .map((row) => {
          const dish = dishesById.value.get(clean(row.item.dish_id)) ?? null
          const label = clean(dish?.name)
          if (!dish || !label) return null

          return {
            item: row.item,
            dish,
            label,
            description: clean(dish.description),
            price: resolveItemPrice(row.item),
          }
        })
        .filter((row): row is PublicMenuItemRow => Boolean(row)),
    }))
  )
  const languageOptions = computed<PublicKitchenLanguageOption[]>(() => [])
  const selectedLanguage = computed<PublicKitchenLanguageCode>(() => '')
  const pending = computed(
    () =>
      kitchensPending.value ||
      menuRead.pending.value ||
      sectionRead.pending.value ||
      dishRead.pending.value ||
      itemsPending.value
  )
  const showUnavailable = computed(
    () => !pending.value && (!kitchen.value || !menu.value)
  )
  const showMenu = computed(
    () => !pending.value && !showUnavailable.value && Boolean(menu.value && kitchen.value)
  )
  const kitchenName = computed(() => publicKitchenName(kitchen.value))

  return {
    pending,
    showUnavailable,
    showMenu,
    kitchenName,
    menu,
    sectionRows,
    languageOptions,
    selectedLanguage,
  }
}
