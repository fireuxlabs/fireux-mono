<template>
  <main
    class="public-menu-surface public-menu-index min-h-screen"
    :class="menuDesignSurfaceClass"
  >
    <section class="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-6 sm:px-8 sm:py-10">
      <div class="public-menu-sans mb-4 flex justify-end">
        <div class="public-menu-toolbar inline-flex items-center gap-1 rounded-lg border p-1">
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
        class="public-menu-sans public-menu-muted py-12 text-center text-sm"
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
        <p class="public-menu-sans public-menu-muted mt-2 text-sm">
          {{ chromeLabels.noPublicMenus }}
        </p>
      </div>

      <div
        v-else
        class="public-menu-content"
        :dir="menuContentDirection"
        :lang="menuContentLanguage"
      >
        <header class="mb-10 text-center">
          <p
            v-if="kitchenName"
            class="public-menu-sans public-menu-muted text-xs font-semibold uppercase tracking-[0.22em]"
          >
            {{ kitchenName }}
          </p>
          <h1 class="public-menu-accent mt-2 text-4xl font-bold uppercase tracking-[0.14em] sm:text-5xl">
            {{ chromeLabels.chooseMenu }}
          </h1>
          <div class="public-menu-accent-bg mx-auto mt-5 h-px w-28" />
        </header>

        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            v-for="menu in menuCards"
            :key="menu.id"
            :to="menu.to"
            class="public-menu-card group block border border-l-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            :class="menuAccentClass(menu.id)"
          >
            <div class="flex min-h-32 flex-col justify-between gap-6">
              <div class="space-y-2">
                <h2 class="public-menu-text text-2xl font-bold uppercase tracking-[0.09em]">
                  {{ menu.name }}
                </h2>
                <p
                  v-if="menu.description"
                  class="public-menu-toned text-[1rem] font-medium leading-6"
                >
                  {{ menu.description }}
                </p>
              </div>

              <div class="public-menu-sans public-menu-muted flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em]">
                <span>{{ chromeLabels.openMenu }}</span>
                <span
                  class="public-menu-arrow grid size-8 shrink-0 place-items-center rounded-full border text-base transition"
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
import { computed, ref, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { navigateTo, useHead, useRoute } from '#imports'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { resolveKitchenChildCollectionPath } from '../../../../composables/fireux/console/kitchen/collections/useKitchenChildCollection'
import {
  getPublicKitchenChromeLabels,
  isPublicKitchenCacheLanguage,
  isPublicKitchenRtlLanguage,
  normalizePublicKitchenLanguage,
  resolvePublicKitchenLanguageOptions,
  resolvePublicKitchenChromeLanguage,
  resolvePublicKitchenLanguageState,
  resolvePublicTranslatedText,
} from '../../../../composables/fireux/app/public-kitchen-language'
import { resolvePublicMenuDesign } from '../../../../composables/fireux/app/public-menu-design'
import { useKitchenCollection } from '../../../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import type { Kitchen } from '../../../../models/kitchen.model'
import type { Menu } from '../../../../models/menu.model'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicMenusIndexPage',
})

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
const menuDesign = computed(() =>
  resolvePublicMenuDesign((kitchen.value as any)?.design)
)
const menuDesignSurfaceClass = computed(
  () => `public-menu-surface--${menuDesign.value.color_mode}`
)
const languageOptions = computed(() =>
  resolvePublicKitchenLanguageOptions(kitchen.value)
)
const selectedLanguageUsesCache = computed(() => {
  const language = selectedLanguage.value
  if (!language || !isPublicKitchenCacheLanguage(language)) return false

  return resolvePublicKitchenLanguageState(kitchen.value).cachedLanguages.includes(language)
})
const { firestoreFetchCollection } = useFirestoreRead()
const resolveDb = useFirestoreResolver()
const menusPath = computed(() =>
  resolveKitchenChildCollectionPath({
    kitchenId: kitchenId.value,
    collectionName: 'menus',
  })
)
const menusRef = shallowRef(null) as ShallowRef<Ref<Menu[] | undefined> | null>

