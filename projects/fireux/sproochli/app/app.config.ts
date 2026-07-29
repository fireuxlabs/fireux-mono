export default defineAppConfig({
  ui: {
    colors: {
      primary: 'purple',
      neutral: 'zinc',
    },
  },
  fireuxAssets: {
    catalogue: [
      {
        key: 'language-default',
        label: 'Default',
        description:
          'The Sproochli default mark appears when a page has mixed source languages.',
        src: '/img/app/language-default.webp',
      },
    ],
  },
})
