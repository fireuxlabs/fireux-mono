import { useHead } from '#imports'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { WorkspaceTheme } from 'fireux-core/types/theme'

export const menuAppTheme: WorkspaceTheme = {
  palette: { canvas: 'var(--ui-bg)', text: 'var(--ui-text)', accent: 'var(--ui-primary)', accent_contrast: 'var(--ui-bg)' },
}

export function useMenuThemeSurface(options: {
  theme?: MaybeRefOrGetter<WorkspaceTheme | null | undefined>
  pageCanvas?: MaybeRefOrGetter<boolean | null | undefined>
} = {}) {
  const className = 'menu-theme--light'
  const styleVars = computed(() => {
    const theme = toValue(options.theme)
    const palette = theme?.palette || menuAppTheme.palette
    // Scope brand tokens to this surface; AppConfig remains owned by the host App.
    const ui = theme && theme !== menuAppTheme ? {
      '--ui-primary': palette.accent,
      '--ui-bg': palette.canvas,
      '--ui-text': palette.text,
      '--ui-text-highlighted': palette.text,
      '--ui-text-inverted': palette.accent_contrast,
      '--ui-bg-inverted': palette.text,
      '--ui-text-muted': `color-mix(in srgb, ${palette.text} 72%, ${palette.canvas})`,
      '--ui-text-dimmed': `color-mix(in srgb, ${palette.text} 54%, ${palette.canvas})`,
      '--ui-text-toned': `color-mix(in srgb, ${palette.text} 86%, ${palette.canvas})`,
      '--ui-bg-muted': `color-mix(in srgb, ${palette.text} 4%, ${palette.canvas})`,
      '--ui-bg-elevated': `color-mix(in srgb, ${palette.text} 8%, ${palette.canvas})`,
      '--ui-bg-accented': `color-mix(in srgb, ${palette.text} 12%, ${palette.canvas})`,
      '--ui-border': `color-mix(in srgb, ${palette.text} 18%, ${palette.canvas})`,
      '--ui-border-muted': `color-mix(in srgb, ${palette.text} 12%, ${palette.canvas})`,
      '--ui-border-accented': `color-mix(in srgb, ${palette.text} 28%, ${palette.canvas})`,
      '--ui-border-inverted': palette.text,
    } : {}
    return {
      ...ui,
      '--menu-bg': palette.canvas,
      '--menu-text': palette.text,
      '--menu-title': palette.text,
      '--menu-primary-source': palette.accent,
      '--menu-primary': palette.accent,
      '--menu-secondary': palette.accent,
      '--menu-theme-primary': palette.accent,
      '--menu-theme-secondary': palette.accent,
      '--menu-accent-contrast': palette.accent_contrast,
      '--menu-bg-light': palette.canvas,
      '--menu-bg-dark': palette.canvas,
      '--menu-text-light': palette.text,
      '--menu-text-dark': palette.text,
      '--menu-title-light': palette.text,
      '--menu-title-dark': palette.text,
      '--menu-font': 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
      '--menu-title-font': 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
    }
  })
  useHead(computed(() => toValue(options.pageCanvas) ? {
    bodyAttrs: { 'data-menu-theme-canvas': 'true', style: {
      ...styleVars.value, 'background-color': 'var(--menu-bg)', color: 'var(--menu-text)',
    } },
  } : {}))
  return { className, styleVars }
}
