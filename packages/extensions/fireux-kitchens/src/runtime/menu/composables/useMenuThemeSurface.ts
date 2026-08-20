import { useHead } from '#imports'
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  type MaybeRefOrGetter,
} from 'vue'
import { toValue } from 'vue'
import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import type { WorkspaceTheme } from 'fireux-core/types/theme'
import {
  resolveMenuPageStyle,
  resolveMenuFont,
  resolveMenuTitleFont,
} from './useMenuTheme'

type MenuThemeSurfaceOptions = {
  pageStyle?: MaybeRefOrGetter<Partial<PageStyle> | null | undefined>
  theme?: MaybeRefOrGetter<WorkspaceTheme | null | undefined>
  colorMode?: MaybeRefOrGetter<'system' | 'light' | 'dark' | null | undefined>
  pageCanvas?: MaybeRefOrGetter<boolean | null | undefined>
}

const color = (value: unknown) => String(value ?? '').trim()

export function useMenuThemeSurface(options: MenuThemeSurfaceOptions = {}) {
  const systemColorMode = ref<'light' | 'dark'>('light')
  let colorSchemeQuery: MediaQueryList | null = null
  const activeColorMode = computed(() => {
    const mode = toValue(options.colorMode)

    return mode === 'light' || mode === 'dark' ? mode : systemColorMode.value
  })
  const resolvedPageStyle = computed(() =>
    resolveMenuPageStyle(toValue(options.pageStyle))
  )
  const resolvedFont = computed(() => resolveMenuFont(resolvedPageStyle.value))
  const resolvedTitleFont = computed(() =>
    resolveMenuTitleFont(resolvedPageStyle.value)
  )
  const className = computed(() => `menu-theme--${activeColorMode.value}`)
  const styleVars = computed(() => {
    const style = resolvedPageStyle.value
    const sourceStyle = toValue(options.pageStyle)
    const palette = toValue(options.theme)?.palette
    const vars: Record<string, string> = {}
    const backgroundLight = color(
      palette?.canvas || style.background_color_light
    )
    const backgroundDark = color(palette?.canvas || style.background_color_dark)
    const fontLight = color(palette?.text || style.font_color_light)
    const fontDark = color(palette?.text || style.font_color_dark)
    const titleLight = color(palette?.text || style.title_color_light)
    const titleDark = color(palette?.text || style.title_color_dark)
    const primary = color(palette?.accent || style.primary_color)
    const secondary = color(palette?.accent || style.secondary_color)
    const customPrimary = color(sourceStyle?.primary_color)
    const customSecondary = color(sourceStyle?.secondary_color)

    if (backgroundLight) vars['--menu-bg-light'] = backgroundLight
    if (backgroundDark) vars['--menu-bg-dark'] = backgroundDark
    if (fontDark) vars['--menu-text-dark'] = fontDark
    if (fontLight) vars['--menu-text-light'] = fontLight
    if (titleLight) vars['--menu-title-light'] = titleLight
    if (titleDark) vars['--menu-title-dark'] = titleDark
    if (primary) vars['--menu-primary-source'] = primary
    if (secondary) vars['--menu-secondary'] = secondary
    if (palette?.accent_contrast) {
      vars['--menu-accent-contrast'] = palette.accent_contrast
    }
    if (customPrimary) vars['--menu-theme-primary'] = customPrimary
    if (customSecondary) vars['--menu-theme-secondary'] = customSecondary
    vars['--menu-bg'] =
      activeColorMode.value === 'dark'
        ? 'var(--menu-bg-dark)'
        : 'var(--menu-bg-light)'
    vars['--menu-text'] =
      activeColorMode.value === 'dark'
        ? 'var(--menu-text-dark)'
        : 'var(--menu-text-light)'
    vars['--menu-title'] =
      activeColorMode.value === 'dark'
        ? 'var(--menu-title-dark)'
        : 'var(--menu-title-light)'
    vars['--menu-primary'] =
      activeColorMode.value === 'dark'
        ? 'color-mix(in srgb, var(--menu-primary-source) 58%, var(--menu-text))'
        : 'var(--menu-primary-source)'
    vars['--menu-font'] = resolvedFont.value.cssFamily
    vars['--menu-title-font'] = resolvedTitleFont.value.cssFamily

    return vars
  })
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
  const updateSystemColorMode = () => {
    systemColorMode.value = colorSchemeQuery?.matches ? 'dark' : 'light'
  }

  useHead(
    computed(() => ({
      link: stylesheetLinks.value,
      ...(toValue(options.pageCanvas)
        ? {
            bodyAttrs: {
              'data-menu-theme-canvas': 'true',
              style: {
                ...styleVars.value,
                'background-color': 'var(--menu-bg)',
                color: 'var(--menu-text)',
              },
            },
          }
        : {}),
    }))
  )

  onMounted(() => {
    colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    colorSchemeQuery.addEventListener('change', updateSystemColorMode)
    updateSystemColorMode()
  })

  onUnmounted(() => {
    colorSchemeQuery?.removeEventListener('change', updateSystemColorMode)
    colorSchemeQuery = null
  })

  return {
    className,
    styleVars,
  }
}
