export default defineAppConfig({
  ui: {
    colors: {
      primary: 'yellow',
      neutral: 'zinc',
    },
  },
  navigation: {
    overrides: {
      apps: {
        label: 'Showcase',
        icon: '',
        order: 50,
        layouts: ['default', 'landing', 'framework'],
      },
    },
  },
})
