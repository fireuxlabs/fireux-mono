<template>
  <main
    :dir="pageDirection"
    :lang="selectedLanguage || undefined"
    class="public-menu-page"
    :class="publicMenuPageClass"
    :style="publicMenuDesignStyle"
  >
    <section class="public-menu-hero">
      <NuxtLink to="/" class="public-menu-kicker">{{ appName }}</NuxtLink>
      <h1>{{ kitchenName }}</h1>
      <p class="public-menu-title">{{ menuTitle }}</p>
      <p v-if="menuDescription" class="public-menu-description">
        {{ menuDescription }}
      </p>

      <SproochliLanguageTrigger
        :language-options="languageOptions"
        :selected-language="selectedLanguage"
      />
    </section>

    <p v-if="loading" class="public-menu-state">{{ chromeLabels.loadingMenu }}</p>

    <section v-else-if="!selectedMenu || missingMessages.length" class="public-menu-state">
      <h2>Menu unavailable</h2>
      <p v-if="!selectedMenu">This menu is not ready yet.</p>
      <details v-if="missingMessages.length" class="public-menu-diagnostics">
        <summary>Data checks</summary>
        <ul>
          <li v-for="message in missingMessages" :key="message">
            {{ message }}
          </li>
        </ul>
      </details>
    </section>

    <article v-else class="public-menu-sections">
      <section
        v-for="section in publicSections"
        :key="section.id"
        class="public-menu-section"
      >
        <header>
          <h2>{{ section.label }}</h2>
          <p v-if="section.description">{{ section.description }}</p>
        </header>

        <p v-if="!section.entries.length" class="public-menu-empty">
          No public items in this category.
        </p>

        <ul v-else class="public-menu-items">
          <li
            v-for="entry in section.entries"
            :key="entry.id"
            class="public-menu-item"
          >
            <div>
              <h3>{{ entry.name }}</h3>
              <p v-if="entry.description">{{ entry.description }}</p>
              <p v-if="entry.missingDish" class="public-menu-warning">
                {{ entry.missingDish }}
              </p>
            </div>
            <span v-if="entry.priceLabel" class="public-menu-price">
              {{ entry.priceLabel }}
            </span>
          </li>
        </ul>
      </section>
    </article>
  </main>
</template>

<script setup lang="ts">
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { computed, ref, watch } from 'vue'
import { useHead, useRoute, useRuntimeConfig } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import SproochliLanguageTrigger from 'fireux-sproochli/runtime/components/Sproochli/LanguageTrigger.vue'
import {
  isSproochliRtlLanguage,
  normalizeSproochliLanguage,
  resolveSproochliLanguageOptions,
  resolveSproochliTranslatedText,
} from 'fireux-sproochli/runtime/sproochli'
import { resolveKitchenChildCollectionPath } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/utils/paths/useKitchenChildCollection'
import type { KitchenSurface } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { Dish } from 'fireux-kitchens/runtime/models/dish.model'
import type { Menu } from 'fireux-kitchens/runtime/models/menu/menu.model'

type PublicKitchenRecord = KitchenSurface & {
  currency_format?: string
  language_settings?: unknown
  primary_language?: string
}

type MiseboxPublicMenuConfig = {
  kitchenCollectionPath?: unknown
  kitchenId?: unknown
  kitchenSlug?: unknown
  menuId?: unknown
  sproochli?: unknown
}

type PublicMenuPriceOption = {
  price?: unknown
  quantity?: unknown
  unit?: unknown
}

type PublicMenuItem = {
  id?: unknown
  dish_id?: unknown
  label?: unknown
  labels?: unknown
  description?: unknown
  descriptions?: unknown
  price?: unknown
  price_options?: PublicMenuPriceOption[]
  active?: boolean
  sort_order?: unknown
}

type PublicMenuSection = {
  id?: unknown
  label?: unknown
  labels?: unknown
  description?: unknown
  descriptions?: unknown
  items?: PublicMenuItem[]
  sort_order?: unknown
}

