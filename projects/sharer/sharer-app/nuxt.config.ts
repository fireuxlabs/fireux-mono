import { defineFireuxEcosystem } from 'fireux-ecosystem/config'

export default defineFireuxEcosystem({
  ecosystem: 'sharer',
  extends: ['fireux-core/layer', 'fireux-sharer/layer'],
  projectId: 'sharer-ecosystem',
  ecosystemId: 'sharer',
  id: 'sharer-app',
  context:
    'Sharer provides personal sharing profiles and branded public link pages. Each profile collects the links and content its owner chooses to share.',
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
})
