import { defineAppConfig } from 'nuxt/app'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'theme',
      neutral: 'slate',
    },
    safelistColors: ['theme'],
  },
})
