import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'sharer',
  projectId: 'sharer-ecosystem',
  ecosystemId: 'sharer',
  id: 'sharer-app',
  name: 'Sharer',
  shortName: 'Sharer',
  theme: {
    palette: {
      canvas: '#F7F8FC',
      surface: '#FFFFFF',
      canvas_inverted: '#15142A',
      text: '#15142A',
      text_muted: '#66657A',
      ink: '#15142A',
      accent: '#6758E8',
      accent_contrast: '#FFFFFF',
    },
  },
  role: 'global',
  authEnabled: true,
  modules: [],
})
