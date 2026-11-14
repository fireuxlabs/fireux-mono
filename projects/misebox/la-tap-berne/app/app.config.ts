export default defineAppConfig({
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
  miseboxTenant: {
    palette: [
      {
        role: 'canvas',
        name: 'Canvas',
        color: 'var(--brand-canvas)',
        label: '#F2E8D8',
      },
      {
        role: 'ink',
        name: 'Ink',
        color: 'var(--brand-ink)',
        label: '#171717',
      },
      {
        role: 'primary',
        name: 'Primary',
        color: 'var(--brand-primary)',
        label: '#171717',
      },
      {
        role: 'accent',
        name: 'Accent',
        color: 'var(--brand-accent)',
        label: '#9A6500',
      },
    ],
  },
})
