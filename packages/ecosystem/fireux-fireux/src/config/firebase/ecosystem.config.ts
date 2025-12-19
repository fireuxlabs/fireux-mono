// FILE: packages/ecosystem/fireux-fireux/src/config/firebase/ecosystem.config.ts
import type { RuntimeFirebaseEcosystem } from 'fireux-core/config/app/runtime'

export const ecosystemConfig: Pick<
  RuntimeFirebaseEcosystem,
  'id' | 'name' | 'description' | 'firebase'
> = {
  id: 'fireux',
  name: 'FireUX',
  description: 'Core FireUX ecosystem and Firebase project.',
  firebase: {
    apiKey: 'AIzaSyBXQzbWwcOCMyBEVn1plDVJAofmalenLM4',
    authDomain: 'fireux-2005.firebaseapp.com',
    projectId: 'fireux-2005',
    storageBucket: 'fireux-2005.firebasestorage.app',
    messagingSenderId: '549102750204',
  },
}