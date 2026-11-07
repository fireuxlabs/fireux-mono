import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'sharer',
  extends: ['fireux-core/layer', 'fireux-sharer/layer'],
  projectId: 'sharer-ecosystem',
  ecosystemId: 'sharer',
  id: 'kjordi',
  context:
    'This is a branded personal sharing App whose public page currently uses the name “Kjordy”. The intended spelling needs confirmation before standardising its identity.',
  name: 'Kjordi',
  shortName: 'Kjordi',
  role: 'tenant',
  authEnabled: true,
  firebaseSecrets: ['NUXT_SHARER_YOUTUBE_API_KEY'],
  modules: ['fireux-go-qr'],
})
