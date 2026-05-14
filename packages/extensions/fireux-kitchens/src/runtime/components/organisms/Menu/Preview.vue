<template>
  <main
    class="public-menu-surface min-h-screen"
    :class="menuDesignSurfaceClass"
  >
    <section class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <div class="public-menu-sans mb-6 flex flex-col gap-3 sm:flex-row sm:items-start">
        <UBreadcrumb
          v-if="breadcrumbItems.length"
          :items="breadcrumbItems"
          class="min-w-0 max-w-full flex-1 pt-1"
          :ui="{
            link: 'public-menu-muted text-xs font-semibold uppercase tracking-[0.14em]',
            linkLabel: 'truncate',
            separator: 'public-menu-muted',
          }"
        >
          <template #separator>
            <span class="public-menu-muted mx-1.5 text-xs">/</span>
          </template>
        </UBreadcrumb>

        <div v-else />

        <div class="public-menu-toolbar ml-auto inline-flex w-fit shrink-0 items-center gap-1 rounded-lg border p-1">
          <UButton
            v-for="option in languageOptions"
            :key="option.code || 'original'"
            :to="languageTo(option.code)"
            size="xs"
            :variant="selectedLanguage === option.code ? 'solid' : 'ghost'"
            color="neutral"
          >
            {{ option.label }}
          </UButton>
        </div>
      </div>

      <div
        v-if="loading"
        class="public-menu-sans public-menu-muted py-12 text-center text-sm"
      >
        {{ chromeLabels.loadingMenu }}
      </div>

      <div v-else-if="!resolvedKitchen" class="py-12 text-center">
        <h2 class="text-xl font-semibold">
          {{ chromeLabels.kitchenNotFound }}
        </h2>
      </div>

      <div v-else-if="!selectedMenu" class="py-12 text-center">
        <h2 class="text-xl font-semibold">
          {{ chromeLabels.menuNotFound }}
        </h2>
      </div>

      <div v-else-if="!publicSections.length" class="py-12 text-center">
        <h2 class="text-xl font-semibold">
          {{ chromeLabels.noSectionsFound }}
        </h2>
      </div>

      <div
        v-else
        class="public-menu-content"
        :dir="menuContentDirection"
        :lang="menuContentLanguage"
      >
        <header class="mb-10 text-center">
          <p
            v-if="kitchenTitle"
            class="public-menu-sans public-menu-muted text-xs font-semibold uppercase tracking-[0.22em]"
          >
            {{ kitchenTitle }}
          </p>
          <h1 class="public-menu-accent mt-2 text-4xl font-bold uppercase tracking-[0.14em] sm:text-5xl">
            {{ menuTitle }}
          </h1>
          <div class="public-menu-accent-bg mx-auto mt-5 h-px w-28" />
        </header>

        <div class="public-menu-sections">
          <section
            v-for="section in publicSections"
            :key="section.id"
            class="public-menu-section"
          >
            <div
              class="mb-4 border-b-2 pb-2"
              :class="sectionAccentClass(section)"
            >
              <h2 class="text-[1.28rem] font-bold uppercase tracking-[0.13em]">
                {{ section.label }}
              </h2>
              <p v-if="section.description" class="public-menu-sans public-menu-toned mt-1 text-sm font-medium">
                {{ section.description }}
              </p>
            </div>

            <article
              v-for="entry in section.entries"
              :key="entry.id || entry.dishId"
              class="public-menu-entry border-b py-3 last:border-0"
            >
              <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3 class="public-menu-text min-w-48 flex-1 text-[1.03rem] font-bold uppercase leading-snug tracking-[0.055em]">
                  {{ entry.name }}
                </h3>
                <div
                  v-if="entry.priceLabel"
                  class="public-menu-price-label public-menu-text ms-auto max-w-full text-right text-[1rem] font-bold tabular-nums leading-snug"
                >
                  {{ entry.priceLabel }}
                </div>
              </div>
              <p v-if="entry.description" class="public-menu-toned mt-1 text-[1rem] font-medium leading-relaxed">
                {{ entry.description }}
              </p>
            </article>
          </section>
        </div>
      </div>

      <DevJson
        v-if="isDev && debugData !== undefined"
        class="mt-10"
        :title="chromeLabels.menuJson"
        context="/kitchens/[slug]/menus/[menuId] · slug route"
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
  isPublicKitchenRtlLanguage,
  resolvePublicKitchenLanguageOptions,
  resolvePublicKitchenChromeLanguage,
  resolvePublicTranslatedText,
} from '../../../composables/fireux/app/public-kitchen-language'
import { resolvePublicMenuDesign } from '../../../composables/fireux/app/public-menu-design'

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

type MenuPreviewBreadcrumbItem = {
  label: string
  to?: string | Record<string, unknown>
}

type MenuPreviewState = {
  loading: MaybeRef<boolean>
  resolvedKitchen: MaybeRef<Record<string, any> | null>
  selectedMenu: MaybeRef<Record<string, any> | null>
  publicSections: MaybeRef<MenuPreviewSection[]>
  selectedLanguage?: MaybeRef<string>
  primaryLanguage?: MaybeRef<string>
  routePath?: MaybeRef<string>
  menuTitle?: MaybeRef<string>
  breadcrumbItems?: MaybeRef<MenuPreviewBreadcrumbItem[]>
  debugData?: MaybeRef<unknown>
}

