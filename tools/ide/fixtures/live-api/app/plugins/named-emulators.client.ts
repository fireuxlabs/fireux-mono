import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { defineNuxtPlugin } from 'nuxt/app'

// nuxt-vuefire connects its default database; this fixture also uses native named databases.
export default defineNuxtPlugin({
  name: 'fixture-named-emulators',
  enforce: 'post',
  setup(nuxtApp) {
    const app = nuxtApp.$firebaseApp
    for (const id of ['misebox', 'fireux', 'live-identity'])
      connectFirestoreEmulator(getFirestore(app, id), '127.0.0.1', 8181)
  },
})
