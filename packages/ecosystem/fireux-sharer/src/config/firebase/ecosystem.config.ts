import type { FireuxEcosystemConfig } from 'fireux-core/types/ecosystem'

export const ecosystemConfig = {
  id: 'fireux-sharer',
  name: 'sharer',
  description: 'FireUX Sharer - personal sharing profiles and branded PWA ecosystem',

  firebase: {
    apiKey: 'AIzaSyBpY5JzeBywiWsFundSkoAG7puJrNuAmZg',
    authDomain: 'sharer-ecosystem.firebaseapp.com',
    projectId: 'sharer-ecosystem',
    storageBucket: 'sharer-ecosystem.firebasestorage.app',
    messagingSenderId: '809988207961',
    databaseId: 'sharer',
  },
  ssr: {
    region: 'europe-west1',
  },
} as const satisfies FireuxEcosystemConfig
