<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="text-sm font-semibold">{{ chromeLabels.menus }}</div>

        <SproochliLanguageTrigger
          v-if="sproochliEnabled"
          :language-options="languageOptions"
          :selected-language="selectedLanguage"
        />
      </div>
    </template>

    <div class="space-y-4">
      <UButton
        v-if="menusIndexLink"
        size="sm"
        variant="soft"
        color="primary"
        icon="i-lucide-book-open-check"
        :to="menusIndexLink"
      >
        {{ chromeLabels.openMenus }}
      </UButton>

      <div v-if="menusLoading" class="py-4 text-sm text-dimmed">
        {{ chromeLabels.loadingMenus }}
      </div>

      <div v-else-if="!sortedMenus.length" class="py-4 text-sm text-dimmed">
        {{ chromeLabels.noMenusAvailable }}
      </div>

      <div v-else class="grid gap-3 sm:grid-cols-2">
        <NuxtLink
          v-for="menu in sortedMenus"
          :key="menu.id"
          :to="menuLink(menu.id)"
          class="rounded-lg border border-default p-4 transition hover:bg-elevated/50"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-highlighted">
                {{ localizedMenuName(menu) }}
              </h2>
              <p
                v-if="localizedMenuDescription(menu)"
                class="mt-1 text-sm text-dimmed"
              >
                {{ localizedMenuDescription(menu) }}
              </p>
              <p v-else class="mt-1 text-sm text-dimmed">
                {{ menuSummary(menu) }}
              </p>
            </div>
            <UIcon
              name="i-lucide-arrow-up-right"
              class="mt-1 size-4 shrink-0 text-muted"
            />
          </div>
        </NuxtLink>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { collection, getDocs } from 'firebase/firestore'
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import SproochliLanguageTrigger from 'fireux-sproochli/runtime/components/Sproochli/LanguageTrigger.vue'
import { useMenuCollection } from '../../composables/fireux/firestore/menu/fetch/useMenuCollection'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  normalizeSproochliLanguage,
  resolveSproochliLanguageOptions,
  resolveSproochliTranslatedText,
} from 'fireux-sproochli/runtime/composables/fireux/sproochli/publicLanguage'
import type { Kitchen } from '../../models/kitchen.model'
import type { Menu } from '../../models/menu.model'

const props = defineProps<{
  kitchen: Kitchen
}>()

const kitchenId = computed(() => String(props.kitchen?.id ?? '').trim())
const kitchenSlug = computed(() => String((props.kitchen as any)?.slug ?? '').trim())
const route = useRoute()
const resolveDb = useFirestoreResolver()
const defaultChromeLabels = {
  menus: 'Menus',
  openMenus: 'Open menus',
  loadingMenus: 'Loading menus...',
  noMenusAvailable: 'No menus available',
  openMenu: 'Open menu',
}
const translatedChromeLabels: Record<string, Partial<typeof defaultChromeLabels>> = {
  fr: {
    menus: 'Menus',
    openMenus: 'Voir les menus',
    loadingMenus: 'Chargement des menus...',
    noMenusAvailable: 'Aucun menu disponible',
    openMenu: 'Ouvrir le menu',
  },
}
const { publishedMenus, pending: menusPending, collectionPath } = useMenuCollection(
  kitchenId
)

const menusLoading = computed(() =>
  Boolean(kitchenId.value) && menusPending.value
)
const normalizeString = (value: unknown) => String(value ?? '').trim()
const sproochliEnabled = computed(
  () => (props.kitchen as any)?.sproochli_enabled === true
)
const selectedLanguage = computed(() =>
  sproochliEnabled.value
    ? normalizeSproochliLanguage(
        route.query.sproochli ?? route.query.lang ?? route.query.language
      )
    : ''
)
const languageOptions = computed(() =>
  resolveSproochliLanguageOptions(sproochliEnabled.value)
)
const chromeLabels = computed(() => ({
  ...defaultChromeLabels,
  ...(translatedChromeLabels[selectedLanguage.value] ?? {}),
}))
const languageQuery = computed(() =>
  selectedLanguage.value
    ? `?sproochli=${encodeURIComponent(selectedLanguage.value)}`
    : ''
)
const sortedMenus = computed(() =>
  [...publishedMenus.value].sort(
    (a, b) =>
      Number((a as any)?.sort_order || 0) -
        Number((b as any)?.sort_order || 0) ||
      String(a?.name || '').localeCompare(String(b?.name || ''))
  )
)
const menuTranslationCache = ref<Record<string, string>>({})
let translationCacheRequestId = 0

const menusIndexLink = computed(() => {
  if (!kitchenSlug.value) return ''
  return `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus${languageQuery.value}`
})

const menuLink = (menuIdRaw: unknown) => {
  const menuId = String(menuIdRaw || '').trim()
  if (!kitchenSlug.value || !menuId) return ''
  return `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus/${encodeURIComponent(menuId)}${languageQuery.value}`
}

const menuFieldId = (menu: Menu, field: 'name' | 'description') =>
  `menu:${normalizeString(menu.id)}:${field}`
const menuCacheText = (menu: Menu, field: 'name' | 'description') =>
  menuTranslationCache.value[menuFieldId(menu, field)] ?? ''
const localizedMenuName = (menu: Menu) =>
  resolveSproochliTranslatedText({
    defaultText: menu.name,
    translations: (menu as any)?.names ?? (menu as any)?.translations,
    selectedLanguage: selectedLanguage.value,
    cacheText: menuCacheText(menu, 'name'),
  }).text || normalizeString(menu.name)
const localizedMenuDescription = (menu: Menu) =>
  resolveSproochliTranslatedText({
    defaultText: menu.description,
    translations: (menu as any)?.descriptions,
    selectedLanguage: selectedLanguage.value,
    cacheText: menuCacheText(menu, 'description'),
  }).text || normalizeString(menu.description)

watch(
  () => ({
    language: selectedLanguage.value,
    menusPath: collectionPath.value,
    menuIds: sortedMenus.value.map((menu) => normalizeString(menu.id)),
  }),
  async ({ language, menusPath, menuIds }) => {
    const requestId = ++translationCacheRequestId

    if (import.meta.server || !language || !menusPath || !menuIds.length) {
      menuTranslationCache.value = {}
      return
    }

    const rows: Record<string, string> = {}

    try {
      const snapshots = await Promise.all(
        menuIds.map((menuId) =>
          getDocs(collection(resolveDb(), `${menusPath}/${menuId}/translation_cache`))
        )
      )

      if (requestId !== translationCacheRequestId) return

      for (const snapshot of snapshots) {
        for (const doc of snapshot.docs) {
          const data = doc.data() as Record<string, unknown>
          const targetLanguage = normalizeString(data.target_language)
          const fieldId = normalizeString(data.field_id)
          const text = normalizeString(data.translated_text)
          if (targetLanguage === language && fieldId && text) rows[fieldId] = text
        }
      }

      menuTranslationCache.value = rows
    } catch (error) {
      if (import.meta.dev) {
        console.warn('[KitchenPublicMenus] menu translation cache read failed', error)
      }
      if (requestId === translationCacheRequestId) menuTranslationCache.value = {}
    }
  },
  { immediate: true }
)

const menuSummary = (_menu: Menu) => chromeLabels.value.openMenu
</script>
