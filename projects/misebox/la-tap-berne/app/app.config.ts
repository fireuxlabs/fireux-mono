import { laTapBerneTheme } from './config/theme.config'

export default defineAppConfig({
  navigation: {
    hiddenKeys: ['kitchens', 'places'],
  },
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
