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
        <p>The kitchen you are looking for does not exist.</p>
        <NuxtLink to="/kitchens" class="text-primary hover:underline">
          &larr; Back
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <OrganismsKitchenCardsProfile
          v-if="kitchenProfile"
          :model="kitchenProfile"
        />

        <DevJson
          v-if="isDev && kitchen"
          :title="'Kitchen (Doc)'"
          context="Kitchen detail page · kitchens/[id] · hydrated kitchen doc"
          :data="kitchen"
          :default-open="false"
        />

        <UCard>
              <template #header>
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="text-sm font-semibold">Menus</div>
                    <p class="text-xs text-dimmed">
                      See available menus for this kitchen.
                    </p>
                  </div>

                  <div class="flex flex-wrap gap-1">
                    <UButton
                      v-for="language in languageOptions"
                      :key="language"
                      size="xs"
                      :variant="selectedLanguage === language ? 'solid' : 'soft'"
                      color="neutral"
                      @click="selectedLanguage = language"
                    >
                      {{ language }}
                    </UButton>
                  </div>
                </div>
              </template>

              <div class="space-y-6">
                <UButton
                  v-if="activeMenu && menuLink(activeMenu.id)"
                  size="sm"
                  variant="soft"
                  color="primary"
                  icon="i-lucide-book-open-check"
                  :to="menuLink(activeMenu.id)"
                >
                  View active menu
                </UButton>

                <div v-if="!menusLoading && sortedMenus.length" class="flex flex-wrap gap-2">
                  <UButton
                    v-for="menu in sortedMenus"
                    :key="menu.id"
                    size="xs"
                    variant="soft"
                    color="neutral"
                    :to="menuLink(menu.id)"
                  >
                    {{ localizedMenuName(menu) }}
                  </UButton>
                </div>

                <div v-if="menusLoading" class="py-4 text-sm text-dimmed">
                  Loading menus...
                </div>

                <div v-else-if="!sortedMenus.length" class="py-4 text-sm text-dimmed">
                  No menus available.
                </div>

                <div v-else class="space-y-8">
                  <section
                    v-for="menu in sortedMenus"
                    :key="menu.id"
                    class="space-y-4"
                  >
                    <div class="border-b border-default pb-3">
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <h2 class="text-xl font-semibold text-highlighted">
                          {{ localizedMenuName(menu) }}
                        </h2>
                        <UButton
                          v-if="menuLink(menu.id)"
                          size="xs"
                          variant="ghost"
                          color="neutral"
                          icon="i-lucide-arrow-up-right"
                          :to="menuLink(menu.id)"
                        >
                          Open
                        </UButton>
                      </div>
                      <p
                        v-if="localizedMenuDescription(menu)"
                        class="mt-1 text-sm text-dimmed"
                      >
                        {{ localizedMenuDescription(menu) }}
                      </p>
                    </div>

                    <div
                      v-if="menuSections(menu).length"
                      class="space-y-6"
                    >
                      <section
                        v-for="section in menuSections(menu)"
                        :key="section.id"
                        class="space-y-3"
                      >
                        <h3 class="text-base font-semibold text-highlighted">
                          {{ localizedSectionLabel(section) }}
                        </h3>

                        <div
                          v-if="sectionItems(section).length"
                          class="space-y-3"
                        >
                          <article
                            v-for="item in sectionItems(section)"
                            :key="item.id"
                            class="border-t border-default pt-3"
                          >
                            <div class="flex gap-3">
                              <div class="min-w-0 flex-1">
                                <h4 class="text-sm font-semibold text-highlighted">
                                  {{ localizedItemName(item) }}
                                </h4>
                                <p
                                  v-if="localizedItemDescription(item)"
                                  class="mt-1 text-sm text-dimmed"
                                >
                                  {{ localizedItemDescription(item) }}
                                </p>
                              </div>
                              <div
                                v-if="itemPriceLabel(item)"
                                class="shrink-0 text-sm font-medium text-toned"
                              >
                                {{ itemPriceLabel(item) }}
                              </div>
                            </div>
                          </article>
                        </div>

                        <p v-else class="text-sm text-dimmed">
                          No items in this section yet.
                        </p>
                      </section>
                    </div>

                    <p v-else class="text-sm text-dimmed">
                      This menu has no sections yet.
                    </p>
                  </section>
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
import { resolveKitchenRuntimeChildCollectionPath } from '../../composables/fireux/app/kitchen-console/shared'
import { getRestaurantMenuGlossaryNames } from '../../composables/fireux/app/kitchen-menu-glossary'
import { formatKitchenMenuPrice } from '../../composables/fireux/app/kitchen-menu-view'
import { useKitchenCollection } from '../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenProfileView } from '../../composables/fireux/firestore/kitchen/utils/view/useKitchenProfileView'
import type { Dish } from '../../models/dish.model'
import type { Kitchen } from '../../models/kitchen.model'
import type { Menu, MenuSection, MenuSectionItem } from '../../models/menu.model'

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
  return /\/kitchens\/[^/]+\/menu(?:\/|$)/.test(path)
})

