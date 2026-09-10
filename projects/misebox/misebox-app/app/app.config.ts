export default defineAppConfig({
  navigation: {
    hiddenKeys: ['products', 'blog'],
    overrides: {
      kitchens: {
        order: 10,
        layouts: ['default', 'landing'],
        position: 'top',
      },
      operations: {
        order: 20,
        position: 'top',
      },
      demo: {
        label: 'Product Demo',
        order: 30,
        position: 'top',
      },
      jobs: {
        label: 'Misebox Jobs',
        order: 40,
        position: 'bottom',
        layouts: ['default', 'landing'],
      },
      professionals: {
        label: 'Hospitality professionals',
        order: 41,
        position: 'bottom',
        layouts: ['default'],
      },
    },
  },
  ui: {
    colors: {
      primary: 'theme',
      neutral: 'slate',
    },
    safelistColors: ['theme'],
  },
})
