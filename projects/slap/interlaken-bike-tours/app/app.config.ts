export default defineAppConfig({
  ui: { colors: { primary: 'cyan', neutral: 'slate' } },
  navigation: {
    overrides: {
      blog: { layouts: ['default', 'landing', 'tours'] },
      products: { layouts: ['default', 'landing', 'tours'] },
    },
  },
})
