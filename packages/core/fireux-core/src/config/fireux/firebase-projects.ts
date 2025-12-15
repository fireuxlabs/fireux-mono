import type { FirebaseProjectConfig } from '../schemas/firebase-project'

export const FIREUX_FIREBASE_PROJECT = {
  apiKey: 'AIzaSyBXQzbWwcOCMyBEVn1plDVJAofmalenLM4',
  authDomain: 'fireux-2005.firebaseapp.com',
  projectId: 'fireux-2005',
  storageBucket: 'fireux-2005.firebasestorage.app',
  messagingSenderId: '549102750204',
} as const satisfies FirebaseProjectConfig

// Values for these ecosystems can be filled as they become available.
export const CLEANBOX_FIREBASE_PROJECT = {
  apiKey: 'AIzaSyBr8HyfrjHGdWA6EAbBddpLL-c4qddMh4A',
  authDomain: 'cleanbox-f15bc.firebaseapp.com',
  projectId: 'cleanbox-f15bc',
  storageBucket: 'cleanbox-f15bc.firebasestorage.app',
  messagingSenderId: '1083929507377',
} as const satisfies FirebaseProjectConfig

export const MISEBOX_FIREBASE_PROJECT = {
  apiKey: '',
  authDomain: '',
  projectId: 'misebox-78f9c',
  storageBucket: '',
  messagingSenderId: '',
} as const satisfies FirebaseProjectConfig
