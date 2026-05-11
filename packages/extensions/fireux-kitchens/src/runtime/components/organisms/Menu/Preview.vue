<template>
  <main class="min-h-screen bg-[#f8faf7] text-[#17201a]">
    <section class="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-8">
      <NuxtLink
        :to="menusIndexTo"
        class="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#2f6b45]"
      >
        <span aria-hidden="true">&larr;</span>
        Menus
      </NuxtLink>

      <header class="border-b border-[#cfdacf] pb-6">
        <p class="text-xs font-semibold uppercase text-[#b2362f]">
          Luna Piccante
        </p>
        <h1 class="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
          {{ title }}
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
        Loading menu...
      </div>

      <div v-else-if="!menu.resolvedKitchen" class="py-12">
        <h2 class="text-xl font-semibold">Kitchen not found</h2>
        <p class="mt-2 text-sm text-[#526157]">
          The kitchen slug does not match a published kitchen.
        </p>
      </div>

      <div v-else-if="!menu.selectedMenu" class="py-12">
        <h2 class="text-xl font-semibold">Menu not found</h2>
        <p class="mt-2 text-sm text-[#526157]">
          This kitchen does not have a public prototype menu yet.
        </p>
      </div>

      <div v-else-if="!menu.semanticSections.length" class="py-12">
        <h2 class="text-xl font-semibold">No menu sections</h2>
        <p class="mt-2 text-sm text-[#526157]">
          The selected public menu has no semantic dish sections yet.
        </p>
      </div>

      <div v-else class="space-y-10 py-8">
        <section
          v-for="section in menu.semanticSections"
          :key="section.id"
          class="space-y-4"
        >
          <div>
            <h2 class="text-2xl font-semibold">{{ section.label }}</h2>
            <p v-if="section.description" class="mt-1 text-sm text-[#526157]">
              {{ section.description }}
            </p>
          </div>

          <article
            v-for="entry in section.entries"
            :key="entry.dishId"
            class="border-t border-[#cfdacf] py-4"
          >
            <h3 class="text-lg font-semibold">{{ entry.name }}</h3>
            <p v-if="entry.description" class="mt-1 text-base text-[#36473b]">
              {{ entry.description }}
            </p>
          </article>
        </section>
      </div>

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
  | 'semanticSections'
  | 'prototypeMenuJson'
  | 'requestedLanguageCode'
  | 'resolvedKitchen'
  | 'routeKitchenSlug'
>

const props = withDefaults(
  defineProps<{
    menu: MenuPreviewState
    showDebugJson?: boolean
  }>(),
  {
    showDebugJson: false,
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
      lang: selectedLanguage.value,
    },
  }
})
const setLanguage = async (language: string) => {
  await navigateTo({
    path: route.path,
    query: {
      ...route.query,
      lang: language,
    },
  })
}
</script>
