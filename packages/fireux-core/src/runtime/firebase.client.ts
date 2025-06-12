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

  // No longer automatically signing in anonymously
  // Users will need to explicitly sign in through the auth system
  console.log('✅ Firebase initialized successfully')
})
