<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="text-sm font-semibold">{{ defaultChromeLabels.menus }}</div>

        <SproochliLanguageTrigger
          v-if="sproochliEnabled"
          :language-options="languageOptions"
          :selected-language="selectedLanguage"
          :show-group-labels="showLanguageGroupLabels"
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
        {{ defaultChromeLabels.openMenus }}
      </UButton>

      <div v-if="menusLoading" class="py-4 text-sm text-dimmed">
        {{ defaultChromeLabels.loadingMenus }}
      </div>

      <div v-else-if="!sortedMenus.length" class="py-4 text-sm text-dimmed">
        {{ defaultChromeLabels.noMenusAvailable }}
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
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
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
const { isAdmin } = useUser()
const resolveDb = useFirestoreResolver()
const defaultChromeLabels = {
  menus: 'Menus',
  openMenus: 'Open menus',
  loadingMenus: 'Loading menus...',
  noMenusAvailable: 'No menus available',
  openMenu: 'Open menu',
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
const languageSettings = computed(() =>
  props.kitchen && typeof (props.kitchen as any).language_settings === 'object'
    ? (props.kitchen as any).language_settings
    : {}
)
const languageOptions = computed(() =>
  resolveSproochliLanguageOptions({
    enabled: sproochliEnabled.value,
    defaultLanguage: (languageSettings.value as any)?.default_language,
    attachedLanguages: (languageSettings.value as any)?.attached_languages,
    cachedLanguages: (languageSettings.value as any)?.cache_languages,
    publicLanguages: (languageSettings.value as any)?.public_languages,
  })
)
const showLanguageGroupLabels = computed(() => isAdmin.value === true)
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

const menuNameFieldId = (menu: Menu) => `menu:${normalizeString(menu.id)}:name`
const menuDescriptionFieldId = (menu: Menu) =>
  `menu:${normalizeString(menu.id)}:description`
const menuNameCacheText = (menu: Menu) =>
  menuTranslationCache.value[menuNameFieldId(menu)] ?? ''
const menuDescriptionCacheText = (menu: Menu) =>
  menuTranslationCache.value[menuDescriptionFieldId(menu)] ?? ''
const localizedMenuName = (menu: Menu) =>
  resolveSproochliTranslatedText({
    defaultText: menu.name,
    translations: (menu as any)?.names ?? (menu as any)?.translations,
    selectedLanguage: selectedLanguage.value,
    cacheText: menuNameCacheText(menu),
  }).text || normalizeString(menu.name)
const localizedMenuDescription = (menu: Menu) =>
  resolveSproochliTranslatedText({
    defaultText: menu.description,
    translations: (menu as any)?.descriptions,
    selectedLanguage: selectedLanguage.value,
    cacheText: menuDescriptionCacheText(menu),
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
          if (
            targetLanguage === language &&
            (fieldId.endsWith(':name') || fieldId.endsWith(':description')) &&
            text
          ) {
            rows[fieldId] = text
          }
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

const menuSummary = (_menu: Menu) => defaultChromeLabels.openMenu
</script>
