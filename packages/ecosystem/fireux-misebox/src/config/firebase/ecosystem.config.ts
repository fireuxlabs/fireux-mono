import type { FireuxEcosystemConfig } from 'fireux-core/types/ecosystem'

export const ecosystemConfig = {
  id: 'fireux-misebox',
  name: 'misebox',
  description: 'FireUX MiseBox - Kitchen, Chef, Supplier Domain Package',

  firebase: {
    apiKey: 'AIzaSyBkWm7VONGZRx74pg2vFbnFyDKjruEwg6M',
    authDomain: 'misebox-78f9c.firebaseapp.com',
    projectId: 'misebox-78f9c',
    storageBucket: 'misebox-78f9c.appspot.com',
    messagingSenderId: '102749723716',
    databaseId: 'misebox',
    simulationDatabaseId: 'misebox-simulation',
  },
  ssrRegion: 'europe-west6',
} as const satisfies FireuxEcosystemConfig
