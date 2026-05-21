import { collection, getDocs } from 'firebase/firestore'
import { computed, ref, watch, type Ref } from 'vue'
import { useRoute, useRuntimeConfig } from '#imports'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Dish } from '../../../models/dish.model'
import type { Menu, MenuItem, MenuSection } from '../../../models/menu.model'
import { useDishCollection } from '../firestore/dish/fetch/useDishCollection'
import { useKitchenCollection } from '../firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenMenuCollection } from '../console/kitchen/operations/menu/fetch/useKitchenMenuCollection'
import { useKitchenMenuSectionCollection } from '../console/kitchen/operations/menu/fetch/useKitchenMenuSectionCollection'
import { kitchenMenuItemsPath } from '../console/kitchen/operations/menu/paths'
import {
  isPublicKitchenCacheLanguage,
  normalizePublicKitchenLanguage,
  resolvePublicKitchenLanguageOptions,
  resolvePublicKitchenLanguageState,
  resolvePublicTranslatedText,
} from './public-kitchen-language'

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
  labels?: unknown
  description?: string
  descriptions?: unknown
  price_options?: Array<{ price?: number }>
}

type EmbeddedMenuSection = MenuSection & {
  active?: boolean
  labels?: unknown
  descriptions?: unknown
  items?: EmbeddedMenuItem[]
}

type MenuWithEmbeddedSections = {
  sections?: EmbeddedMenuSection[]
  names?: unknown
  descriptions?: unknown
}