type PublicMenuRecord = Menu & {
  names?: unknown
  descriptions?: unknown
  sections?: PublicMenuSection[]
}

definePageMeta({
  layout: 'default',
  nav: {
    key: 'misebox-menu',
    label: 'Menu',
    icon: 'i-lucide-utensils',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default'],
    visibility: { modules: ['fireux-kitchens'] },
  },
  tenant: 'tenant',
  title: 'Menu',
  name: 'MiseboxPublicMenuPage',
})

const { appName } = useFireUXConfig()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeRouteQueryString = (value: unknown) =>
  Array.isArray(value) ? normalizeString(value[0]) : normalizeString(value)
const publicMenuConfig = computed<MiseboxPublicMenuConfig>(() => {
  const publicConfig = runtimeConfig.public as Record<string, unknown>
  const fireux = publicConfig.fireux as Record<string, unknown> | undefined
  const misebox = fireux?.misebox as Record<string, unknown> | undefined
  const publicMenu = misebox?.publicMenu
  return publicMenu && typeof publicMenu === 'object'
    ? (publicMenu as MiseboxPublicMenuConfig)
    : {}
})
const sproochliRuntimeEnabled = computed(() => {
  const publicConfig = runtimeConfig.public as Record<string, unknown>
  const fireux = publicConfig.fireux as Record<string, unknown> | undefined
  const sproochli = fireux?.sproochli
  return !(
    sproochli &&
    typeof sproochli === 'object' &&
    !Array.isArray(sproochli) &&
    (sproochli as Record<string, unknown>).enabled === false
  )
})
const publicMenuSproochliEnabled = computed(
  () => publicMenuConfig.value.sproochli !== false
)
const routeKitchenSlug = computed(() =>
  normalizeString(publicMenuConfig.value.kitchenId) ||
  normalizeString(publicMenuConfig.value.kitchenSlug)
)
const routeMenuId = computed(
  () => normalizeString(publicMenuConfig.value.menuId) || 'main'
)
const rootKitchenCollectionPath = computed(
  () =>
    normalizeString(publicMenuConfig.value.kitchenCollectionPath) || 'kitchens'
)

const resolveDb = useFirestoreResolver()
const kitchen = ref<PublicKitchenRecord | null>(null)
const kitchenPending = ref(false)
const kitchenError = ref('')
const kitchenId = computed(() => routeKitchenSlug.value)
const kitchenName = computed(() =>
  kitchenPending.value && !kitchen.value
    ? appName
    : normalizeString(kitchen.value?.name) || '[missing kitchen.name]'
)
const kitchenPath = computed(() =>
  kitchenId.value ? `${rootKitchenCollectionPath.value}/${kitchenId.value}` : ''
)
const menusPath = computed(() =>
  kitchenId.value
    ? resolveKitchenChildCollectionPath({
        kitchenCollectionPath: rootKitchenCollectionPath.value,
        kitchenId: kitchenId.value,
        collectionName: 'menus',
      })
    : ''
)
const dishesPath = computed(() =>
  kitchenId.value
    ? resolveKitchenChildCollectionPath({
        kitchenCollectionPath: rootKitchenCollectionPath.value,
        kitchenId: kitchenId.value,
        collectionName: 'dishes',
      })
    : ''
)

const kitchenSproochliEnabled = computed(() => {
  const settings = kitchen.value?.language_settings
  return !(
    settings &&
    typeof settings === 'object' &&
    !Array.isArray(settings) &&
    (settings as Record<string, unknown>).sproochli === false
  )
})
const sproochliEnabled = computed(
  () =>
    sproochliRuntimeEnabled.value &&
    publicMenuSproochliEnabled.value &&
    kitchenSproochliEnabled.value
)
const selectedLanguage = computed(() =>
  sproochliEnabled.value
    ? normalizeSproochliLanguage(
        normalizeRouteQueryString(route.query.sproochli)
      )
    : ''
)
const pageDirection = computed(() =>
  isSproochliRtlLanguage(selectedLanguage.value) ? 'rtl' : 'ltr'
)
const activeContentLanguage = computed(() => selectedLanguage.value || '')
const chromeLabels = { loadingMenu: 'Loading menu...' }
const selectedLanguageUsesCache = computed(() => false)
const translationCachePath = computed(() =>
  kitchenId.value && selectedLanguageUsesCache.value
    ? `${rootKitchenCollectionPath.value}/${kitchenId.value}/menus/${routeMenuId.value}/translation_cache`
    : ''
)

