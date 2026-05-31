import type { FireuxEcosystemConfig } from 'fireux-core/types/ecosystem'

export const ecosystemConfig = {
  id: 'fireux-slap',
  name: 'slap',
  description: 'FireUX Slap - Lifestyle-commerce ecosystem for culture-led brands',

  firebase: {
    apiKey: 'AIzaSyAFrIqgvbr3f3eK5JVOuDSFvATSuZCh_Cc',
    authDomain: 'slap-45389.firebaseapp.com',
    projectId: 'slap-45389',
    storageBucket: 'slap-45389.firebasestorage.app',
    messagingSenderId: '884456976096',
    databaseId: 'slap',
  },
  ssrRegion: 'europe-west1',
} as const satisfies FireuxEcosystemConfig
