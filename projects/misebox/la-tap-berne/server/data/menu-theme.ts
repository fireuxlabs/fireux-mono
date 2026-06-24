import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'

// Tenant menu theme spine: full app chrome lives in app/assets/styles/main.css; this portable subset is emitted for Misebox menu consumers.
export const laTapBerneMenuTheme = {
  background_color_light: '#F4E8D2',
  background_color_dark: '#171717',
  font_color_light: '#1F1A14',
  font_color_dark: '#F7F1E6',
  title_color_light: '#1F1A14',
  title_color_dark: '#F7F1E6',
  primary_color: '#9C2C18',
  secondary_color: '#E99F5E',
} satisfies Partial<PageStyle>
