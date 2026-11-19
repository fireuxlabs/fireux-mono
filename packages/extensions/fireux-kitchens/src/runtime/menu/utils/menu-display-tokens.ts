import type { WorkspacePalette, WorkspaceTheme } from 'fireux-core/types/theme'

export const menuAppTheme: WorkspaceTheme = {
  palette: {
    canvas: 'var(--ui-bg)',
    text: 'var(--ui-text)',
    accent: 'var(--ui-primary)',
    accent_contrast: 'var(--ui-bg)',
  },
}

export function menuDisplayTokens(palette: WorkspacePalette) {
  return {
    '--menu-bg': palette.canvas,
    '--menu-text': palette.text,
    '--menu-title': palette.text,
    '--menu-primary': palette.accent,
    '--menu-muted': `color-mix(in srgb, ${palette.text} 72%, ${palette.canvas})`,
    '--menu-font': 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
    '--menu-title-font':
      'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
  }
}
