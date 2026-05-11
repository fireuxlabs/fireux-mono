<template>
  <main class="min-h-screen bg-[#f8faf7] text-[#17201a]">
    <section class="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-8">
      <NuxtLink
        :to="menu.backToKitchen"
        class="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#2f6b45]"
      >
        <span aria-hidden="true">&larr;</span>
        Kitchen
      </NuxtLink>

      <header class="border-b border-[#cfdacf] pb-6">
        <p class="text-xs font-semibold uppercase text-[#b2362f]">
          {{ kitchenName }}
        </p>
        <h1 class="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
          Menus
        </h1>
        <p v-if="menu.kitchenAddress" class="mt-3 text-sm text-[#526157]">
          {{ menu.kitchenAddress }}
        </p>

        <div class="mt-5 flex flex-wrap gap-2">
          <button
            v-for="language in languageOptions"
            :key="language"
            type="button"
            class="rounded-full border px-3 py-1 text-sm font-medium transition"
            :class="language === selectedLanguage
              ? 'border-[#2f6b45] bg-[#2f6b45] text-white'
              : 'border-[#cfdacf] text-[#526157] hover:border-[#2f6b45] hover:text-[#2f6b45]'"
            @click="setLanguage(language)"
          >
            {{ languageLabel(language) }}
          </button>
        </div>
      </header>

      <div v-if="menu.loading" class="py-12 text-sm text-[#526157]">
        Loading menus...
      </div>

      <div v-else-if="!menu.resolvedKitchen" class="py-12">
        <h2 class="text-xl font-semibold">Kitchen not found</h2>
        <p class="mt-2 text-sm text-[#526157]">
          The kitchen slug does not match a published kitchen.
        </p>
      </div>

      <div v-else-if="!visibleMenus.length" class="py-12">
        <h2 class="text-xl font-semibold">No menus available</h2>
        <p class="mt-2 text-sm text-[#526157]">
          This kitchen does not have public menus available yet.
        </p>
      </div>

      <div v-else class="grid gap-4 py-8">
        <NuxtLink
          v-for="entry in visibleMenus"
          :key="entry.id"
          :to="entry.to"
          class="block rounded-xl border border-[#cfdacf] bg-white/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2f6b45] hover:shadow-md"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h2 class="text-xl font-semibold">{{ entry.name }}</h2>
              <p class="mt-2 text-sm text-[#526157]">
                {{ entry.summary }}
              </p>
            </div>
            <span class="mt-1 text-lg text-[#2f6b45]" aria-hidden="true">&rarr;</span>
          </div>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { useKitchenMenu } from '../../../../composables/fireux/app/useKitchenMenu'
import type { Menu } from '../../../../models/menu.model'

definePageMeta({
  layout: 'public-menu',
  title: 'Kitchen Menus',
  description: 'Choose a public menu.',
  head: { title: 'Kitchen Menus' },
  name: 'KitchenPublicMenusIndexPage',
})

const CORE_PUBLIC_LANGUAGE_CODES = ['de', 'en', 'fr', 'it', 'es', 'pt', 'ja', 'zh-CN', 'ko', 'ar']
const LANGUAGE_LABELS: Record<string, string> = {
  de: '🇩🇪 de',
  en: '🇬🇧 en',
  fr: '🇫🇷 fr',
  it: '🇮🇹 it',
  es: '🇪🇸 es',
  pt: '🇵🇹 pt',
  ja: '🇯🇵 ja',
  'zh-CN': '🇨🇳 zh-CN',
  ko: '🇰🇷 ko',
  ar: '🇸🇦 ar',
}

const route = useRoute()
const menu = useKitchenMenu()
const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeLanguageCode = (value: unknown) => normalizeString(value).replace(/_/g, '-')
const selectedLanguage = computed(() => normalizeLanguageCode(menu.requestedLanguageCode.value) || 'de')
const defaultLanguage = computed(() => normalizeLanguageCode(menu.defaultLanguageCode.value) || 'de')
const languageOptions = computed(() => {
  const configured = Array.isArray((menu.resolvedKitchen.value as any)?.language_settings?.supported_languages)
    ? (menu.resolvedKitchen.value as any).language_settings.supported_languages
    : []
  const seen = new Set<string>()
  const languages: string[] = []

  for (const value of ['de', ...configured, ...CORE_PUBLIC_LANGUAGE_CODES]) {
    const language = normalizeLanguageCode(value)
    if (!language || seen.has(language)) continue
    seen.add(language)
    languages.push(language)
  }

  return languages
})

const kitchenName = computed(() =>
  normalizeString((menu.resolvedKitchen.value as any)?.name) || 'Kitchen'
)

const menuSummary = (source: Menu) => {
  const sections = Array.isArray(source.sections) ? source.sections.length : 0
  const items = Array.isArray(source.sections)
    ? source.sections.reduce(
        (total, section) => total + (Array.isArray(section?.items) ? section.items.length : 0),
        0
      )
    : 0

  if (sections && items) return `${sections} sections · ${items} dishes`
  if (sections) return `${sections} sections`
  return 'Open menu'
}

const visibleMenus = computed(() =>
  menu.sortedMenus.value
    .filter((entry) => entry.active !== false)
    .map((entry) => ({
      id: entry.id,
      name: menu.localizedMenuName(entry),
      summary: menu.localizedMenuDescription(entry) || menuSummary(entry),
      to: menu.resolveMenuTo(entry),
    }))
    .filter((entry) => Boolean(entry.id && entry.to))
)

const languageLabel = (language: string) => LANGUAGE_LABELS[language] || language

const setLanguage = async (language: string) => {
  await navigateTo({
    path: route.path,
    query: {
      ...route.query,
      lang: language === defaultLanguage.value ? undefined : language,
    },
  })
}
</script>
