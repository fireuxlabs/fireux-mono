<template>
  <NuxtPage v-if="hasChildRoute" />

  <UPage v-else>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/kitchens"
        >
          Back
        </UButton>
        <UButton
          v-if="canEdit && kitchenId"
          size="xs"
          variant="soft"
          color="neutral"
          icon="i-lucide-pencil"
          @click="goToEdit"
        >
          Edit
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <div v-if="loading" class="py-10 text-sm opacity-70">
        Loading kitchen...
      </div>

      <div v-else-if="!kitchen" class="space-y-2">
        <h1 class="text-lg font-semibold">Kitchen Not Found</h1>
        <p>The kitchen you are looking for does not exist or is not public-ready.</p>
        <NuxtLink to="/kitchens" class="text-primary hover:underline">
          &larr; Back
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div class="flex items-start gap-3">
          <div
            v-if="kitchenImageUrl"
            class="max-w-2xl flex-1 overflow-hidden rounded-lg border border-default bg-muted"
          >
            <img
              :src="kitchenImageUrl"
              :alt="kitchenImageAlt"
              class="w-full object-contain"
            >
          </div>

          <div class="inline-flex shrink-0 items-center gap-1 rounded-lg border border-default bg-default/80 p-1">
            <UButton
              v-for="language in publicLanguageOptions"
              :key="language.code || 'original'"
              size="xs"
              :variant="selectedLanguage === language.code ? 'solid' : 'ghost'"
              color="neutral"
              @click="setPublicLanguage(language.code)"
            >
              {{ language.label }}
            </UButton>
          </div>
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

        <UCard>
              <template #header>
                <div class="space-y-1">
                  <div class="text-sm font-semibold">Kitchen Claim</div>
                  <p class="text-xs text-dimmed">
                    Claiming controls who can update this public kitchen record.
                  </p>
                </div>
              </template>

              <div class="space-y-3">
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge
                    size="xs"
                    variant="soft"
                    :color="canEdit ? 'primary' : 'neutral'"
                  >
                    {{ canEdit ? 'Can edit' : 'Read only' }}
                  </UBadge>
                  <UBadge v-if="isOwner" size="xs" variant="soft" color="emerald">
                    Owner
                  </UBadge>
                  <UBadge v-else-if="isAdmin" size="xs" variant="soft" color="primary">
                    Support access
                  </UBadge>
                  <UBadge
                    v-if="claimedByLabel"
                    size="xs"
                    variant="soft"
                    color="neutral"
                  >
                    Claimed by: {{ claimedByLabel }}
                  </UBadge>
                </div>

                <p class="text-sm text-dimmed">
                  {{ permissionMessage }}
                </p>

                <div class="flex flex-wrap gap-2">
                  <UButton
                    v-if="canEdit && kitchenId"
                    size="xs"
                    variant="soft"
                    color="primary"
                    icon="i-lucide-pencil"
                    @click="goToEdit"
                  >
                    Edit kitchen
                  </UButton>
                  <UButton
                    v-if="showClaimButton"
                    size="xs"
                    variant="soft"
                    color="primary"
                    icon="i-lucide-key-round"
                    :loading="isClaiming"
                    :disabled="isClaiming"
                    @click="onClaimKitchen"
                  >
                    Claim this kitchen
                  </UButton>
                  <UButton
                    v-if="!canEdit && !showClaimButton"
                    size="xs"
                    variant="soft"
                    color="neutral"
                    icon="i-lucide-eye"
                  >
                    View only
                  </UButton>
                </div>
              </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { navigateTo, useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { usePlaceClaim } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceClaim'
import { computed, ref, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { resolveKitchenChildCollectionPath } from '../../composables/fireux/console/kitchen/paths'
import {
  getPublicKitchenChromeLabels,
  normalizePublicKitchenLanguage,
  PUBLIC_KITCHEN_LANGUAGE_OPTIONS,
  resolvePublicKitchenChromeLanguage,
} from '../../composables/fireux/app/public-kitchen-language'
import { useKitchenCollection } from '../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import type { Kitchen } from '../../models/kitchen.model'
import type { Menu } from '../../models/menu.model'

definePageMeta({
  layout: 'default',
  title: 'Kitchen',
  description: 'View a saved kitchen.',
  head: { title: 'Kitchen' },
  name: 'KitchensDetailPage',
})

const { appName } = useFireUXConfig()
const route = useRoute()
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
  return found ?? null
})

const kitchenId = computed(() => String(kitchen.value?.id ?? '').trim())
const loading = computed(() => Boolean(kitchenSlug.value) && kitchensPending.value)

const { firestoreFetchCollection } = useFirestoreRead()
const menusRef = shallowRef(null) as ShallowRef<Ref<Menu[] | undefined> | null>

