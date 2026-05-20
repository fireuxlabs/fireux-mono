<template>
  <main :dir="pageDirection">
    <p>
      <NuxtLink to="/">La Tap Berne</NuxtLink>
    </p>

    <h1>{{ kitchenName }}</h1>
    <p>
      Route identity:
      <code>kitchens/{{ routeKitchenSlug }}/menus/{{ routeMenuId }}</code>
    </p>
    <p v-if="kitchenId">
      Firestore source:
      <code>kitchens/{{ kitchenId }}</code>
    </p>

    <p v-if="loading">{{ chromeLabels.loadingMenu }}</p>

    <section v-if="languageOptions.length > 1" aria-label="Menu language">
      <h2>Language</h2>
      <p>
        <NuxtLink
          v-for="option in languageOptions"
          :key="option.code || 'original'"
          :to="languageRoute(option.code)"
        >
          {{ option.label }}
        </NuxtLink>
      </p>
      <p v-if="selectedLanguage">
        Showing language: <code>{{ selectedLanguage }}</code>
      </p>
    </section>

    <section v-if="missingMessages.length">
      <h2>Missing / unclear data</h2>
      <ul>
        <li v-for="message in missingMessages" :key="message">
          {{ message }}
        </li>
      </ul>
    </section>

    <article v-if="selectedMenu">
      <h2>{{ menuTitle }}</h2>
      <p v-if="menuDescription">{{ menuDescription }}</p>

      <section v-for="section in publicSections" :key="section.id">
        <h3>{{ section.label }}</h3>
        <p v-if="section.description">{{ section.description }}</p>

        <p v-if="!section.entries.length">No public items in this category.</p>

        <ul v-else>
          <li v-for="entry in section.entries" :key="entry.id">
            <h4>{{ entry.name }}</h4>
            <p v-if="entry.priceLabel">{{ entry.priceLabel }}</p>
            <p v-if="entry.description">{{ entry.description }}</p>
            <p v-if="entry.missingDish">{{ entry.missingDish }}</p>
          </li>
        </ul>
      </section>
    </article>

    <details>
      <summary>Data paths checked</summary>
      <dl>
        <dt>Kitchen</dt>
        <dd>{{ kitchenPath || '[waiting for kitchen id]' }}</dd>
        <dt>Menus</dt>
        <dd>{{ menusPath || '[waiting for kitchen id]' }}</dd>
        <dt>Dishes</dt>
        <dd>{{ dishesPath || '[waiting for kitchen id]' }}</dd>
        <dt>Translation cache</dt>
        <dd>{{ translationCachePath || '[not requested for this language]' }}</dd>
      </dl>
    </details>
  </main>
</template>

<script setup lang="ts">
import { collection, getDocs } from 'firebase/firestore'
import { computed, ref, watch } from 'vue'
import { useHead, useRoute } from '#imports'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  isPublicKitchenCacheLanguage,
  isPublicKitchenRtlLanguage,
  normalizePublicKitchenLanguage,
  resolvePublicKitchenChromeLanguage,
  resolvePublicKitchenLanguageOptions,
  resolvePublicKitchenLanguageState,
  resolvePublicTranslatedText,
  type PublicKitchenLanguageCode,
} from 'fireux-kitchens/runtime/composables/fireux/app/public-kitchen-language'
import { usePublicMenuLanguage } from 'fireux-kitchens/runtime/composables/fireux/app/kitchens/usePublicMenuLanguage'
import { resolveKitchenChildCollectionPath } from 'fireux-kitchens/runtime/composables/fireux/console/kitchen/operations/collections/useKitchenChildCollection'
import { useKitchenCollection } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import type { KitchenSurface } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { Dish } from 'fireux-kitchens/runtime/models/dish.model'
import type {
  Menu,
  MenuSection,
  MenuSectionItem,
  MenuItemPriceOption,
} from 'fireux-kitchens/runtime/models/menu.model'

type PublicKitchenRecord = KitchenSurface & {
  currency_format?: string
  language_settings?: unknown
  primary_language?: string
}

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const routeKitchenSlug = 'la-tapberne'
const routeMenuId = 'main'
const rootKitchenCollectionPath = 'kitchens'
const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeRouteQueryString = (value: unknown) =>
  Array.isArray(value) ? normalizeString(value[0]) : normalizeString(value)