const props = defineProps<{
  menu: MenuPreviewState
}>()

const route = useRoute()
const loading = computed(() => Boolean(unref(props.menu.loading)))
const resolvedKitchen = computed(() => unref(props.menu.resolvedKitchen))
const languageOptions = computed(() =>
  resolvePublicKitchenLanguageOptions(resolvedKitchen.value)
)
const selectedMenu = computed(() => unref(props.menu.selectedMenu))
const menuDesign = computed(() =>
  resolvePublicMenuDesign(
    resolvedKitchen.value?.design,
    selectedMenu.value?.design
  )
)
const menuDesignSurfaceClass = computed(
  () => `public-menu-surface--${menuDesign.value.color_mode}`
)
const publicSections = computed(() => unref(props.menu.publicSections) || [])
const breadcrumbItems = computed(() => unref(props.menu.breadcrumbItems) || [])
const selectedLanguage = computed(() => unref(props.menu.selectedLanguage) || '')
const primaryLanguage = computed(() => unref(props.menu.primaryLanguage) || '')
const routePath = computed(() => unref(props.menu.routePath) || route.path)
const menuTitleOverride = computed(() => String(unref(props.menu.menuTitle) || '').trim())
const passThroughQuery = computed(() =>
  Object.fromEntries(
    Object.entries(route.query).filter(
      ([key]) => !['lang', 'language'].includes(key)
    )
  )
)
const languageTo = (language: string) => ({
  path: routePath.value,
  query: language
    ? { ...passThroughQuery.value, lang: language }
    : passThroughQuery.value,
})
const chromeLanguage = computed(() =>
  resolvePublicKitchenChromeLanguage({
    selectedLanguage: selectedLanguage.value,
    primaryLanguage: primaryLanguage.value,
  })
)
const chromeLabels = computed(() => getPublicKitchenChromeLabels(chromeLanguage.value))
const isDev = import.meta.dev
const isRtl = computed(() => isPublicKitchenRtlLanguage(selectedLanguage.value))
const menuContentDirection = computed(() => isRtl.value ? 'rtl' : 'ltr')
const menuContentLanguage = computed(() => selectedLanguage.value || chromeLanguage.value)
const debugData = computed(() => unref(props.menu.debugData))
const kitchenTitle = computed(() =>
  String(resolvedKitchen.value?.name || '').trim()
)
const textForLanguage = (
  defaultText: unknown,
  translations: unknown,
  language: string
) => {
  return resolvePublicTranslatedText({
    defaultText,
    translations,
    selectedLanguage: language,
  }).text
}
const menuTitle = computed(() =>
  menuTitleOverride.value ||
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
  if (key) {
    return 'public-menu-section-heading'
  }

  return 'public-menu-section-heading'
}
</script>

<style scoped>
.public-menu-surface {
  --public-menu-bg: #fffdf8;
  --public-menu-panel: rgba(255, 255, 255, 0.86);
  --public-menu-text: #1f1a16;
  --public-menu-toned: #52483f;
  --public-menu-muted: #7a7067;
  --public-menu-border: rgba(44, 36, 28, 0.16);
  --public-menu-accent: #7b5534;
  --public-menu-price: #2b211a;
  background: var(--public-menu-bg);
  color: var(--public-menu-text);
  font-family: Georgia, 'Times New Roman', serif;
}

.public-menu-surface--dark {
  --public-menu-bg: #080705;
  --public-menu-panel: rgba(255, 244, 216, 0.07);
  --public-menu-text: #fffaf0;
  --public-menu-toned: #d9c9ab;
  --public-menu-muted: #a99778;
  --public-menu-border: rgba(238, 205, 127, 0.22);
  --public-menu-accent: #f0c84d;
  --public-menu-price: #f6d873;
}

.public-menu-content {
  padding: 0;
}

.public-menu-toolbar {
  background: var(--public-menu-panel);
  border-color: var(--public-menu-border);
}

.public-menu-price-label {
  color: var(--public-menu-price);
  direction: ltr;
  margin-inline-start: auto;
  overflow-wrap: anywhere;
  unicode-bidi: plaintext;
}

.public-menu-sections {
  column-count: 1;
  column-gap: 2.5rem;
}

.public-menu-section {
  break-inside: avoid;
  display: inline-block;
  margin: 0 0 2.25rem;
  width: 100%;
}

.public-menu-section-heading {
  border-color: var(--public-menu-accent);
  color: var(--public-menu-accent);
}

.public-menu-entry {
  border-color: var(--public-menu-border);
}

.public-menu-text {
  color: var(--public-menu-text);
}

.public-menu-toned {
  color: var(--public-menu-toned);
}

.public-menu-muted {
  color: var(--public-menu-muted);
}

.public-menu-surface :deep(.public-menu-muted) {
  color: var(--public-menu-muted);
}

.public-menu-accent {
  color: var(--public-menu-accent);
}

.public-menu-accent-bg {
  background: var(--public-menu-accent);
}

.public-menu-sans {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

@media (min-width: 860px) {
  .public-menu-content {
    padding: 2rem 3rem;
  }

  .public-menu-sections {
    column-count: 2;
  }
}
</style>
