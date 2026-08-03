import { browserSessionPersistence, getAuth, setPersistence } from 'firebase/auth'

export default defineNuxtPlugin(async () => {
  // Keep authentication within the browser session. Apps must make a separate,
  // reviewed product decision before offering a persistent-sign-in feature.
  await setPersistence(getAuth(), browserSessionPersistence)
})