const selectedLanguage = computed(() =>
  normalizePublicKitchenLanguage(
    normalizeRouteQueryString(route.query.lang || route.query.language)
  )
)
const pageDirection = computed(() =>
  isPublicKitchenRtlLanguage(selectedLanguage.value) ? 'rtl' : 'ltr'
)

const resolveDb = useFirestoreResolver()
const { kitchens: slugResolverKitchens, pending: slugResolverPending } =
  useKitchenCollection()
const slugResolvedKitchen = computed<PublicKitchenRecord | null>(() => {
  const slugKey = routeKitchenSlug.toLowerCase()
  const found = slugResolverKitchens.value.find((entry) => {
    const slug = normalizeString((entry as { slug?: unknown }).slug).toLowerCase()
    return slug.length > 0 && slug === slugKey
  })

  return found ? (found as PublicKitchenRecord) : null
})
const slugResolvedKitchenId = computed(() =>
  normalizeString(slugResolvedKitchen.value?.id)
)
const kitchen = computed<PublicKitchenRecord | null>(() => slugResolvedKitchen.value)
const kitchenId = computed(() => slugResolvedKitchenId.value)
const kitchenName = computed(() =>
  normalizeString(kitchen.value?.name) || '[missing kitchen.name]'
)
const kitchenPath = computed(() =>
  kitchenId.value ? `${rootKitchenCollectionPath}/${kitchenId.value}` : ''
)
const menusPath = computed(() =>
  kitchenId.value
    ? resolveKitchenChildCollectionPath({
        kitchenCollectionPath: rootKitchenCollectionPath,
        kitchenId: kitchenId.value,
        collectionName: 'menus',
      })
    : ''
)
const dishesPath = computed(() =>
  kitchenId.value
    ? resolveKitchenChildCollectionPath({
        kitchenCollectionPath: rootKitchenCollectionPath,
        kitchenId: kitchenId.value,
        collectionName: 'dishes',
      })
    : ''
)

const languageState = computed(() => resolvePublicKitchenLanguageState(kitchen.value))
const chromeLanguage = computed(() =>
  resolvePublicKitchenChromeLanguage({
    selectedLanguage: selectedLanguage.value,
    primaryLanguage:
      languageState.value.defaultLanguage || languageState.value.primaryLanguage,
  })
)
const { labels: chromeLabels } = usePublicMenuLanguage(chromeLanguage)
const selectedLanguageUsesCache = computed(() => {
  const language = selectedLanguage.value
  return Boolean(
    language &&
      isPublicKitchenCacheLanguage(language) &&
      languageState.value.cachedLanguages.includes(language)
  )
})
const translationCachePath = computed(() =>
  kitchenId.value && selectedLanguageUsesCache.value
    ? `${rootKitchenCollectionPath}/${kitchenId.value}/menus/${routeMenuId}/translation_cache`
    : ''
)

const menus = ref<Menu[] | undefined>(undefined)
const dishes = ref<Dish[] | undefined>(undefined)
const translationCacheRows = ref<Record<string, unknown>[] | undefined>(undefined)
const menuDataPending = ref(false)
const menuDataError = ref('')
let menuDataRequestId = 0

const selectedMenu = computed<Menu | null>(() => {
  const list = menus.value ?? []
  return list.find((entry: Menu) => normalizeString(entry.id) === routeMenuId) ?? null
})
const dishesById = computed(() => {
  const map = new Map<string, Dish>()
  for (const dish of dishes.value ?? []) {
    const id = normalizeString(dish.id)
    if (id) map.set(id, dish)
  }
  return map
})
const translationCacheByField = computed(() => {
  const map = new Map<string, string>()
  if (!selectedLanguageUsesCache.value) return map

  for (const row of translationCacheRows.value ?? []) {
    const fieldId = normalizeString(row.field_id)
    const targetLanguage = normalizeString(row.target_language)
    const translatedText = normalizeString(row.translated_text)
    if (fieldId && targetLanguage === selectedLanguage.value && translatedText) {
      map.set(fieldId, translatedText)
    }
  }

  return map
})
const languageOptions = computed(() =>
  resolvePublicKitchenLanguageOptions(kitchen.value)
)
const loading = computed(() => {
  if (slugResolverPending.value) return true
  if (!kitchenId.value) return false
  return menuDataPending.value
})