watch(
  menusPath,
  (nextPath) => {
    menusRef.value = nextPath ? firestoreFetchCollection<Menu>(nextPath) : null
  },
  { immediate: true }
)

const menus = computed(() => menusRef.value?.value ?? [])
const menuTranslationCache = ref<Record<string, string>>({})
const menuTranslationCachePending = ref(false)
const pending = computed(
  () =>
    Boolean(routeKitchenSlug.value) &&
    (kitchensPending.value ||
      Boolean(kitchenId.value && menusRef.value?.value === undefined) ||
      menuTranslationCachePending.value)
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
  return resolvePublicTranslatedText({
    defaultText,
    translations,
    selectedLanguage: language,
    cacheText: selectedLanguageUsesCache.value
      ? menuTranslationCache.value[cacheKey]
      : '',
  }).text
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
  [kitchenId, menus, selectedLanguage, selectedLanguageUsesCache],
  async ([activeKitchenId, activeMenus, activeLanguage, activeLanguageUsesCache]) => {
    const requestId = ++menuCacheRequestId
    menuTranslationCache.value = {}
    menuTranslationCachePending.value = false

    if (import.meta.server || !activeLanguageUsesCache || !activeKitchenId) return

    const visibleMenus = activeMenus
      .filter((menu) => menu.active !== false)
      .map((menu) => normalizeString(menu.id))
      .filter(Boolean)

    if (!visibleMenus.length) return

    menuTranslationCachePending.value = true
    const nextCache: Record<string, string> = {}
    try {
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
    } finally {
      if (requestId === menuCacheRequestId) {
        menuTranslationCachePending.value = false
      }
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
const menuAccentClass = () => 'public-menu-card--accent'
const setLanguage = async (language: string) => {
  await navigateTo({
    path: route.path,
    query: languageQuery(language),
  })
}
</script>

<style scoped>
.public-menu-surface {
  --public-menu-bg: #fffdf8;
  --public-menu-panel: rgba(255, 255, 255, 0.86);
  --public-menu-panel-hover: rgba(255, 255, 255, 0.96);
  --public-menu-text: #1f1a16;
  --public-menu-toned: #52483f;
  --public-menu-muted: #7a7067;
  --public-menu-border: rgba(44, 36, 28, 0.16);
  --public-menu-accent: #7b5534;
  background: var(--public-menu-bg);
  color: var(--public-menu-text);
  font-family: Georgia, 'Times New Roman', serif;
}

.public-menu-surface--dark {
  --public-menu-bg: #080705;
  --public-menu-panel: rgba(255, 244, 216, 0.07);
  --public-menu-panel-hover: rgba(255, 244, 216, 0.11);
  --public-menu-text: #fffaf0;
  --public-menu-toned: #d9c9ab;
  --public-menu-muted: #a99778;
  --public-menu-border: rgba(238, 205, 127, 0.22);
  --public-menu-accent: #f0c84d;
}

.public-menu-content {
  padding: 0;
}

.public-menu-sans {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.public-menu-toolbar,
.public-menu-card,
.public-menu-arrow {
  background: var(--public-menu-panel);
  border-color: var(--public-menu-border);
}

.public-menu-card:hover,
.public-menu-arrow {
  background: var(--public-menu-panel-hover);
}

.public-menu-card--accent {
  border-left-color: var(--public-menu-accent);
}

.public-menu-text {
  color: var(--public-menu-text);
}

.public-menu-toned {
  color: var(--public-menu-toned);
}

.public-menu-muted {
  color: var(--public-menu-muted);
}

.public-menu-accent {
  color: var(--public-menu-accent);
}

.public-menu-accent-bg {
  background: var(--public-menu-accent);
}

@media (min-width: 860px) {
  .public-menu-content {
    padding: 2rem 3rem;
  }
}

</style>
