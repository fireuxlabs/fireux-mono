import { defineAppConfig } from '#imports'

export default defineAppConfig({
  navigation: {
    hiddenKeys: ['properties'],
  },
  ui: {
    colors: {
      primary: 'teal',
      neutral: 'stone',
    },
  },
})
