// FILE: packages/ecosystem/fireux-fireux/src/config/firebase/ecosystem.config.ts
import type { FireuxEcosystemConfig } from 'fireux-core/types/ecosystem'

export const ecosystemConfig = {
  id: 'fireux-fireux',
  name: 'fireux',
  description: 'Core FireUX ecosystem and Firebase project.',
  firebase: {
    apiKey: 'AIzaSyBXQzbWwcOCMyBEVn1plDVJAofmalenLM4',
    authDomain: 'fireux-2005.firebaseapp.com',
    projectId: 'fireux-2005',
    storageBucket: 'fireux-2005.firebasestorage.app',
    messagingSenderId: '549102750204',
    databaseId: 'fireux',
  },
  ssrRegion: 'europe-west1',
} as const satisfies FireuxEcosystemConfig
