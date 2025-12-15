import type { FireuxEcosystemConfig } from 'fireux-core/config/ecosystem'

export const ecosystemConfig = {
  id: 'fireux-misebox',
  name: 'misebox',
  description: 'FireUX MiseBox - Cooking Marketplace Domain Package',

  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: 'misebox-78f9c',
    storageBucket: '',
    messagingSenderId: '',
  },
} as const satisfies FireuxEcosystemConfig
