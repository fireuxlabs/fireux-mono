import { collection, getDocs } from 'firebase/firestore'
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useDishCollection } from '../../firestore/dish/useDish'
import { useKitchenCollection } from '../../firestore/kitchen/useKitchen'
import {
  menuItemsPath,
  useMenuCollection,
  useMenuSectionCollection,
} from '../../firestore/menu/useMenu'
import {
  clean,
  cleanIdentity,
  isPublicMenu,
  resolveItemPrice,
  type PublicMenuSectionRow,
} from './useKitchenPublicMenuRows'
import type {
  PublicKitchenLanguageCode,
  PublicKitchenLanguageOption,
} from './publicLanguage'
import type { MenuItem } from '../../../../models/menu.model'

function publicKitchenName(kitchen: unknown) {
  const record = kitchen as { name?: unknown; display_name?: unknown } | null
  const name = clean(record?.name)
  if (name) return name

  const displayName = clean(record?.display_name)
  if (displayName) return displayName

  return 'Kitchen'
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
    const dishes = dishRead.dishes.value ?? []

    dishes.forEach((dish) => {
      const id = clean(dish.id)
      if (id) map.set(id, dish)
    })
    return map
  })
  const sectionRows = computed<PublicMenuSectionRow[]>(() =>
    (sectionRead.sections.value ?? []).map((section) => ({
      section,
      items: itemRows.value
        .filter((row) => row.sectionId === clean(section.id))
        .map((row) => {
          const dish = dishesById.value.get(clean(row.item.dish_id)) ?? null
          if (!dish) return null

          const label = clean(dish.name)
          if (!label) return null

          return {
            item: row.item,
            dish,
            label,
            description: clean(dish.description),
            price: resolveItemPrice(row.item),
          }
        })
        .filter((row): row is NonNullable<typeof row> => Boolean(row)),
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