const menus = ref<PublicMenuRecord[] | undefined>(undefined)
const dishes = ref<Dish[] | undefined>(undefined)
const translationCacheRows = ref<Record<string, unknown>[] | undefined>(undefined)
const menuDataPending = ref(false)
const menuDataError = ref('')
let menuDataRequestId = 0

watch(
  [kitchenId, rootKitchenCollectionPath],
  async ([activeKitchenId, activeCollectionPath]: [string, string]) => {
    kitchen.value = null
    kitchenError.value = ''

    if (!activeKitchenId || !activeCollectionPath) {
      kitchenPending.value = false
      return
    }

    kitchenPending.value = true

    try {
      const snap = await getDoc(doc(resolveDb(), activeCollectionPath, activeKitchenId))
      kitchen.value = snap.exists()
        ? ({ ...(snap.data() as PublicKitchenRecord), id: snap.id })
        : null
    } catch (error) {
      kitchenError.value = error instanceof Error ? error.message : String(error)
      kitchen.value = null
    } finally {
      kitchenPending.value = false
    }
  },
  { immediate: true }
)

const selectedMenu = computed<PublicMenuRecord | null>(() => {
  const list = menus.value ?? []
  return list.find((entry) => normalizeString(entry.id) === routeMenuId.value) ?? null
})
const publicMenuPageClass = 'public-menu-page--light'
const publicMenuDesignStyle = {}
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
  sproochliEnabled.value
    ? resolveSproochliLanguageOptions(true)
    : []
)
const loading = computed(() => {
  if (kitchenPending.value) return true
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

const cacheTextFor = (fieldId: string) =>
  selectedLanguageUsesCache.value
    ? translationCacheByField.value.get(fieldId) || ''
    : ''
const textForLanguage = (
  defaultText: unknown,
  translations: unknown,
  cacheFieldId = ''
) =>
  resolveSproochliTranslatedText({
    defaultText,
    translations,
    selectedLanguage: activeContentLanguage.value,
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
  section: Pick<PublicMenuSection, 'id'>,
  field: string
) =>
  `menu:${normalizeString(menu.id)}:section:${normalizeString(section.id)}:${field}`
const itemFieldId = (
  menu: Pick<Menu, 'id'>,
  section: Pick<PublicMenuSection, 'id'>,
  item: Pick<PublicMenuItem, 'id'>,
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

  return new Intl.NumberFormat(activeContentLanguage.value || 'de-CH', {
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
const formatPriceOption = (option: PublicMenuPriceOption) => {
  const quantity = Number(option.quantity ?? 0)
  const price = formatPrice(option.price)
  if (!Number.isFinite(quantity) || quantity <= 0 || !price) return ''

  const unit = priceUnitLabel(option.unit)
  const quantityLabel = unit === 'gr' ? `${quantity}${unit}` : `${quantity} ${unit}`.trim()
  return `${quantityLabel} ${price}`.trim()
}
const formatMenuItemPrice = (item: PublicMenuItem) => {
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
        ...(doc.data() as PublicMenuRecord),
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
          section.descriptions,
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
  if (!routeKitchenSlug.value) {
    messages.push('No public menu kitchen id is configured for this Misebox app.')
  }
  if (kitchenError.value) {
    messages.push(`Kitchen data load failed: ${kitchenError.value}`)
  }
  if (!kitchen.value) {
    messages.push(`No kitchen document found at ${kitchenPath.value}.`)
  }
  if (menuDataError.value) {
    messages.push(`Menu data load failed: ${menuDataError.value}`)
  }
  if (kitchenId.value && menus.value !== undefined && !menus.value.length) {
    messages.push(`No menu documents found at ${menusPath.value}.`)
  }
  if (menus.value !== undefined && menus.value.length && !selectedMenu.value) {
    messages.push(`No menu document found with id "${routeMenuId.value}".`)
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
  title: computed(() => `${appName} - ${menuTitle.value}`),
})
</script>

<style scoped>
.public-menu-page {
  --public-menu-bg: #fffaf2;
  --public-menu-text: #211915;
  --public-menu-toned: #4f4037;
  --public-menu-muted: #756a60;
  --public-menu-border: rgba(34, 25, 20, 0.16);
  --public-menu-accent: var(--ui-primary);
  width: min(100%, 980px);
  min-height: 100vh;
  margin: 0 auto;
  padding: 48px 16px 72px;
  background: var(--public-menu-bg);
  color: var(--public-menu-text, var(--ui-text-highlighted));
  font-family: var(--public-menu-font, inherit);
}

.public-menu-page--dark {
  --public-menu-bg: #090806;
  --public-menu-text: #fff7e8;
  --public-menu-toned: #e2d2b8;
  --public-menu-muted: #bba98b;
  --public-menu-border: rgba(255, 255, 255, 0.18);
}

.public-menu-hero {
  display: grid;
  gap: 12px;
  padding: 24px 0 28px;
  border-bottom: 1px solid var(--public-menu-border, var(--ui-border));
}

.public-menu-kicker {
  width: fit-content;
  color: var(--public-menu-muted, var(--ui-text-muted));
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
}

.public-menu-hero h1 {
  margin: 0;
  font-size: clamp(2.2rem, 9vw, 5.5rem);
  font-family: var(--public-menu-heading-font, var(--public-menu-font, inherit));
  font-weight: 800;
  line-height: 0.95;
}

.public-menu-title {
  margin: 0;
  color: var(--public-menu-accent, var(--ui-primary));
  font-size: 1.15rem;
  font-weight: 700;
}

.public-menu-description {
  max-width: 680px;
  margin: 0;
  color: var(--public-menu-muted, var(--ui-text-muted));
  font-size: 1rem;
}

.public-menu-state {
  margin: 32px 0 0;
  padding: 20px;
  border: 1px solid var(--public-menu-border, var(--ui-border));
  border-radius: var(--public-menu-radius, 8px);
  background: var(--public-menu-bg, var(--ui-bg-muted));
  color: var(--public-menu-muted, var(--ui-text-muted));
}

.public-menu-state h2 {
  margin: 0 0 6px;
  color: var(--public-menu-text, var(--ui-text-highlighted));
  font-size: 1rem;
}

.public-menu-diagnostics {
  margin-top: 12px;
}

.public-menu-sections {
  display: grid;
  gap: 28px;
  padding-top: 34px;
}

.public-menu-section {
  display: grid;
  gap: 14px;
}

.public-menu-section header {
  display: grid;
  gap: 4px;
}

.public-menu-section h2 {
  margin: 0;
  font-size: clamp(1.35rem, 4vw, 2.1rem);
  font-weight: 800;
}

.public-menu-section header p {
  margin: 0;
  color: var(--public-menu-muted, var(--ui-text-muted));
}

.public-menu-items {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--public-menu-border, var(--ui-border));
}

.public-menu-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--public-menu-border, var(--ui-border));
}

.public-menu-item h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 750;
}

.public-menu-item p {
  max-width: 680px;
  margin: 6px 0 0;
  color: var(--public-menu-muted, var(--ui-text-muted));
  font-size: 0.94rem;
  line-height: 1.45;
}

.public-menu-price {
  color: var(--public-menu-accent, var(--public-menu-text, var(--ui-text-highlighted)));
  font-size: 0.95rem;
  font-weight: 800;
  white-space: nowrap;
}

.public-menu-empty,
.public-menu-warning {
  color: var(--public-menu-muted, var(--ui-text-muted));
}

@media (max-width: 640px) {
  .public-menu-page {
    padding-top: 28px;
  }

  .public-menu-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .public-menu-price {
    justify-self: start;
  }
}
</style>
