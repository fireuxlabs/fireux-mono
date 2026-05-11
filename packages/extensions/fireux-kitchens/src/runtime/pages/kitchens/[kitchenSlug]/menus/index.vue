<template>
  <main class="min-h-screen bg-[#fbfaf7] text-[#18221b]">
    <section class="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-8 sm:px-8">
      <header class="space-y-6 border-b border-[#ded8cb] pb-6">
        <div class="space-y-2">
          <p class="text-sm font-medium text-[#6f766d]">
            {{ kitchenName }}
          </p>
          <h1 class="text-4xl font-semibold tracking-normal sm:text-5xl">
            {{ chromeLabels.chooseMenu }}
          </h1>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in languageOptions"
            :key="option.code || 'default'"
            type="button"
            class="min-h-10 rounded-full border px-4 text-sm font-medium transition"
            :class="
              option.code === selectedLanguage
                ? 'border-[#18221b] bg-[#18221b] text-white'
                : 'border-[#ded8cb] bg-white/70 text-[#50594f] hover:border-[#18221b] hover:text-[#18221b]'
            "
            @click="setLanguage(option.code)"
          >
            {{ chromeLabels[option.labelKey] }}
          </button>
        </div>
      </header>

      <div
        v-if="pending"
        class="py-12 text-sm text-[#6f766d]"
      >
        {{ chromeLabels.loadingMenus }}
      </div>

      <div
        v-else-if="errorMessage"
        class="py-12"
      >
        <h2 class="text-xl font-semibold">
          {{ chromeLabels.failedToLoadMenus }}
        </h2>
        <p class="mt-2 text-sm text-[#6f766d]">
          {{ errorMessage }}
        </p>
      </div>

      <div
        v-else-if="!menuCards.length"
        class="py-12"
      >
        <h2 class="text-xl font-semibold">
          {{ chromeLabels.noMenusAvailable }}
        </h2>
        <p class="mt-2 text-sm text-[#6f766d]">
          {{ chromeLabels.noPublicMenus }}
        </p>
      </div>

      <div
        v-else
        class="grid gap-4 py-8"
      >
        <NuxtLink
          v-for="menu in menuCards"
          :key="menu.id"
          :to="menu.to"
          class="group block rounded-2xl border border-[#ded8cb] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#18221b] hover:shadow-md"
        >
          <div class="flex min-h-24 items-center justify-between gap-4">
            <div class="min-w-0 space-y-2">
              <h2 class="text-2xl font-semibold tracking-normal">
                {{ menu.name }}
              </h2>
              <p
                v-if="menu.description"
                class="text-sm leading-6 text-[#5f685d]"
              >
                {{ menu.description }}
              </p>
            </div>

            <span
              class="grid size-10 shrink-0 place-items-center rounded-full border border-[#ded8cb] text-lg transition group-hover:border-[#18221b] group-hover:bg-[#18221b] group-hover:text-white"
              aria-hidden="true"
            >
              &rarr;
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo, useHead, useRoute } from '#imports'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { resolveKitchenRuntimeChildCollectionPath } from '../../../../composables/fireux/app/kitchen-console/shared'
import {
  getPublicKitchenChromeLabels,
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
  const key = routeKitchenSlug.value
  if (!key) return null

  const keyLower = key.toLowerCase()
  const list = kitchens.value ?? []
  const found = list.find((entry) => {
    const id = normalizeString(entry?.id)
    const slug = normalizeString((entry as any)?.slug).toLowerCase()
    const slugAliases = Array.isArray((entry as any)?.slug_aliases)
      ? (entry as any).slug_aliases.map((alias: unknown) =>
          normalizeString(alias).toLowerCase()
        )
      : []

    return (
      id === key ||
      (slug.length > 0 && slug === keyLower) ||
      slugAliases.includes(keyLower) ||
      (id === 'ChIJ93_ggY-jj0cRTCyLcfBuK2w' &&
        ['luna-picante', 'luna-piccante'].includes(keyLower))
    )
  })

  return found ?? null
})
const kitchenId = computed(() => normalizeString(kitchen.value?.id))
const { firestoreFetchCollection } = useFirestoreRead()
const menusPath = computed(() =>
  resolveKitchenRuntimeChildCollectionPath({
    kitchenId: kitchenId.value,
    collectionName: 'menus',
  })
)
const menusRef = firestoreFetchCollection<Menu>(menusPath)
const menus = computed(() => menusRef.value ?? [])
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
useHead({
  title: computed(() => chromeLabels.value.chooseMenu),
})
const errorMessage = computed(() => '')
const textForLanguage = (
  defaultText: unknown,
  translations: unknown,
  language: string
) => {
  const fallback = normalizeString(defaultText)
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
        name: textForLanguage(menu.name, menu.names, selectedLanguage.value),
        description: textForLanguage(
          menu.description,
          menu.descriptions,
          selectedLanguage.value
        ),
        to: menuTo(id),
      }
    })
    .filter((menu) => Boolean(menu.id && menu.name))
)
const setLanguage = async (language: string) => {
  await navigateTo({
    path: route.path,
    query: languageQuery(language),
  })
}
</script>
