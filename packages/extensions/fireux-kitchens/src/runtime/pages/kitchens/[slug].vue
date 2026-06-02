<template>
  <NuxtPage v-if="hasChildRoute" />

  <UPage v-else>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription">
      <template #links>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/kitchens"
        >
          Back
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UAlert
        v-if="loading"
        color="neutral"
        variant="soft"
        title="Loading kitchen"
        description="Fetching this kitchen."
      />

      <UAlert
        v-else-if="!kitchen"
        color="warning"
        variant="soft"
        title="Kitchen not found"
        description="This kitchen does not exist or is not public-ready."
      />

      <div v-else class="space-y-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
          <KitchenCardsProfile
            v-if="kitchenProfileModel"
            class="flex-1"
            :model="kitchenProfileModel"
          />

          <MenuSproochliLanguageTrigger
            class="shrink-0"
            :language-options="publicLanguageOptions"
            :selected-language="selectedLanguage"
          />
        </div>

        <DevJson
          v-if="isDev && kitchen"
          :title="'Kitchen (Doc)'"
          context="Kitchen detail page · kitchens/[slug] · hydrated kitchen doc"
          :data="kitchen"
          :default-open="false"
        />

        <UCard>
              <template #header>
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="text-sm font-semibold">{{ chromeLabels.menus }}</div>
                  </div>
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
                      <UIcon name="i-lucide-arrow-up-right" class="mt-1 size-4 shrink-0 text-muted" />
                    </div>
                  </NuxtLink>
                </div>
              </div>
        </UCard>

        <EntityOperatorPanel entity-label="Kitchen" />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRoute, useRuntimeConfig } from '#imports'
import { computed } from 'vue'
import {
  normalizePublicKitchenLanguage,
  resolvePublicKitchenLanguageOptions,
  resolvePublicKitchenChromeLanguage,
} from '../../composables/fireux/app/public-kitchen-language'
import { usePublicMenuLanguage } from '../../composables/fireux/app/kitchens/usePublicMenuLanguage'
import { useMenuCollection } from '../../composables/fireux/firestore/menu/fetch/useMenuCollection'
import { useKitchenCollection } from '../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenProfileView } from '../../composables/fireux/firestore/kitchen/utils/view/useKitchenProfileView'
import { useKitchenSeo } from '../../composables/fireux/firestore/kitchen/utils/useKitchenSeo'
import { KitchenStorage, type Kitchen } from '../../models/kitchen.model'
import type { Menu } from '../../models/menu.model'

definePageMeta({
  layout: 'default',
  title: 'Kitchen',
  description: 'View a saved kitchen.',
  head: { title: 'Kitchen' },
  name: 'KitchensDetailPage',
})

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
const runtimeSproochliEnabled = computed(() => runtimeSproochli.enabled !== false)
const publicMenuSproochliEnabled = computed(() => publicMenuConfig.sproochli !== false)
const hasChildRoute = computed(() => {
  const path = String(route.path || '').trim()
  return /\/kitchens\/[^/]+\/menus?(?:\/|$)/.test(path)
})

const kitchenSlug = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})

const { kitchens, pending: kitchensPending } = useKitchenCollection()
const kitchen = computed<Kitchen | null>(() => {
  const slugKey = kitchenSlug.value.toLowerCase()
  if (!slugKey) return null
  const list = kitchens.value ?? []
  const found = list.find((entry) => {
    const slug = String((entry as any)?.slug ?? '').trim().toLowerCase()
    return slug.length > 0 && slug === slugKey
  })
  return (found as unknown as Kitchen) ?? null
})

const kitchenId = computed(() => String(kitchen.value?.id ?? '').trim())
const loading = computed(() => Boolean(kitchenSlug.value) && kitchensPending.value)
const { model: kitchenProfileModel } = useKitchenProfileView(kitchen)

const { publishedMenus, pending: menusPending } = useMenuCollection(
  kitchenId,
  { shape: 'scoped', kitchenCollectionPath: KitchenStorage.rootCollection }
)
const menus = computed(() => publishedMenus.value)
const menusLoading = computed(() =>
  Boolean(kitchenId.value) && menusPending.value
)
const normalizeString = (value: unknown) => String(value ?? '').trim()
const sortedMenus = computed(() =>
  [...menus.value].sort(
    (a, b) =>
      Number(a?.sort_order || 0) - Number(b?.sort_order || 0) ||
      String(a?.name || '').localeCompare(String(b?.name || ''))
  )
)
const languageSettings = computed(() => asRecord((kitchen.value as any)?.language_settings))
const kitchenSproochliEnabled = computed(() => languageSettings.value.sproochli !== false)
const sproochliEnabled = computed(
  () =>
    runtimeSproochliEnabled.value &&
    publicMenuSproochliEnabled.value &&
    kitchenSproochliEnabled.value
)
const publicLanguageOptions = computed(() =>
  sproochliEnabled.value
    ? resolvePublicKitchenLanguageOptions(kitchen.value)
    : []
)
const selectedLanguage = computed(() => {
  if (!sproochliEnabled.value) return ''
  const raw = route.query.sproochli
  const value = Array.isArray(raw) ? raw[0] : raw
  return normalizePublicKitchenLanguage(value)
})
const primaryLanguage = computed(() => {
  const settings = (kitchen.value as Record<string, any> | null)?.language_settings
  return (
    normalizePublicKitchenLanguage((kitchen.value as any)?.primary_language) ||
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
const publicLanguageQuery = (language = selectedLanguage.value) =>
  language ? `?sproochli=${encodeURIComponent(language)}` : ''
const menuLink = (menuIdRaw: unknown) => {
  const publicKitchenSlug = String((kitchen.value as any)?.slug || '').trim()
  const menuId = String(menuIdRaw || '').trim()
  if (!publicKitchenSlug || !menuId) return ''
  return `/kitchens/${encodeURIComponent(publicKitchenSlug)}/menus/${encodeURIComponent(menuId)}${publicLanguageQuery()}`
}

const menusIndexLink = computed(() => {
  const publicKitchenSlug = String((kitchen.value as any)?.slug || '').trim()
  if (!publicKitchenSlug) return ''
  return `/kitchens/${encodeURIComponent(publicKitchenSlug)}/menus${publicLanguageQuery()}`
})

const localizedMenuName = (menu: Menu) =>
  normalizeString(menu.name)

const localizedMenuDescription = (menu: Menu) =>
  normalizeString(menu.description)

const menuSummary = (_menu: Menu) => chromeLabels.value.openMenu

const pageTitle = computed(() => kitchen.value?.name || 'Kitchen')
const pageDescription = computed(() =>
  kitchen.value?.short_address || kitchen.value?.formatted_address || 'Kitchen details.'
)
const isDev = import.meta.dev

useKitchenSeo(kitchen)
</script>
