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
const menusRef = firestoreFetchCollection<Menu>(menusPath)
const dishesRef = firestoreFetchCollection<Dish>(dishesPath)
const menus = computed(() => menusRef.value ?? [])
const dishes = computed(() => dishesRef.value ?? [])
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
const textForLanguage = (
  defaultText: unknown,
  translations: unknown,
  language: string
) => {
  const fallback = normalizeString(defaultText)
  if (!language || !translations || typeof translations !== 'object' || Array.isArray(translations)) {
    return fallback
  }

  return normalizeString((translations as Record<string, unknown>)[language]) || fallback
}
const formatPrice = (value: unknown) => {
  const amount = Number(value ?? 0)
  if (!Number.isFinite(amount) || amount <= 0) return ''
  if (amount % 1 === 0) return `${amount}.-`
  return amount.toFixed(2)
}

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
            selectedLanguage.value
          )
          const dishDescription = dish
            ? textForLanguage(dish.description, (dish as any).descriptions, selectedLanguage.value)
            : ''
          const itemLabel = textForLanguage(
            item.label,
            item.labels,
            selectedLanguage.value
          )

          return {
            id: normalizeString(item.id),
            dishId,
            name: dish
              ? textForLanguage(dish.name, (dish as any).names, selectedLanguage.value)
              : itemLabel,
            description: itemDescription || dishDescription,
            priceLabel: normalizeString(item.price_label) || formatPrice(item.price),
          }
        })
        .filter((entry: { name: string; description: string }) => entry.name || entry.description)

      return {
        id: normalizeString(section.id),
        label: textForLanguage(section.label, section.labels, selectedLanguage.value),
        description: textForLanguage(
          section.description,
          section.descriptions,
          selectedLanguage.value
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
