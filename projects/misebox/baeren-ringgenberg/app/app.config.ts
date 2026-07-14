import { baerenRinggenbergTheme } from './config/theme.config'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'theme',
      neutral: 'neutral',
    },
    safelistColors: ['theme'],
  },
  miseboxTenant: {
    palette: baerenRinggenbergTheme.palette,
  },
})
