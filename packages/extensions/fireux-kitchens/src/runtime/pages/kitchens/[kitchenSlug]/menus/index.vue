<template>
  <main class="luna-menu-index min-h-screen text-highlighted">
    <section class="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-6 sm:px-8 sm:py-10">
      <div class="luna-menu-sans mb-4 flex justify-end">
        <div class="inline-flex items-center gap-1 rounded-lg border border-default bg-default/80 p-1">
          <UButton
            v-for="option in languageOptions"
            :key="option.code || 'default'"
            size="xs"
            :variant="option.code === selectedLanguage ? 'solid' : 'ghost'"
            color="neutral"
            @click="setLanguage(option.code)"
          >
            {{ option.label }}
          </UButton>
        </div>
      </div>

      <div
        v-if="pending"
        class="luna-menu-sans py-12 text-center text-sm text-muted"
      >
        {{ chromeLabels.loadingMenus }}
      </div>

      <div
        v-else-if="!menuCards.length"
        class="py-12 text-center"
      >
        <h2 class="text-xl font-semibold">
          {{ chromeLabels.noMenusAvailable }}
        </h2>
        <p class="luna-menu-sans mt-2 text-sm text-muted">
          {{ chromeLabels.noPublicMenus }}
        </p>
      </div>

      <div
        v-else
        class="luna-menu-content"
        :dir="menuContentDirection"
        :lang="menuContentLanguage"
      >
        <header class="mb-10 text-center">
          <p
            v-if="kitchenName"
            class="luna-menu-sans text-xs font-semibold uppercase tracking-[0.22em] text-muted"
          >
            {{ kitchenName }}
          </p>
          <h1 class="mt-2 text-4xl font-bold uppercase tracking-[0.14em] text-primary sm:text-5xl">
            {{ chromeLabels.chooseMenu }}
          </h1>
          <div class="mx-auto mt-5 h-px w-28 bg-primary" />
        </header>

        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            v-for="menu in menuCards"
            :key="menu.id"
            :to="menu.to"
            class="group block border border-l-4 border-default bg-default p-5 text-highlighted transition hover:-translate-y-0.5 hover:bg-elevated hover:shadow-lg"
            :class="menuAccentClass(menu.id)"
          >
            <div class="flex min-h-32 flex-col justify-between gap-6">
              <div class="space-y-2">
                <h2 class="text-2xl font-bold uppercase tracking-[0.09em] text-highlighted">
                  {{ menu.name }}
                </h2>
                <p
                  v-if="menu.description"
                  class="text-[1rem] font-medium leading-6 text-toned"
                >
                  {{ menu.description }}
                </p>
              </div>

              <div class="luna-menu-sans flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                <span>{{ chromeLabels.openMenu }}</span>
                <span
                  class="grid size-8 shrink-0 place-items-center rounded-full border border-default text-base text-highlighted transition group-hover:bg-elevated"
                  aria-hidden="true"
                >
                  {{ isRtl ? '←' : '→' }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { collection, getDocs } from 'firebase/firestore'
import { computed, ref, watch } from 'vue'
import { navigateTo, useHead, useRoute } from '#imports'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { resolveKitchenRuntimeChildCollectionPath } from '../../../../composables/fireux/app/kitchen-console/shared'
import {
  getPublicKitchenChromeLabels,
  isPublicKitchenCacheLanguage,
  isPublicKitchenRtlLanguage,
  normalizePublicKitchenLanguage,
  PUBLIC_KITCHEN_LANGUAGE_OPTIONS,
  resolvePublicKitchenChromeLanguage,
} from '../../../../composables/fireux/app/public-kitchen-language'
import { useKitchenCollection } from '../../../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import type { Kitchen } from '../../../../models/kitchen.model'
import type { Menu } from '../../../../models/menu.model'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicMenusIndexPage',
})

const languageOptions = PUBLIC_KITCHEN_LANGUAGE_OPTIONS

