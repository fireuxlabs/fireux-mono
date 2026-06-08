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
        <KitchenPublicMenuLink
          v-for="menu in sortedMenus"
          :key="menu.id"
          :kitchen="kitchen"
          :menu="menu"
          :menu-collection-path="collectionPath"
          :selected-language="selectedLanguage"
          :to="menuLink(menu.id)"
          :summary="defaultChromeLabels.openMenu"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import SproochliLanguageTrigger from 'fireux-sproochli/runtime/components/Sproochli/LanguageTrigger.vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useMenuCollection } from '../../composables/fireux/firestore/menu/fetch/useMenuCollection'
import {
  normalizeSproochliLanguage,
  resolveSproochliLanguageOptions,
} from 'fireux-sproochli/runtime/sproochli'
import KitchenPublicMenuLink from './PublicMenuLink.vue'
import type { Kitchen } from '../../models/kitchen.model'

const props = defineProps<{
  kitchen: Kitchen
}>()

const kitchenId = computed(() => String(props.kitchen?.id ?? '').trim())
const kitchenSlug = computed(() => String((props.kitchen as any)?.slug ?? '').trim())
const route = useRoute()
const { isAdmin } = useUser()
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

const menusIndexLink = computed(() => {
  if (!kitchenSlug.value) return ''
  return `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus${languageQuery.value}`
})

const menuLink = (menuIdRaw: unknown) => {
  const menuId = String(menuIdRaw || '').trim()
  if (!kitchenSlug.value || !menuId) return ''
  return `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus/${encodeURIComponent(menuId)}${languageQuery.value}`
}
</script>
