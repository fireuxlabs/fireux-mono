import type { FireuxEcosystemConfig } from 'fireux-core/types/ecosystem'

export const ecosystemConfig = {
  id: 'fireux-misebox',
  name: 'misebox',
  description: 'FireUX Misebox ecosystem identity and Firebase binding',
  firebase: {
    apiKey: 'AIzaSyBkWm7VONGZRx74pg2vFbnFyDKjruEwg6M',
    authDomain: 'misebox-78f9c.firebaseapp.com',
    projectId: 'misebox-78f9c',
    storageBucket: 'misebox-78f9c.appspot.com',
    messagingSenderId: '102749723716',
    databaseId: 'misebox',
  },
  ssr: {
    region: 'europe-west6',
    serviceAccount: 'misebox-ssr@misebox-78f9c.iam.gserviceaccount.com',
  },
} as const satisfies FireuxEcosystemConfig
