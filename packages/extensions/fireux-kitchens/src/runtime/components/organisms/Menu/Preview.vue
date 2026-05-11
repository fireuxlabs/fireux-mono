<template>
  <main class="luna-menu-surface min-h-screen bg-[#f1e7d4] text-[#15120d]">
    <section class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <div class="luna-menu-sans mb-4 flex justify-end">
        <div class="inline-flex items-center gap-1 rounded-lg border border-default bg-default/80 p-1">
          <UButton
            :to="originalLanguageTo"
            size="xs"
            :variant="!selectedLanguage ? 'solid' : 'ghost'"
            color="neutral"
          >
            {{ originalLanguageLabel }}
          </UButton>
          <UButton
            :to="germanLanguageTo"
            size="xs"
            :variant="selectedLanguage === 'de' ? 'solid' : 'ghost'"
            color="neutral"
          >
            {{ germanLanguageLabel }}
          </UButton>
          <UButton
            :to="englishLanguageTo"
            size="xs"
            :variant="selectedLanguage === 'en' ? 'solid' : 'ghost'"
            color="neutral"
          >
            {{ englishLanguageLabel }}
          </UButton>
        </div>
      </div>

      <div
        v-if="loading"
        class="luna-menu-paper luna-menu-sans py-12 text-center text-sm text-[#6f6756]"
      >
        {{ chromeLabels.loadingMenu }}
      </div>

      <div v-else-if="!resolvedKitchen" class="luna-menu-paper py-12 text-center">
        <h2 class="text-xl font-semibold">
          {{ chromeLabels.kitchenNotFound }}
        </h2>
      </div>

      <div v-else-if="!selectedMenu" class="luna-menu-paper py-12 text-center">
        <h2 class="text-xl font-semibold">
          {{ chromeLabels.menuNotFound }}
        </h2>
      </div>

      <div v-else-if="!publicSections.length" class="luna-menu-paper py-12 text-center">
        <h2 class="text-xl font-semibold">
          {{ chromeLabels.noSectionsFound }}
        </h2>
      </div>

      <div v-else class="luna-menu-paper">
        <header class="mb-10 text-center">
          <p
            v-if="kitchenTitle"
            class="luna-menu-sans text-xs font-semibold uppercase tracking-[0.22em] text-[#7d735e]"
          >
            {{ kitchenTitle }}
          </p>
          <h1 class="mt-2 text-4xl font-bold uppercase tracking-[0.14em] text-[#9f211e] sm:text-5xl">
            {{ menuTitle }}
          </h1>
          <div class="mx-auto mt-5 h-px w-28 bg-[#9f211e]" />
        </header>

        <div class="luna-menu-sections">
          <section
            v-for="section in publicSections"
            :key="section.id"
            class="luna-menu-section"
          >
            <div
              class="mb-4 border-b-2 pb-2"
              :class="sectionAccentClass(section)"
            >
              <h2 class="text-[1.28rem] font-bold uppercase tracking-[0.13em]">
                {{ section.label }}
              </h2>
              <p v-if="section.description" class="luna-menu-sans mt-1 text-sm font-medium text-[#3b3529]">
                {{ section.description }}
              </p>
            </div>

            <article
              v-for="entry in section.entries"
              :key="entry.id || entry.dishId"
              class="border-b border-[#e3dac6]/80 py-3 last:border-0"
            >
              <div class="flex items-start gap-4">
                <h3 class="min-w-0 flex-1 text-[1.03rem] font-bold uppercase leading-snug tracking-[0.055em] text-[#15120d]">
                  {{ entry.name }}
                </h3>
                <div
                  v-if="entry.priceLabel"
                  class="shrink-0 pt-0.5 text-[1rem] font-bold tabular-nums text-[#15120d]"
                >
                  {{ entry.priceLabel }}
                </div>
              </div>
              <p v-if="entry.description" class="mt-1 text-[1rem] font-medium leading-relaxed text-[#2f2a20]">
                {{ entry.description }}
              </p>
            </article>
          </section>
        </div>
      </div>

      <DevJson
        v-if="debugData !== undefined"
        class="mt-10"
        :title="chromeLabels.menuJson"
        context="/kitchens/[slug]/menus/[menuId] · raw default menu read"
        :data="debugData"
        :default-open="true"
        :hide-when-empty="false"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, unref, type Ref } from 'vue'
