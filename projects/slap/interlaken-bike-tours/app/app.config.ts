export default defineAppConfig({
  ui: { colors: { primary: 'cyan', neutral: 'slate' } },
  navigation: {
    overrides: {
      blog: { layouts: ['default', 'landing'] },
      products: { layouts: ['default', 'landing'] },
    },
  },
})
