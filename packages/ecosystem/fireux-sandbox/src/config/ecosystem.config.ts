import type { FireuxEcosystemConfig } from 'fireux-core/config/ecosystem'

export const ecosystemConfig = {
  id: 'fireux-sandbox',
  name: 'sandbox',
  description: 'FireUX sandbox ecosystem (local-only)',

  // Intentionally dummy values; sandbox uses these to prime env & show config wiring.
  firebase: {
    apiKey: 'dummy',
    authDomain: 'dummy.firebaseapp.com',
    projectId: 'dummy',
    storageBucket: 'dummy.appspot.com',
    messagingSenderId: '000000000000',
  },
} as const satisfies FireuxEcosystemConfig
