import { defineAppConfig } from '#imports'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'theme',
      neutral: 'slate',
    },
    safelistColors: ['theme'],
  },
})
