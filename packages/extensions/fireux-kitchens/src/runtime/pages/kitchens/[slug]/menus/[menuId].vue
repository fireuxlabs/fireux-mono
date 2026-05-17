<template>
  <OrganismsMenuPreview :menu="publicMenuPreview" />
</template>

<script setup lang="ts">
import { collection, getDocs } from 'firebase/firestore'
import { computed, ref, watch } from 'vue'
import { useHead, useRoute } from '#imports'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { resolveKitchenChildCollectionPath } from '../../../../composables/fireux/console/kitchen/operations/collections/useKitchenChildCollection'
import {
  getPublicKitchenChromeLabels,
  isPublicKitchenCacheLanguage,
  normalizePublicKitchenLanguage,
  resolvePublicKitchenChromeLanguage,
  resolvePublicKitchenLanguageState,
  resolvePublicTranslatedText,
} from '../../../../composables/fireux/app/public-kitchen-language'
import { useKitchenCollection } from '../../../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import type { Dish } from '../../../../models/dish.model'
import type { Kitchen } from '../../../../models/kitchen.model'
import type { Menu } from '../../../../models/menu.model'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicMenusDetailPage',
  key: (route) => route.fullPath,
})

const route = useRoute()
const normalizeString = (value: unknown) => String(value ?? '').trim()
const routeKitchenSlug = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw)
    ? normalizeString(raw[0])
    : normalizeString(raw)
})
const routeMenuId = computed(() => {
  const raw = route.params.menuId
  return Array.isArray(raw)
    ? normalizeString(raw[0])
    : normalizeString(raw)
})
const selectedLanguage = computed(() => {
  const raw = route.query.lang || route.query.language
  const value = Array.isArray(raw) ? raw[0] : raw
  return normalizePublicKitchenLanguage(value)
})
const passThroughQuery = computed(() =>
  Object.fromEntries(
    Object.entries(route.query).filter(
      ([key]) => !['lang', 'language'].includes(key)
    )
  )
)
const languageQuery = computed(() =>
  selectedLanguage.value
    ? { ...passThroughQuery.value, lang: selectedLanguage.value }
    : passThroughQuery.value
)

const { kitchens, pending: kitchensPending } = useKitchenCollection()
const resolvedKitchen = computed<Kitchen | null>(() => {
  const slugKey = routeKitchenSlug.value.toLowerCase()
  if (!slugKey) return null

  const list = kitchens.value ?? []
  const found = list.find((entry) => {
    const slug = normalizeString((entry as any)?.slug).toLowerCase()
    return slug.length > 0 && slug === slugKey
  })

  return found ?? null
})
const kitchenId = computed(() => normalizeString(resolvedKitchen.value?.id))
const resolveDb = useFirestoreResolver()
const menusPath = computed(() =>
  resolveKitchenChildCollectionPath({
    kitchenId: kitchenId.value,
    collectionName: 'menus',
  })
)
const dishesPath = computed(() =>
  resolveKitchenChildCollectionPath({
    kitchenId: kitchenId.value,
    collectionName: 'dishes',
  })
)
const translationCachePath = computed(() => {
  if (!kitchenId.value || !routeMenuId.value) return ''
  return `kitchens/${kitchenId.value}/menus/${routeMenuId.value}/translation_cache`
})
const menus = ref<Menu[]>([])
const dishes = ref<Dish[]>([])
const translationCacheRows = ref<Record<string, any>[]>([])
const menuDataPending = ref(false)
let menuDataRequestId = 0
const translationCacheByField = computed(() => {
  const map = new Map<string, string>()
  for (const item of translationCacheRows.value) {
    const fieldId = normalizeString((item as any).field_id)
    const targetLanguage = normalizeString((item as any).target_language)
    const translatedText = normalizeString((item as any).translated_text)
    if (fieldId && targetLanguage === selectedLanguage.value && translatedText) {
      map.set(fieldId, translatedText)
    }
  }
  return map
})
const selectedLanguageUsesCache = computed(() => {
  const language = selectedLanguage.value
  if (!language || !isPublicKitchenCacheLanguage(language)) return false

  return resolvePublicKitchenLanguageState(resolvedKitchen.value).cachedLanguages.includes(language)
})

