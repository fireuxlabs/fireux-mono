import { laTapBerneTheme } from './config/theme.config'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'theme',
      neutral: 'neutral',
    },
    safelistColors: ['theme'],
  },
  miseboxTenant: {
    palette: laTapBerneTheme.palette,
  },
})
