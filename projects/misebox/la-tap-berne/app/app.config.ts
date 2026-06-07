export default defineAppConfig({
  ui: {
    colors: {
      primary: 'theme',
      neutral: 'slate',
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
        label: '#2A0E07',
      },
      {
        role: 'primary',
        name: 'Primary',
        color: 'var(--brand-primary)',
        label: '#9C2C18',
      },
      {
        role: 'accent',
        name: 'Accent',
        color: 'var(--brand-accent)',
        label: '#E99F5E',
      },
    ],
  },
})
