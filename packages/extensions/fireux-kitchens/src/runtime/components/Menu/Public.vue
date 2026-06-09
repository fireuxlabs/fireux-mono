<template>
  <main
    class="public-menu"
    :class="menuClasses"
    :style="menuStyleVars"
  >
    <section class="menu-page">
      <slot name="breadcrumbs" />

      <header class="menu-header">
        <p v-if="kitchenName" class="kitchen-name">
          {{ kitchenName }}
        </p>
        <div v-if="$slots.language" class="menu-language">
          <slot name="language" />
        </div>
        <h1>{{ menu.name }}</h1>
        <p v-if="menu.description" class="description">
          {{ menu.description }}
        </p>
      </header>

      <UAlert
        v-if="!sections.length"
        color="neutral"
        variant="soft"
        title="Menu unavailable"
        description="This menu has no public sections yet."
      />

      <div v-else class="menu-sections">
        <section
          v-for="section in sections"
          :key="section.id"
          class="menu-section"
        >
          <header class="section-header">
            <h2>{{ section.label }}</h2>
            <p v-if="section.description">
              {{ section.description }}
            </p>
          </header>

          <div v-if="section.items.length" class="menu-items">
            <article
              v-for="item in section.items"
              :key="item.id"
              class="menu-item"
            >
              <div class="item-copy">
                <h3>{{ item.name }}</h3>
                <p v-if="item.description">
                  {{ item.description }}
                </p>
              </div>

              <div v-if="formatItemPrice(item)" class="item-price">
                {{ formatItemPrice(item) }}
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import {
  resolveKitchenPublicMenuFont,
  resolveKitchenPublicMenuTitleFont,
} from '../../composables/fireux/public/kitchen/menu/useKitchenPublicMenuTheme'
import { formatKitchenPublicMenuItemPrice } from '../../composables/fireux/public/kitchen/menu/useKitchenPublicMenuPrice'
import type {
  KitchenPublicMenuItemRow,
  KitchenPublicMenuSectionRow,
} from '../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'
import type { Menu } from '../../models/menu.model'

const props = defineProps<{
  kitchenName: string
  menu: Menu
  sections: KitchenPublicMenuSectionRow[]
  pageStyle?: Partial<PageStyle> | null
  currencyCode?: string
  currencyFormat?: CurrencyDisplayFormat
  showCurrency?: boolean
  languageCode?: string
  variant?: 'page' | 'preview'
  colorMode?: 'system' | 'light' | 'dark'
}>()

const color = (value: unknown) => String(value ?? '').trim()
const systemColorMode = ref<'light' | 'dark'>('light')
let colorSchemeQuery: MediaQueryList | null = null
const activeColorMode = computed(() =>
  props.colorMode === 'light' || props.colorMode === 'dark'
    ? props.colorMode
    : systemColorMode.value
)
const menuClasses = computed(() => ({
  'public-menu--preview': props.variant === 'preview',
  'public-menu--light': activeColorMode.value === 'light',
  'public-menu--dark': activeColorMode.value === 'dark',
}))
const resolvedFont = computed(() => resolveKitchenPublicMenuFont(props.pageStyle))
const resolvedTitleFont = computed(() => resolveKitchenPublicMenuTitleFont(props.pageStyle))
const stylesheetLinks = computed(() => {
  const urls = [
    resolvedFont.value.stylesheetUrl,
    resolvedTitleFont.value.stylesheetUrl,
  ].filter(Boolean)

  return [...new Set(urls)].map((href) => ({
    rel: 'stylesheet',
    href,
  }))
})

useHead(computed(() => ({
  link: stylesheetLinks.value,
})))

const menuStyleVars = computed(() => {
  const style = props.pageStyle ?? {}
  const vars: Record<string, string> = {}
  const backgroundLight = color(style.background_color_light)
  const backgroundDark = color(style.background_color_dark)
  const fontLight = color(style.font_color_light)
  const fontDark = color(style.font_color_dark)
  const titleLight = color(style.title_color_light)
  const titleDark = color(style.title_color_dark)

  if (backgroundLight) vars['--menu-bg-light'] = backgroundLight
  if (backgroundDark) vars['--menu-bg-dark'] = backgroundDark
  if (fontDark) vars['--menu-text-dark'] = fontDark
  if (fontLight) vars['--menu-text-light'] = fontLight
  if (titleLight) vars['--menu-title-light'] = titleLight
  if (titleDark) vars['--menu-title-dark'] = titleDark
  vars['--menu-font'] = resolvedFont.value.cssFamily
  vars['--menu-title-font'] = resolvedTitleFont.value.cssFamily

  return vars
})