const kitchenRouteKey = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})

const { kitchens, pending: kitchensPending } = useKitchenCollection()
const kitchen = computed<Kitchen | null>(() => {
  const key = kitchenRouteKey.value
  if (!key) return null
  const keyLower = key.toLowerCase()
  const list = kitchens.value ?? []
  const found = list.find((entry) => {
    const id = String(entry?.id ?? '').trim()
    const slug = String((entry as any)?.slug ?? '').trim().toLowerCase()
    const slugAliases = Array.isArray((entry as any)?.slug_aliases)
      ? (entry as any).slug_aliases.map((alias: unknown) =>
          String(alias ?? '').trim().toLowerCase()
        )
      : []

    return id === key || (slug.length > 0 && slug === keyLower) || slugAliases.includes(keyLower)
  })
  return found ?? null
})

const kitchenId = computed(() => String(kitchen.value?.id ?? '').trim())
const loading = computed(() => Boolean(kitchenRouteKey.value) && kitchensPending.value)

const { firestoreFetchCollection } = useFirestoreRead()
const menusRef = shallowRef(null) as ShallowRef<Ref<Menu[] | undefined> | null>
const dishesRef = shallowRef(null) as ShallowRef<Ref<Dish[] | undefined> | null>

watch(
  kitchenId,
  (nextKitchenId) => {
    const menuPath = resolveKitchenRuntimeChildCollectionPath({
      kitchenId: nextKitchenId,
      collectionName: 'menus',
    })
    const dishPath = resolveKitchenRuntimeChildCollectionPath({
      kitchenId: nextKitchenId,
      collectionName: 'dishes',
    })
    menusRef.value = menuPath ? firestoreFetchCollection<Menu>(menuPath) : null
    dishesRef.value = dishPath ? firestoreFetchCollection<Dish>(dishPath) : null
  },
  { immediate: true }
)

const menus = computed(() => menusRef.value?.value ?? [])
const dishes = computed(() => dishesRef.value?.value ?? [])
const menusLoading = computed(() => Boolean(kitchenId.value && !menusRef.value?.value))
const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeLanguageCode = (value: unknown) => normalizeString(value).replace(/_/g, '-')
const sortedMenus = computed(() =>
  [...menus.value].sort(
    (a, b) =>
      Number(a?.sort_order || 0) - Number(b?.sort_order || 0) ||
      String(a?.name || '').localeCompare(String(b?.name || ''))
  )
)
const activeMenu = computed(() => sortedMenus.value.find((menu) => Boolean(menu?.active)) || null)
const languageOptions = computed(() => {
  const settings = (kitchen.value as Record<string, any> | null)?.language_settings
  const configured = Array.isArray(settings?.supported_languages)
    ? settings.supported_languages
    : []
  const seen = new Set<string>()
  const languages: string[] = []

  for (const value of ['de', ...configured, 'en', 'fr', 'it']) {
    const language = normalizeLanguageCode(value)
    if (!language || seen.has(language)) continue
    seen.add(language)
    languages.push(language)
  }

  return languages
})
const selectedLanguage = ref('de')
const defaultLanguage = computed(() => {
  const settings = (kitchen.value as Record<string, any> | null)?.language_settings
  return normalizeLanguageCode(settings?.default_language) || 'de'
})

