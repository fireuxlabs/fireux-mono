import type { FireuxEcosystemConfig } from 'fireux-core/types/ecosystem'

export const ecosystemConfig = {
  id: 'fireux-bringli',
  name: 'bringli',
  description: 'FireUX Bringli - Local producer delivery marketplace ecosystem',

  firebase: {
    apiKey: 'AIzaSyCiSkdVYeyM3vb5hbXPSaGWaHSI3FXngIc',
    authDomain: 'bringli-b0517.firebaseapp.com',
    projectId: 'bringli-b0517',
    storageBucket: 'bringli-b0517.firebasestorage.app',
    messagingSenderId: '286263060307',
  },
  ssrRegion: 'europe-west1',
} as const satisfies FireuxEcosystemConfig
