import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'fireux',
  extends: ['fireux-core/layer'],
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-template',
  context:
    'This is the reusable starting point for a new FireUX App. Its placeholder identity and content must be replaced with the new App’s actual purpose and ownership.',
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
})