const currencyCode = computed(() =>
  normalizeString(kitchen.value?.currency_code).toUpperCase() || 'CHF'
)
const currencyFormat = computed(() => {
  const format = normalizeString(kitchen.value?.currency_format).toLowerCase()
  if (format === 'dash' || format === 'symbol' || format === 'code') {
    return format
  }
  return currencyCode.value === 'CHF' ? 'dash' : 'symbol'
})

const languageRoute = (code: PublicKitchenLanguageCode) => ({
  path: route.path,
  query: code ? { lang: code } : {},
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
    selectedLanguage: selectedLanguage.value,
    cacheText: cacheTextFor(cacheFieldId),
  }).text
const requiredTextForLanguage = (
  defaultText: unknown,
  translations: unknown,
  cacheFieldId: string,
  missingLabel: string
) => textForLanguage(defaultText, translations, cacheFieldId) || missingLabel

const menuFieldId = (menu: Pick<Menu, 'id'>, field: string) =>
  `menu:${normalizeString(menu.id)}:${field}`
const sectionFieldId = (
  menu: Pick<Menu, 'id'>,
  section: Pick<MenuSection, 'id'>,
  field: string
) =>
  `menu:${normalizeString(menu.id)}:section:${normalizeString(section.id)}:${field}`
const itemFieldId = (
  menu: Pick<Menu, 'id'>,
  section: Pick<MenuSection, 'id'>,
  item: Pick<MenuSectionItem, 'id'>,
  field: string
) =>
  `menu:${normalizeString(menu.id)}:section:${normalizeString(section.id)}:item:${normalizeString(item.id)}:${field}`
const dishFieldId = (dish: Pick<Dish, 'id'>, field: string) =>
  `dish:${normalizeString(dish.id)}:${field}`

