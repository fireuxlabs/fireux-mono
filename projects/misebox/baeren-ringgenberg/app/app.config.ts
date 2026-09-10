export default defineAppConfig({
  navigation: {
    hiddenKeys: ['kitchens', 'places', 'companies', 'agents', 'professionals'],
  },
  ui: {
    colors: {
      primary: 'theme',
      neutral: 'stone',
    },
    safelistColors: ['theme'],
  },
})
