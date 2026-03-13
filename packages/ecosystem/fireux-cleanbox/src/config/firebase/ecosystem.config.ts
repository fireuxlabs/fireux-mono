import type { FireuxEcosystemConfig } from 'fireux-core/types/ecosystem'

export const ecosystemConfig = {
  id: 'fireux-cleanbox',
  name: 'cleanbox',
  description: 'FireUX CleanBox - Cleaning Services Domain Package',

  firebase: {
    apiKey: 'AIzaSyBr8HyfrjHGdWA6EAbBddpLL-c4qddMh4A',
    authDomain: 'cleanbox-f15bc.firebaseapp.com',
    projectId: 'cleanbox-f15bc',
    storageBucket: 'cleanbox-f15bc.firebasestorage.app',
    messagingSenderId: '1083929507377',
    databaseId: 'cleanbox',
  },
  ssrRegion: 'europe-west1',
} as const satisfies FireuxEcosystemConfig
