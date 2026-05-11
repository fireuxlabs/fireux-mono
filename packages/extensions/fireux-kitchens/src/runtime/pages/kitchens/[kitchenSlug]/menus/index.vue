<template>
  <main class="luna-menu-index min-h-screen bg-[#f1e7d4] text-[#15120d]">
    <section class="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-6 sm:px-8 sm:py-10">
      <div class="luna-menu-sans mb-4 flex justify-end">
        <div class="inline-flex items-center gap-1 rounded-lg border border-default bg-default/80 p-1">
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
        class="luna-menu-paper luna-menu-sans py-12 text-center text-sm text-[#6f6756]"
      >
        {{ chromeLabels.loadingMenus }}
      </div>

      <div
        v-else-if="!menuCards.length"
        class="luna-menu-paper py-12 text-center"
      >
        <h2 class="text-xl font-semibold">
          {{ chromeLabels.noMenusAvailable }}
        </h2>
        <p class="luna-menu-sans mt-2 text-sm text-[#6f6756]">
          {{ chromeLabels.noPublicMenus }}
        </p>
      </div>

      <div
        v-else
        class="luna-menu-paper"
      >
        <header class="mb-10 text-center">
          <p
            v-if="kitchenName"
            class="luna-menu-sans text-xs font-semibold uppercase tracking-[0.22em] text-[#7d735e]"
          >
            {{ kitchenName }}
          </p>
          <h1 class="mt-2 text-4xl font-bold uppercase tracking-[0.14em] text-[#9f211e] sm:text-5xl">
            {{ chromeLabels.chooseMenu }}
          </h1>
          <div class="mx-auto mt-5 h-px w-28 bg-[#9f211e]" />
        </header>

        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            v-for="menu in menuCards"
            :key="menu.id"
            :to="menu.to"
            class="group block border border-l-4 border-[#d7ceb8] bg-[#fffdf8] p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
            :class="menuAccentClass(menu.id)"
          >
            <div class="flex min-h-32 flex-col justify-between gap-6">
              <div class="space-y-2">
                <h2 class="text-2xl font-bold uppercase tracking-[0.09em]">
                  {{ menu.name }}
                </h2>
                <p
                  v-if="menu.description"
                  class="text-[1rem] font-medium leading-6 text-[#2f2a20]"
                >
                  {{ menu.description }}
                </p>
              </div>

              <div class="luna-menu-sans flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-[#7d735e]">
                <span>{{ chromeLabels.openMenu }}</span>
                <span
                  class="grid size-8 shrink-0 place-items-center rounded-full border border-[#d7ceb8] text-base transition group-hover:border-[#211f16] group-hover:bg-[#211f16] group-hover:text-white"
                  aria-hidden="true"
                >
                  &rarr;
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
const menuAccentClass = (menuId: string) =>
  menuId === 'pizza'
    ? 'border-l-[#23633b] text-[#23633b]'
    : 'border-l-[#9f211e] text-[#9f211e]'
const setLanguage = async (language: string) => {
  await navigateTo({
    path: route.path,
    query: languageQuery(language),
  })
}
</script>

<style scoped>
.luna-menu-index {
  font-family: Georgia, 'Times New Roman', serif;
}

.luna-menu-paper {
  border: 1px solid #d7ceb8;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.62)),
    #fffaf0;
  box-shadow: 0 18px 50px rgba(65, 50, 26, 0.16);
  padding: clamp(1.5rem, 4vw, 3rem);
}

.luna-menu-sans {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>
