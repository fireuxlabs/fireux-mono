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
import { computed } from 'vue'
import { useRoute } from '#imports'
import SproochliLanguageTrigger from 'fireux-sproochli/runtime/components/Sproochli/LanguageTrigger.vue'
import { useMenuCollection } from '../../composables/fireux/firestore/menu/fetch/useMenuCollection'
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
const chromeLabels = {
  menus: 'Menus',
  openMenus: 'Open menus',
  loadingMenus: 'Loading menus...',
  noMenusAvailable: 'No menus available',
  openMenu: 'Open menu',
}
const { publishedMenus, pending: menusPending } = useMenuCollection(
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
  normalizeSproochliLanguage(
    route.query.sproochli ?? route.query.lang ?? route.query.language
  )
)
const languageOptions = computed(() =>
  resolveSproochliLanguageOptions(sproochliEnabled.value)
)
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

const localizedMenuName = (menu: Menu) =>
  resolveSproochliTranslatedText({
    defaultText: menu.name,
    translations: (menu as any)?.names ?? (menu as any)?.translations,
    selectedLanguage: selectedLanguage.value,
  }).text || normalizeString(menu.name)
const localizedMenuDescription = (menu: Menu) =>
  resolveSproochliTranslatedText({
    defaultText: menu.description,
    translations: (menu as any)?.descriptions,
    selectedLanguage: selectedLanguage.value,
  }).text || normalizeString(menu.description)
const menuSummary = (_menu: Menu) => chromeLabels.openMenu
</script>