const formatItemPrice = (item: KitchenPublicMenuItemRow) =>
  formatKitchenPublicMenuItemPrice(item, {
    currencyCode: props.currencyCode,
    currencyFormat: props.currencyFormat,
    showCurrency: props.showCurrency,
    languageCode: props.languageCode,
  })

const updateSystemColorMode = () => {
  systemColorMode.value = colorSchemeQuery?.matches ? 'dark' : 'light'
}

onMounted(() => {
  colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  colorSchemeQuery.addEventListener('change', updateSystemColorMode)
  updateSystemColorMode()
})

onUnmounted(() => {
  colorSchemeQuery?.removeEventListener('change', updateSystemColorMode)
  colorSchemeQuery = null
})
</script>

<style scoped>
.public-menu {
  --menu-bg-light: #ffffff;
  --menu-bg-dark: #111827;
  --menu-text-light: #111827;
  --menu-text-dark: #f8fafc;
  --menu-title-light: var(--menu-text-light);
  --menu-title-dark: var(--menu-text-dark);
  --menu-bg: var(--menu-bg-light);
  --menu-text: var(--menu-text-light);
  --menu-title: var(--menu-title-light);
  --menu-muted: color-mix(in srgb, var(--menu-text) 72%, var(--menu-bg));
  --menu-dimmed: color-mix(in srgb, var(--menu-text) 54%, var(--menu-bg));
  --menu-secondary: var(--menu-muted);
  --menu-font: ui-sans-serif, system-ui, sans-serif;
  --menu-title-font: var(--menu-font);
  --menu-page-padding-block: clamp(1.5rem, 4vw, 3rem);
  --menu-page-padding-inline: clamp(1.5rem, 4vw, 3rem);

  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background-color: var(--menu-bg);
  background-image: none;
  color: var(--menu-text);
  font-family: var(--menu-font);
  isolation: isolate;
  position: relative;
  z-index: 0;
}

.public-menu:not(.public-menu--preview)::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  background-color: var(--menu-bg);
}

.public-menu--preview {
  min-height: auto;
  border-radius: 1rem;
  overflow: hidden;
}

.public-menu--light {
  --menu-bg: var(--menu-bg-light);
  --menu-text: var(--menu-text-light);
  --menu-title: var(--menu-title-light);
}

.public-menu--dark {
  --menu-bg: var(--menu-bg-dark);
  --menu-text: var(--menu-text-dark);
  --menu-title: var(--menu-title-dark);
}

.public-menu--preview .menu-page {
  width: 100%;
}

.menu-page {
  width: min(100%, 72rem);
  margin: 0 auto;
  padding: var(--menu-page-padding-block) var(--menu-page-padding-inline);
  background-color: var(--menu-bg);
}

:deep(.menu-breadcrumbs) {
  margin-bottom: 2rem;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.menu-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.menu-language {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.kitchen-name,
.description {
  font-family: inherit;
}

.kitchen-name {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0;
  color: var(--menu-secondary);
}

.menu-header h1 {
  margin: 0;
  font-family: var(--menu-title-font);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0;
  color: var(--menu-title);
}

.description {
  margin: 0.75rem auto 0;
  max-width: 42rem;
  line-height: 1.55;
  color: var(--menu-muted);
}

.menu-sections {
  display: grid;
  gap: clamp(2rem, 5vw, 3rem);
}

.menu-section {
  display: grid;
  gap: 1rem;
}

.section-header {
  text-align: center;
}

.section-header h2 {
  margin: 0;
  font-size: clamp(1.25rem, 3vw, 1.65rem);
  letter-spacing: 0;
  color: var(--menu-title);
}

.section-header p {
  margin: 0.5rem auto 0;
  max-width: 36rem;
  color: var(--menu-muted);
}

.menu-items {
  display: grid;
  gap: 0.9rem;
}

.menu-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  padding-block: 0.85rem;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-secondary) 24%, transparent);
}

.item-copy h3 {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.3;
  color: var(--menu-text);
}

.item-copy p {
  margin: 0.3rem 0 0;
  font-family: inherit;
  font-size: 0.92rem;
  line-height: 1.45;
  color: var(--menu-muted);
}

.item-price {
  white-space: nowrap;
  font-size: 1rem;
  font-weight: 600;
  color: var(--menu-text);
}

@media (min-width: 920px) {
  .menu-sections {
    display: block;
    column-count: 2;
    column-gap: clamp(2rem, 5vw, 5rem);
  }

  .menu-section {
    break-inside: avoid;
    margin-bottom: clamp(2rem, 5vw, 3rem);
  }
}

</style>
