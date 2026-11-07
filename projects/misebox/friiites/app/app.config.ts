export default defineAppConfig({
  theme: {
    palette: {
      canvas: '#181817',
      surface: '#242321',
      canvas_inverted: '#f3e9d2',
      text: '#f3e9d2',
      text_muted: '#bdb6a5',
      ink: '#181817',
      accent: '#d99a22',
      accent_contrast: '#181817',
    },
  },
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
})
