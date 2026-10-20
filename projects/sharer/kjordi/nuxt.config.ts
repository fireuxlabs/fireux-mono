import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'sharer',
  extends: ['fireux-core/layer', 'fireux-sharer/layer', 'fireux-blogs/layer'],
  projectId: 'sharer-ecosystem',
  ecosystemId: 'sharer',
  id: 'kjordi',
  context: "This is a branded personal sharing App whose public page currently uses the name “Kjordy”. The intended spelling needs confirmation before standardising its identity.",
  name: 'Kjordi',
  shortName: 'Kjordi',
  theme: {
    palette: {
      canvas: '#09090B',
      surface: '#18181B',
      canvas_inverted: '#FAFAFA',
      text: '#FAFAFA',
      text_muted: '#A1A1AA',
      ink: '#09090B',
      accent: '#F5C451',
      accent_contrast: '#09090B',
    },
  },
  role: 'tenant',
  authEnabled: true,
  firebaseSecrets: ['NUXT_SHARER_YOUTUBE_API_KEY'],
  modules: ['fireux-go-qr'],
})
