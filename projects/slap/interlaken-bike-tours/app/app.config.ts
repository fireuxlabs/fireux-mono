export default defineAppConfig({
  theme: {
    palette: {
      canvas: '#f5f5f1',
      surface: '#e9eceb',
      canvas_inverted: '#07162d',
      text: '#101d31',
      text_muted: '#687382',
      ink: '#07162d',
      accent: '#10d4dd',
      accent_contrast: '#07162d',
    },
  },
  ui: { colors: { primary: 'cyan', neutral: 'slate' } },
  navigation: {
    overrides: {
      blog: { layouts: ['default', 'landing'] },
      products: { layouts: ['default', 'landing'] },
    },
  },
})