watch(
  [kitchenId, routeMenuId, selectedLanguageUsesCache],
  async ([activeKitchenId, activeMenuId, activeLanguageUsesCache]) => {
    const requestId = ++menuDataRequestId
    menus.value = []
    dishes.value = []
    translationCacheRows.value = []

    if (!activeKitchenId) {
      menuDataPending.value = false
      return
    }

    menuDataPending.value = true

    try {
      const [menusSnap, dishesSnap, translationCacheSnap] = await Promise.all([
        getDocs(
          collection(
            resolveDb(),
            resolveKitchenChildCollectionPath({
              kitchenId: activeKitchenId,
              collectionName: 'menus',
            })
          )
        ),
        getDocs(
          collection(
            resolveDb(),
            resolveKitchenChildCollectionPath({
              kitchenId: activeKitchenId,
              collectionName: 'dishes',
            })
          )
        ),
        activeLanguageUsesCache && activeMenuId
          ? getDocs(
              collection(
                resolveDb(),
                `kitchens/${activeKitchenId}/menus/${activeMenuId}/translation_cache`
              )
            )
          : Promise.resolve(null),
      ])

      if (requestId !== menuDataRequestId) return

      menus.value = menusSnap.docs.map((doc) => ({
        ...(doc.data() as Menu),
        id: doc.id,
      }))
      dishes.value = dishesSnap.docs.map((doc) => ({
        ...(doc.data() as Dish),
        id: doc.id,
      }))
      translationCacheRows.value = translationCacheSnap
        ? translationCacheSnap.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        : []
    } catch (error) {
      if (requestId === menuDataRequestId) {
        console.error('[public-menu] Failed to load menu data', error)
        menus.value = []
        dishes.value = []
        translationCacheRows.value = []
      }
    } finally {
      if (requestId === menuDataRequestId) {
        menuDataPending.value = false
      }
    }
  },
  { immediate: true }
)