const formatPrice = (value: unknown) => {
  const amount = Number(value ?? 0)
  if (!Number.isFinite(amount) || amount <= 0) return ''
  if (currencyFormat.value === 'dash') {
    return amount % 1 === 0 ? `${amount}.-` : amount.toFixed(2)
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
  if (normalizedUnit === 'piece') return selectedLanguage.value === 'en' ? 'pcs' : 'Stk.'
  if (normalizedUnit === 'gram') return selectedLanguage.value === 'en' ? 'g' : 'gr'
  return normalizedUnit
}
const formatPriceOption = (option: MenuItemPriceOption) => {
  const quantity = Number(option.quantity ?? 0)
  const price = formatPrice(option.price)
  if (!Number.isFinite(quantity) || quantity <= 0 || !price) return ''

  const unit = priceUnitLabel(option.unit)
  const quantityLabel = unit === 'gr' ? `${quantity}${unit}` : `${quantity} ${unit}`.trim()
  return `${quantityLabel} ${price}`.trim()
}
const formatMenuItemPrice = (item: MenuSectionItem) => {
  if (Array.isArray(item.price_options) && item.price_options.length) {
    return item.price_options
      .map((option) => formatPriceOption(option))
      .filter(Boolean)
      .join(' / ')
  }

  return formatPrice(item.price)
}

type PublicMenuEntry = {
  id: string
  name: string
  description: string
  priceLabel: string
  missingDish: string
}

watch(
  [kitchenId, selectedLanguageUsesCache],
  async ([activeKitchenId, activeLanguageUsesCache]: [string, boolean]) => {
    const requestId = ++menuDataRequestId
    menus.value = undefined
    dishes.value = undefined
    translationCacheRows.value = undefined
    menuDataError.value = ''

    if (!activeKitchenId) {
      menus.value = []
      dishes.value = []
      translationCacheRows.value = []
      menuDataPending.value = false
      return
    }

    menuDataPending.value = true

    try {
      const [menusSnap, dishesSnap, translationCacheSnap] = await Promise.all([
        getDocs(collection(resolveDb(), menusPath.value)),
        getDocs(collection(resolveDb(), dishesPath.value)),
        activeLanguageUsesCache && translationCachePath.value
          ? getDocs(collection(resolveDb(), translationCachePath.value))
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
      if (requestId !== menuDataRequestId) return

      const message = error instanceof Error ? error.message : String(error)
      menuDataError.value = message || 'Unknown menu data load error.'
      menus.value = []
      dishes.value = []
      translationCacheRows.value = []
    } finally {
      if (requestId === menuDataRequestId) menuDataPending.value = false
    }
  },
  { immediate: true }
)

const publicSections = computed(() => {
  const menu = selectedMenu.value
  if (!menu || !Array.isArray(menu.sections)) return []

  return menu.sections
    .slice()
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    .map((section) => {
      const sectionId = normalizeString(section.id)
      const entries: PublicMenuEntry[] = (Array.isArray(section.items) ? section.items : [])
        .slice()
        .filter((item) => item.active !== false)
        .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
        .map((item) => {
          const itemId = normalizeString(item.id)
          const dishId = normalizeString(item.dish_id)
          const dish = dishId ? dishesById.value.get(dishId) ?? null : null
          const itemLabel = textForLanguage(
            item.label,
            item.labels,
            itemFieldId(menu, section, item, 'label')
          )
          const name = dish
            ? requiredTextForLanguage(
                dish.name,
                dish.names,
                dishFieldId(dish, 'name'),
                '[missing dish.name]'
              )
            : itemLabel || '[missing item.label or linked dish]'
          const itemDescription = textForLanguage(
            item.description,
            item.descriptions,
            itemFieldId(menu, section, item, 'description')
          )
          const dishDescription = dish
            ? textForLanguage(
                dish.description,
                dish.descriptions,
                dishFieldId(dish, 'description')
              )
            : ''

          return {
            id: itemId || dishId || `missing-item-${sectionId}`,
            name,
            description: itemDescription || dishDescription,
            priceLabel: formatMenuItemPrice(item),
            missingDish:
              dishId && !dish ? `Missing dish document: ${dishId}` : '',
          }
        })

      return {
        id: sectionId || `missing-section-${section.sort_order ?? 'unknown'}`,
        label: requiredTextForLanguage(
          section.label,
          section.labels,
          sectionFieldId(menu, section, 'label'),
          '[missing section.label]'
        ),
        description: textForLanguage(
          section.description,
          (section as MenuSection & { descriptions?: unknown }).descriptions,
          sectionFieldId(menu, section, 'description')
        ),
        entries,
      }
    })
})
const menuTitle = computed(() => {
  const menu = selectedMenu.value
  if (!menu) return '[missing menu]'

  return requiredTextForLanguage(
    menu.name,
    menu.names,
    menuFieldId(menu, 'name'),
    '[missing menu.name]'
  )
})
const menuDescription = computed(() => {
  const menu = selectedMenu.value
  if (!menu) return ''

  return textForLanguage(menu.description, menu.descriptions, menuFieldId(menu, 'description'))
})
const missingMessages = computed(() => {
  if (loading.value) return []

  const messages: string[] = []
  if (!kitchen.value) {
    messages.push(`No public kitchen found with slug "${routeKitchenSlug}".`)
  }
  if (menuDataError.value) {
    messages.push(`Menu data load failed: ${menuDataError.value}`)
  }
  if (kitchenId.value && menus.value !== undefined && !menus.value.length) {
    messages.push(`No menu documents found at ${menusPath.value}.`)
  }
  if (menus.value !== undefined && menus.value.length && !selectedMenu.value) {
    messages.push(`No menu document found with id "${routeMenuId}".`)
  }
  if (selectedMenu.value && !Array.isArray(selectedMenu.value.sections)) {
    messages.push('Selected menu has no sections array.')
  }
  if (selectedMenu.value && Array.isArray(selectedMenu.value.sections) && !selectedMenu.value.sections.length) {
    messages.push('Selected menu has an empty sections array.')
  }
  if (kitchenId.value && dishes.value !== undefined && !dishes.value.length) {
    messages.push(`No dish documents found at ${dishesPath.value}.`)
  }

  for (const section of publicSections.value) {
    for (const entry of section.entries) {
      if (entry.missingDish) messages.push(entry.missingDish)
    }
  }

  return Array.from(new Set(messages))
})

useHead({
  title: computed(() => `La Tap Berne - ${menuTitle.value}`),
})
</script>
