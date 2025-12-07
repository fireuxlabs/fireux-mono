import type { FirebaseProjectConfig } from '../schemas/firebase-project'

export const FIREUX_FIREBASE_PROJECT: FirebaseProjectConfig = {
  apiKey: 'AIzaSyBXQzbWwcOCMyBEVn1plDVJAofmalenLM4',
  authDomain: 'fireux-2005.firebaseapp.com',
  projectId: 'fireux-2005',
  storageBucket: 'fireux-2005.firebasestorage.app',
  messagingSenderId: '549102750204',
  appId: '1:549102750204:web:f136fca73d3c9101b8ca79',
  measurementId: 'G-4R6XV8JJEP',
  registryDatabaseId: 'registry',
}

export const CLEANBOX_FIREBASE_PROJECT: FirebaseProjectConfig = {
  apiKey: 'AIzaSyBr8HyfrjHGdWA6EAbBddpLL-c4qddMh4A',
  authDomain: 'cleanbox-f15bc.firebaseapp.com',
  projectId: 'cleanbox-f15bc',
  storageBucket: 'cleanbox-f15bc.firebasestorage.app',
  messagingSenderId: '1083929507377',
  appId: '1:1083929507377:web:d3ad38cdc238645e658710',
  measurementId: 'G-HVCD78T7LW',
}

export const MISEBOX_FIREBASE_PROJECT: FirebaseProjectConfig = {
  apiKey: 'AIzaSyBkWm7VONGZRx74pg2vFbnFyDKjruEwg6M',
  authDomain: 'misebox-78f9c.firebaseapp.com',
  projectId: 'misebox-78f9c',
  storageBucket: 'misebox-78f9c.appspot.com',
  messagingSenderId: '102749723716',
  appId: '1:102749723716:web:8c9d57e9a768f9cd017011',
}

export const FIREBASE_PROJECTS: Record<string, FirebaseProjectConfig> = {
  fireux: FIREUX_FIREBASE_PROJECT,
  cleanbox: CLEANBOX_FIREBASE_PROJECT,
  misebox: MISEBOX_FIREBASE_PROJECT,
}

export function getFirebaseProjectConfig(
  ecosystem: string
): FirebaseProjectConfig | undefined {
  return FIREBASE_PROJECTS[ecosystem]
}
