import { initializeApp } from 'firebase/app'
import {
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { shallowRef, ref } from 'vue'

export default defineNuxtPlugin(() => {
  const app = initializeApp({
    projectId: 'demo-native-foundation',
    apiKey: 'demo-key',
  })
  const auth = getAuth(app)
  const db = getFirestore(app, useRuntimeConfig().public.ecosystem.databaseId)
  connectAuthEmulator(auth, 'http://127.0.0.1:19099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 18744)
  const user = shallowRef<User | null>(null)
  const ready = ref(false)
  const stop = onAuthStateChanged(auth, (value) => {
    user.value = value
    ready.value = true
  })
  if (import.meta.hot) import.meta.hot.dispose(stop)
  return { provide: { firebase: { auth, db, user, ready } } }
})
