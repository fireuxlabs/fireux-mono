import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import type { FirebaseOptions } from 'firebase/app'

export default defineNuxtPlugin(() => {
  const {
    public: { firebaseConfig },
  } = useRuntimeConfig()

  // Initialize Firebase app if it hasn't been initialized yet
  const app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig as FirebaseOptions)

  // Initialize Firebase Authentication
  const auth = getAuth(app)

  // Sign in anonymously if no user is currently signed in
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      try {
        await signInAnonymously(auth)
        console.log('✅ Signed in anonymously.')
      } catch (error) {
        if (error instanceof Error) {
          console.error('❌ Anonymous sign-in failed:', error.message)
        } else {
          console.error('❌ Anonymous sign-in failed: Unknown error')
        }
      }
    }
  })
})