import { useRoute } from '#imports'
import {
  getPublicKitchenChromeLabels,
  PUBLIC_KITCHEN_LANGUAGE_OPTIONS,
  resolvePublicKitchenChromeLanguage,
} from '../../../composables/fireux/app/public-kitchen-language'

type MaybeRef<T> = T | Ref<T>

type MenuPreviewEntry = {
  id: string
  dishId: string
  name: string
  description: string
  priceLabel?: string
}

type MenuPreviewSection = {
  id: string
  label: string
  description: string
  entries: MenuPreviewEntry[]
}

type MenuPreviewState = {
  loading: MaybeRef<boolean>
  resolvedKitchen: MaybeRef<Record<string, any> | null>
  selectedMenu: MaybeRef<Record<string, any> | null>
  publicSections: MaybeRef<MenuPreviewSection[]>
  selectedLanguage?: MaybeRef<string>
  primaryLanguage?: MaybeRef<string>
  routePath?: MaybeRef<string>
  debugData?: MaybeRef<unknown>
}

const props = defineProps<{
  menu: MenuPreviewState
}>()

const route = useRoute()
const originalLanguageLabel = PUBLIC_KITCHEN_LANGUAGE_OPTIONS.find((option) => option.code === '')?.label || 'Original'
const germanLanguageLabel = PUBLIC_KITCHEN_LANGUAGE_OPTIONS.find((option) => option.code === 'de')?.label || '🇩🇪'
const englishLanguageLabel = PUBLIC_KITCHEN_LANGUAGE_OPTIONS.find((option) => option.code === 'en')?.label || '🇬🇧'
const loading = computed(() => Boolean(unref(props.menu.loading)))
const resolvedKitchen = computed(() => unref(props.menu.resolvedKitchen))
const selectedMenu = computed(() => unref(props.menu.selectedMenu))
const publicSections = computed(() => unref(props.menu.publicSections) || [])
const selectedLanguage = computed(() => unref(props.menu.selectedLanguage) || '')
const primaryLanguage = computed(() => unref(props.menu.primaryLanguage) || '')
const routePath = computed(() => unref(props.menu.routePath) || route.path)
const passThroughQuery = computed(() =>
  Object.fromEntries(
    Object.entries(route.query).filter(
      ([key]) => !['lang', 'language'].includes(key)
    )
  )
)
const originalLanguageTo = computed(() => ({
  path: routePath.value,
  query: passThroughQuery.value,
}))
const germanLanguageTo = computed(() => ({
  path: routePath.value,
  query: { ...passThroughQuery.value, lang: 'de' },
}))
const englishLanguageTo = computed(() => ({
  path: routePath.value,
  query: { ...passThroughQuery.value, lang: 'en' },
}))
const chromeLanguage = computed(() =>
  resolvePublicKitchenChromeLanguage({
    selectedLanguage: selectedLanguage.value,
    primaryLanguage: primaryLanguage.value,
  })
)
const chromeLabels = computed(() => getPublicKitchenChromeLabels(chromeLanguage.value))
const debugData = computed(() => unref(props.menu.debugData))
const kitchenTitle = computed(() =>
  String(resolvedKitchen.value?.name || '').trim()
)
const textForLanguage = (
  defaultText: unknown,
  translations: unknown,
  language: string
) => {
  const fallback = String(defaultText ?? '').trim()
  if (!language || !translations || typeof translations !== 'object' || Array.isArray(translations)) {
    return fallback
  }

  return String((translations as Record<string, unknown>)[language] ?? '').trim() || fallback
}
const menuTitle = computed(() =>
  textForLanguage(
    selectedMenu.value?.name || chromeLabels.value.menus,
    selectedMenu.value?.names,
    selectedLanguage.value
  )
)

const normalizeToneText = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const sectionAccentClass = (section: MenuPreviewSection) => {
  const key = normalizeToneText(`${section.id} ${section.label}`)
  if (/(poulet|chicken|schweinefleisch|pork|kalbsfleisch|veal)/.test(key)) {
    return 'border-[#23633b] text-[#23633b]'
  }

  return 'border-[#9f211e] text-[#9f211e]'
}
</script>

<style scoped>
.luna-menu-surface {
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

.luna-menu-sections {
  column-count: 1;
  column-gap: 2.5rem;
}

.luna-menu-section {
  break-inside: avoid;
  display: inline-block;
  margin: 0 0 2.25rem;
  width: 100%;
}

.luna-menu-sans {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

@media (min-width: 860px) {
  .luna-menu-sections {
    column-count: 2;
  }
}
</style>
