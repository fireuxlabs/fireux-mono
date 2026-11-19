import { useHead } from '#imports'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { WorkspaceTheme } from 'fireux-core/types/theme'

import { menuAppTheme, menuDisplayTokens } from '../utils/menu-display-tokens'
export { menuAppTheme } from '../utils/menu-display-tokens'

export function useMenuThemeSurface(
  options: {
    theme?: MaybeRefOrGetter<WorkspaceTheme | null | undefined>
    themeSource?: MaybeRefOrGetter<
      'menu' | 'kitchen' | 'default' | null | undefined
    >
    pageCanvas?: MaybeRefOrGetter<boolean | null | undefined>
  } = {}
) {
  const className = computed(() =>
    toValue(options.pageCanvas)
      ? 'menu-theme--light menu-theme--page-canvas'
      : 'menu-theme--light'
  )
  const styleVars = computed(() => {
    const theme =
      toValue(options.themeSource) === 'default'
        ? undefined
        : toValue(options.theme)
    const palette = theme?.palette || menuAppTheme.palette
    // Scope brand tokens to this surface; AppConfig remains owned by the host App.
    const ui =
      theme && theme !== menuAppTheme
        ? {
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
          }
        : {}
    return {
      ...ui,
      ...menuDisplayTokens(palette),
      '--menu-primary-source': palette.accent,
      '--menu-secondary': palette.accent,
      '--menu-accent-contrast': palette.accent_contrast,
      '--menu-bg-light': palette.canvas,
      '--menu-bg-dark': palette.canvas,
      '--menu-text-light': palette.text,
      '--menu-text-dark': palette.text,
      '--menu-title-light': palette.text,
      '--menu-title-dark': palette.text,
    }
  })
  useHead(
    computed(() =>
      toValue(options.pageCanvas)
        ? {
            // Keep brand tokens on the surface. Canvas variables alone have no effect
            // after the Menu leaves the DOM, even during asynchronous route transitions.
            bodyAttrs: {
              style: {
                '--menu-page-canvas-bg': styleVars.value['--menu-bg'],
                '--menu-page-canvas-text': styleVars.value['--menu-text'],
              },
            },
            style: [
              {
                key: 'menu-page-canvas',
                innerHTML:
                  'body:has(.menu-theme--page-canvas) { background-color: var(--menu-page-canvas-bg); color: var(--menu-page-canvas-text); }',
              },
            ],
          }
        : {}
    )
  )
  return { className, styleVars }
}