watch(
  kitchenId,
  (nextKitchenId) => {
    const menuPath = resolveKitchenChildCollectionPath({
      kitchenId: nextKitchenId,
      collectionName: 'menus',
    })
    menusRef.value = menuPath ? firestoreFetchCollection<Menu>(menuPath) : null
  },
  { immediate: true }
)

const menus = computed(() => menusRef.value?.value ?? [])
const menusLoading = computed(() => Boolean(kitchenId.value && !menusRef.value?.value))
const normalizeString = (value: unknown) => String(value ?? '').trim()
const sortedMenus = computed(() =>
  [...menus.value].sort(
    (a, b) =>
      Number(a?.sort_order || 0) - Number(b?.sort_order || 0) ||
      String(a?.name || '').localeCompare(String(b?.name || ''))
  )
)
const publicLanguageOptions = PUBLIC_KITCHEN_LANGUAGE_OPTIONS
const selectedLanguage = computed(() => {
  const raw = route.query.lang || route.query.language
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
const chromeLabels = computed(() => getPublicKitchenChromeLabels(chromeLanguage.value))
const publicLanguageQuery = (language = selectedLanguage.value) =>
  language ? `?lang=${encodeURIComponent(language)}` : ''
const routeQueryWithoutLanguage = computed(() =>
  Object.fromEntries(
    Object.entries(route.query).filter(
      ([key]) => !['lang', 'language'].includes(key)
    )
  )
)
const setPublicLanguage = async (language: string) => {
  await navigateTo({
    path: route.path,
    query: language
      ? { ...routeQueryWithoutLanguage.value, lang: language }
      : routeQueryWithoutLanguage.value,
  })
}
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

const localizedString = (
  map: unknown,
  defaultValue: unknown = ''
): string => {
  if (!selectedLanguage.value) return normalizeString(defaultValue)

  if (map && typeof map === 'object' && !Array.isArray(map)) {
    const values = map as Record<string, unknown>
    const selected = normalizeString(values[selectedLanguage.value])
    if (selected) return selected
  }

  return ''
}

const localizedMenuName = (menu: Menu) =>
  localizedString((menu as any).names, menu.name)

const localizedMenuDescription = (menu: Menu) =>
  localizedString((menu as any).descriptions, menu.description)

const menuSummary = (menu: Menu) => {
  const sections = Array.isArray(menu.sections) ? menu.sections.length : 0
  const items = Array.isArray(menu.sections)
    ? menu.sections.reduce(
        (total, section) => total + (Array.isArray(section?.items) ? section.items.length : 0),
        0
      )
    : 0

  const sectionLabel = sections === 1 ? chromeLabels.value.section : chromeLabels.value.sections
  const dishLabel = items === 1 ? chromeLabels.value.dish : chromeLabels.value.dishes

  if (sections && items) return `${sections} ${sectionLabel} · ${items} ${dishLabel}`
  if (sections) return `${sections} ${sectionLabel}`
  return chromeLabels.value.openMenu
}

const kitchenImageUrl = computed(() => String((kitchen.value as any)?.image_url || '').trim())
const kitchenImageAlt = computed(() => pageTitle.value)

const { currentUser, isAdmin } = useUser()
const claimedBy = computed(() => String(kitchen.value?.claimed_by || '').trim())
const claimedByLabel = computed(() => claimedBy.value || '')
const isOwner = computed(() => Boolean(claimedBy.value && currentUser.value?.id === claimedBy.value))
const canEdit = computed(() => {
  if (!claimedBy.value) return Boolean(isAdmin.value)
  return Boolean(isAdmin.value || isOwner.value)
})

const permissionMessage = computed(() => {
  if (canEdit.value) {
    return 'You can edit this kitchen record.'
  }
  if (!claimedBy.value) {
    return 'This kitchen is not claimed yet. Claim it if this is your kitchen.'
  }
  return 'This kitchen is already claimed. You can still browse its public details and menus.'
})

const { claimPlace } = usePlaceClaim()
const toast = useToastify()
const isClaiming = ref(false)
const showClaimButton = computed(() => !claimedBy.value)

const onClaimKitchen = async () => {
  if (isClaiming.value) return
  const targetId = kitchenId.value
  if (!targetId) return
  isClaiming.value = true
  try {
    await claimPlace(targetId)
    toast.success('Kitchen claimed')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to claim kitchen: ${message}`)
  } finally {
    isClaiming.value = false
  }
}

const pageTitle = computed(() => kitchen.value?.name || 'Kitchen')
const pageDescription = computed(() =>
  kitchen.value?.short_address || kitchen.value?.formatted_address || 'Kitchen details.'
)
const isDev = import.meta.dev

const goToEdit = async () => {
  if (!kitchenId.value) return
  await navigateTo(`/kitchens/edit/${encodeURIComponent(kitchenId.value)}`)
}

useHead({
  title: computed(() => `${appName} | ${pageTitle.value}`),
})
</script>
