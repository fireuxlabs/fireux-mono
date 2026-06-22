<template>
  <main
    class="public-menu"
    :class="menuClasses"
    :style="menuStyleVars"
  >
    <section class="menu-page">
      <slot />
    </section>
  </main>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import {
  resolveKitchenPublicMenuFont,
  resolveKitchenPublicMenuTitleFont,
} from '../../composables/fireux/public/kitchen/menu/useKitchenPublicMenuTheme'

const props = defineProps<{
  pageStyle?: Partial<PageStyle> | null
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
  const primary = color(style.primary_color)
  const secondary = color(style.secondary_color)

  if (backgroundLight) vars['--menu-bg-light'] = backgroundLight
  if (backgroundDark) vars['--menu-bg-dark'] = backgroundDark
  if (fontDark) vars['--menu-text-dark'] = fontDark
  if (fontLight) vars['--menu-text-light'] = fontLight
  if (titleLight) vars['--menu-title-light'] = titleLight
  if (titleDark) vars['--menu-title-dark'] = titleDark
  if (primary) vars['--menu-primary'] = primary
  if (secondary) vars['--menu-secondary'] = secondary
  vars['--menu-font'] = resolvedFont.value.cssFamily
  vars['--menu-title-font'] = resolvedTitleFont.value.cssFamily

  return vars
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
  --menu-primary: var(--menu-title-light);
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
</style>