const route = useRoute()
const normalizeString = (value: unknown) => String(value ?? '').trim()
const routeKitchenSlug = computed(() => {
  const raw = route.params.kitchenSlug
  return Array.isArray(raw) ? normalizeString(raw[0]) : normalizeString(raw)
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

const { kitchens, pending: kitchensPending } = useKitchenCollection()
const kitchen = computed<Kitchen | null>(() => {
  const slugKey = routeKitchenSlug.value.toLowerCase()
  if (!slugKey) return null

  const list = kitchens.value ?? []
  const found = list.find((entry) => {
    const slug = normalizeString((entry as any)?.slug).toLowerCase()
    return slug.length > 0 && slug === slugKey
  })

  return found ?? null
})
const kitchenId = computed(() => normalizeString(kitchen.value?.id))
const { firestoreFetchCollection } = useFirestoreRead()
const resolveDb = useFirestoreResolver()
const menusPath = computed(() =>
  resolveKitchenRuntimeChildCollectionPath({
    kitchenId: kitchenId.value,
    collectionName: 'menus',
  })
)
const menusRef = firestoreFetchCollection<Menu>(menusPath)
const menus = computed(() => menusRef.value ?? [])
const menuTranslationCache = ref<Record<string, string>>({})
const pending = computed(
  () =>
    Boolean(routeKitchenSlug.value) &&
    (kitchensPending.value || Boolean(kitchenId.value && menusRef.value === undefined))
)

const kitchenName = computed(() =>
  normalizeString(kitchen.value?.name)
)
const chromeLanguage = computed(() =>
  resolvePublicKitchenChromeLanguage({
    selectedLanguage: selectedLanguage.value,
    primaryLanguage: (kitchen.value as any)?.primary_language,
  })
)
const chromeLabels = computed(() =>
  getPublicKitchenChromeLabels(chromeLanguage.value)
)
const isRtl = computed(() => isPublicKitchenRtlLanguage(selectedLanguage.value))
const menuContentDirection = computed(() => isRtl.value ? 'rtl' : 'ltr')
const menuContentLanguage = computed(() => selectedLanguage.value || chromeLanguage.value)
useHead({
  title: computed(() => chromeLabels.value.chooseMenu),
})
const textForLanguage = (
  defaultText: unknown,
  translations: unknown,
  language: string,
  cacheKey = ''
) => {
  const fallback = normalizeString(defaultText)
  if (isPublicKitchenCacheLanguage(language)) {
    return menuTranslationCache.value[cacheKey] || fallback
  }

  if (!language || !translations || typeof translations !== 'object' || Array.isArray(translations)) {
    return fallback
  }

  return normalizeString((translations as Record<string, unknown>)[language]) || fallback
}
const languageQuery = (language = selectedLanguage.value) =>
  language ? { ...passThroughQuery.value, lang: language } : passThroughQuery.value
const menuTo = (menuId: string) => ({
  path: `/kitchens/${encodeURIComponent(
    routeKitchenSlug.value
  )}/menus/${encodeURIComponent(menuId)}`,
  query: languageQuery(),
})
const menuFieldId = (menu: Record<string, any>, field: string) =>
  `menu:${normalizeString(menu.id)}:${field}`
const menuCacheKey = (menuId: string, fieldId: string) => `${menuId}:${fieldId}`
let menuCacheRequestId = 0

watch(
  [kitchenId, menus, selectedLanguage],
  async ([activeKitchenId, activeMenus, activeLanguage]) => {
    const requestId = ++menuCacheRequestId
    menuTranslationCache.value = {}

    if (import.meta.server || !isPublicKitchenCacheLanguage(activeLanguage) || !activeKitchenId) return

    const visibleMenus = activeMenus
      .filter((menu) => menu.active !== false)
      .map((menu) => normalizeString(menu.id))
      .filter(Boolean)

    if (!visibleMenus.length) return

    const nextCache: Record<string, string> = {}
    await Promise.all(
      visibleMenus.map(async (menuId) => {
        const snapshot = await getDocs(
          collection(
            resolveDb(),
            `kitchens/${activeKitchenId}/menus/${menuId}/translation_cache`
          )
        )

        snapshot.forEach((doc) => {
          const data = doc.data() as Record<string, unknown>
          const fieldId = normalizeString(data.field_id)
          const targetLanguage = normalizeString(data.target_language)
          const translatedText = normalizeString(data.translated_text)
          if (fieldId && targetLanguage === activeLanguage && translatedText) {
            nextCache[menuCacheKey(menuId, fieldId)] = translatedText
          }
        })
      })
    )

    if (requestId === menuCacheRequestId) {
      menuTranslationCache.value = nextCache
    }
  },
  { immediate: true }
)
const menuCards = computed(() =>
  menus.value
    .filter((menu) => menu.active !== false)
    .sort(
      (a, b) =>
        Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) ||
        normalizeString(a.name).localeCompare(normalizeString(b.name))
    )
    .map((menu) => {
      const id = normalizeString(menu.id)
      return {
        id,
        name: textForLanguage(
          menu.name,
          menu.names,
          selectedLanguage.value,
          menuCacheKey(id, menuFieldId(menu as any, 'name'))
        ),
        description: textForLanguage(
          menu.description,
          menu.descriptions,
          selectedLanguage.value,
          menuCacheKey(id, menuFieldId(menu as any, 'description'))
        ),
        to: menuTo(id),
      }
    })
    .filter((menu) => Boolean(menu.id && menu.name))
)
const menuAccentClass = (menuId: string) =>
  menuId === 'pizza'
    ? 'border-l-primary'
    : 'border-l-default'
const setLanguage = async (language: string) => {
  await navigateTo({
    path: route.path,
    query: languageQuery(language),
  })
}
</script>

<style scoped>
.luna-menu-index {
  font-family: Georgia, 'Times New Roman', serif;
}

.luna-menu-content {
  padding: 0;
}

.luna-menu-sans {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

@media (min-width: 860px) {
  .luna-menu-content {
    padding: 2rem 3rem;
  }
}

</style>
