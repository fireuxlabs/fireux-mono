<template>
  <main class="min-h-screen bg-white text-black">
    <section class="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-8">
      <NuxtLink
        :to="menusIndexTo"
        class="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
      >
        <span aria-hidden="true">&larr;</span>
        Menus
      </NuxtLink>

      <header class="border-b border-gray-200 pb-6">
        <p class="text-xs font-semibold uppercase text-gray-600">
          Luna Piccante
        </p>
        <h1 class="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
          {{ title }}
        </h1>
        <p v-if="menu.kitchenAddress" class="mt-3 text-sm text-gray-600">
          {{ menu.kitchenAddress }}
        </p>

        <div class="mt-5 flex flex-wrap gap-2">
          <button
            v-for="language in languageOptions"
            :key="language"
            type="button"
            class="rounded-full border px-3 py-1 text-sm font-medium transition"
            :class="language === selectedLanguage
              ? 'border-black bg-black text-white'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-black'"
            @click="setLanguage(language)"
          >
            {{ languageLabel(language) }}
          </button>
        </div>
      </header>

      <div v-if="menu.loading" class="py-12 text-sm text-gray-600">
        Loading menu...
      </div>

      <div v-else-if="!menu.resolvedKitchen" class="py-12">
        <h2 class="text-xl font-semibold">Kitchen not found</h2>
        <p class="mt-2 text-sm text-gray-600">
          The kitchen slug does not match a published kitchen.
        </p>
      </div>

      <div v-else-if="!menu.selectedMenu" class="py-12">
        <h2 class="text-xl font-semibold">Menu not found</h2>
        <p class="mt-2 text-sm text-gray-600">
          This kitchen does not have a public prototype menu yet.
        </p>
      </div>

      <div v-else-if="!menu.publicSections.length" class="py-12">
        <h2 class="text-xl font-semibold">No menu sections</h2>
        <p class="mt-2 text-sm text-gray-600">
          The selected public menu has no dish sections yet.
        </p>
      </div>

      <div v-else class="space-y-10 py-8">
        <section
          v-for="section in menu.publicSections"
          :key="section.id"
          class="space-y-4"
        >
          <div>
            <h2 class="text-2xl font-semibold">{{ section.label }}</h2>
            <p v-if="section.description" class="mt-1 text-sm text-gray-600">
              {{ section.description }}
            </p>
          </div>

          <article
            v-for="entry in section.entries"
            :key="entry.dishId"
            class="border-t border-gray-200 py-4"
          >
            <div class="flex items-start justify-between gap-4">
              <h3 class="text-lg font-semibold">{{ entry.name }}</h3>
              <p v-if="entry.priceLabel" class="shrink-0 text-lg font-semibold">
                {{ entry.priceLabel }}
              </p>
            </div>
            <p v-if="entry.description" class="mt-1 text-base text-gray-700">
              {{ entry.description }}
            </p>
          </article>
        </section>
      </div>

      <DevJson
        v-if="showLanguageDebug"
        class="mb-8"
        :title="`Current language menu · ${selectedLanguage}`"
        context="/kitchens/[slug]/menus/[menuId] · selected-language menu output"
        :data="languageDebugData"
        :default-open="false"
        :hide-when-empty="false"
      />

      <DevJson
        v-if="showDebugJson"
        class="mb-8"
        title="Luna prototype menu JSON"
        context="/kitchen/[slug]/menu · semantic menu proof"
        :data="menu.prototypeMenuJson"
        :default-open="true"
        :hide-when-empty="false"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue'
import { navigateTo, useRoute } from '#imports'
import type { KitchenMenuState } from '../../../composables/fireux/app/useKitchenMenu'

type MenuPreviewState = Pick<
  KitchenMenuState,
  | 'backToKitchen'
  | 'headerTitle'
  | 'kitchenAddress'
  | 'loading'
  | 'resolvedKitchen'
  | 'selectedMenu'
  | 'publicSections'
  | 'prototypeMenuJson'
  | 'requestedLanguageCode'
  | 'defaultLanguageCode'
  | 'resolvedKitchen'
  | 'routeKitchenSlug'
>

const props = withDefaults(
  defineProps<{
    menu: MenuPreviewState
    showDebugJson?: boolean
    showLanguageDebug?: boolean
  }>(),
  {
    showDebugJson: false,
    showLanguageDebug: false,
  }
)

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
const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeLanguageCode = (value: unknown) => normalizeString(value).replace(/_/g, '-')
const title = computed(() => normalizeString(unref(props.menu.headerTitle)) || 'Menu')
const selectedLanguage = computed(() =>
  normalizeLanguageCode(unref(props.menu.requestedLanguageCode)) || 'de'
)
const defaultLanguage = computed(() =>
  normalizeLanguageCode(unref(props.menu.defaultLanguageCode)) || 'de'
)
const languageOptions = computed(() => {
  const kitchen = unref(props.menu.resolvedKitchen) as Record<string, any> | null
  const configured = Array.isArray(kitchen?.language_settings?.supported_languages)
    ? kitchen.language_settings.supported_languages
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
const languageLabel = (language: string) => LANGUAGE_LABELS[language] || language
const menusIndexTo = computed(() => {
  const key = normalizeString(unref(props.menu.routeKitchenSlug) || route.params.kitchenSlug)
  if (!key) return unref(props.menu.backToKitchen) || '/kitchens'

  return {
    path: `/kitchens/${encodeURIComponent(key)}/menus`,
    query: {
      ...route.query,
      lang: selectedLanguage.value === defaultLanguage.value
        ? undefined
        : selectedLanguage.value,
    },
  }
})
const setLanguage = async (language: string) => {
  await navigateTo({
    path: route.path,
    query: {
      ...route.query,
      lang: language === defaultLanguage.value ? undefined : language,
    },
  })
}

const languageDebugData = computed(() => ({
  language: selectedLanguage.value,
  default_language: defaultLanguage.value,
  menu: title.value,
  sections: (unref(props.menu.publicSections) || []).map((section) => ({
    id: section.id,
    label: section.label,
    description: section.description,
    items: section.entries.map((entry) => ({
      id: entry.id,
      dish_id: entry.dishId,
      name: entry.name,
      description: entry.description,
      price: entry.price,
      price_label: entry.priceLabel,
    })),
  })),
}))
</script>
