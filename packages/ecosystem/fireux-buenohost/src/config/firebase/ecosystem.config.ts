import type { FireuxEcosystemConfig } from 'fireux-core/types/ecosystem'

export const ecosystemConfig = {
  id: 'fireux-buenohost',
  name: 'buenohost',
  description:
    'BuenoHost ecosystem identity and Firebase binding for property-hosting apps.',
  firebase: {
    apiKey: 'AIzaSyBLWvQ1Y4IWEhvwvMDVaB02AF5xL4dYE0M',
    authDomain: 'buenohost-ecosystem.firebaseapp.com',
    projectId: 'buenohost-ecosystem',
    storageBucket: 'buenohost-ecosystem.firebasestorage.app',
    messagingSenderId: '892357897064',
    databaseId: 'buenohost',
    identityDatabaseId: 'buenohost',
  },
  ssrRegion: 'europe-west6',
} as const satisfies FireuxEcosystemConfig
