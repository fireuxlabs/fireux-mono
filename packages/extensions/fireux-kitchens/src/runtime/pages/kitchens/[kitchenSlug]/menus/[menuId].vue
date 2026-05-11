<template>
  <OrganismsMenuPreview :menu="publicMenuPreview" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead, useRoute } from '#imports'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { resolveKitchenRuntimeChildCollectionPath } from '../../../../composables/fireux/app/kitchen-console/shared'
import {
  getPublicKitchenChromeLabels,
  isPublicKitchenCacheLanguage,
  normalizePublicKitchenLanguage,
  resolvePublicKitchenChromeLanguage,
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
  const raw = route.params.kitchenSlug
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

const { kitchens, pending: kitchensPending } = useKitchenCollection()
const resolvedKitchen = computed<Kitchen | null>(() => {
  const key = routeKitchenSlug.value
  if (!key) return null

  const keyLower = key.toLowerCase()
  const list = kitchens.value ?? []
  const found = list.find((entry) => {
    const id = normalizeString(entry?.id)
    const slug = normalizeString((entry as any)?.slug).toLowerCase()
    const slugAliases = Array.isArray((entry as any)?.slug_aliases)
      ? (entry as any).slug_aliases.map((alias: unknown) =>
          normalizeString(alias).toLowerCase()
        )
      : []

    return (
      id === key ||
      (slug.length > 0 && slug === keyLower) ||
      slugAliases.includes(keyLower) ||
      (id === 'ChIJ93_ggY-jj0cRTCyLcfBuK2w' &&
        ['luna-picante', 'luna-piccante'].includes(keyLower))
    )
  })

  return found ?? null
})
const kitchenId = computed(() => normalizeString(resolvedKitchen.value?.id))
const { firestoreFetchCollection } = useFirestoreRead()
const menusPath = computed(() =>
  resolveKitchenRuntimeChildCollectionPath({
    kitchenId: kitchenId.value,
    collectionName: 'menus',
  })
)
const dishesPath = computed(() =>
  resolveKitchenRuntimeChildCollectionPath({
    kitchenId: kitchenId.value,
    collectionName: 'dishes',
  })
)
const translationCachePath = computed(() => {
  if (!kitchenId.value || !routeMenuId.value) return ''
  return `kitchens/${kitchenId.value}/menus/${routeMenuId.value}/translation_cache`
})
const menusRef = firestoreFetchCollection<Menu>(menusPath)
const dishesRef = firestoreFetchCollection<Dish>(dishesPath)
const translationCacheRef = firestoreFetchCollection<Record<string, any>>(translationCachePath)
const menus = computed(() => menusRef.value ?? [])
const dishes = computed(() => dishesRef.value ?? [])
const translationCacheByField = computed(() => {
  const map = new Map<string, string>()
  for (const item of translationCacheRef.value ?? []) {
    const fieldId = normalizeString((item as any).field_id)
    const targetLanguage = normalizeString((item as any).target_language)
    const translatedText = normalizeString((item as any).translated_text)
    if (fieldId && targetLanguage === selectedLanguage.value && translatedText) {
      map.set(fieldId, translatedText)
    }
  }
  return map
})
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
    (kitchensPending.value ||
      Boolean(kitchenId.value && (menusRef.value === undefined || dishesRef.value === undefined)))
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
  const fallback = normalizeString(defaultText)
  if (isPublicKitchenCacheLanguage(language)) {
    return translationCacheByField.value.get(cacheFieldId) || fallback
  }

  if (!language || !translations || typeof translations !== 'object' || Array.isArray(translations)) {
    return fallback
  }

  return normalizeString((translations as Record<string, unknown>)[language]) || fallback
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
    if (selectedLanguage.value === 'fr') return 'pièces'
    return selectedLanguage.value === 'en' ? 'pcs' : 'Stk.'
  }
  if (normalizedUnit === 'gram') {
    if (selectedLanguage.value === 'ar') return 'غ'
    return selectedLanguage.value === 'en' || selectedLanguage.value === 'fr' ? 'g' : 'gr'
  }
  return normalizedUnit
}
const formatPriceOption = (option: Record<string, any>) => {
  const quantity = Number(option.quantity ?? 0)
  const price = formatPrice(option.price)
  if (!Number.isFinite(quantity) || quantity <= 0 || !price) return ''

  const unit = priceUnitLabel(option.unit)
  const quantityLabel = unit === 'g' || unit === 'gr'
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
  debugData: computed(() => ({
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
          slug: normalizeString((resolvedKitchen.value as any).slug) || routeKitchenSlug.value,
        }
      : null,
    menu: selectedMenu.value
      ? {
          id: selectedMenu.value.id,
          description: normalizeString(selectedMenu.value.description),
        }
      : null,
    sections: publicSections.value,
  })),
}
</script>
