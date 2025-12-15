import type { FireuxEcosystemConfig } from 'fireux-core/config/ecosystem'

export const ecosystemConfig = {
  id: 'fireux-cleanbox',
  name: 'cleanbox',
  description: 'FireUX CleanBox - Cleaning Services Domain Package',

  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
  },
} as const satisfies FireuxEcosystemConfig
