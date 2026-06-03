<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="text-sm font-semibold">{{ chromeLabels.menus }}</div>

        <MenuSproochliLanguageTrigger
          :language-options="publicLanguageOptions"
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
import { useRoute, useRuntimeConfig } from '#imports'
import { computed } from 'vue'
import {
  normalizePublicKitchenLanguage,
  resolvePublicKitchenChromeLanguage,
  resolvePublicKitchenLanguageOptions,
} from '../../composables/fireux/public/kitchen/publicLanguage'
import { usePublicMenuLanguage } from '../../composables/fireux/public/kitchen/usePublicMenuLanguage'
import { useMenuCollection } from '../../composables/fireux/firestore/menu/fetch/useMenuCollection'
import type { Kitchen } from '../../models/kitchen.model'
import type { Menu } from '../../models/menu.model'

const props = defineProps<{
  kitchen: Kitchen
}>()

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const publicConfig = runtimeConfig.public as Record<string, unknown>
const fireuxConfig = asRecord(publicConfig.fireux)
const miseboxConfig = asRecord(fireuxConfig.misebox)
const publicMenuConfig = asRecord(miseboxConfig.publicMenu)
const runtimeSproochli = asRecord(fireuxConfig.sproochli)

const kitchenId = computed(() => String(props.kitchen?.id ?? '').trim())
const kitchenSlug = computed(() => String((props.kitchen as any)?.slug ?? '').trim())

const runtimeSproochliEnabled = computed(() => runtimeSproochli.enabled !== false)
const publicMenuSproochliEnabled = computed(() => publicMenuConfig.sproochli !== false)
const languageSettings = computed(() => asRecord((props.kitchen as any)?.language_settings))
const kitchenSproochliEnabled = computed(() => languageSettings.value.sproochli !== false)
const sproochliEnabled = computed(
  () =>
    runtimeSproochliEnabled.value &&
    publicMenuSproochliEnabled.value &&
    kitchenSproochliEnabled.value
)

const publicLanguageOptions = computed(() =>
  sproochliEnabled.value
    ? resolvePublicKitchenLanguageOptions(props.kitchen)
    : []
)

const selectedLanguage = computed(() => {
  if (!sproochliEnabled.value) return ''
  const raw = route.query.sproochli
  const value = Array.isArray(raw) ? raw[0] : raw
  return normalizePublicKitchenLanguage(value)
})

const primaryLanguage = computed(() => {
  const settings = (props.kitchen as Record<string, any> | null)?.language_settings
  return (
    normalizePublicKitchenLanguage((props.kitchen as any)?.primary_language) ||
    normalizePublicKitchenLanguage(settings?.default_language) ||
    'en'
  )
})

const chromeLanguage = computed(() =>
  resolvePublicKitchenChromeLanguage({
    selectedLanguage: selectedLanguage.value,
    primaryLanguage: primaryLanguage.value,
  })
)

const { labels: chromeLabels } = usePublicMenuLanguage(chromeLanguage)
const { publishedMenus, pending: menusPending } = useMenuCollection(
  kitchenId
)

const menusLoading = computed(() =>
  Boolean(kitchenId.value) && menusPending.value
)
const normalizeString = (value: unknown) => String(value ?? '').trim()
const sortedMenus = computed(() =>
  [...publishedMenus.value].sort(
    (a, b) =>
      Number((a as any)?.sort_order || 0) -
        Number((b as any)?.sort_order || 0) ||
      String(a?.name || '').localeCompare(String(b?.name || ''))
  )
)

const publicLanguageQuery = (language = selectedLanguage.value) =>
  language ? `?sproochli=${encodeURIComponent(language)}` : ''

const menusIndexLink = computed(() => {
  if (!kitchenSlug.value) return ''
  return `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus${publicLanguageQuery()}`
})

const menuLink = (menuIdRaw: unknown) => {
  const menuId = String(menuIdRaw || '').trim()
  if (!kitchenSlug.value || !menuId) return ''
  return `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus/${encodeURIComponent(menuId)}${publicLanguageQuery()}`
}

const localizedMenuName = (menu: Menu) => normalizeString(menu.name)
const localizedMenuDescription = (menu: Menu) =>
  normalizeString(menu.description)
const menuSummary = (_menu: Menu) => chromeLabels.value.openMenu
</script>
