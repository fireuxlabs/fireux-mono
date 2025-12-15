import type { FireuxEcosystemConfig } from 'fireux-core/config/ecosystem'

export const ecosystemConfig = {
  id: 'fireux',
  name: 'FireUX',
  description: 'FireUX core platform ecosystem',

  firebase: {
    apiKey: 'AIzaSyBXQzbWwcOCMyBEVn1plDVJAofmalenLM4',
    authDomain: 'fireux-2005.firebaseapp.com',
    projectId: 'fireux-2005',
    storageBucket: 'fireux-2005.firebasestorage.app',
    messagingSenderId: '549102750204',
  },
} as const satisfies FireuxEcosystemConfig
