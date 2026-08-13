import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-template',
  name: 'FireUX Template',
  shortName: 'Template',
  theme: {
    palette: {
      canvas: '#0f172a',
      surface: '#1e293b',
      canvas_inverted: '#f8fafc',
      text: '#f8fafc',
      text_muted: '#cbd5e1',
      ink: '#0f172a',
      accent: '#2563eb',
      accent_contrast: '#f8fafc',
    },
  },
  role: 'tenant',
  modules: ['fireux-products'],
})