watch(
  [defaultLanguage, languageOptions],
  ([nextDefault, nextOptions]) => {
    if (nextOptions.includes(selectedLanguage.value)) return
    selectedLanguage.value = nextOptions.includes(nextDefault)
      ? nextDefault
      : nextOptions[0] || 'de'
  },
  { immediate: true }
)
const menuLink = (menuIdRaw: unknown) => {
  const publicKitchenKey = String((kitchen.value as any)?.slug || kitchenRouteKey.value || kitchenId.value).trim()
  const menuId = String(menuIdRaw || '').trim()
  if (!publicKitchenKey || !menuId) return ''
  return `/kitchens/${encodeURIComponent(publicKitchenKey)}/menu/${encodeURIComponent(menuId)}`
}

const localizedString = (
  map: unknown,
  fallbackValues: unknown[] = []
): string => {
  if (map && typeof map === 'object' && !Array.isArray(map)) {
    const values = map as Record<string, unknown>
    const selected = normalizeString(values[selectedLanguage.value])
    if (selected) return selected
    const defaultValue = normalizeString(values[defaultLanguage.value])
    if (defaultValue) return defaultValue
    const first = Object.values(values).map(normalizeString).find(Boolean)
    if (first) return first
  }

  for (const value of fallbackValues) {
    const next = normalizeString(value)
    if (next) return next
  }

  return ''
}

const menuSections = (menu: Menu) =>
  Array.isArray(menu.sections)
    ? [...menu.sections].sort(
        (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
      )
    : []

const sectionItems = (section: MenuSection) =>
  Array.isArray(section.items)
    ? [...section.items]
        .filter((item) => item?.active !== false)
        .sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
    : []

const dishesById = computed(() => {
  const lookup = new Map<string, Dish>()

  for (const dish of dishes.value) {
    const id = normalizeString(dish?.id)
    if (id) lookup.set(id, dish)
  }

  return lookup
})

const itemDish = (item: MenuSectionItem) => {
  const dishId = normalizeString(item.dish_id)
  return dishId ? dishesById.value.get(dishId) || null : null
}

const localizedMenuName = (menu: Menu) =>
  localizedString((menu as any).names, [menu.name, menu.id])

const localizedMenuDescription = (menu: Menu) =>
  localizedString((menu as any).descriptions, [menu.description])

const localizedSectionLabel = (section: MenuSection) => {
  const glossary = getRestaurantMenuGlossaryNames(section.label)

  return localizedString((section as any).labels || glossary, [
    section.label,
    (section as any).name,
    section.id,
  ])
}

const localizedItemName = (item: MenuSectionItem) => {
  const dish = itemDish(item)

  return localizedString((item as any).names, [
    (item as any).name,
    (item as any).title,
    item.label,
    localizedString((dish as any)?.names, [(dish as any)?.name]),
    item.dish_id,
    item.id,
  ])
}

const localizedItemDescription = (item: MenuSectionItem) => {
  const dish = itemDish(item)

  return localizedString((item as any).descriptions, [
    item.description,
    (item as any).description_default,
    localizedString((dish as any)?.descriptions, [
      (dish as any)?.description,
      (dish as any)?.description_default,
    ]),
  ])
}

const itemPriceLabel = (item: MenuSectionItem) => {
  const price = Number(item.price)
  if (!Number.isFinite(price) || price <= 0) return ''

  return formatKitchenMenuPrice(
    price,
    normalizeString((kitchen.value as Record<string, unknown> | null)?.currency_code)
  )
}

const { model: kitchenProfile } = useKitchenProfileView(kitchen)

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