const ROOT_KITCHENS = 'kitchens'
const clean = (value: unknown) => String(value ?? '').trim()
const cleanIdentity = (value: unknown) => clean(value).toLowerCase()
const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const queryString = (value: unknown) =>
  Array.isArray(value) ? clean(value[0]) : clean(value)
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
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const resolveDb = useFirestoreResolver()
  const publicConfig = runtimeConfig.public as Record<string, unknown>
  const fireuxConfig = asRecord(publicConfig.fireux)
  const miseboxConfig = asRecord(fireuxConfig.misebox)
  const publicMenuConfig = asRecord(miseboxConfig.publicMenu)
  const runtimeSproochli = asRecord(fireuxConfig.sproochli)
  const runtimeSproochliEnabled = computed(() => runtimeSproochli.enabled !== false)
  const publicMenuSproochliEnabled = computed(() => publicMenuConfig.sproochli !== false)
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
  const languageSettings = computed(() => asRecord((kitchen.value as any)?.language_settings))
  const kitchenSproochliEnabled = computed(() => languageSettings.value.sproochli !== false)
  const sproochliEnabled = computed(
    () =>
      runtimeSproochliEnabled.value &&
      publicMenuSproochliEnabled.value &&
      kitchenSproochliEnabled.value
  )
  const selectedLanguage = computed(() =>
    sproochliEnabled.value
      ? normalizePublicKitchenLanguage(
          queryString(route.query.lang || route.query.language)
        )
      : ''
  )
  const languageState = computed(() => resolvePublicKitchenLanguageState(kitchen.value))
  const activeContentLanguage = computed(
    () =>
      selectedLanguage.value ||
      languageState.value.defaultLanguage ||
      languageState.value.primaryLanguage ||
      ''
  )
  const selectedLanguageUsesCache = computed(() => {
    const language = selectedLanguage.value
    return Boolean(
      language &&
        isPublicKitchenCacheLanguage(language) &&
        languageState.value.cachedLanguages.includes(language)
    )
  })
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
  const requestedMenuId = computed(() => clean(menuId?.value))
  const menu = computed(() => {
    const id = requestedMenuId.value
    return id ? menus.value.find((item) => clean(item.id) === id) ?? null : null
  })
  const translationCachePath = computed(() =>
    kitchenId.value && clean(menu.value?.id) && selectedLanguageUsesCache.value
      ? `${ROOT_KITCHENS}/${kitchenId.value}/menus/${clean(menu.value?.id)}/translation_cache`
      : ''
  )
  const translationCacheRows = ref<Record<string, unknown>[]>([])
  const translationCachePending = ref(false)
  let translationCacheRequestId = 0
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

  watch(
    [translationCachePath, selectedLanguageUsesCache],
    async ([path, usesCache]) => {
      const requestId = ++translationCacheRequestId
      translationCacheRows.value = []

      if (!usesCache || !path) {
        translationCachePending.value = false
        return
      }

      translationCachePending.value = true
      try {
        const snap = await getDocs(collection(resolveDb(), path))
        if (requestId !== translationCacheRequestId) return

        translationCacheRows.value = snap.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        }))
      } finally {
        if (requestId === translationCacheRequestId) {
          translationCachePending.value = false
        }
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
  const translationCacheByField = computed(() => {
    const map = new Map<string, string>()
    if (!selectedLanguageUsesCache.value) return map

    for (const row of translationCacheRows.value) {
      const fieldId = clean(row.field_id)
      const targetLanguage = clean(row.target_language)
      const translatedText = clean(row.translated_text)
      if (fieldId && targetLanguage === selectedLanguage.value && translatedText) {
        map.set(fieldId, translatedText)
      }
    }

    return map
  })
  const cacheTextFor = (fieldId: string) =>
    selectedLanguageUsesCache.value
      ? translationCacheByField.value.get(fieldId) || ''
      : ''
  const textForLanguage = (
    defaultText: unknown,
    translations: unknown,
    cacheFieldId = ''
  ) =>
    resolvePublicTranslatedText({
      defaultText,
      translations,
      selectedLanguage: activeContentLanguage.value,
      cacheText: cacheTextFor(cacheFieldId),
    }).text
  const menuFieldId = (menu: Pick<Menu, 'id'>, field: string) =>
    `menu:${clean(menu.id)}:${field}`
  const sectionFieldId = (
    menu: Pick<Menu, 'id'>,
    section: Pick<MenuSection, 'id'>,
    field: string
  ) => `menu:${clean(menu.id)}:section:${clean(section.id)}:${field}`
  const itemFieldId = (
    menu: Pick<Menu, 'id'>,
    section: Pick<MenuSection, 'id'>,
    item: Pick<MenuItem, 'id'>,
    field: string
  ) => `menu:${clean(menu.id)}:section:${clean(section.id)}:item:${clean(item.id)}:${field}`
  const dishFieldId = (dish: Pick<Dish, 'id'>, field: string) =>
    `dish:${clean(dish.id)}:${field}`
  const displayMenu = computed<Menu | null>(() => {
    if (!menu.value) return null

    const source = menu.value as Menu & MenuWithEmbeddedSections
    return {
      ...menu.value,
      name:
        textForLanguage(source.name, source.names, menuFieldId(source, 'name')) ||
        menu.value.name,
      description:
        textForLanguage(
          source.description,
          source.descriptions,
          menuFieldId(source, 'description')
        ) || menu.value.description,
    }
  })

  const sectionRows = computed<PublicMenuSectionRow[]>(() =>
    sections.value.map((section) => {
      const sectionId = clean(section.id)
      const sourceSection = section as EmbeddedMenuSection
      const items = resolvedItemRows.value
        .filter((row) => row.sectionId === sectionId)
        .map<PublicMenuItemRow>((row) => {
          const sourceItem = row.item as EmbeddedMenuItem
          const dish = dishesById.value.get(clean(row.item.dish_id)) ?? null
          const sourceDish = dish as (Dish & { names?: unknown; descriptions?: unknown }) | null
          const itemLabel = textForLanguage(
            sourceItem.label,
            sourceItem.labels,
            itemFieldId(menu.value as Menu, sourceSection, sourceItem, 'label')
          )
          const label = sourceDish
            ? textForLanguage(
                sourceDish.name,
                sourceDish.names,
                dishFieldId(sourceDish, 'name')
              ) || itemLabel
            : itemLabel
          const itemDescription = textForLanguage(
            sourceItem.description,
            sourceItem.descriptions,
            itemFieldId(menu.value as Menu, sourceSection, sourceItem, 'description')
          )
          const dishDescription = sourceDish
            ? textForLanguage(
                sourceDish.description,
                sourceDish.descriptions,
                dishFieldId(sourceDish, 'description')
              )
            : ''
          return {
            item: row.item,
            dish,
            label,
            description: itemDescription || dishDescription,
            price: resolveItemPrice(row.item),
          }
        })
        .filter((row) => row.label)

      return {
        section: {
          ...section,
          label:
            textForLanguage(
              sourceSection.label,
              sourceSection.labels,
              sectionFieldId(menu.value as Menu, sourceSection, 'label')
            ) || section.label,
          description:
            textForLanguage(
              sourceSection.description,
              sourceSection.descriptions,
              sectionFieldId(menu.value as Menu, sourceSection, 'description')
            ) || section.description,
        },
        items,
      }
    })
  )
  const languageOptions = computed(() =>
    sproochliEnabled.value
      ? resolvePublicKitchenLanguageOptions(kitchen.value)
      : []
  )

  const pending = computed(
    () =>
      kitchensPending.value ||
      menuRead.pending.value ||
      (Boolean(requestedMenuId.value) &&
        ((!usesEmbeddedSections.value && sectionRead.pending.value) ||
          dishRead.pending.value ||
          itemsPending.value ||
          translationCachePending.value))
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
    menu: displayMenu,
    sections,
    sectionRows,
    selectedLanguage,
    languageOptions,
    sproochliEnabled,
    pending,
    unavailable,
  }
}