const selectedMenu = computed<Menu | null>(() =>
  menus.value.find((menu) => normalizeString(menu.id) === routeMenuId.value) ?? null
)
const dishesById = computed(() => {
  const map = new Map<string, Dish>()
  dishes.value.forEach((dish) => {
    const id = normalizeString(dish.id)
    if (id) map.set(id, dish)
  })
  return map
})
const loading = computed(
  () =>
    Boolean(routeKitchenSlug.value) &&
    (kitchensPending.value || menuDataPending.value)
)
const currencyCode = computed(() =>
  normalizeString((resolvedKitchen.value as any)?.currency_code).toUpperCase() || 'CHF'
)
const currencyFormat = computed(() => {
  const format = normalizeString((resolvedKitchen.value as any)?.currency_format).toLowerCase()
  if (format === 'dash' || format === 'symbol' || format === 'code') return format
  return currencyCode.value === 'CHF' ? 'dash' : 'symbol'
})
const textForLanguage = (
  defaultText: unknown,
  translations: unknown,
  language: string,
  cacheFieldId = ''
) => {
  return resolvePublicTranslatedText({
    defaultText,
    translations,
    selectedLanguage: language,
    cacheText: selectedLanguageUsesCache.value
      ? translationCacheByField.value.get(cacheFieldId)
      : '',
  }).text
}
const formatPrice = (value: unknown) => {
  const amount = Number(value ?? 0)
  if (!Number.isFinite(amount) || amount <= 0) return ''
  if (currencyFormat.value === 'dash') {
    if (amount % 1 === 0) return `${amount}.-`
    return amount.toFixed(2)
  }

  return new Intl.NumberFormat(selectedLanguage.value || 'de-CH', {
    style: 'currency',
    currency: currencyCode.value,
    currencyDisplay: currencyFormat.value === 'code' ? 'code' : 'narrowSymbol',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
const priceUnitLabel = (unit: unknown) => {
  const normalizedUnit = normalizeString(unit).toLowerCase()
  if (normalizedUnit === 'piece') {
    if (selectedLanguage.value === 'ar') return 'قطع'
    if (selectedLanguage.value === 'he') return 'יח׳'
    if (selectedLanguage.value === 'ko') return '개'
    if (selectedLanguage.value === 'ja') return '個'
    if (selectedLanguage.value === 'fr') return 'pièces'
    if (selectedLanguage.value === 'it') return 'pz.'
    if (selectedLanguage.value === 'es') return 'uds.'
    if (selectedLanguage.value === 'pt') return 'un.'
    return selectedLanguage.value === 'en' ? 'pcs' : 'Stk.'
  }
  if (normalizedUnit === 'gram') {
    if (selectedLanguage.value === 'ar') return 'غ'
    if (selectedLanguage.value === 'he') return 'גרם'
    return selectedLanguage.value === 'en' ||
      selectedLanguage.value === 'fr' ||
      selectedLanguage.value === 'it' ||
      selectedLanguage.value === 'es' ||
      selectedLanguage.value === 'pt' ||
      selectedLanguage.value === 'ko' ||
      selectedLanguage.value === 'ja'
      ? 'g'
      : 'gr'
  }
  return normalizedUnit
}
const formatPriceOption = (option: Record<string, any>) => {
  const quantity = Number(option.quantity ?? 0)
  const price = formatPrice(option.price)
  if (!Number.isFinite(quantity) || quantity <= 0 || !price) return ''

  const unit = priceUnitLabel(option.unit)
  const quantityLabel = unit === 'gr'
    ? `${quantity}${unit}`
    : `${quantity} ${unit}`.trim()

  return `${quantityLabel} ${price}`.trim()
}
const formatMenuItemPrice = (item: Record<string, any>) => {
  if (Array.isArray(item.price_options) && item.price_options.length) {
    return item.price_options
      .map((option: Record<string, any>) => formatPriceOption(option))
      .filter(Boolean)
      .join(' / ')
  }

  return formatPrice(item.price)
}
const menuFieldId = (menu: Record<string, any>, field: string) =>
  `menu:${normalizeString(menu.id)}:${field}`
const sectionFieldId = (menu: Record<string, any>, section: Record<string, any>, field: string) =>
  `menu:${normalizeString(menu.id)}:section:${normalizeString(section.id)}:${field}`
const itemFieldId = (
  menu: Record<string, any>,
  section: Record<string, any>,
  item: Record<string, any>,
  field: string
) =>
  `menu:${normalizeString(menu.id)}:section:${normalizeString(section.id)}:item:${normalizeString(item.id)}:${field}`
const dishFieldId = (dish: Record<string, any>, field: string) =>
  `dish:${normalizeString(dish.id)}:${field}`

const publicSections = computed(() =>
  (Array.isArray((selectedMenu.value as any)?.sections)
    ? ((selectedMenu.value as any).sections as Record<string, any>[])
    : []
  )
    .slice()
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    .map((section) => {
      const entries = (Array.isArray(section.items) ? section.items : [])
        .slice()
        .filter((item: Record<string, any>) => item.active !== false)
        .sort((a: Record<string, any>, b: Record<string, any>) =>
          Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
        )
        .map((item: Record<string, any>) => {
          const dishId = normalizeString(item.dish_id)
          const dish = dishesById.value.get(dishId) ?? null
          const itemDescription = textForLanguage(
            item.description,
            item.descriptions,
            selectedLanguage.value,
            itemFieldId(selectedMenu.value as any, section, item, 'description')
          )
          const dishDescription = dish
            ? textForLanguage(
                dish.description,
                (dish as any).descriptions,
                selectedLanguage.value,
                dishFieldId(dish as any, 'description')
              )
            : ''
          const itemLabel = textForLanguage(
            item.label,
            item.labels,
            selectedLanguage.value,
            itemFieldId(selectedMenu.value as any, section, item, 'label')
          )

          return {
            id: normalizeString(item.id),
            dishId,
            name: dish
              ? textForLanguage(
                  dish.name,
                  (dish as any).names,
                  selectedLanguage.value,
                  dishFieldId(dish as any, 'name')
                )
              : itemLabel,
            description: itemDescription || dishDescription,
            priceLabel: formatMenuItemPrice(item),
          }
        })
        .filter((entry: { name: string; description: string }) => entry.name || entry.description)

      return {
        id: normalizeString(section.id),
        label: textForLanguage(
          section.label,
          section.labels,
          selectedLanguage.value,
          sectionFieldId(selectedMenu.value as any, section, 'label')
        ),
        description: textForLanguage(
          section.description,
          section.descriptions,
          selectedLanguage.value,
          sectionFieldId(selectedMenu.value as any, section, 'description')
        ),
        entries,
      }
    })
    .filter((section) => section.entries.length > 0)
)
const primaryLanguage = computed(() =>
  normalizeString((resolvedKitchen.value as any)?.primary_language)
)
const chromeLanguage = computed(() =>
  resolvePublicKitchenChromeLanguage({
    selectedLanguage: selectedLanguage.value,
    primaryLanguage: primaryLanguage.value,
  })
)
const chromeLabels = computed(() =>
  getPublicKitchenChromeLabels(chromeLanguage.value)
)
const menuTitle = computed(() => {
  const menu = selectedMenu.value as any
  if (!menu) return chromeLabels.value.menus
  return textForLanguage(
    menu.name || chromeLabels.value.menus,
    menu.names,
    selectedLanguage.value,
    menuFieldId(menu, 'name')
  )
})
const breadcrumbItems = computed(() => [
  {
    label: chromeLabels.value.menus,
    to: {
      path: `/kitchens/${encodeURIComponent(routeKitchenSlug.value)}/menus`,
      query: languageQuery.value,
    },
  },
  {
    label: menuTitle.value,
  },
])

useHead({
  title: computed(() => chromeLabels.value.menus),
})

const publicMenuPreview = {
  loading,
  resolvedKitchen,
  selectedMenu,
  publicSections,
  selectedLanguage,
  primaryLanguage,
  routePath: computed(() => route.path),
  menuTitle,
  breadcrumbItems,
  debugData: computed(() =>
    import.meta.dev
      ? {
          route: {
            slug: routeKitchenSlug.value,
            menu_id: routeMenuId.value,
            mode: selectedLanguage.value || 'default',
          },
          firestore_paths: {
            kitchen: kitchenId.value ? `kitchens/${kitchenId.value}` : '',
            menus: menusPath.value,
            dishes: dishesPath.value,
            translation_cache: translationCachePath.value,
          },
          kitchen: resolvedKitchen.value
            ? {
                id: resolvedKitchen.value.id,
                name: normalizeString(resolvedKitchen.value.name),
                primary_language: primaryLanguage.value,
                slug: normalizeString((resolvedKitchen.value as any).slug),
              }
            : null,
          menu: selectedMenu.value
            ? {
                id: selectedMenu.value.id,
                description: normalizeString(selectedMenu.value.description),
              }
            : null,
          sections: publicSections.value,
        }
      : undefined
  ),
}
</script>
