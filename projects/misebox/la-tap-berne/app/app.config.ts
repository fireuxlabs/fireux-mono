import { laTapBerneTheme } from './config/theme.config'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'theme',
      neutral: 'slate',
    },
    safelistColors: ['theme'],
  },
  miseboxTenant: {
    palette: laTapBerneTheme.palette,
  },
})
