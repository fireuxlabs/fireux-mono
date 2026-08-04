import type { FireuxEcosystemConfig } from 'fireux-core/types/ecosystem'

export const ecosystemConfig = {
  id: 'fireux-granite',
  name: 'granite',
  description: 'FireUX Granite - Portfolio landlord operating system ecosystem',

  firebase: {
    apiKey: 'AIzaSyBdwxKKCXn3aXu5jy-RzLKVX0PYShGh1aI',
    authDomain: 'granite-ecosystem.firebaseapp.com',
    projectId: 'granite-ecosystem',
    storageBucket: 'granite-ecosystem.firebasestorage.app',
    messagingSenderId: '614334323822',
    databaseId: 'granite',
  },
  ssr: {
    region: 'europe-west1',
  },
} as const satisfies FireuxEcosystemConfig
