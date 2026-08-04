import { getApps } from 'firebase/app'
import {
  browserSessionPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth'

export default defineNuxtPlugin(async () => {
  // NuxtFire owns the default App. The module appends this plugin after
  // NuxtFire's client initializer; keep this guard so HMR can never turn a
  // transient plugin-order state into a fatal application error.
  if (!getApps().length) return

  // Keep authentication within the browser session. Apps must make a separate,
  // reviewed product decision before offering a persistent-sign-in feature.
  await setPersistence(getAuth(), browserSessionPersistence)
})
